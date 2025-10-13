import { getAttackType, isDamageSkill } from './attack-types'

import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { ActiveSkill, PassiveSkill } from '@/types/skills'

/**
 * Calculate distance between two positions (Manhattan distance)
 */
const calculateDistance = (
  pos1: { row: number; col: number },
  pos2: { row: number; col: number }
): number => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col)
}

/**
 * Find the closest target to the acting unit based on position
 * For melee attacks: Prioritizes front row over back row, then closest distance
 * For ranged/magical attacks: Simply finds closest by distance regardless of row
 */
const findClosestTarget = (
  actingUnit: BattleContext,
  potentialTargets: BattleContext[],
  skill: ActiveSkill | PassiveSkill
): BattleContext | null => {
  if (potentialTargets.length === 0) return null
  if (potentialTargets.length === 1) return potentialTargets[0]

  // Determine if this is a melee attack that should respect front row blocking
  const shouldRespectFrontRow =
    isDamageSkill(skill.skillCategories) &&
    getAttackType(actingUnit.unit.classKey, skill.innateAttackType) === 'Melee'

  if (shouldRespectFrontRow) {
    // Melee attacks: prioritize front row, then closest distance within that row
    const frontRow = potentialTargets.filter(
      target => target.position.row === 1
    )
    const backRow = potentialTargets.filter(target => target.position.row === 0)

    // Always prioritize front row if available
    const targetsToConsider = frontRow.length > 0 ? frontRow : backRow

    // Find closest by distance within the chosen row
    let closestTarget = targetsToConsider[0]
    let closestDistance = calculateDistance(
      actingUnit.position,
      closestTarget.position
    )

    for (const target of targetsToConsider.slice(1)) {
      const distance = calculateDistance(actingUnit.position, target.position)
      if (distance < closestDistance) {
        closestDistance = distance
        closestTarget = target
      }
    }

    return closestTarget
  } else {
    // Ranged/Magical attacks or non-damage skills: find truly closest target
    let closestTarget = potentialTargets[0]
    let closestDistance = calculateDistance(
      actingUnit.position,
      closestTarget.position
    )

    for (const target of potentialTargets.slice(1)) {
      const distance = calculateDistance(actingUnit.position, target.position)
      if (distance < closestDistance) {
        closestDistance = distance
        closestTarget = target
      }
    }

    return closestTarget
  }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Self: (actingUnit: BattleContext, _battlefield: BattlefieldState) => [
    actingUnit,
  ],
} as const

/**
 * Targeting pattern handlers
 * All handlers have consistent signature: (targets, actingUnit, skill) => BattleContext[]
 */
const targetingPatternHandlers = {
  Self: (
    _targets: BattleContext[],
    actingUnit: BattleContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _skill: ActiveSkill | PassiveSkill
  ) => [actingUnit],

  All: (
    targets: BattleContext[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _actingUnit: BattleContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _skill: ActiveSkill | PassiveSkill
  ) => targets,

  Single: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill
  ) => {
    const closestTarget = findClosestTarget(actingUnit, targets, skill)
    return closestTarget ? [closestTarget] : []
  },

  Row: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill
  ) => {
    // If no targets or primary target, return empty
    if (targets.length === 0) return []

    // Find closest target first (this will be in the row we want to target)
    const primaryTarget = findClosestTarget(actingUnit, targets, skill)
    if (!primaryTarget) return []

    // Return all targets in the same row as the primary target
    return targets.filter(
      target => target.position.row === primaryTarget.position.row
    )
  },

  Column: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill
  ) => {
    // If no targets or primary target, return empty
    if (targets.length === 0) return []

    // Find closest target first (this will be in the column we want to target)
    const primaryTarget = findClosestTarget(actingUnit, targets, skill)
    if (!primaryTarget) return []

    // Return all targets in the same column as the primary target
    return targets.filter(
      target => target.position.col === primaryTarget.position.col
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
  preFilteredTargets?: BattleContext[]
): BattleContext[] => {
  const { targeting } = skill
  const { group, pattern } = targeting

  // Handle Self pattern directly (doesn't use group)
  if (pattern === 'Self') {
    const selfHandler = targetingPatternHandlers.Self
    return selfHandler([], actingUnit, skill)
  }

  // Use pre-filtered targets if provided, otherwise get targets based on group
  let potentialTargets: BattleContext[]
  if (preFilteredTargets) {
    potentialTargets = preFilteredTargets
  } else {
    const groupHandler =
      targetingGroupHandlers[group as keyof typeof targetingGroupHandlers]
    if (!groupHandler) {
      console.warn(`Unknown targeting group: ${group}`)
      return []
    }
    potentialTargets = groupHandler(actingUnit, battlefield)
  }

  // CRITICAL: Apply front row blocking for melee attacks
  // This must happen even with prefiltered targets to enforce melee targeting rules
  if (group === 'Enemy' && isDamageSkill(skill.skillCategories)) {
    const attackType = getAttackType(
      actingUnit.unit.classKey,
      skill.innateAttackType
    )
    if (attackType === 'Melee') {
      // For melee attacks against enemies, enforce front row blocking
      // Check the ENTIRE battlefield for front row enemies, not just filtered targets
      const allEnemies = Object.values(battlefield.units).filter(
        unit => unit.team !== actingUnit.team && unit.currentHP > 0
      )
      const allFrontRowEnemies = allEnemies.filter(
        enemy => enemy.position.row === 1
      )

      if (allFrontRowEnemies.length > 0) {
        // Front row enemies exist on battlefield - melee attacks can only target front row
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
          // Tactical system selected only back row, but front row enemies exist - block the attack entirely
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
  }

  // Apply pattern-based selection
  const patternHandler =
    targetingPatternHandlers[pattern as keyof typeof targetingPatternHandlers]
  if (!patternHandler) {
    console.warn(
      `Unsupported targeting pattern: ${pattern}, falling back to Single`
    )
    const fallbackTarget = findClosestTarget(
      actingUnit,
      potentialTargets,
      skill
    )
    return fallbackTarget ? [fallbackTarget] : []
  }

  return patternHandler(potentialTargets, actingUnit, skill)
}

/**
 * Hardcoded Standby skill - costs 0 AP, does nothing
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
