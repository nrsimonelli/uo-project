import { canCrit, canGuard } from './affliction-manager'
import { prepareAttackContext } from './attack-context'
import { calculateDamageComponents } from './base-damage'
import {
  checkAndConsumeNegateMagicDamage,
  checkAndConsumeTrueCritical,
  checkAndConsumeUnguardable,
  hasFlagOrBuff,
} from './buff-consumption'
import { logCombat } from './combat-utils'
import { BUFF_STATS } from './damage-calculator-types'
import type { DamageResult } from './damage-calculator-types'
import { checkAndConsumeDamageImmunity } from './damage-immunity'
import { applyDamageModifiers, applyDamageReduction } from './damage-modifiers'
import type { EffectProcessingResult } from './effect-processor'
import {
  calculateNaturalGuardMultiplier,
  calculateSkillGuardMultiplier,
} from './guard-calculation'
import { resolveHit } from './hit-calculation'
import {
  getEffectiveStatsForTarget,
  removeExpiredConferrals,
} from './status-effects'

import {
  rollCrit,
  getCritMultiplier,
  rollGuard,
} from '@/core/calculations/combat-calculations'
import type { RandomNumberGeneratorType } from '@/core/random'
import type { BattleContext } from '@/types/battle-engine'
import type { SkillCategory } from '@/types/core'
import type { DamageEffect, Flag } from '@/types/effects'

const createMissResult = (
  hitChance: number = 0,
  wasDodged: boolean = false
): DamageResult => ({
  hit: false,
  damage: 0,
  wasCritical: false,
  wasGuarded: false,
  wasDodged,
  hitChance,
  breakdown: {
    rawBaseDamage: 0,
    afterPotency: 0,
    afterCrit: 0,
    afterGuard: 0,
    afterEffectiveness: 0,
    afterDmgReduction: 0,
  },
})

export const calculateSkillDamage = (
  damageEffect: DamageEffect,
  skillFlags: readonly Flag[] | Flag[] = [],
  skillCategories: readonly SkillCategory[] | SkillCategory[] = [],
  attacker: BattleContext,
  target: BattleContext,
  rng: RandomNumberGeneratorType,
  innateAttackType?: 'Magical' | 'Ranged',
  effectResults?: EffectProcessingResult,
  twoHitsRemaining?: number,
  magicNegatedOverride?: boolean,
  remainingImmunityHits?: number
): DamageResult => {
  void skillCategories

  const context = prepareAttackContext(
    damageEffect,
    skillFlags,
    attacker,
    innateAttackType,
    effectResults
  )

  // Log combat stats for verification
  logCombat('⚔️ Combat Stats:', {
    attacker: {
      name: attacker.unit.name,
      class: attacker.unit.classKey,
      attackType: context.attackType,
      stats: attacker.combatStats,
    },
    target: {
      name: target.unit.name,
      class: target.unit.classKey,
      hp: target.currentHP,
      stats: target.combatStats,
    },
    skill: {
      potency: damageEffect.potency,
      type: context.damageType,
      flags: context.combinedFlags,
    },
  })

  const hitResolution = resolveHit(
    attacker,
    target,
    damageEffect,
    context,
    rng,
    twoHitsRemaining
  )

  if (hitResolution === null) {
    return createMissResult(0, false)
  }

  if (!hitResolution.finalHit) {
    return createMissResult(hitResolution.hitChance, hitResolution.wasDodged)
  }

  const { hit, hitChance, wasDodged, finalHit } = hitResolution

  const effectiveStats = getEffectiveStatsForTarget(attacker, target)
  const critRate = effectiveStats.CRT

  const canLandCrit = canCrit(attacker)
  const hasTrueCriticalBuff = checkAndConsumeTrueCritical(attacker)
  const hasTrueCritical =
    hasFlagOrBuff(
      context.combinedFlags,
      attacker.buffs,
      BUFF_STATS.TRUE_CRITICAL as Flag,
      BUFF_STATS.TRUE_CRITICAL
    ) || hasTrueCriticalBuff
  const wasCritical =
    canLandCrit && (hasTrueCritical || rollCrit(rng, critRate))
  const critMultiplier = getCritMultiplier(wasCritical)
  if (hasTrueCritical) {
    logCombat('✨ TrueCritical Active - guaranteed crit applied')
  }

  const isUnguardableBuff = checkAndConsumeUnguardable(attacker)
  const isUnguardable =
    hasFlagOrBuff(
      context.combinedFlags,
      attacker.buffs,
      BUFF_STATS.UNGUARDABLE as Flag,
      BUFF_STATS.UNGUARDABLE
    ) || isUnguardableBuff
  const canGuardAttack =
    context.hasPhysical && !isUnguardable && canGuard(target)
  const guardRate = canGuardAttack ? target.combatStats.GRD : 0
  let wasGuarded = canGuardAttack && rollGuard(rng, guardRate)
  if (isUnguardable) {
    logCombat('⚡ Unguardable Active - guard bypassed')
  }
  const equipmentGuardEff = target.combatStats.GuardEff || 0
  let guardMultiplier = calculateNaturalGuardMultiplier(
    wasGuarded,
    equipmentGuardEff
  )

  if (context.hasPhysical && target.incomingGuard) {
    const override =
      target.incomingGuard === 'full'
        ? 0
        : calculateSkillGuardMultiplier(target.incomingGuard)
    guardMultiplier = override
    wasGuarded = true
  }

  const magicNegated =
    magicNegatedOverride !== undefined
      ? magicNegatedOverride
      : checkAndConsumeNegateMagicDamage(target)

  if (typeof effectResults?.ownHPBasedDamage === 'number') {
    if (context.attackType === 'Melee' && target.incomingParry) {
      target.incomingParry = false
    }

    if (attacker.conferrals && attacker.conferrals.length > 0) {
      removeExpiredConferrals(attacker, 'attacks')
    }

    const dmgReductionPercent = target.combatStats.DmgReductionPercent ?? 0
    const multiplier = (100 - dmgReductionPercent) / 100
    let finalDamage = Math.max(
      0,
      Math.round(effectResults.ownHPBasedDamage * multiplier)
    )

    if (finalHit && finalDamage > 0) {
      const immunityResult = checkAndConsumeDamageImmunity(
        target,
        remainingImmunityHits
      )
      if (immunityResult.blocked) {
        finalDamage = 0
        logCombat(
          `🛡️ ${target.unit.name} blocked all damage via DamageImmunity`
        )
      }
    }

    return {
      hit: finalHit,
      damage: finalDamage,
      wasCritical: false,
      wasGuarded: false,
      wasDodged: false,
      hitChance,
      breakdown: {
        rawBaseDamage: effectResults.ownHPBasedDamage,
        afterPotency: effectResults.ownHPBasedDamage,
        afterCrit: effectResults.ownHPBasedDamage,
        afterGuard: effectResults.ownHPBasedDamage,
        afterEffectiveness: effectResults.ownHPBasedDamage,
        afterDmgReduction: finalDamage,
      },
    }
  }

  const damageComponents = calculateDamageComponents(
    attacker,
    target,
    damageEffect,
    context,
    critMultiplier,
    guardMultiplier,
    effectResults,
    magicNegated
  )

  const {
    physicalDamage,
    magicalDamage,
    conferralDamage,
    totalDamage,
    rawBaseDamage,
    afterPotencyDamage,
    afterCritDamage,
  } = damageComponents

  const modifiers = applyDamageModifiers(attacker, target, totalDamage)
  const {
    effectiveness,
    effectivenessRule,
    afterEffectiveness,
    dmgReductionPercent,
  } = modifiers

  let damageWithTargetHP = afterEffectiveness
  if (typeof effectResults?.targetHPBasedDamage === 'number') {
    damageWithTargetHP = afterEffectiveness + effectResults.targetHPBasedDamage
    logCombat(
      `💥 Target HP-based damage: +${effectResults.targetHPBasedDamage} (added to ${afterEffectiveness} = ${damageWithTargetHP})`
    )
  }

  let finalDamage = applyDamageReduction(
    damageWithTargetHP,
    dmgReductionPercent
  )

  if (finalHit && finalDamage > 0) {
    const immunityResult = checkAndConsumeDamageImmunity(
      target,
      remainingImmunityHits
    )
    if (immunityResult.blocked) {
      finalDamage = 0
      logCombat(`🛡️ ${target.unit.name} blocked all damage via DamageImmunity`)
    }
  }

  const targetHPBonus =
    typeof effectResults?.targetHPBasedDamage === 'number'
      ? ` + ${effectResults.targetHPBasedDamage} (target HP)`
      : ''
  const damageBreakdownString =
    context.hasPhysical && context.hasMagical
      ? `(${physicalDamage} physical + ${magicalDamage} magical${conferralDamage > 0 ? ` + ${conferralDamage} conferral` : ''}) × ${effectiveness}${targetHPBonus}${dmgReductionPercent > 0 ? ` × ${((100 - dmgReductionPercent) / 100).toFixed(2)}` : ''} = ${finalDamage} total`
      : context.hasPhysical || context.hasMagical
        ? `${physicalDamage + magicalDamage} ${context.hasPhysical ? 'physical' : 'magical'}${conferralDamage > 0 ? ` + ${conferralDamage} conferral` : ''} × ${effectiveness}${targetHPBonus}${dmgReductionPercent > 0 ? ` × ${((100 - dmgReductionPercent) / 100).toFixed(2)}` : ''} = ${finalDamage} final`
        : conferralDamage > 0
          ? `${conferralDamage} conferral × ${effectiveness}${targetHPBonus}${dmgReductionPercent > 0 ? ` × ${((100 - dmgReductionPercent) / 100).toFixed(2)}` : ''} = ${finalDamage} final`
          : `${totalDamage} × ${effectiveness}${targetHPBonus}${dmgReductionPercent > 0 ? ` × ${((100 - dmgReductionPercent) / 100).toFixed(2)}` : ''} = ${finalDamage} final`

  logCombat('🎲 Damage Calculation Complete', {
    attacker: attacker.unit.name,
    target: target.unit.name,
    attackType: `${context.attackType} Attack`,
    damageType: `${context.damageType} Damage`,
    damageBreakdown: damageBreakdownString,
    hitChance: `${hitChance.toFixed(1)}%`,
    result: finalHit ? 'HIT' : wasDodged ? 'DODGED' : 'MISS',
    damage: finalHit ? `${finalDamage} damage` : '0 damage (missed)',
    effectiveness: effectivenessRule
      ? `×${effectiveness} - ${effectivenessRule.description}`
      : 'No effectiveness bonus',
    guardInfo: hit
      ? {
          equipmentGuardEff,
          totalGuardEff: wasGuarded ? Math.min(25 + equipmentGuardEff, 75) : 0,
          guardRate: `${guardRate}%`,
          wasGuarded,
        }
      : null,
    breakdown: hit
      ? {
          physicalDamage: context.hasPhysical ? physicalDamage : 0,
          magicalDamage: context.hasMagical ? magicalDamage : 0,
          conferralDamage: conferralDamage,
          targetHPBasedDamage:
            typeof effectResults?.targetHPBasedDamage === 'number'
              ? effectResults.targetHPBasedDamage
              : 0,
          subtotal: totalDamage,
          effectiveness: `×${effectiveness}`,
          critResult: wasCritical ? `CRIT ×${critMultiplier}` : 'no crit',
          guardResult: wasGuarded
            ? `GUARDED (${Math.min(25 + equipmentGuardEff, 75)}% reduction) - physical only`
            : 'no guard',
          final: `${finalDamage} total damage`,
          dmgReduction:
            dmgReductionPercent > 0
              ? `${dmgReductionPercent}% reduction applied`
              : 'no reduction',
        }
      : null,
  })

  return {
    hit: finalHit,
    damage: finalDamage,
    wasCritical,
    wasGuarded,
    wasDodged,
    hitChance,
    breakdown: {
      rawBaseDamage: rawBaseDamage,
      afterPotency: afterPotencyDamage,
      afterCrit: afterCritDamage,
      afterGuard: totalDamage,
      afterEffectiveness: afterEffectiveness,
      targetHPBasedDamage:
        typeof effectResults?.targetHPBasedDamage === 'number'
          ? effectResults.targetHPBasedDamage
          : 0,
      afterDmgReduction: finalDamage,
    },
  }
}
