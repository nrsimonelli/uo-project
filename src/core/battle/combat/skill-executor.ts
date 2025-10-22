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
import {
  applyStatusEffects,
  removeExpiredBuffs,
  removeExpiredDebuffs,
  recalculateStats,
  getSkillName,
  applyBuff,
  mapDuration,
} from './status-effects'

import { isDamageSkill } from '@/core/attack-types'
import type { RandomNumberGeneratorType } from '@/core/random'
import type { StatKey } from '@/types/base-stats'
import type { BattleContext, Buff } from '@/types/battle-engine'
import type { SkillCategory } from '@/types/core'
import type { DamageEffect, Flag } from '@/types/effects'
import type { ActiveSkill, PassiveSkill } from '@/types/skills'

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
  skill: ActiveSkill | PassiveSkill,
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
  const effectResults = processEffects(
    skill.effects,
    conditionContext,
    skill.id,
    attacker.combatStats.MATK // Pass caster's MATK for conferral effects
  )

  // Apply status effects (buffs/debuffs) to appropriate targets
  // Note: applyStatusEffects already handles recalculating combat stats
  applyStatusEffects(effectResults, attacker, [target])

  return {
    damageResults: [],
    effectResults,
    totalDamage: 0,
    anyHit: true, // Non-damage skills always "hit"
    allHit: true,
  }
}

/**
 * Apply self-buffs from effects to attacker before damage calculation
 * Only applies buffs targeting the User (applyTo: 'User')
 */
const applyAttackerSelfBuffs = (
  effectResults: EffectProcessingResult,
  attacker: BattleContext
) => {
  // Filter buffs that apply to User
  const selfBuffs = effectResults.buffsToApply.filter(
    buff => buff.target === 'User'
  )

  if (selfBuffs.length === 0) return

  selfBuffs.forEach(buff => {
    const skillName = getSkillName(buff.skillId)
    const buffToApply: Buff = {
      name: `${skillName} (+${buff.stat})`,
      stat: buff.stat as StatKey,
      value: buff.value,
      duration: mapDuration(buff.duration),
      scaling: buff.scaling,
      source: attacker.unit.id,
      skillId: buff.skillId,
    }

    applyBuff(attacker, buffToApply, buff.stacks)
  })

  // Recalculate attacker stats with new buffs
  recalculateStats(attacker)
}

/**
 * Execute a damage skill against a single target
 */
const executeDamageSkill = (
  skill: ActiveSkill | PassiveSkill,
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
  const effectResults = processEffects(
    skill.effects,
    conditionContext,
    skill.id,
    attacker.combatStats.MATK // Pass caster's MATK for conferral effects
  )

  // Apply self-buffs to attacker BEFORE damage calculation
  // This allows buffs like Keen Edge's +50 CRT to affect the current attack
  applyAttackerSelfBuffs(effectResults, attacker)

  // Get damage effects from skill
  const damageEffects = getDamageEffects(skill.effects)

  // Execute each damage effect
  const damageResults: DamageResult[] = []

  for (const damageEffect of damageEffects) {
    // Apply effect modifications to damage (potency boosts, defense ignore)
    const modifiedDamageData = applyEffectsToDamage(
      damageEffect,
      effectResults,
      target.combatStats.PDEF,
      target.combatStats.MDEF
    )

    // Create a new damage effect with modified potency
    const modifiedEffect: DamageEffect = {
      ...damageEffect,
      potency: modifiedDamageData.modifiedPotency,
    }

    // Create a modified target context with reduced defense
    // to account for defense ignore effects
    const targetWithModifiedDefense: BattleContext = {
      ...target,
      combatStats: {
        ...target.combatStats,
        PDEF: modifiedDamageData.modifiedDefenderPDEF,
        MDEF: modifiedDamageData.modifiedDefenderMDEF,
      },
    }

    // Create effect results without potency/defense modifiers since they're now in the damage effect/target
    const effectResultsWithoutModifiers: EffectProcessingResult = {
      ...effectResults,
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
    }

    // Handle multi-hit attacks (hitCount > 1)
    if (damageEffect.hitCount > 1) {
      const multiHitResults = calculateMultiHitDamage(
        attacker,
        targetWithModifiedDefense,
        modifiedEffect,
        rng,
        (skill.skillFlags as Flag[]) || [],
        [], // effectFlags - not used in current implementation
        (skill.skillCategories as SkillCategory[]) || ['Damage'],
        skill.innateAttackType,
        effectResultsWithoutModifiers
      )
      damageResults.push(...multiHitResults)
    } else {
      // Single hit attack
      const result = calculateSkillDamage(
        modifiedEffect,
        skill.skillFlags || [],
        skill.skillCategories,
        attacker,
        targetWithModifiedDefense,
        rng,
        skill.innateAttackType,
        effectResultsWithoutModifiers
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

  // Remove self-buffs with UntilNextAttack duration (they were consumed by this attack)
  removeExpiredBuffs(attacker, 'attacks')

  // Apply remaining status effects (target buffs, debuffs, etc)
  // Only apply target-directed effects if the attack hit
  applyStatusEffects(effectResults, attacker, [target], anyHit)

  // Clean up debuffs with UntilNextAttack duration
  removeExpiredDebuffs(attacker, 'attacks')

  // Clean up buffs/debuffs with UntilAttacked duration for the target
  // These expire after the target is attacked
  if (anyHit) {
    removeExpiredBuffs(target, 'attacked')
  }

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
  skill: ActiveSkill | PassiveSkill,
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
  skill: ActiveSkill | PassiveSkill,
  attacker: BattleContext,
  target: BattleContext,
  rng: RandomNumberGeneratorType
): SingleTargetSkillResult => {
  if (!isDamageSkill(skill.skillCategories)) {
    return executeNonDamageSkill(skill, attacker, target)
  }
  return executeDamageSkill(skill, attacker, target, rng)
}
