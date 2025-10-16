import {
  type ConditionEvaluationContext,
  evaluateAllConditions,
} from '../evaluation/condition-evaluator'

import type { AfflictionType } from '@/types/conditions'
import type { Effect, DamageEffect } from '@/types/effects'

/**
 * Check if an effect is classified as a debuff for immunity purposes
 * Debuff-type effects include:
 * - DebuffEffect (stat debuffs)
 * - ResourceStealEffect (resource stealing)
 * - AfflictionEffect (status afflictions)
 */
export const isDebuffTypeEffect = (effect: Effect): boolean => {
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
): boolean => {
  return unitImmunities.includes('Debuff')
}

/**
 * Check if a unit is immune to a specific affliction
 */
export const hasAfflictionImmunity = (
  unitImmunities: (AfflictionType | 'Affliction' | 'Debuff')[],
  affliction: AfflictionType
): boolean => {
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
  // Damage modifications
  potencyModifiers: {
    physical: number
    magical: number
  }
  defenseIgnoreFraction: number

  // Additional flags granted by effects
  grantedFlags: string[]

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
    duration?: 'NextAction'
    skillId: string
  }>

  // Buffs/debuffs to apply
  buffsToApply: Array<{
    stat: string
    value: number
    scaling: 'flat' | 'percent'
    target: 'User' | 'Target'
    duration?: 'NextAction'
    skillId: string
    stacks: boolean
  }>
  debuffsToApply: Array<{
    stat: string
    value: number
    scaling: 'flat' | 'percent'
    target: 'User' | 'Target'
    duration?: 'NextAction'
    skillId: string
    stacks: boolean
  }>
}

/**
 * Process all effects for a skill, evaluating conditions and accumulating results
 */
export const processEffects = (
  effects: readonly Effect[] | Effect[],
  context: ConditionEvaluationContext,
  skillId: string
): EffectProcessingResult => {
  const result: EffectProcessingResult = {
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

    if (effect.kind === 'Cover' || effect.kind === 'Guard') {
      // These would be processed differently - perhaps in passive skill system
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
