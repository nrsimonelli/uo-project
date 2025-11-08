import { checkAndConsumeNegateMagicDamage } from './buff-consumption'
import { calculateSkillDamage } from './damage-calculator'
import type { DamageResult } from './damage-calculator-types'
import { checkAndConsumeDamageImmunity } from './damage-immunity'
import type { EffectProcessingResult } from './effect-processor'
import { createDodgedResult, getCurrentTwoHitsRemaining } from './evade-system'

import type { RandomNumberGeneratorType } from '@/core/random'
import type { BattleContext } from '@/types/battle-engine'
import type { SkillCategory } from '@/types/core'
import type { DamageEffect, Flag } from '@/types/effects'

export const calculateMultiHitDamage = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  rng: RandomNumberGeneratorType,
  skillFlags: Flag[] = [],
  effectFlags: Flag[] = [],
  skillCategories: SkillCategory[] = ['Damage'],
  innateAttackType?: 'Magical' | 'Ranged',
  effectResults?: EffectProcessingResult
): DamageResult[] => {
  void effectFlags
  const magicNegated = checkAndConsumeNegateMagicDamage(target)

  const initialEntireAttackImmunity = (target.damageImmunities || []).find(
    immunity => immunity.immunityType === 'entireAttack'
  )
  const entireAttackBlocked = initialEntireAttackImmunity !== undefined
  if (entireAttackBlocked) {
    const immunityResult = checkAndConsumeDamageImmunity(target)
    if (immunityResult.blocked) {
      return Array.from({ length: damageEffect.hitCount }).map(() => ({
        hit: true,
        damage: 0,
        wasCritical: false,
        wasGuarded: false,
        wasDodged: false,
        hitChance: 100,
        breakdown: {
          baseDamage: 0,
          afterPotency: 0,
          afterCrit: 0,
          afterGuard: 0,
          afterEffectiveness: 0,
          afterDmgReduction: 0,
        },
      }))
    }
  }

  const initialEntireAttackCount = (target.evades || []).filter(
    evade => evade.evadeType === 'entireAttack'
  ).length
  const initialTwoHitsEvades = (target.evades || []).filter(
    evade => evade.evadeType === 'twoHits'
  )
  const initialMultipleHitsImmunity = (target.damageImmunities || []).find(
    immunity => immunity.immunityType === 'multipleHits'
  )
  const initialRemainingImmunityHits =
    initialMultipleHitsImmunity?.remainingImmunityHits ??
    initialMultipleHitsImmunity?.hitCount ??
    0

  const calculateHit = (
    twoHitsRemaining: number,
    entireAttackUsed: boolean,
    remainingImmunityHits: number
  ): {
    result: DamageResult
    nextRemaining: number
    nextEntireAttackUsed: boolean
    nextRemainingImmunityHits: number
  } => {
    if (entireAttackUsed) {
      return {
        result: createDodgedResult(),
        nextRemaining: twoHitsRemaining,
        nextEntireAttackUsed: true,
        nextRemainingImmunityHits: remainingImmunityHits,
      }
    }

    const result = calculateSkillDamage(
      damageEffect,
      skillFlags,
      skillCategories,
      attacker,
      target,
      rng,
      innateAttackType,
      effectResults,
      twoHitsRemaining,
      magicNegated,
      remainingImmunityHits
    )

    const currentEntireAttackCount = (target.evades || []).filter(
      evade => evade.evadeType === 'entireAttack'
    ).length
    const nextEntireAttackUsed =
      result.wasDodged &&
      initialEntireAttackCount > 0 &&
      currentEntireAttackCount < initialEntireAttackCount

    const nextRemaining =
      result.wasDodged && initialTwoHitsEvades.length > 0
        ? getCurrentTwoHitsRemaining(target.evades)
        : twoHitsRemaining

    const currentMultipleHitsImmunity = (target.damageImmunities || []).find(
      immunity => immunity.immunityType === 'multipleHits'
    )
    const nextRemainingImmunityHits =
      currentMultipleHitsImmunity?.remainingImmunityHits ??
      remainingImmunityHits

    return {
      result,
      nextRemaining,
      nextEntireAttackUsed,
      nextRemainingImmunityHits,
    }
  }

  const initialTwoHitsRemaining =
    initialTwoHitsEvades[0]?._remainingUses ??
    (initialTwoHitsEvades.length > 0 ? 2 : 0)

  return Array.from({ length: damageEffect.hitCount }).reduce<{
    results: DamageResult[]
    remaining: number
    entireAttackUsed: boolean
    remainingImmunityHits: number
  }>(
    acc => {
      const {
        result,
        nextRemaining,
        nextEntireAttackUsed,
        nextRemainingImmunityHits,
      } = calculateHit(
        acc.remaining,
        acc.entireAttackUsed,
        acc.remainingImmunityHits
      )
      return {
        results: [...acc.results, result],
        remaining: nextRemaining,
        entireAttackUsed: nextEntireAttackUsed,
        remainingImmunityHits: nextRemainingImmunityHits,
      }
    },
    {
      results: [],
      remaining: initialTwoHitsRemaining,
      entireAttackUsed: false,
      remainingImmunityHits: initialRemainingImmunityHits,
    }
  ).results
}
