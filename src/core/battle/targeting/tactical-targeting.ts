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
import type { TacticalCondition } from '@/types/tactics'

export interface TacticalResult {
  shouldUseSkill: boolean
  targets: BattleContext[]
}

export const evaluateSkillSlotTactics = (
  skillSlot: SkillSlot,
  actingUnit: BattleContext,
  battlefield: BattlefieldState,
  preFilteredTargets?: BattleContext[]
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
  let targets =
    preFilteredTargets && preFilteredTargets.length > 0
      ? preFilteredTargets
      : getInitialTargetPool(skill, context)

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
    tactic => tactic && COMPLETE_TACTIC_METADATA[tactic.key]?.type === 'sort'
  )

  if (sortedTactics.length > 0 && hasTrueTie(targets, sortedTactics, context)) {
    // True tie detected - but for formation tactics, we should preserve tactical priorities
    // and not fall back to default targeting which would override formation preferences
    const hasFormationTactic = sortedTactics.some(tactic => {
      if (!tactic) {
        return false
      }
      const metadata = COMPLETE_TACTIC_METADATA[tactic.key]
      return metadata?.valueType === 'formation'
    })

    if (hasFormationTactic) {
      // For formation tactics, we want to preserve the formation priority (i.e. the
      // tactically-sorted list which promotes the desired row), but when there is
      // a true tie among sorted values we should use the default tie-breaker to
      // pick the closest unit within that prioritized group. Call getDefaultTargets
      // with useDefaultTieBreaker = true so distance/front-row rules are applied
      // only for tie-breaking inside the tactically-selected subset.
      if (pattern === 'Single' && targets.length > 0) {
        // Find the formation sort tactic metadata so we can restrict the
        // default tie-breaking to the tactically-prioritized subset (e.g., the
        // back row). This avoids the default 'front-row-first' rule from
        // overturning a formation preference when we only want to break ties
        // among formation-matching units.
        const formationTactic = sortedTactics.find(tactic => {
          if (!tactic) {
            return false
          }
          const metadata = COMPLETE_TACTIC_METADATA[tactic.key]
          return metadata?.valueType === 'formation'
        })

        let tieCandidates = targets
        if (formationTactic) {
          const formationMeta = {
            ...COMPLETE_TACTIC_METADATA[formationTactic.key],
            conditionKey: formationTactic.key,
          }
          // Use filter evaluator for formation to get only formation-matching targets
          const formationFilter = FILTER_EVALUATORS['formation']
          if (formationFilter) {
            tieCandidates = formationFilter(targets, formationMeta, context)
          }
        }

        // Now apply default tie-breaking (closest/front-row-first) only within the
        // formation-prioritized subset (tieCandidates). This will pick the closest
        // unit among the candidates.
        const defaultTargets = getDefaultTargets(
          skill,
          actingUnit,
          battlefield,
          tieCandidates,
          true // request default tie-breaking (closest/front-row-first)
        )
        return {
          shouldUseSkill: defaultTargets.length > 0,
          targets: defaultTargets,
        }
      }
    } else {
      // True tie for non-formation tactics - use default targeting on the tied targets
      const defaultTargets = getDefaultTargets(
        skill,
        actingUnit,
        battlefield,
        targets,
        true // caller requests default tie-breaking behavior
      )
      return {
        shouldUseSkill: defaultTargets.length > 0,
        targets: defaultTargets,
      }
    }
  }

  if (targets.length > 0) {
    // Check if this is a melee attack without Piercing that needs front-row blocking
    const { group } = skill.targeting
    const attackType = getAttackType(
      actingUnit.unit.classKey,
      skill.innateAttackType
    )
    const hasPiercingFlag = skill.skillFlags?.includes('Piercing') ?? false

    const needsFrontRowBlocking =
      group === 'Enemy' &&
      isDamageSkill(skill.skillCategories) &&
      attackType === 'Melee' &&
      !hasPiercingFlag

    if (needsFrontRowBlocking) {
      // Apply front-row blocking check for melee attacks without Piercing
      const frontRowBlockingResult = getDefaultTargets(
        skill,
        actingUnit,
        battlefield,
        targets, // Pass tactically-processed targets as preFilteredTargets
        true // apply default front-row blocking/tie-breaking logic
      )

      // If front-row blocking filtered out all targets, the skill should be blocked
      if (frontRowBlockingResult.length === 0) {
        return { shouldUseSkill: false, targets: [] }
      }

      // Otherwise, use the front-row blocking result
      return { shouldUseSkill: true, targets: frontRowBlockingResult }
    } else {
      // For Piercing attacks, ranged/magical attacks, use tactical result directly for Single pattern
      if (pattern === 'Single') {
        return { shouldUseSkill: true, targets: [targets[0]] }
      }
      // For other patterns, fall through to normal processing
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

const shouldSkipSkillForTactic = (
  tactic: TacticalCondition,
  context: TacticalContext
) => {
  const metadata = COMPLETE_TACTIC_METADATA[tactic.key]
  if (!metadata) {
    console.warn(`Unknown tactic condition: ${tactic.key}`)
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

const applyTacticToTargets = (
  targets: BattleContext[],
  tactic: TacticalCondition,
  context: TacticalContext
): BattleContext[] => {
  const metadata = COMPLETE_TACTIC_METADATA[tactic.key]
  if (!metadata) {
    console.warn(`Unknown tactic condition: ${tactic.key}`)
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
        conditionKey: tactic.key,
      }
      return sortEvaluator(targets, extendedMetadata, context)
    }
  }

  return targets
}

const hasTrueTie = (
  targets: BattleContext[],
  sortTactics: (TacticalCondition | null)[],
  context: TacticalContext
) => {
  if (targets.length < 2) return false

  const [first, second] = targets

  for (const tactic of sortTactics) {
    if (tactic) {
      const metadata = COMPLETE_TACTIC_METADATA[tactic.key]
      if (metadata && metadata.type === 'sort') {
        const extendedMetadata = { ...metadata, conditionKey: tactic.key }
        const comparison = compareTargets(
          first,
          second,
          extendedMetadata,
          context
        )
        if (comparison !== 0) {
          return false
        }
      }
    }
  }

  return true // All sort conditions resulted in ties
}

const compareTargets = (
  a: BattleContext,
  b: BattleContext,
  metadata: ConditionMetadata,
  context: TacticalContext
) => {
  const compareEvaluator = COMPARE_EVALUATORS[metadata.valueType]
  if (compareEvaluator) {
    return compareEvaluator(a, b, metadata, context)
  }

  return 0 // tie for unhandled types
}

const getSkillFromSlot = (skillSlot: SkillSlot) => {
  if (!skillSlot.skillId) {
    return null
  }

  if (skillSlot.skillType === 'active') {
    return ActiveSkillsMap[skillSlot.skillId]
  } else if (skillSlot.skillType === 'passive') {
    return PassiveSkillsMap[skillSlot.skillId]
  }

  return null
}

// ============================================================================
// INDIVIDUAL TACTIC TESTING EXPORTS
// ============================================================================

export const testSkipCondition = (
  valueType: string,
  metadata: ConditionMetadata,
  context: TacticalContext
) => {
  const evaluator = SKIP_EVALUATORS[valueType]
  return evaluator ? evaluator(metadata, context) : false
}

export const testFilterCondition = (
  valueType: string,
  targets: BattleContext[],
  metadata: ConditionMetadata,
  context: TacticalContext
): BattleContext[] => {
  const evaluator = FILTER_EVALUATORS[valueType]
  return evaluator ? evaluator(targets, metadata, context) : targets
}

export const testSortCondition = (
  valueType: string,
  targets: BattleContext[],
  metadata: ConditionMetadata,
  context: TacticalContext
): BattleContext[] => {
  const evaluator = SORT_EVALUATORS[valueType]
  return evaluator ? evaluator(targets, metadata, context) : targets
}

export const testCompareCondition = (
  valueType: string,
  a: BattleContext,
  b: BattleContext,
  metadata: ConditionMetadata,
  context: TacticalContext
) => {
  const evaluator = COMPARE_EVALUATORS[valueType]
  return evaluator ? evaluator(a, b, metadata, context) : 0
}
