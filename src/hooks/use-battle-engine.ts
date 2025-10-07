import { useState } from 'react'

import { createBattleContext } from '@/core/battlefield-state'
import { calculateTurnOrder } from '@/core/calculations'
import { rng } from '@/core/random'
import type {
  BattleContext,
  BattleEvent,
  BattleResultSummary,
  BattlefieldState,
} from '@/types/battle-engine'
import type { Team } from '@/types/team'

// Hook return type
interface UseBattleEngineReturn {
  battleEvents: BattleEvent[]
  resultSummary: BattleResultSummary
  battlefieldState: BattlefieldState | null
  isExecuting: boolean
  error: string | null
  executeBattle: (homeTeam: Team, awayTeam: Team, seed?: string) => void
  clearResults: () => void
}

/**
 * Custom hook for battle engine execution
 *
 * @returns Battle state and execution functions
 */
export const useBattleEngine = (): UseBattleEngineReturn => {
  // Battle state management
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([])
  const [resultSummary, setResultSummary] = useState<BattleResultSummary>({
    winner: null,
    endReason: null,
    totalTurns: 0,
    totalEvents: 0,
    teamHpPercentages: {},
  })
  const [battlefieldState, setBattlefieldState] =
    useState<BattlefieldState | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeBattle = (homeTeam: Team, awayTeam: Team, seed?: string) => {
    // Generate seed if not provided
    const battleSeed = seed || `battle-${Date.now()}`
    const randomData = rng(battleSeed)

    setIsExecuting(true)
    setError(null)
    setBattleEvents([])
    setBattlefieldState(null)
    setResultSummary({
      winner: null,
      endReason: null,
      totalTurns: 0,
      totalEvents: 0,
      teamHpPercentages: {},
    })

    try {
      // Initialize battlefield state by creating battle contexts for all units
      const allBattleContexts: Record<string, BattleContext> = {}

      // Process home team units
      homeTeam.formation.forEach((unit, index) => {
        if (unit) {
          const position = {
            row: Math.floor(index / 3), // 0 or 1 (back/front row)
            col: index % 3, // 0, 1, or 2 (left/center/right)
          }
          const battleContext = createBattleContext(unit, 'home-team', position)
          allBattleContexts[`home-${unit.id}`] = battleContext
        }
      })

      // Process away team units
      awayTeam.formation.forEach((unit, index) => {
        if (unit) {
          const position = {
            row: Math.floor(index / 3), // 0 or 1 (back/front row)
            col: index % 3, // 0, 1, or 2 (left/center/right)
          }
          const battleContext = createBattleContext(unit, 'away-team', position)
          allBattleContexts[`away-${unit.id}`] = battleContext
        }
      })

      // Calculate turn order based on initiative
      const turnOrder = calculateTurnOrder(allBattleContexts, randomData)

      // Create initial battlefield state
      const initialBattlefieldState: BattlefieldState = {
        units: allBattleContexts,
        turnOrder,
        currentTurn: 0,
        currentUnitIndex: 0,
        phase: 'battle',
        rng: randomData,
        events: [],
      }

      setBattlefieldState(initialBattlefieldState)

      console.log(
        'Battle initialized:',
        homeTeam.name,
        'vs',
        awayTeam.name,
        'with seed:',
        battleSeed,
        'turn order:',
        turnOrder
      )

      // TODO: Implement actual battle execution logic

      // Temporarily set executing to false since we have no battle logic yet
      setIsExecuting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsExecuting(false)
    }
  }

  const clearResults = () => {
    setBattleEvents([])
    setBattlefieldState(null)
    setResultSummary({
      winner: null,
      endReason: null,
      totalTurns: 0,
      totalEvents: 0,
      teamHpPercentages: {},
    })
    setError(null)
    setIsExecuting(false)
  }

  return {
    battleEvents,
    resultSummary,
    battlefieldState,
    isExecuting,
    error,
    executeBattle,
    clearResults,
  }
}
