import {
  type ConditionEvaluationContext,
  evaluateAllConditions,
} from '../evaluation/condition-evaluator'

import type { AfflictionType } from '@/types/conditions'
import type { Effect, DamageEffect, Flag } from '@/types/effects'

/**
 * Check if an effect is classified as a debuff for immunity purposes
 * Debuff-type effects include:
 * - DebuffEffect (stat debuffs)
 * - ResourceStealEffect (resource stealing)
 * - AfflictionEffect (status afflictions)
 */
export const isDebuffTypeEffect = (effect: Effect) => {
  return (
    effect.kind === 'Debuff' ||
    effect.kind === 'ResourceSteal' ||
    effect.kind === 'Affliction'
  )
}

/**
 * Check if a unit is immune to debuff-type effects
 */
export const hasDebuffImmunity = (
  unitImmunities: (AfflictionType | 'Affliction' | 'Debuff')[]
) => {
  return unitImmunities.includes('Debuff')
}

/**
 * Check if a unit is immune to a specific affliction
 */
export const hasAfflictionImmunity = (
  unitImmunities: (AfflictionType | 'Affliction' | 'Debuff')[],
  affliction: AfflictionType
) => {
  return (
    unitImmunities.includes('Affliction') ||
    unitImmunities.includes('Debuff') ||
    unitImmunities.includes(affliction)
  )
}

/**
 * Result of processing effects for a skill
 */
export interface EffectProcessingResult {
  // Sacrifice tracking
  sacrificeAmount: number // Actual amount of HP sacrificed
  sacrificePercentage: number // Original percentage requested

  ownHPBasedDamage: null | number // Damage based on own HP

  // Damage modifications
  potencyModifiers: {
    physical: number
    magical: number
  }
  defenseIgnoreFraction: number

  // Additional flags granted by effects
  grantedFlags: Flag[]

  // Healing effects
  healPercent: number
  healPotency: {
    physical: number
    magical: number
  }

  // Resource changes
  apGain: number
  ppGain: number

  // Resource stealing (classified as debuffs for immunity purposes)
  resourceStealToApply: Array<{
    resource: 'AP' | 'PP'
    amount: number | 'All'
    target: 'User' | 'Target'
  }>

  // Debuff amplification effects to apply
  debuffAmplificationsToApply: Array<{
    multiplier: number
    target: 'User' | 'Target'
    duration?: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
    skillId: string
  }>

  // Conferral effects to apply
  conferralsToApply: Array<{
    potency: number
    target: 'User' | 'Target'
    duration?: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
    skillId: string
    casterMATK: number // Store the caster's MATK when the effect is applied
  }>

  // Afflictions to apply
  afflictionsToApply: Array<{
    afflictionType: AfflictionType
    target: 'User' | 'Target'
    level?: number // For Burn stacking
    skillId: string
  }>

  // Cleanses to apply (remove buffs/debuffs/afflictions)
  cleansesToApply: Array<{
    target: 'Buffs' | 'Debuffs' | 'Afflictions' | AfflictionType
    applyTo: 'User' | 'Target'
    skillId: string
  }>

  // Resurrect entries - applied after damage phase, revives dead targets
  resurrectsToApply: Array<{
    healAmount: number
    healType: 'flat' | 'percent'
    target: 'User' | 'Target'
    skillId: string
  }>

  // LifeSteal entries - healed after damage is applied
  lifeStealsToApply: Array<{
    percentage: number
    target: 'User' | 'Target'
    skillId: string
  }>

  // Buffs/debuffs to apply
  buffsToApply: Array<{
    stat: string
    value: number
    scaling: 'flat' | 'percent'
    target: 'User' | 'Target'
    duration?:
      | 'UntilNextAction'
      | 'UntilNextAttack'
      | 'UntilAttacked'
      | 'UntilDebuffed'
    skillId: string
    stacks: boolean
  }>
  debuffsToApply: Array<{
    stat: string
    value: number
    scaling: 'flat' | 'percent'
    target: 'User' | 'Target'
    duration?:
      | 'UntilNextAction'
      | 'UntilNextAttack'
      | 'UntilAttacked'
      | 'UntilDebuffed'
    skillId: string
    stacks: boolean
  }>
}

/**
 * Process all effects for a skill, evaluating conditions and accumulating results
 */

/**
 * Process sacrifice effects to determine the HP cost for using a skill
 * This is called once at skill execution time, before any targeting or per-target effects.
 *
 * Key Behavior:
 * - Sacrifice is a skill cost, not a per-target effect
 * - Only applies once per skill use regardless of number of targets
 * - Ensures unit will never be reduced below 1 HP
 * - Must be called BEFORE individual target processing begins
 */
export const processSacrificeEffects = (
  effects: readonly Effect[] | Effect[],
  context: ConditionEvaluationContext
): {
  hpSacrificed: number
  percentageRequested: number
} => {
  const sacrificeEffect = effects.find(e => e.kind === 'Sacrifice')
  if (!sacrificeEffect || sacrificeEffect.kind !== 'Sacrifice') {
    return { hpSacrificed: 0, percentageRequested: 0 }
  }

  // Skip if conditions aren't met
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!evaluateAllConditions(sacrificeEffect.conditions as any, context)) {
    return { hpSacrificed: 0, percentageRequested: 0 }
  }

  // Calculate maximum safe sacrifice
  const currentHP = context.attacker.currentHP
  const maxSacrifice = Math.max(0, currentHP - 1) // Must leave 1 HP

  // Calculate requested sacrifice
  const requestedAmount = Math.floor(
    (context.attacker.combatStats.HP * sacrificeEffect.amount) / 100
  )

  // Take minimum of requested and safe amount
  const actualSacrifice = Math.min(maxSacrifice, requestedAmount)

  return {
    hpSacrificed: actualSacrifice,
    percentageRequested: sacrificeEffect.amount,
  }
}

export const processEffects = (
  effects: readonly Effect[] | Effect[],
  context: ConditionEvaluationContext,
  skillId: string,
  casterMATK?: number // Optional caster MATK for MagicConferral effects
): EffectProcessingResult => {
  const result: EffectProcessingResult = {
    sacrificeAmount: 0,
    sacrificePercentage: 0,
    ownHPBasedDamage: null,
    potencyModifiers: { physical: 0, magical: 0 },
    defenseIgnoreFraction: 0,
    grantedFlags: [],
    healPercent: 0,
    healPotency: { physical: 0, magical: 0 },
    apGain: 0,
    ppGain: 0,
    buffsToApply: [],
    debuffsToApply: [],
    resourceStealToApply: [],
    debuffAmplificationsToApply: [],
    conferralsToApply: [],
    afflictionsToApply: [],
    cleansesToApply: [],
    resurrectsToApply: [],
    lifeStealsToApply: [],
  }

  const nonDamageEffects = effects.filter(effect => effect.kind !== 'Damage')
  const validEffects = nonDamageEffects.filter(effect =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evaluateAllConditions(effect.conditions as any, context)
  )

  validEffects.forEach(effect => {
    if (effect.kind === 'PotencyBoost') {
      result.potencyModifiers.physical += effect.amount.physical || 0
      result.potencyModifiers.magical += effect.amount.magical || 0
      return
    }

    if (effect.kind === 'IgnoreDefense') {
      // Take the maximum ignore fraction (don't stack additively)
      result.defenseIgnoreFraction = Math.max(
        result.defenseIgnoreFraction,
        effect.fraction
      )
      return
    }

    if (effect.kind === 'GrantFlag') {
      result.grantedFlags.push(effect.flag)
      return
    }

    if (effect.kind === 'HealPercent') {
      result.healPercent += effect.value
      return
    }

    if (effect.kind === 'Heal') {
      result.healPotency.physical += effect.potency.physical || 0
      result.healPotency.magical += effect.potency.magical || 0
      return
    }

    if (effect.kind === 'ResourceGain') {
      if (effect.resource === 'AP') {
        result.apGain += effect.amount
      }
      if (effect.resource === 'PP') {
        result.ppGain += effect.amount
      }
      return
    }

    if (effect.kind === 'Buff') {
      result.buffsToApply.push({
        stat: effect.stat,
        value: effect.value,
        scaling: effect.scaling,
        target: effect.applyTo || 'Target',
        duration: effect.duration,
        skillId,
        stacks: effect.stacks || false,
      })
      return
    }

    if (effect.kind === 'Debuff') {
      result.debuffsToApply.push({
        stat: effect.stat,
        value: effect.value,
        scaling: effect.scaling,
        target: effect.applyTo || 'Target',
        duration: effect.duration,
        skillId,
        stacks: effect.stacks || false,
      })
      return
    }

    if (effect.kind === 'ResourceSteal') {
      // ResourceSteal is classified as a debuff-type effect for immunity purposes
      result.resourceStealToApply.push({
        resource: effect.resource,
        amount: effect.amount,
        target: effect.applyTo || 'User', // Resources go to user, taken from target
      })
      return
    }

    if (effect.kind === 'DebuffAmplification') {
      result.debuffAmplificationsToApply.push({
        multiplier: effect.multiplier,
        target: effect.applyTo || 'Target',
        duration: effect.duration,
        skillId,
      })
      return
    }

    if (effect.kind === 'Conferral') {
      result.conferralsToApply.push({
        potency: effect.potency,
        target: effect.applyTo || 'Target',
        duration: effect.duration,
        skillId,
        casterMATK: casterMATK || 0, // Store caster's MATK at time of casting
      })
      return
    }

    if (effect.kind === 'Affliction') {
      result.afflictionsToApply.push({
        afflictionType: effect.affliction,
        target: effect.applyTo || 'Target',
        level: effect.level, // For Burn stacking
        skillId,
      })
      return
    }

    if (effect.kind === 'Cover' || effect.kind === 'Guard') {
      // These would be processed differently - passive skill system
      return
    }

    if (effect.kind === 'Parry') {
      // Parry is processed in passive skill system
      return
    }

    if (effect.kind === 'Evade') {
      // Evade is processed in passive skill system
      return
    }

    if (effect.kind === 'OwnHPBasedDamage') {
      const currentHP = context.attacker.currentHP
      const missingHP = context.attacker.combatStats.HP - currentHP
      const factor = effect.amount / 100

      const rawDamage =
        effect.type === 'percentRemaining'
          ? currentHP * factor
          : missingHP * factor

      result.ownHPBasedDamage = Math.max(0, Math.round(rawDamage))
      return
    }

    if (effect.kind === 'Cleanse') {
      // Queue cleanse actions for later application (status-effects will execute them)
      result.cleansesToApply.push({
        target: effect.target,
        applyTo: effect.applyTo || 'Target',
        skillId,
      })
      return
    }

    if (effect.kind === 'LifeSteal') {
      result.lifeStealsToApply.push({
        percentage: effect.percentage,
        target: effect.applyTo || 'User',
        skillId,
      })
      return
    }

    if (effect.kind === 'Resurrect') {
      result.resurrectsToApply.push({
        healAmount: effect.value,
        healType: effect.scaling,
        target: effect.applyTo || 'Target',
        skillId,
      })
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn('Unknown effect kind:', (effect as any).kind)
  })

  return result
}

/**
 * Apply effect processing results to a damage effect
 * This modifies the damage calculation based on conditional effects
 */
export const applyEffectsToDamage = (
  baseDamageEffect: DamageEffect,
  effectResults: EffectProcessingResult,
  defenderPDEF: number,
  defenderMDEF: number
): {
  modifiedPotency: { physical?: number; magical?: number }
  modifiedDefenderPDEF: number
  modifiedDefenderMDEF: number
  additionalFlags: string[]
} => {
  // Apply potency boosts
  const modifiedPotency = {
    physical: baseDamageEffect.potency.physical
      ? baseDamageEffect.potency.physical +
        effectResults.potencyModifiers.physical
      : undefined,
    magical: baseDamageEffect.potency.magical
      ? baseDamageEffect.potency.magical +
        effectResults.potencyModifiers.magical
      : undefined,
  }

  // Apply defense ignore
  const modifiedDefenderPDEF =
    defenderPDEF * (1 - effectResults.defenseIgnoreFraction)
  const modifiedDefenderMDEF =
    defenderMDEF * (1 - effectResults.defenseIgnoreFraction)

  return {
    modifiedPotency,
    modifiedDefenderPDEF,
    modifiedDefenderMDEF,
    additionalFlags: effectResults.grantedFlags,
  }
}

/**
 * Get all damage effects from a skill's effects array
 */
export const getDamageEffects = (
  effects: readonly Effect[] | Effect[]
): DamageEffect[] => {
  return effects.filter(effect => effect.kind === 'Damage') as DamageEffect[]
}
