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
 * Prioritizes front row over back row, then closest distance
 */
const findClosestTarget = (
  actingUnit: BattleContext,
  potentialTargets: BattleContext[]
): BattleContext | null => {
  if (potentialTargets.length === 0) return null
  if (potentialTargets.length === 1) return potentialTargets[0]

  // Group by row (front row = 1, back row = 0)
  const frontRow = potentialTargets.filter(target => target.position.row === 1)
  const backRow = potentialTargets.filter(target => target.position.row === 0)

  // Always prioritize front row if available
  const targetsToConsider = frontRow.length > 0 ? frontRow : backRow

  // Find closest by distance
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
} as const

/**
 * Targeting pattern handlers
 * All handlers have consistent signature: (targets, actingUnit) => BattleContext[]
 */
const targetingPatternHandlers = {
  Self: (_targets: BattleContext[], actingUnit: BattleContext) => [actingUnit],

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  All: (targets: BattleContext[], _actingUnit: BattleContext) => targets,

  Single: (targets: BattleContext[], actingUnit: BattleContext) => {
    const closestTarget = findClosestTarget(actingUnit, targets)
    return closestTarget ? [closestTarget] : []
  },

  // TODO: Add other patterns like 'Row', 'Column', etc.
} as const

/**
 * Get default targets for a skill based on its targeting pattern
 */
export const getDefaultTargets = (
  skill: ActiveSkill | PassiveSkill,
  actingUnit: BattleContext,
  battlefield: BattlefieldState
): BattleContext[] => {
  const { targeting } = skill
  const { group, pattern } = targeting

  // Handle Self pattern directly (doesn't use group)
  if (pattern === 'Self') {
    const selfHandler = targetingPatternHandlers.Self
    return selfHandler([], actingUnit)
  }

  // Get potential targets based on group
  const groupHandler =
    targetingGroupHandlers[group as keyof typeof targetingGroupHandlers]
  if (!groupHandler) {
    console.warn(`Unknown targeting group: ${group}`)
    return []
  }

  const potentialTargets = groupHandler(actingUnit, battlefield)

  // Apply pattern-based selection
  const patternHandler =
    targetingPatternHandlers[pattern as keyof typeof targetingPatternHandlers]
  if (!patternHandler) {
    console.warn(
      `Unsupported targeting pattern: ${pattern}, falling back to Single`
    )
    const fallbackTarget = findClosestTarget(actingUnit, potentialTargets)
    return fallbackTarget ? [fallbackTarget] : []
  }

  return patternHandler(potentialTargets, actingUnit)
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
  effects: [], // No effects - just passes the turn
}
