import {
  checkAndConsumeBlind,
  canCrit,
  canGuard,
  processAfflictionsOnDamage,
} from './affliction-manager'
import type { EffectProcessingResult } from './effect-processor'
import { removeExpiredConferrals } from './status-effects'

import {
  getAttackType,
  getDamageType,
  getCombinedFlags,
} from '@/core/attack-types'
import {
  rollCrit,
  getCritMultiplier,
  rollGuard,
  type GuardLevel,
} from '@/core/calculations/combat-calculations'
import { findEffectivenessRule } from '@/core/effectiveness-rules'
import type { RandomNumberGeneratorType } from '@/core/random'
import { CLASS_DATA } from '@/data/units/class-data'
import { clamp } from '@/lib/utils'
import type { BattleContext } from '@/types/battle-engine'
import type { SkillCategory } from '@/types/core'
import type { DamageEffect, Flag } from '@/types/effects'

/**
 * Result of a damage calculation attempt
 */
export interface DamageResult {
  /** Whether the attack hit */
  hit: boolean
  /** Final damage dealt (0 if missed) */
  damage: number
  /** Whether the attack was a critical hit */
  wasCritical: boolean
  /** Whether the target guarded */
  wasGuarded: boolean
  /** Hit chance percentage that was calculated */
  hitChance: number
  /** Breakdown of damage calculation steps */
  breakdown: {
    baseDamage: number
    afterPotency: number
    afterCrit: number
    afterGuard: number
    afterEffectiveness: number
  }
}

/**
 * Calculate hit chance for an attack
 * Formula: ((100 + attacker accuracy) - target evasion) * skill hitRate / 100
 * Special cases:
 * - If hitRate is "True" or TrueStrike flag is present, always hits
 * - Flying units get 50% evasion bonus against melee attacks
 */
export const calculateHitChance = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  flags: Flag[] = [],
  attackType?: 'Melee' | 'Ranged' | 'Magical'
) => {
  // Check for always-hit conditions
  if (damageEffect.hitRate === 'True' || flags.includes('TrueStrike')) {
    return 100
  }

  // Calculate base hit chance
  const accuracy = attacker.combatStats.ACC
  const evasion = target.combatStats.EVA
  const skillHitRate = damageEffect.hitRate

  const rawHitChance = ((100 + accuracy - evasion) * skillHitRate) / 100

  // Apply flying evasion bonus against melee attacks
  const targetIsFlying = target.combatantTypes.includes('Flying')
  const flyingEvasionBonus = targetIsFlying && attackType === 'Melee' ? 0.5 : 1

  const adjustedHitChance = rawHitChance * flyingEvasionBonus
  const clampedHitChance = clamp(adjustedHitChance, 0, 100)

  return clampedHitChance
}

/**
 * Roll for hit success based on hit chance
 */
export const rollHit = (rng: RandomNumberGeneratorType, hitChance: number) => {
  const roll = rng.random() * 100
  const hit = roll < hitChance
  return hit
}

/**
 * Calculate base damage before modifiers
 * Formula: (attack - defense) * potency / 100
 * Applies potency bonuses and defense ignore modifiers from effects
 */
export const calculateBaseDamage = (
  attacker: BattleContext,
  target: BattleContext,
  potency: number,
  isPhysical: boolean,
  effectResults?: EffectProcessingResult
) => {
  const attack = isPhysical
    ? attacker.combatStats.PATK
    : attacker.combatStats.MATK

  let defense = isPhysical ? target.combatStats.PDEF : target.combatStats.MDEF

  // Apply potency bonus from effects
  let adjustedPotency = potency
  if (effectResults) {
    const bonusPercent = isPhysical
      ? effectResults.potencyModifiers.physical
      : effectResults.potencyModifiers.magical
    adjustedPotency *= 1 + bonusPercent / 100
  }

  // Apply defense ignore from effects
  if (effectResults && effectResults.defenseIgnoreFraction > 0) {
    defense *= 1 - effectResults.defenseIgnoreFraction
  }

  const baseDamage = attack - defense
  const afterPotency = (baseDamage * adjustedPotency) / 100
  const finalDamage = Math.max(1, afterPotency)

  return finalDamage
}

/**
 * Calculate natural guard multiplier using GuardEff as reduction percentage
 * All units have base 25% guard, equipment adds to this, capped at 75% (heavy guard level)
 */
export const calculateNaturalGuardMultiplier = (
  didGuard: boolean,
  equipmentGuardEff: number
) => {
  if (!didGuard) {
    return 1.0
  }

  // Base 25% guard for all units + equipment GuardEff, capped at 75% (heavy guard level)
  const baseGuardEff = 25
  const totalGuardEff = baseGuardEff + equipmentGuardEff
  const reductionPercent = Math.min(totalGuardEff, 75) // Cap at 75% (heavy guard level)
  const multiplier = (100 - reductionPercent) / 100

  return multiplier
}

/**
 * Calculate guard multiplier for guard skills/effects with fixed levels
 * These are used by guard skills and have fixed reduction values
 */
export const calculateSkillGuardMultiplier = (guardLevel: GuardLevel) => {
  const fixedMultipliers: Record<GuardLevel, number> = {
    none: 1.0,
    light: 0.75,
    medium: 0.5,
    heavy: 0.25,
  }

  return fixedMultipliers[guardLevel]
}

/**
 * Calculate effectiveness multiplier based on class/movement type matchups
 * Uses data-driven effectiveness rules for maintainable and extensible combat bonuses
 */
export const calculateEffectiveness = (
  attacker: BattleContext,
  target: BattleContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _isPhysical: boolean
) => {
  const attackerClassData = CLASS_DATA[attacker.unit.classKey]
  const targetClassData = CLASS_DATA[target.unit.classKey]

  if (!attackerClassData || !targetClassData) {
    console.warn(`Missing class data for effectiveness calculation:`, {
      attackerClass: attacker.unit.classKey,
      targetClass: target.unit.classKey,
      attackerClassData: !!attackerClassData,
      targetClassData: !!targetClassData,
    })
    return 1.0
  }

  // Find applicable effectiveness rule
  const effectivenessRule = findEffectivenessRule(
    attacker.unit.classKey,
    attackerClassData.movementType,
    attackerClassData.trait,
    target.unit.classKey,
    targetClassData.movementType,
    targetClassData.trait
  )

  return effectivenessRule ? effectivenessRule.multiplier : 1.0
}

/**
 * Main damage calculation function
 * Handles hit chance, damage calculation, crit, guard, and effectiveness
 */
export const calculateSkillDamage = (
  damageEffect: DamageEffect,
  skillFlags: readonly Flag[] | Flag[] = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _skillCategories: readonly SkillCategory[] | SkillCategory[] = [],
  attacker: BattleContext,
  target: BattleContext,
  rng: RandomNumberGeneratorType,
  innateAttackType?: 'Magical' | 'Ranged',
  effectResults?: EffectProcessingResult
): DamageResult => {
  // Combine skill-level, damage effect flags, and granted flags from effects
  let combinedFlags = getCombinedFlags(skillFlags, damageEffect.flags || [])
  if (effectResults?.grantedFlags && effectResults.grantedFlags.length > 0) {
    combinedFlags = getCombinedFlags(
      combinedFlags,
      effectResults.grantedFlags as Flag[]
    )
    console.log('🚩 Granted Flags Applied:', {
      grantedFlags: effectResults.grantedFlags,
      allCombinedFlags: combinedFlags,
    })
  }

  // Determine attack type for this skill usage
  const attackType = getAttackType(attacker.unit.classKey, innateAttackType)

  // Determine damage type
  const damageType = getDamageType(damageEffect)
  const hasPhysical =
    damageEffect.potency.physical !== undefined &&
    damageEffect.potency.physical > 0
  const hasMagical =
    damageEffect.potency.magical !== undefined &&
    damageEffect.potency.magical > 0

  // Log combat stats for verification
  console.log('⚔️ Combat Stats:', {
    attacker: {
      name: attacker.unit.name,
      class: attacker.unit.classKey,
      attackType,
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
      type: damageType,
      flags: combinedFlags,
    },
  })

  // Check for Blind - this overrides all hit calculations including TrueStrike
  const blindMiss = checkAndConsumeBlind(attacker)
  if (blindMiss) {
    return {
      hit: false,
      damage: 0,
      wasCritical: false,
      wasGuarded: false,
      hitChance: 0, // Blind guarantees miss
      breakdown: {
        baseDamage: 0,
        afterPotency: 0,
        afterCrit: 0,
        afterGuard: 0,
        afterEffectiveness: 0,
      },
    }
  }

  // Calculate hit chance
  const isTrueStrike = combinedFlags.includes('TrueStrike')
  const hitChance = calculateHitChance(
    attacker,
    target,
    damageEffect,
    combinedFlags,
    attackType
  )
  if (isTrueStrike) {
    console.log('🎯 TrueStrike Flag Active - guaranteed hit')
  }

  // Roll for hit
  const hit = rollHit(rng, hitChance)

  // If miss, return early
  if (!hit) {
    return {
      hit: false,
      damage: 0,
      wasCritical: false,
      wasGuarded: false,
      hitChance,
      breakdown: {
        baseDamage: 0,
        afterPotency: 0,
        afterCrit: 0,
        afterGuard: 0,
        afterEffectiveness: 0,
      },
    }
  }

  // Roll shared modifiers once
  const critRate = attacker.combatStats.CRT

  // Check for Crit Seal - this overrides TrueCritical as well
  const canLandCrit = canCrit(attacker)
  const hasTrueCritical = combinedFlags.includes('TrueCritical')
  const wasCritical =
    canLandCrit && (hasTrueCritical || rollCrit(rng, critRate))
  const critMultiplier = getCritMultiplier(wasCritical)
  if (hasTrueCritical) {
    console.log('✨ TrueCritical Flag Active - guaranteed crit applied')
  }

  // Roll for guard (only affects physical damage)
  const isUnguardable = combinedFlags.includes('Unguardable')
  const canGuardAttack = hasPhysical && !isUnguardable && canGuard(target)
  const guardRate = canGuardAttack ? target.combatStats.GRD : 0
  let wasGuarded = canGuardAttack && rollGuard(rng, guardRate)
  if (isUnguardable) {
    console.log('⚡ Unguardable Flag Active - guard bypassed')
  }
  const equipmentGuardEff = target.combatStats.GuardEff || 0
  let guardMultiplier = calculateNaturalGuardMultiplier(
    wasGuarded,
    equipmentGuardEff
  )

  // Skill Guard overrides natural guard for this attack instance (physical only)
  if (hasPhysical && target.incomingGuard) {
    const override =
      target.incomingGuard === 'full'
        ? 0
        : calculateSkillGuardMultiplier(target.incomingGuard)
    guardMultiplier = override
    wasGuarded = true
  }

  let totalDamage = 0
  let physicalDamage = 0
  let magicalDamage = 0
  let conferralDamage = 0

  // Calculate physical damage component (before effectiveness)
  if (hasPhysical) {
    let physicalBaseDamage = 0
    let parried = false

    // Parry: negate melee physical damage for one hit
    if (attackType === 'Melee' && target.incomingParry) {
      parried = true
      physicalBaseDamage = 0
      // consume one parry charge
      target.incomingParry = false
    } else {
      physicalBaseDamage = calculateBaseDamage(
        attacker,
        target,
        damageEffect.potency.physical!,
        true,
        effectResults
      )
    }

    const afterCrit = physicalBaseDamage * critMultiplier
    const afterGuard = afterCrit * guardMultiplier // Guard only affects physical
    physicalDamage = parried ? 0 : Math.max(1, Math.round(afterGuard))
    totalDamage += physicalDamage
  }

  // Calculate magical damage component (before effectiveness)
  if (hasMagical) {
    const magicalBaseDamage = calculateBaseDamage(
      attacker,
      target,
      damageEffect.potency.magical!,
      false,
      effectResults
    )
    const afterCrit = magicalBaseDamage * critMultiplier
    // No guard multiplier for magical damage
    magicalDamage = Math.max(1, Math.round(afterCrit))
    totalDamage += magicalDamage
  }

  // Apply conferral magical damage (if attacker has active conferrals)
  if (attacker.conferrals && attacker.conferrals.length > 0) {
    attacker.conferrals.forEach(conferral => {
      // Calculate magical damage using the stored caster's MATK
      const conferralBaseDamage =
        ((conferral.casterMATK - target.combatStats.MDEF) * conferral.potency) /
        100
      const conferralAfterCrit = conferralBaseDamage * critMultiplier
      // No guard multiplier for conferral magical damage
      conferralDamage += Math.max(1, Math.round(conferralAfterCrit))
    })
    totalDamage += conferralDamage

    console.log('🪄 Conferral Effects Applied:', {
      conferralCount: attacker.conferrals.length,
      conferralDamage,
      conferrals: attacker.conferrals.map(c => ({
        skillId: c.skillId,
        potency: c.potency,
        casterMATK: c.casterMATK,
      })),
    })

    // Remove conferrals that expire when this unit attacks
    removeExpiredConferrals(attacker, 'attacks')
  }

  // Calculate effectiveness once and apply to total damage
  // Use physical=true as default, but effectiveness is class-based anyway
  const attackerClassData = CLASS_DATA[attacker.unit.classKey]
  const targetClassData = CLASS_DATA[target.unit.classKey]
  const effectivenessRule =
    attackerClassData && targetClassData
      ? findEffectivenessRule(
          attacker.unit.classKey,
          attackerClassData.movementType,
          attackerClassData.trait,
          target.unit.classKey,
          targetClassData.movementType,
          targetClassData.trait
        )
      : null
  const effectiveness = effectivenessRule ? effectivenessRule.multiplier : 1.0
  const finalDamage = Math.max(1, Math.round(totalDamage * effectiveness))

  // Process afflictions when target takes damage (removes Freeze)
  if (finalDamage > 0) {
    processAfflictionsOnDamage(target)
  }

  console.log('🎲 Damage Calculation Complete', {
    attacker: attacker.unit.name,
    target: target.unit.name,
    attackType: `${attackType} Attack`,
    damageType: `${damageType} Damage`,
    damageBreakdown:
      hasPhysical && hasMagical
        ? `(${physicalDamage} physical + ${magicalDamage} magical${conferralDamage > 0 ? ` + ${conferralDamage} conferral` : ''}) × ${effectiveness} = ${finalDamage} total`
        : hasPhysical || hasMagical
          ? `${physicalDamage + magicalDamage} ${hasPhysical ? 'physical' : 'magical'}${conferralDamage > 0 ? ` + ${conferralDamage} conferral` : ''} × ${effectiveness} = ${finalDamage} final`
          : conferralDamage > 0
            ? `${conferralDamage} conferral × ${effectiveness} = ${finalDamage} final`
            : `${totalDamage} × ${effectiveness} = ${finalDamage} final`,
    hitChance: `${hitChance.toFixed(1)}%`,
    result: hit ? 'HIT' : 'MISS',
    damage: hit ? `${finalDamage} damage` : '0 damage (missed)',
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
          physicalDamage: hasPhysical ? physicalDamage : 0,
          magicalDamage: hasMagical ? magicalDamage : 0,
          conferralDamage: conferralDamage,
          subtotal: totalDamage,
          effectiveness: `×${effectiveness}`,
          critResult: wasCritical ? `CRIT ×${critMultiplier}` : 'no crit',
          guardResult: wasGuarded
            ? `GUARDED (${Math.min(25 + equipmentGuardEff, 75)}% reduction) - physical only`
            : 'no guard',
          final: `${finalDamage} total damage`,
        }
      : null,
  })

  return {
    hit,
    damage: finalDamage,
    wasCritical,
    wasGuarded,
    hitChance,
    breakdown: {
      baseDamage:
        (hasPhysical ? physicalDamage : 0) + (hasMagical ? magicalDamage : 0),
      afterPotency: finalDamage,
      afterCrit: finalDamage,
      afterGuard: finalDamage,
      afterEffectiveness: finalDamage,
    },
  }
}

/**
 * Apply multiple hits from a skill (for skills with hitCount > 1)
 */
export const calculateMultiHitDamage = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  rng: RandomNumberGeneratorType,
  skillFlags: Flag[] = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _effectFlags: Flag[] = [],
  skillCategories: SkillCategory[] = ['Damage'],
  innateAttackType?: 'Magical' | 'Ranged',
  effectResults?: EffectProcessingResult
): DamageResult[] => {
  const results: DamageResult[] = []

  for (let i = 0; i < damageEffect.hitCount; i++) {
    const result = calculateSkillDamage(
      damageEffect,
      skillFlags,
      skillCategories,
      attacker,
      target,
      rng,
      innateAttackType,
      effectResults
    )
    results.push(result)
  }

  return results
}
