import type { ConditionEvaluationContext } from '../evaluation/condition-evaluator'

import type { DamageResult } from './damage-calculator'
import {
  calculateSkillDamage,
  calculateMultiHitDamage,
} from './damage-calculator'
import {
  processEffects,
  getDamageEffects,
  applyEffectsToDamage,
  type EffectProcessingResult,
} from './effect-processor'

import { isDamageSkill } from '@/core/attack-types'
import type { RandomNumberGeneratorType } from '@/core/random'
import type { BattleContext } from '@/types/battle-engine'
import type { DamageEffect } from '@/types/effects'
import type { ActiveSkill } from '@/types/skills'

/**
 * Result of executing a skill on a single target
 */
export interface SingleTargetSkillResult {
  damageResults: readonly DamageResult[]
  effectResults: EffectProcessingResult
  totalDamage: number
  anyHit: boolean
  allHit: boolean
}

/**
 * Summary statistics for multi-target skill execution
 */
export interface SkillExecutionSummary {
  totalDamage: number
  targetsHit: number
  criticalHits: number
}

/**
 * Result of executing a skill on multiple targets
 */
export interface MultiTargetSkillResult {
  results: readonly SingleTargetSkillResult[]
  summary: SkillExecutionSummary
}

/**
 * Execute a non-damage skill on a single target
 */
const executeNonDamageSkill = (
  skill: ActiveSkill,
  attacker: BattleContext,
  target: BattleContext
): SingleTargetSkillResult => {
  // Create condition evaluation context
  const conditionContext: ConditionEvaluationContext = {
    attacker,
    target,
    hitResult: undefined,
    targetDefeated: undefined,
  }

  // Process all conditional effects
  const effectResults = processEffects(skill.effects, conditionContext)

  return {
    damageResults: [],
    effectResults,
    totalDamage: 0,
    anyHit: true, // Non-damage skills always "hit"
    allHit: true,
  }
}

/**
 * Execute a damage skill against a single target
 */
const executeDamageSkill = (
  skill: ActiveSkill,
  attacker: BattleContext,
  target: BattleContext,
  rng: RandomNumberGeneratorType
): SingleTargetSkillResult => {
  // Create condition evaluation context
  const conditionContext: ConditionEvaluationContext = {
    attacker,
    target,
    hitResult: undefined,
    targetDefeated: undefined,
  }

  // Process all conditional effects
  const effectResults = processEffects(skill.effects, conditionContext)

  // Get damage effects from skill
  const damageEffects = getDamageEffects(skill.effects)

  // Execute each damage effect
  const damageResults: DamageResult[] = []

  for (const damageEffect of damageEffects) {
    // Apply effect modifications to damage
    const modifiedDamageData = applyEffectsToDamage(
      damageEffect,
      effectResults,
      target.combatStats.PDEF,
      target.combatStats.MDEF
    )

    // Prepare damage effect with modified potency
    const modifiedEffect: DamageEffect = {
      ...damageEffect,
      potency: modifiedDamageData.modifiedPotency,
    }

    // Handle multi-hit attacks (hitCount > 1)
    if (damageEffect.hitCount > 1) {
      const multiHitResults = calculateMultiHitDamage(
        attacker,
        target,
        modifiedEffect,
        rng,
        skill.skillFlags || [],
        [], // effectFlags - not used in current implementation
        skill.skillCategories || ['Damage']
      )
      damageResults.push(...multiHitResults)
    } else {
      // Single hit attack
      const result = calculateSkillDamage(
        modifiedEffect,
        skill.skillFlags || [],
        skill.skillCategories,
        attacker,
        target,
        rng
      )
      damageResults.push(result)
    }
  }

  // Calculate total damage and hit status
  const totalDamage = damageResults.reduce(
    (sum, result) => sum + result.damage,
    0
  )
  const anyHit = damageResults.some(result => result.hit)
  const allHit = damageResults.every(result => result.hit)

  // Update condition context with final hit result
  conditionContext.targetDefeated = target.currentHP - totalDamage <= 0

  return {
    damageResults,
    effectResults,
    totalDamage,
    anyHit,
    allHit,
  }
}

/**
 * Calculate summary statistics for multiple skill execution results
 */
const calculateSkillSummary = (
  results: readonly SingleTargetSkillResult[]
): SkillExecutionSummary => {
  return results.reduce(
    (acc: SkillExecutionSummary, result: SingleTargetSkillResult) => ({
      totalDamage: acc.totalDamage + result.totalDamage,
      targetsHit: acc.targetsHit + (result.anyHit ? 1 : 0),
      criticalHits:
        acc.criticalHits +
        result.damageResults.filter(d => d.wasCritical).length,
    }),
    { totalDamage: 0, targetsHit: 0, criticalHits: 0 }
  )
}

/**
 * Execute a skill against one or more targets
 */
export const executeSkill = (
  skill: ActiveSkill,
  attacker: BattleContext,
  targets: BattleContext | readonly BattleContext[],
  rng: RandomNumberGeneratorType
): SingleTargetSkillResult | MultiTargetSkillResult => {
  // Convert to array for consistent handling
  const targetArray = Array.isArray(targets) ? targets : [targets]

  // Safety check: Single-target skills should only affect one target
  // (This should now be rare due to tactical system fix, but kept as safety net)
  if (skill.targeting.pattern === 'Single' && targetArray.length > 1) {
    console.warn(
      `⚠️  executeSkill: Single-target skill '${skill.name}' received ${targetArray.length} targets (tactical system should prevent this):`,
      targetArray.map(t => t.unit.name)
    )
    // For single-target skills, only use the first target
    const singleTarget = targetArray[0]
    const result = executeSingleTarget(skill, attacker, singleTarget, rng)
    return result
  }

  // Execute skill for all targets
  const results = targetArray.map(target =>
    executeSingleTarget(skill, attacker, target, rng)
  )

  // Return single result for one target, multi-target result for multiple
  if (targetArray.length === 1) {
    return results[0]
  }

  const summary = calculateSkillSummary(results)
  return { results, summary }
}

/**
 * Execute a skill on a single target (preserving existing logic)
 */
const executeSingleTarget = (
  skill: ActiveSkill,
  attacker: BattleContext,
  target: BattleContext,
  rng: RandomNumberGeneratorType
): SingleTargetSkillResult => {
  if (!isDamageSkill(skill.skillCategories)) {
    return executeNonDamageSkill(skill, attacker, target)
  }
  return executeDamageSkill(skill, attacker, target, rng)
}
