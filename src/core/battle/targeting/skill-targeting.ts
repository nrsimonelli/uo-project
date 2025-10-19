import { getAttackType, isDamageSkill } from '@/core/attack-types'
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
  battlefield?: BattlefieldState
): BattleContext[] => {
  if (targets.length === 0) return []
  if (count <= 0) return []

  const selectedTargets: BattleContext[] = []
  let remainingTargets = [...targets] // Copy to avoid mutating original array

  // Select targets one by one, always picking the closest from remaining targets
  for (let i = 0; i < count && remainingTargets.length > 0; i++) {
    const nextTarget = findClosestTarget(
      actingUnit,
      remainingTargets,
      skill,
      battlefield
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

  _skill: ActiveSkill | PassiveSkill,
  battlefield?: BattlefieldState
): BattleContext | null => {
  if (potentialTargets.length === 0) return null
  if (potentialTargets.length === 1) return potentialTargets[0]

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Self: (actingUnit: BattleContext, _battlefield: BattlefieldState) => [
    actingUnit,
  ],
} as const

/**
 * Targeting pattern handlers
 * All handlers have consistent signature: (targets, actingUnit, skill, battlefield?, isTactical?) => BattleContext[]
 */
const targetingPatternHandlers = {
  Self: (
    _targets: BattleContext[],
    actingUnit: BattleContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _skill: ActiveSkill | PassiveSkill,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _battlefield?: BattlefieldState
  ) => [actingUnit],

  All: (
    targets: BattleContext[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _actingUnit: BattleContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _skill: ActiveSkill | PassiveSkill,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _battlefield?: BattlefieldState
  ) => targets,

  Single: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState
  ) => {
    if (targets.length === 0) return []

    // If we have targets, find the closest one using default targeting rules
    const closestTarget = findClosestTarget(
      actingUnit,
      targets,
      skill,
      battlefield
    )
    return closestTarget ? [closestTarget] : []
  },

  Row: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState
  ) => {
    // If no targets or primary target, return empty
    if (targets.length === 0) return []

    // Find closest target first (this will be in the row we want to target)
    const primaryTarget = findClosestTarget(
      actingUnit,
      targets,
      skill,
      battlefield
    )
    if (!primaryTarget) return []

    // Return all targets in the same row as the primary target
    return targets.filter(
      target => target.position.row === primaryTarget.position.row
    )
  },

  Column: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState
  ) => {
    // If no targets or primary target, return empty
    if (targets.length === 0) return []

    // Find closest target using default targeting rules (front row first, then back row)
    const primaryTarget = findClosestTarget(
      actingUnit,
      targets,
      skill,
      battlefield
    )
    if (!primaryTarget) return []

    // Return all targets in the same column as the primary target
    return targets.filter(
      target => target.position.col === primaryTarget.position.col
    )
  },

  Two: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState
  ) => {
    return selectClosestTargets(targets, actingUnit, skill, 2, battlefield)
  },

  Three: (
    targets: BattleContext[],
    actingUnit: BattleContext,
    skill: ActiveSkill | PassiveSkill,
    battlefield?: BattlefieldState
  ) => {
    return selectClosestTargets(targets, actingUnit, skill, 3, battlefield)
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
    return selfHandler([], actingUnit, skill, battlefield)
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
      skill,
      battlefield
    )
    return fallbackTarget ? [fallbackTarget] : []
  }

  return patternHandler(potentialTargets, actingUnit, skill, battlefield)
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
