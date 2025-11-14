import type { RandomNumberGeneratorType } from '@/core/random'
import type { BattleContext } from '@/types/battle-engine'

const getBoardPositionPriority = (position: { row: number; col: number }) => {
  const { row, col } = position

  if (row === 1) {
    return col // Front row: 0, 1, 2
  } else {
    return col + 3 // Back row: 3, 4, 5
  }
}

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
