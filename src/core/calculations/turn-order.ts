import type { RandomNumberGeneratorType } from '@/core/random'
import type { BattleContext } from '@/types/battle-engine'

/**
 * Calculate board position priority for initiative tiebreaking
 * Lower number = higher priority
 *
 * Priority order (0 = highest priority):
 * Row 1, Col 0 (front left) = 0
 * Row 1, Col 1 (front center) = 1
 * Row 1, Col 2 (front right) = 2
 * Row 0, Col 0 (back left) = 3
 * Row 0, Col 1 (back center) = 4
 * Row 0, Col 2 (back right) = 5
 */
const getBoardPositionPriority = (position: { row: number; col: number }) => {
  const { row, col } = position

  if (row === 1) {
    return col // Front row: 0, 1, 2
  } else {
    return col + 3 // Back row: 3, 4, 5
  }
}

/**
 * Calculate initiative order for units based on INIT stat with proper tiebreaking
 * 1. Higher INIT acts first
 * 2. Board position priority (front left = highest, back right = lowest)
 * 3. RNG for cross-team identical positions
 */
export const calculateTurnOrder = (
  units: Record<string, BattleContext>,
  rng: RandomNumberGeneratorType
) => {
  return Object.entries(units)
    .sort(([idA, contextA], [idB, contextB]) => {
      const initA = contextA.combatStats.INIT
      const initB = contextB.combatStats.INIT

      // Primary sort: Higher initiative goes first
      if (initA !== initB) {
        return initB - initA
      }

      // Tiebreaker 1: Board position priority
      const priorityA = getBoardPositionPriority(contextA.position)
      const priorityB = getBoardPositionPriority(contextB.position)

      if (priorityA !== priorityB) {
        return priorityA - priorityB // Lower priority value = higher precedence
      }

      // Tiebreaker 2: Cross-team RNG (if same team, maintain consistent order by ID)
      if (contextA.team !== contextB.team) {
        return rng.random() < 0.5 ? -1 : 1
      }

      // Same team, same position priority - use ID for deterministic order
      return idA.localeCompare(idB)
    })
    .map(([id]) => id)
}
