import { calculateSkillDamage } from '@/core/battle/combat/damage-calculator'
import {
  getDamageEffects,
  processEffects,
} from '@/core/battle/combat/effect-processor'
import type { ConditionEvaluationContext } from '@/core/battle/evaluation/condition-evaluator'
import type { RandomNumberGeneratorType } from '@/core/random'

/**
 * Simple skill damage test
 * Uses any to accept both generated and interface types
 */
export function testSkillDamage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skill: any,
  context: ConditionEvaluationContext,
  rng: RandomNumberGeneratorType
) {
  const damageEffects = getDamageEffects(skill.effects)

  if (damageEffects.length === 0) {
    return { damage: 0, hit: false }
  }

  const result = calculateSkillDamage(
    damageEffects[0],
    skill.skillFlags ?? [],
    skill.skillCategories || ['Damage'],
    context.attacker,
    context.target,
    rng
  )

  return result
}

/**
 * Test skill effects processing
 * Uses any to accept both generated and interface types
 */
export function testSkillEffects(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skill: any,
  context: ConditionEvaluationContext
) {
  return processEffects(skill.effects, context)
}
