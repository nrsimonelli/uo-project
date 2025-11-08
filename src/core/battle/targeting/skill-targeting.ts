import { getAttackType, isDamageSkill } from '@/core/attack-types'
import {
  evaluateAllConditions,
  type ConditionEvaluationContext,
} from '@/core/battle/evaluation/condition-evaluator'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { ActiveSkill, PassiveSkill } from '@/types/skills'

/**
 * Calculate distance between two positions (Manhattan distance)
 */
const calculateDistance = (
  pos1: { row: number; col: number },
  pos2: { row: number; col: number }
) => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col)
}

/**
 * Select multiple closest targets with no overlap
 * Returns up to 'count' targets, prioritizing closest ones
 */
const selectClosestTargets = (
  targets: BattleContext[],
  actingUnit: BattleContext,
  skill: ActiveSkill | PassiveSkill,
  count: number,
  battlefield?: BattlefieldState,
  options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
): BattleContext[] => {
  if (targets.length === 0) return []
  if (count <= 0) return []

  const selectedTargets: BattleContext[] = []
  let remainingTargets = [...targets] // Copy to avoid mutating original array

  // If targets were tactically pre-filtered and the caller doesn't want the
  // default tie-breaking behavior, respect the tactical ordering and return
  // the first N targets.
  if (options?.preFiltered && !options?.useDefaultTieBreaker) {
    return remainingTargets.slice(0, count)
  }

  // Select targets one by one, always picking the closest from remaining targets
  for (let i = 0; i < count && remainingTargets.length > 0; i++) {
    const nextTarget = findClosestTarget(
      actingUnit,
      remainingTargets,
      skill,
      battlefield,
      options
    )
    if (!nextTarget) break

    selectedTargets.push(nextTarget)
    // Remove the selected target from remaining targets to ensure no overlap
    remainingTargets = remainingTargets.filter(target => target !== nextTarget)
  }

  return selectedTargets
}

/**
 * Find the closest target using default targeting rules
 * DEFAULT TARGETING RULE: Closest unit in front row first, then closest unit in back row
 * This applies to ALL skills (melee, ranged, healing, etc.) when using default targeting
 */
const findClosestTarget = (
  actingUnit: BattleContext,
  potentialTargets: BattleContext[],

  skill: ActiveSkill | PassiveSkill,
  battlefield?: BattlefieldState,
  options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
): BattleContext | null => {
  void skill
  if (potentialTargets.length === 0) return null
  if (potentialTargets.length === 1) return potentialTargets[0]

  // If these targets were provided by the tactical system and the caller
  // doesn't want default tie-breaking, respect the tactical ordering and
  // choose the first target in the provided list.
  if (options?.preFiltered && !options?.useDefaultTieBreaker) {
    return potentialTargets[0] || null
  }

  // UNIVERSAL DEFAULT TARGETING: Front row first, then back row
  const frontRow = potentialTargets.filter(target => target.position.row === 1)
  const backRow = potentialTargets.filter(target => target.position.row === 0)

  // Always prioritize front row if available (for ALL skills)
  const targetsToConsider = frontRow.length > 0 ? frontRow : backRow

  // Find closest by distance within the chosen row
  let closestTarget = targetsToConsider[0]
  let closestDistance = calculateDistance(
    actingUnit.position,
    closestTarget.position
  )

  // Collect all targets at the closest distance for tie-breaking
  const closestTargets = [closestTarget]

  for (const target of targetsToConsider.slice(1)) {
    const distance = calculateDistance(actingUnit.position, target.position)
    if (distance < closestDistance) {
      closestDistance = distance
      closestTarget = target
      closestTargets.length = 0 // Clear array
      closestTargets.push(target)
    } else if (distance === closestDistance) {
      closestTargets.push(target)
    }
  }

  // If multiple targets are equidistant, randomly select one
  if (closestTargets.length > 1) {
    const random = battlefield?.rng?.random || Math.random
    const randomIndex = Math.floor(random() * closestTargets.length)
    closestTarget = closestTargets[randomIndex]
  }

  return closestTarget
}

/**
 * Targeting group handlers
 */
const targetingGroupHandlers = {
  Ally: (actingUnit: BattleContext, battlefield: BattlefieldState) =>
    Object.values(battlefield.units).filter(
      unit => unit.team === actingUnit.team && unit.currentHP > 0
    ),

  Enemy: (actingUnit: BattleContext, battlefield: BattlefieldState) =>
    Object.values(battlefield.units).filter(
      unit => unit.team !== actingUnit.team && unit.currentHP > 0
    ),

  Self: (actingUnit: BattleContext, battlefield: BattlefieldState) => {
    void battlefield
    return [actingUnit]
  },
} as const

/**
 * Targeting pattern handlers
 * All handlers have consistent signature: (targets, actingUnit, skill, battlefield?, options?) => BattleContext[]
 */
const targetingPatternHandlers = {
  Self: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState,
    options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
  ) => {
    void targets
    void skill
    void battlefield
    void options
    return [actingUnit]
  },

  All: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState,
    options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
  ) => {
    void options
    void actingUnit
    void skill
    void battlefield
    return targets
  },

  Single: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState,
    options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
  ) => {
    if (targets.length === 0) return []

    // If targets are tactically pre-filtered and caller asked us to respect
    // tactical ordering, pick the first target directly instead of running
    // default distance-based logic which may override tactical priorities.
    if (options?.preFiltered && !options?.useDefaultTieBreaker) {
      return [targets[0]]
    }

    // Otherwise use default targeting logic (front-row-first + distance)
    const closestTarget = findClosestTarget(
      actingUnit,
      targets,
      skill,
      battlefield,
      options
    )
    return closestTarget ? [closestTarget] : []
  },

  Row: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState,
    options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
  ) => {
    // If no targets or primary target, return empty
    if (targets.length === 0) return []

    // Choose primary target. If tactical ordering is present and we're asked to
    // respect it, use the first target; otherwise fall back to default distance
    // selection.
    let primaryTarget: BattleContext | null = null
    if (options?.preFiltered && !options?.useDefaultTieBreaker) {
      primaryTarget = targets[0]
    } else {
      primaryTarget = findClosestTarget(
        actingUnit,
        targets,
        skill,
        battlefield,
        options
      )
    }
    if (!primaryTarget) return []

    // Return all targets in the same row as the primary target
    return targets.filter(
      target => target.position.row === primaryTarget?.position.row
    )
  },

  Column: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState,
    options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
  ) => {
    // If no targets or primary target, return empty
    if (targets.length === 0) return []

    // Choose primary target. If tactical ordering is present and we're asked to
    // respect it, use the first target; otherwise fall back to default distance
    // selection.
    let primaryTarget: BattleContext | null = null
    if (options?.preFiltered && !options?.useDefaultTieBreaker) {
      primaryTarget = targets[0]
    } else {
      primaryTarget = findClosestTarget(
        actingUnit,
        targets,
        skill,
        battlefield,
        options
      )
    }
    if (!primaryTarget) return []

    // Return all targets in the same column as the primary target
    return targets.filter(
      target => target.position.col === primaryTarget?.position.col
    )
  },

  Two: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState,
    options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
  ) => {
    return selectClosestTargets(
      targets,
      actingUnit,
      skill,
      2,
      battlefield,
      options
    )
  },

  Three: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState,
    options?: { useDefaultTieBreaker?: boolean; preFiltered?: boolean }
  ) => {
    return selectClosestTargets(
      targets,
      actingUnit,
      skill,
      3,
      battlefield,
      options
    )
  },
} as const

/**
 * Get default targets for a skill based on its targeting pattern
 * @param preFilteredTargets Optional pre-filtered list of targets to select from (used by tactical system)
 */
export const getDefaultTargets = (
  skill: ActiveSkill | PassiveSkill,
  actingUnit: BattleContext,
  battlefield: BattlefieldState,
  preFilteredTargets?: BattleContext[],
  // When true, apply the original DEFAULT targeting rules (front-row-first, distance tie-breaks).
  // When false (default), and preFilteredTargets is provided, respect the tactical ordering
  // supplied by the caller and only use default tie-breaking when the caller explicitly requests it.
  useDefaultTieBreaker = false
): BattleContext[] => {
  const { targeting } = skill
  const { group, pattern, conditionalPattern } = targeting

  // Check if any condition depends on the target (e.g., checking if target has an affliction)
  const hasTargetDependentCondition =
    conditionalPattern?.conditions.some(
      condition => 'target' in condition && condition.target === 'Enemy'
    ) ?? false

  // Determine which pattern to use based on conditional pattern evaluation
  let effectivePattern = pattern
  if (conditionalPattern) {
    // For target-dependent conditions, we need to select a target first, then check the condition
    if (hasTargetDependentCondition && pattern === 'Single') {
      // We'll handle this after initial target selection
      // For now, keep the base pattern
      effectivePattern = pattern
    } else {
      // Build condition evaluation context for non-target-dependent conditions
      // (e.g., time of day, battlefield state)
      const conditionContext: ConditionEvaluationContext = {
        attacker: actingUnit,
        target: actingUnit, // Default to self for targeting pattern conditions
        isNight: battlefield.isNight,
        alliesLiving: Object.values(battlefield.units).filter(
          unit => unit.team === actingUnit.team && unit.currentHP > 0
        ).length,
        enemiesLiving: Object.values(battlefield.units).filter(
          unit => unit.team !== actingUnit.team && unit.currentHP > 0
        ).length,
      }

      // Evaluate conditions - if all conditions are met, use the conditional pattern
      if (
        evaluateAllConditions(conditionalPattern.conditions, conditionContext)
      ) {
        effectivePattern = conditionalPattern.pattern
      }
    }
  }

  // Handle Self pattern directly (doesn't use group)
  if (effectivePattern === 'Self') {
    const selfHandler = targetingPatternHandlers.Self
    return selfHandler([], actingUnit, skill, battlefield)
  }

  // Use pre-filtered targets if provided, otherwise get targets based on group
  let potentialTargets: BattleContext[]
  if (preFilteredTargets) {
    potentialTargets = preFilteredTargets
  } else {
    // Special case: When group is "Self" and pattern is "Row" or "All", we want to get all allies
    // For "Row": get all allies in the same row as the acting unit
    // For "All": get all allies (since Self + All means target all allies)
    if (
      group === 'Self' &&
      (effectivePattern === 'Row' || effectivePattern === 'All')
    ) {
      if (effectivePattern === 'Row') {
        potentialTargets = targetingGroupHandlers.Ally(actingUnit, battlefield)
      } else {
        // For "All" pattern with "Self" group, get all allies
        potentialTargets = targetingGroupHandlers.Ally(actingUnit, battlefield)
      }
    } else {
      const groupHandler =
        targetingGroupHandlers[group as keyof typeof targetingGroupHandlers]
      if (!groupHandler) {
        console.warn(`Unknown targeting group: ${group}`)
        return []
      }
      potentialTargets = groupHandler(actingUnit, battlefield)
    }
  }

  // EXCLUDE SELF: Filter out the acting unit if ExcludeSelf flag is present and targeting allies
  const hasExcludeSelfFlag = skill.skillFlags?.includes('ExcludeSelf') ?? false
  if (hasExcludeSelfFlag && group === 'Ally') {
    potentialTargets = potentialTargets.filter(
      target => target.unit.id !== actingUnit.unit.id
    )
  }

  // FRONT-ROW BLOCKING: Apply to melee attacks without Piercing flag
  // Piercing attacks and Ranged/Magical attacks can bypass front-row blocking via tactics
  if (group === 'Enemy' && isDamageSkill(skill.skillCategories)) {
    const attackType = getAttackType(
      actingUnit.unit.classKey,
      skill.innateAttackType
    )

    // Check if skill has Piercing flag
    const hasPiercingFlag = skill.skillFlags?.includes('Piercing') ?? false

    // Only apply front-row blocking for melee attacks without Piercing flag
    if (attackType === 'Melee' && !hasPiercingFlag) {
      // Check the ENTIRE battlefield for front row enemies, not just filtered targets
      const allEnemies = Object.values(battlefield.units).filter(
        unit => unit.team !== actingUnit.team && unit.currentHP > 0
      )
      const allFrontRowEnemies = allEnemies.filter(
        enemy => enemy.position.row === 1
      )

      if (allFrontRowEnemies.length > 0) {
        // Front row enemies exist - enforce front-row blocking for melee Single/Row attacks
        const frontRowTargetsInSelection = potentialTargets.filter(
          target => target.position.row === 1
        )
        const backRowTargetsInSelection = potentialTargets.filter(
          target => target.position.row === 0
        )

        if (
          backRowTargetsInSelection.length > 0 &&
          frontRowTargetsInSelection.length === 0
        ) {
          // Tactical system selected only back row, but front row enemies exist - block the attack
          console.debug(
            `⚠️  Front row blocking: Melee attack '${skill.name}' by ${actingUnit.unit.name} BLOCKED - tactical system selected back row only but front row enemies exist`,
            {
              allFrontRowEnemies: allFrontRowEnemies.map(e => ({
                name: e.unit.name,
                pos: e.position,
              })),
              tacticalSelection: potentialTargets.map(t => ({
                name: t.unit.name,
                pos: t.position,
              })),
              result: 'SKILL_BLOCKED',
            }
          )
          return [] // Return empty - skill should be skipped
        } else if (backRowTargetsInSelection.length > 0) {
          // Mixed front/back selection - remove back row targets
          console.debug(
            `🛡️  Front row blocking: Melee attack '${skill.name}' by ${actingUnit.unit.name} restricted to front row targets only`,
            {
              originalTargets: potentialTargets.length,
              frontRowTargets: frontRowTargetsInSelection.length,
              backRowTargets: backRowTargetsInSelection.length,
              restrictedTo: frontRowTargetsInSelection.map(t => ({
                name: t.unit.name,
                pos: t.position,
              })),
            }
          )
          potentialTargets = frontRowTargetsInSelection
        }
        // If selection already contains only front row targets, no change needed
      }
      // If no front row enemies exist anywhere, back row enemies become valid targets
    }
    // Piercing and non-melee attacks can freely target any units chosen by tactics
  }

  // Handle target-dependent conditional patterns (e.g., poison burst)
  // For these, we need to select a target first, then check if condition is met
  if (
    hasTargetDependentCondition &&
    conditionalPattern &&
    pattern === 'Single'
  ) {
    // First, select a single target using the base pattern
    const singleHandler = targetingPatternHandlers.Single
    const initialTargets = singleHandler(
      potentialTargets,
      actingUnit,
      skill,
      battlefield,
      {
        useDefaultTieBreaker,
        preFiltered: Boolean(preFilteredTargets),
      } as unknown as Record<string, unknown>
    )

    if (initialTargets.length === 0) {
      return []
    }

    // Get the selected target
    const selectedTarget = initialTargets[0]
    if (!selectedTarget) {
      return []
    }

    // Build condition evaluation context with the selected target
    const conditionContext: ConditionEvaluationContext = {
      attacker: actingUnit,
      target: selectedTarget,
      isNight: battlefield.isNight,
      alliesLiving: Object.values(battlefield.units).filter(
        unit => unit.team === actingUnit.team && unit.currentHP > 0
      ).length,
      enemiesLiving: Object.values(battlefield.units).filter(
        unit => unit.team !== actingUnit.team && unit.currentHP > 0
      ).length,
    }

    // Evaluate conditions with the selected target
    if (
      evaluateAllConditions(conditionalPattern.conditions, conditionContext)
    ) {
      // Condition met - use the conditional pattern (e.g., All)
      const conditionalPatternHandler =
        targetingPatternHandlers[
          conditionalPattern.pattern as keyof typeof targetingPatternHandlers
        ]
      if (conditionalPatternHandler) {
        return conditionalPatternHandler(
          potentialTargets,
          actingUnit,
          skill,
          battlefield,
          {
            useDefaultTieBreaker,
            preFiltered: Boolean(preFilteredTargets),
          } as unknown as Record<string, unknown>
        )
      }
    }

    // Condition not met - return the single target
    return initialTargets
  }

  // Apply pattern-based selection using the effective pattern
  const patternHandler =
    targetingPatternHandlers[
      effectivePattern as keyof typeof targetingPatternHandlers
    ]
  if (!patternHandler) {
    console.warn(
      `Unsupported targeting pattern: ${effectivePattern}, falling back to Single`
    )
    const fallbackTarget = findClosestTarget(
      actingUnit,
      potentialTargets,
      skill,
      battlefield
    )
    return fallbackTarget ? [fallbackTarget] : []
  }

  // If tactical pre-filtered targets were provided and the caller did NOT request
  // the default tie-breaker behavior, we want pattern handlers to respect the
  // tactical ordering rather than recomputing a distance-based default.
  return patternHandler(potentialTargets, actingUnit, skill, battlefield, {
    useDefaultTieBreaker,
    preFiltered: Boolean(preFilteredTargets),
  } as unknown as Record<string, unknown>)
}

/**
 * Hardcoded Standby skill - costs 0 AP, counts as having used an active skill, passes turn
 */
export const STANDBY_SKILL: ActiveSkill = {
  id: 'standby',
  type: 'active',
  name: 'Standby',
  description: 'Pass your turn without taking any action.',
  ap: 0,
  targeting: {
    group: 'Ally', // Group doesn't matter for Self pattern
    pattern: 'Self',
  },
  skillCategories: ['Utility'],
  effects: [], // No effects - just passes the turn
}
