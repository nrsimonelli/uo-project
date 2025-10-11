import { getAttackType, getDamageType, getCombinedFlags } from './attack-types'
import {
  rollCrit,
  getCritMultiplier,
  rollGuard,
  type GuardLevel,
} from './calculations'
import type { RandomNumberGeneratorType } from './random'

import { CLASS_DATA } from '@/data/units/class-data'
import { clamp } from '@/lib/utils'
import type { BattleContext } from '@/types/battle-engine'
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
 */
export const calculateHitChance = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  flags: Flag[] = []
): number => {
  // Check for always-hit conditions
  if (damageEffect.hitRate === 'True' || flags.includes('TrueStrike')) {
    console.debug('Hit Chance Calculation: Always hit (True/TrueStrike)', {
      attacker: attacker.unit.name,
      target: target.unit.name,
      hitRate: damageEffect.hitRate,
      flags,
    })
    return 100
  }

  // Calculate base hit chance
  const accuracy = attacker.combatStats.ACC
  const evasion = target.combatStats.EVA
  const skillHitRate = damageEffect.hitRate as number

  const rawHitChance = ((100 + accuracy - evasion) * skillHitRate) / 100
  const clampedHitChance = clamp(rawHitChance, 0, 100)

  console.debug('Hit Chance Calculation', {
    attacker: attacker.unit.name,
    target: target.unit.name,
    accuracy,
    evasion,
    skillHitRate,
    formula: `((100 + ${accuracy} - ${evasion}) * ${skillHitRate}) / 100`,
    calculation: `((100 + ${accuracy} - ${evasion}) * ${skillHitRate}) / 100 = ${rawHitChance.toFixed(1)}%`,
    rawHitChance,
    clampedHitChance,
  })

  return clampedHitChance
}

/**
 * Roll for hit success based on hit chance
 */
export const rollHit = (rng: RandomNumberGeneratorType, hitChance: number) => {
  const roll = rng.random() * 100
  const hit = roll < hitChance
  console.debug('Hit Roll', {
    hitChance: `${hitChance.toFixed(1)}%`,
    roll: `${roll.toFixed(1)}%`,
    result: hit ? 'HIT' : 'MISS',
    comparison: `${roll.toFixed(1)} ${hit ? '<' : '>='} ${hitChance.toFixed(1)}`,
  })
  return hit
}

/**
 * Calculate base damage before modifiers
 * Formula: (attack - defense) * potency / 100
 */
export const calculateBaseDamage = (
  attacker: BattleContext,
  target: BattleContext,
  potency: number,
  isPhysical: boolean
) => {
  const attack = isPhysical
    ? attacker.combatStats.PATK
    : attacker.combatStats.MATK

  const defense = isPhysical ? target.combatStats.PDEF : target.combatStats.MDEF

  const baseDamage = attack - defense
  const afterPotency = (baseDamage * potency) / 100
  const finalDamage = Math.max(1, afterPotency)

  console.debug('Base Damage Calculation', {
    attacker: attacker.unit.name,
    target: target.unit.name,
    type: isPhysical ? 'Physical' : 'Magical',
    attack,
    defense,
    potency: `${potency}%`,
    formula: `max(1, (${attack} - ${defense}) * ${potency}% / 100)`,
    baseDamage,
    afterPotency,
    finalDamage,
  })

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

  console.debug('Natural Guard Multiplier Calculation', {
    didGuard,
    baseGuardEff,
    equipmentGuardEff,
    totalGuardEff,
    reductionPercent: `${reductionPercent}%`,
    multiplier,
  })

  return multiplier
}

/**
 * Calculate guard multiplier for guard skills/effects with fixed levels
 * These are used by guard skills and have fixed reduction values
 */
export const calculateSkillGuardMultiplier = (guardLevel: GuardLevel) => {
  const fixedMultipliers: Record<GuardLevel, number> = {
    none: 1.0,
    light: 0.75, // 25% reduction
    medium: 0.5, // 50% reduction
    heavy: 0.25, // 75% reduction
  }

  return fixedMultipliers[guardLevel]
}

/**
 * Calculate effectiveness multiplier based on class/movement type matchups
 * Effectiveness Rules (x2 damage):
 * - Gryphon Knight | Wyvern Knight | Gryphon Master | Wyvern Master attacking Cavalry
 * - Cavalry attacking Infantry
 * - Archer attacking Flying
 */
export const calculateEffectiveness = (
  attacker: BattleContext,
  target: BattleContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _isPhysical: boolean
) => {
  const attackerClass = attacker.unit.classKey
  const targetClass = target.unit.classKey

  const attackerClassData = CLASS_DATA[attackerClass]
  const targetClassData = CLASS_DATA[targetClass]

  if (!attackerClassData || !targetClassData) {
    console.warn(`Missing class data for effectiveness calculation:`, {
      attackerClass,
      targetClass,
      attackerClassData: !!attackerClassData,
      targetClassData: !!targetClassData,
    })
    return 1.0
  }

  let effectiveness = 1.0
  let effectivenessReason = 'neutral'

  // Flying units (Gryphon/Wyvern Knights/Masters) attacking Cavalry
  const flyingAttackerClasses = [
    'Gryphon Knight',
    'Wyvern Knight',
    'Gryphon Master',
    'Wyvern Master',
  ]
  if (
    flyingAttackerClasses.includes(attackerClass) &&
    targetClassData.movementType === 'Cavalry'
  ) {
    effectiveness = 2.0
    effectivenessReason = 'Flying vs Cavalry'
  }
  // Cavalry attacking Infantry
  else if (
    attackerClassData.movementType === 'Cavalry' &&
    targetClassData.movementType === 'Infantry'
  ) {
    effectiveness = 2.0
    effectivenessReason = 'Cavalry vs Infantry'
  }
  // Archer attacking Flying
  else if (
    attackerClassData.trait === 'Archer' &&
    targetClassData.movementType === 'Flying'
  ) {
    effectiveness = 2.0
    effectivenessReason = 'Archer vs Flying'
  }

  console.debug('Effectiveness Calculation', {
    attacker: attacker.unit.name,
    target: target.unit.name,
    attackerClass,
    targetClass,
    attackerMovement: attackerClassData.movementType,
    targetMovement: targetClassData.movementType,
    attackerTrait: attackerClassData.trait,
    targetTrait: targetClassData.trait,
    effectiveness,
    reason: effectivenessReason,
  })

  return effectiveness
}

/**
 * Main damage calculation function
 * Handles hit chance, damage calculation, crit, guard, and effectiveness
 */
export const calculateSkillDamage = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  rng: RandomNumberGeneratorType,
  skillFlags: Flag[] = [], // Skill-level flags
  effectFlags: Flag[] = [], // Effect-level flags (from damageEffect.flags)
  innateAttackType?: 'Magical' | 'Ranged' // Innate attack type from skill
): DamageResult => {
  // Combine skill-level and effect-level flags
  const combinedFlags = getCombinedFlags(skillFlags, effectFlags)

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

  // Calculate hit chance
  const hitChance = calculateHitChance(
    attacker,
    target,
    damageEffect,
    combinedFlags
  )

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
  const wasCritical =
    combinedFlags.includes('TrueCritical') || rollCrit(rng, critRate)
  const critMultiplier = getCritMultiplier(wasCritical)

  // Roll for guard (only affects physical damage)
  const canGuard = hasPhysical && !combinedFlags.includes('Unguardable')
  const guardRate = canGuard ? target.combatStats.GRD : 0
  const wasGuarded = canGuard && rollGuard(rng, guardRate)
  const equipmentGuardEff = target.combatStats.GuardEff || 0
  const guardMultiplier = calculateNaturalGuardMultiplier(
    wasGuarded,
    equipmentGuardEff
  )

  let totalDamage = 0
  let physicalDamage = 0
  let magicalDamage = 0

  // Calculate physical damage component (before effectiveness)
  if (hasPhysical) {
    const physicalBaseDamage = calculateBaseDamage(
      attacker,
      target,
      damageEffect.potency.physical!,
      true
    )
    const afterCrit = physicalBaseDamage * critMultiplier
    const afterGuard = afterCrit * guardMultiplier // Guard only affects physical
    physicalDamage = Math.max(1, Math.round(afterGuard))
    totalDamage += physicalDamage
  }

  // Calculate magical damage component (before effectiveness)
  if (hasMagical) {
    const magicalBaseDamage = calculateBaseDamage(
      attacker,
      target,
      damageEffect.potency.magical!,
      false
    )
    const afterCrit = magicalBaseDamage * critMultiplier
    // No guard multiplier for magical damage
    magicalDamage = Math.max(1, Math.round(afterCrit))
    totalDamage += magicalDamage
  }

  // Calculate effectiveness once and apply to total damage
  // Use physical=true as default, but effectiveness is class-based anyway
  const effectiveness = calculateEffectiveness(attacker, target, hasPhysical)
  const finalDamage = Math.max(1, Math.round(totalDamage * effectiveness))

  console.log('🎲 Damage Calculation Complete', {
    attacker: attacker.unit.name,
    target: target.unit.name,
    attackType: `${attackType} Attack`,
    damageType: `${damageType} Damage`,
    damageBreakdown:
      hasPhysical && hasMagical
        ? `(${physicalDamage} physical + ${magicalDamage} magical) × ${effectiveness} = ${finalDamage} total`
        : `${totalDamage} ${hasPhysical ? 'physical' : 'magical'} × ${effectiveness} = ${finalDamage} final`,
    hitChance: `${hitChance.toFixed(1)}%`,
    result: hit ? 'HIT' : 'MISS',
    damage: hit ? `${finalDamage} damage` : '0 damage (missed)',
    effectiveness:
      effectiveness > 1
        ? `Effective bonus dmg ×${effectiveness}!`
        : 'No class effective damage',
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
  effectFlags: Flag[] = [],
  innateAttackType?: 'Magical' | 'Ranged'
): DamageResult[] => {
  const results: DamageResult[] = []

  for (let i = 0; i < damageEffect.hitCount; i++) {
    const result = calculateSkillDamage(
      attacker,
      target,
      damageEffect,
      rng,
      skillFlags,
      effectFlags,
      innateAttackType
    )
    results.push(result)

    console.debug(`Hit ${i + 1}/${damageEffect.hitCount}`, result)
  }

  return results
}
