import {
  type TacticalContext,
  SKIP_EVALUATORS,
  FILTER_EVALUATORS,
  SORT_EVALUATORS,
  COMPARE_EVALUATORS,
} from '../evaluation/tactical-evaluators'

import { getDefaultTargets } from './skill-targeting'

import { getAttackType, isDamageSkill } from '@/core/attack-types'
import {
  COMPLETE_TACTIC_METADATA,
  type ConditionMetadata,
} from '@/data/tactics/tactic-condition-meta'
import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { SkillSlot, ActiveSkill, PassiveSkill } from '@/types/skills'
import type { Tactic } from '@/types/tactics'

/**
 * Result of tactical evaluation for a skill slot
 */
export interface TacticalResult {
  shouldUseSkill: boolean
  targets: BattleContext[]
}

/**
 * Main function to evaluate tactical targeting for a skill slot
 * This is identical to the original but uses registry-based evaluators
 */
export const evaluateSkillSlotTactics = (
  skillSlot: SkillSlot,
  actingUnit: BattleContext,
  battlefield: BattlefieldState
): TacticalResult => {
  const skill = getSkillFromSlot(skillSlot)
  if (!skill) {
    return { shouldUseSkill: false, targets: [] }
  }

  const context: TacticalContext = {
    actingUnit,
    battlefield,
    skill,
    allAllies: Object.values(battlefield.units).filter(
      unit => unit.team === actingUnit.team && unit.currentHP > 0
    ),
    allEnemies: Object.values(battlefield.units).filter(
      unit => unit.team !== actingUnit.team && unit.currentHP > 0
    ),
  }

  const [tactic1, tactic2] = skillSlot.tactics

  // If no tactics, use default targeting
  if (!tactic1 && !tactic2) {
    const defaultTargets = getDefaultTargets(skill, actingUnit, battlefield)
    return {
      shouldUseSkill: defaultTargets.length > 0,
      targets: defaultTargets,
    }
  }

  // Get initial target pool based on skill's target group
  let targets = getInitialTargetPool(skill, context)

  // Apply tactic 1 if present
  if (tactic1) {
    const shouldSkip = shouldSkipSkillForTactic(tactic1, context)
    if (shouldSkip) {
      return { shouldUseSkill: false, targets: [] }
    }
    targets = applyTacticToTargets(targets, tactic1, context)
  }

  // Apply tactic 2 if present
  if (tactic2) {
    const shouldSkip = shouldSkipSkillForTactic(tactic2, context)
    if (shouldSkip) {
      return { shouldUseSkill: false, targets: [] }
    }
    targets = applyTacticToTargets(targets, tactic2, context)
  }

  // If no valid targets after tactical filtering, skip skill
  if (targets.length === 0) {
    return { shouldUseSkill: false, targets: [] }
  }

  // Apply skill targeting pattern, respecting tactical priorities
  // For Single patterns, we need to check front-row blocking for melee attacks
  // before returning the tactical result directly
  const { pattern } = skill.targeting

  // Check for true tie after all tactical processing
  const sortedTactics = [tactic1, tactic2].filter(
    tactic =>
      tactic && COMPLETE_TACTIC_METADATA[tactic.condition.key]?.type === 'sort'
  )

  if (sortedTactics.length > 0 && hasTrueTie(targets, sortedTactics, context)) {
    // True tie detected - but for formation tactics, we should preserve tactical priorities
    // and not fall back to default targeting which would override formation preferences
    const hasFormationTactic = sortedTactics.some(tactic => {
      if (!tactic) return false
      const metadata = COMPLETE_TACTIC_METADATA[tactic.condition.key]
      return metadata?.valueType === 'formation'
    })

    if (hasFormationTactic) {
      // For formation tactics, use the tactically sorted result directly for Single attacks
      // Don't fall back to default targeting which would override formation priorities
      if (pattern === 'Single' && targets.length > 0) {
        return { shouldUseSkill: true, targets: [targets[0]] }
      }
    } else {
      // True tie for non-formation tactics - use default targeting on the tied targets
      const defaultTargets = getDefaultTargets(
        skill,
        actingUnit,
        battlefield,
        targets
      )
      return {
        shouldUseSkill: defaultTargets.length > 0,
        targets: defaultTargets,
      }
    }
  }

  if ((pattern === 'Single' || pattern === 'Row') && targets.length > 0) {
    // Check if this is a melee Single/Row attack that needs front-row blocking
    const { group } = skill.targeting
    const needsFrontRowBlocking =
      group === 'Enemy' &&
      isDamageSkill(skill.skillCategories) &&
      getAttackType(actingUnit.unit.classKey, skill.innateAttackType) ===
        'Melee' &&
      (pattern === 'Single' || pattern === 'Row')

    if (needsFrontRowBlocking) {
      // Apply front-row blocking check for melee Single/Row attacks
      const frontRowBlockingResult = getDefaultTargets(
        skill,
        actingUnit,
        battlefield,
        targets // Pass tactically-processed targets as preFilteredTargets
      )

      // If front-row blocking filtered out all targets, the skill should be blocked
      if (frontRowBlockingResult.length === 0) {
        return { shouldUseSkill: false, targets: [] }
      }

      // Otherwise, use the front-row blocking result
      return { shouldUseSkill: true, targets: frontRowBlockingResult }
    } else {
      // For non-melee attacks or Single ranged/magical attacks, use tactical result directly
      if (pattern === 'Single') {
        return { shouldUseSkill: true, targets: [targets[0]] }
      }
      // For Row patterns that don't need front-row blocking, fall through to normal processing
    }
  }

  // For other patterns, apply the pattern to tactically-processed targets
  const finalTargets = getDefaultTargets(
    skill,
    actingUnit,
    battlefield,
    targets // Pass tactically-processed targets as preFilteredTargets
  )

  return { shouldUseSkill: finalTargets.length > 0, targets: finalTargets }
}

/**
 * Get initial target pool based on skill's targeting and tactic requirements
 * (unchanged from original)
 */
const getInitialTargetPool = (
  skill: ActiveSkill | PassiveSkill,
  context: TacticalContext
): BattleContext[] => {
  const { targeting } = skill

  // Handle Self pattern
  if (targeting.pattern === 'Self') {
    return [context.actingUnit]
  }

  // Get base target group
  if (targeting.group === 'Ally') {
    return context.allAllies
  } else if (targeting.group === 'Enemy') {
    return context.allEnemies
  } else if (targeting.group === 'Self') {
    return [context.actingUnit]
  }

  return []
}

/**
 * NEW: Check if a tactic condition requires skipping the skill entirely
 * Uses registry lookup instead of switch statement
 */
const shouldSkipSkillForTactic = (
  tactic: Tactic,
  context: TacticalContext
): boolean => {
  const metadata = COMPLETE_TACTIC_METADATA[tactic.condition.key]
  if (!metadata) {
    console.warn(`Unknown tactic condition: ${tactic.condition.key}`)
    return false
  }

  // Look up the appropriate evaluator function
  const evaluator = SKIP_EVALUATORS[metadata.valueType]
  if (evaluator) {
    return evaluator(metadata, context)
  }

  // Default: don't skip for unhandled types
  return false
}

/**
 * NEW: Apply a tactic (filter or sort) to a list of targets
 * Uses registry lookup instead of switch statement
 */
const applyTacticToTargets = (
  targets: BattleContext[],
  tactic: Tactic,
  context: TacticalContext
): BattleContext[] => {
  const metadata = COMPLETE_TACTIC_METADATA[tactic.condition.key]
  if (!metadata) {
    console.warn(`Unknown tactic condition: ${tactic.condition.key}`)
    return targets
  }

  if (metadata.type === 'filter') {
    const filterEvaluator = FILTER_EVALUATORS[metadata.valueType]
    if (filterEvaluator) {
      return filterEvaluator(targets, metadata, context)
    }
  } else if (metadata.type === 'sort') {
    const sortEvaluator = SORT_EVALUATORS[metadata.valueType]
    if (sortEvaluator) {
      // Pass the original condition key in the metadata for sort evaluators
      const extendedMetadata = {
        ...metadata,
        conditionKey: tactic.condition.key,
      }
      return sortEvaluator(targets, extendedMetadata, context)
    }
  }

  return targets
}

/**
 * Check if there's a true tie among the top targets after sorting
 * (unchanged from original)
 */
const hasTrueTie = (
  targets: BattleContext[],
  sortTactics: (Tactic | null)[],
  context: TacticalContext
): boolean => {
  if (targets.length < 2) return false

  // Compare first target with second target using all sort conditions
  const [first, second] = targets

  for (const tactic of sortTactics) {
    if (!tactic) continue

    const metadata = COMPLETE_TACTIC_METADATA[tactic.condition.key]
    if (!metadata || metadata.type !== 'sort') continue

    // Pass the original condition key in the metadata for compare evaluators
    const extendedMetadata = { ...metadata, conditionKey: tactic.condition.key }
    const comparison = compareTargets(first, second, extendedMetadata, context)
    if (comparison !== 0) {
      return false // No tie - clear winner
    }
  }

  return true // All sort conditions resulted in ties
}

/**
 * NEW: Compare two targets using a specific sort condition
 * Uses registry lookup instead of switch statement
 */
const compareTargets = (
  a: BattleContext,
  b: BattleContext,
  metadata: ConditionMetadata,
  context: TacticalContext
): number => {
  const compareEvaluator = COMPARE_EVALUATORS[metadata.valueType]
  if (compareEvaluator) {
    return compareEvaluator(a, b, metadata, context)
  }

  return 0 // tie for unhandled types
}

/**
 * Helper function to get skill from slot
 * (unchanged from original)
 */
const getSkillFromSlot = (
  skillSlot: SkillSlot
): ActiveSkill | PassiveSkill | null => {
  if (!skillSlot.skillId) return null

  if (skillSlot.skillType === 'active') {
    return (
      ActiveSkillsMap[skillSlot.skillId as keyof typeof ActiveSkillsMap] || null
    )
  } else if (skillSlot.skillType === 'passive') {
    return (
      PassiveSkillsMap[skillSlot.skillId as keyof typeof PassiveSkillsMap] ||
      null
    )
  }

  return null
}

// ============================================================================
// INDIVIDUAL TACTIC TESTING EXPORTS
// ============================================================================

/**
 * Test individual skip conditions - useful for unit testing
 */
export const testSkipCondition = (
  valueType: string,
  metadata: ConditionMetadata,
  context: TacticalContext
): boolean => {
  const evaluator = SKIP_EVALUATORS[valueType]
  return evaluator ? evaluator(metadata, context) : false
}

/**
 * Test individual filter conditions - useful for unit testing
 */
export const testFilterCondition = (
  valueType: string,
  targets: BattleContext[],
  metadata: ConditionMetadata,
  context: TacticalContext
): BattleContext[] => {
  const evaluator = FILTER_EVALUATORS[valueType]
  return evaluator ? evaluator(targets, metadata, context) : targets
}

/**
 * Test individual sort conditions - useful for unit testing
 */
export const testSortCondition = (
  valueType: string,
  targets: BattleContext[],
  metadata: ConditionMetadata,
  context: TacticalContext
): BattleContext[] => {
  const evaluator = SORT_EVALUATORS[valueType]
  return evaluator ? evaluator(targets, metadata, context) : targets
}

/**
 * Test individual compare conditions - useful for unit testing
 */
export const testCompareCondition = (
  valueType: string,
  a: BattleContext,
  b: BattleContext,
  metadata: ConditionMetadata,
  context: TacticalContext
): number => {
  const evaluator = COMPARE_EVALUATORS[valueType]
  return evaluator ? evaluator(a, b, metadata, context) : 0
}
