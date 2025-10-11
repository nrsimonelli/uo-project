import { evaluateAllConditions } from './condition-evaluator'
import type { ConditionEvaluationContext } from './condition-evaluator'

import type { Effect, DamageEffect } from '@/types/effects'

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

  // Buffs/debuffs to apply
  buffsToApply: Array<{
    stat: string
    value: number
    scaling: 'flat' | 'percent'
    target: 'User' | 'Target'
    duration?: 'NextAction'
  }>
  debuffsToApply: Array<{
    stat: string
    value: number
    scaling: 'flat' | 'percent'
    target: 'User' | 'Target'
    duration?: 'NextAction'
  }>
}

/**
 * Process all effects for a skill, evaluating conditions and accumulating results
 */
export const processEffects = (
  effects: Effect[],
  context: ConditionEvaluationContext
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
  }

  const nonDamageEffects = effects.filter(effect => effect.kind !== 'Damage')
  const validEffects = nonDamageEffects.filter(effect =>
    evaluateAllConditions(effect.conditions, context)
  )

  validEffects.forEach(effect => {
    if (effect.kind === 'PotencyBoost') {
      result.potencyModifiers.physical += effect.amount.physical || 0
      result.potencyModifiers.magical += effect.amount.magical || 0
      console.debug('Applied PotencyBoost:', effect.amount)
      return
    }

    if (effect.kind === 'IgnoreDefense') {
      // Take the maximum ignore fraction (don't stack additively)
      result.defenseIgnoreFraction = Math.max(
        result.defenseIgnoreFraction,
        effect.fraction
      )
      console.debug('Applied IgnoreDefense:', effect.fraction)
      return
    }

    if (effect.kind === 'GrantFlag') {
      result.grantedFlags.push(effect.flag)
      console.debug('Granted flag:', effect.flag)
      return
    }

    if (effect.kind === 'HealPercent') {
      result.healPercent += effect.value
      console.debug('Added heal percent:', effect.value)
      return
    }

    if (effect.kind === 'Heal') {
      result.healPotency.physical += effect.potency.physical || 0
      result.healPotency.magical += effect.potency.magical || 0
      console.debug('Added heal potency:', effect.potency)
      return
    }

    if (effect.kind === 'ResourceGain') {
      if (effect.resource === 'AP') {
        result.apGain += effect.amount
      }
      if (effect.resource === 'PP') {
        result.ppGain += effect.amount
      }
      console.debug(`Added ${effect.resource} gain:`, effect.amount)
      return
    }

    if (effect.kind === 'Buff') {
      result.buffsToApply.push({
        stat: effect.stat,
        value: effect.value,
        scaling: effect.scaling,
        target: effect.applyTo || 'Target',
        duration: effect.duration,
      })
      console.debug('Added buff:', effect)
      return
    }

    if (effect.kind === 'Debuff') {
      result.debuffsToApply.push({
        stat: effect.stat,
        value: effect.value,
        scaling: effect.scaling,
        target: effect.applyTo || 'Target',
        duration: effect.duration,
      })
      console.debug('Added debuff:', effect)
      return
    }

    if (effect.kind === 'Cover' || effect.kind === 'Guard') {
      // These would be processed differently - perhaps in passive skill system
      console.debug('Skipping Cover/Guard effect - needs passive system')
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
export const getDamageEffects = (effects: Effect[]): DamageEffect[] => {
  return effects.filter(
    (effect): effect is DamageEffect => effect.kind === 'Damage'
  )
}
