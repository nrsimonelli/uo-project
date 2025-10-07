import { useState } from 'react'

import {
  createAllBattleContexts,
  createInitialBattlefieldState,
} from '@/core/battlefield-state'
import { calculateTurnOrder } from '@/core/calculations'
import { rng } from '@/core/random'
import type {
  BattleEvent,
  BattleResultSummary,
  BattlefieldState,
} from '@/types/battle-engine'
import type { Team } from '@/types/team'

/**
 * Hook return type - clean interface with only what UI components need
 */
interface UseBattleEngineReturn {
  battleEvents: BattleEvent[]
  resultSummary: BattleResultSummary
  isExecuting: boolean
  error: string | null
  executeBattle: (homeTeam: Team, awayTeam: Team, seed?: string) => void
  clearResults: () => void
}

/**
 * Initial result summary state
 */
const initialResultSummary: BattleResultSummary = {
  winner: null,
  endReason: null,
  totalTurns: 0,
  totalEvents: 0,
  teamHpPercentages: {},
}

/**
 * Custom hook for battle engine execution
 * Manages battle state and provides clean interface for UI components
 */
export const useBattleEngine = (): UseBattleEngineReturn => {
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([])
  const [resultSummary, setResultSummary] = useState<BattleResultSummary>(initialResultSummary)
  const [battlefieldState, setBattlefieldState] = useState<BattlefieldState | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeBattle = (homeTeam: Team, awayTeam: Team, seed?: string) => {
    const battleSeed = seed || `battle-${Date.now()}`
    const randomData = rng(battleSeed)

    // Reset all state
    setIsExecuting(true)
    setError(null)
    setBattleEvents([])
    setBattlefieldState(null)
    setResultSummary(initialResultSummary)

    try {
      // Initialize battlefield
      const allBattleContexts = createAllBattleContexts(homeTeam, awayTeam)
      const turnOrder = calculateTurnOrder(allBattleContexts, randomData)
      const initialBattlefieldState = createInitialBattlefieldState(
        allBattleContexts,
        turnOrder,
        randomData
      )

      setBattlefieldState(initialBattlefieldState)

      console.log('Battle initialized:', {
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        seed: battleSeed,
        turnOrder,
        unitCount: Object.keys(allBattleContexts).length,
      })

      // TODO: Implement battle execution logic here
      // For now, just finish initialization
      setIsExecuting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Battle initialization failed')
      setIsExecuting(false)
    }
  }

  const clearResults = () => {
    setBattleEvents([])
    setBattlefieldState(null)
    setResultSummary(initialResultSummary)
    setError(null)
    setIsExecuting(false)
  }

  return {
    battleEvents,
    resultSummary,
    isExecuting,
    error,
    executeBattle,
    clearResults,
  }
}
