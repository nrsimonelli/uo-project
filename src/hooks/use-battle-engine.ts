import { useState } from 'react'

import { rng, type RandomNumberGeneratorType } from '@/core/random'
import type { Team } from '@/types/team'

// Battle event type
export interface BattleEvent {
  id: string
  type: string
  turn: number
  description: string
  actingUnit?: string
  targets?: string[]
}

// Battle result summary
export interface BattleResultSummary {
  winner: string | null
  endReason: string | null
  totalTurns: number
  totalEvents: number
  teamHpPercentages: { [teamId: string]: number }
}

// Hook return type
interface UseBattleEngineReturn {
  battleEvents: BattleEvent[]
  resultSummary: BattleResultSummary
  isExecuting: boolean
  error: string | null
  executeBattle: (allyTeam: Team, enemyTeam: Team, seed?: string) => void
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
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeBattle = (allyTeam: Team, enemyTeam: Team, seed?: string) => {
    // Generate seed if not provided
    const battleSeed = seed || `battle-${Date.now()}`
    const randomData = rng(battleSeed)

    setIsExecuting(true)
    setError(null)
    setBattleEvents([])
    setResultSummary({
      winner: null,
      endReason: null,
      totalTurns: 0,
      totalEvents: 0,
      teamHpPercentages: {},
    })

    try {
      // TODO: Implement actual battle simulation logic here
      // For now, just log the execution
      console.log(
        'Battle executing:',
        allyTeam.name,
        'vs',
        enemyTeam.name,
        'with seed:',
        battleSeed
      )

      // TODO: Replace with actual battle engine implementation
      // The actual battle logic will populate battleEvents and resultSummary
      // and then call setIsExecuting(false) when complete

      // Temporarily set executing to false since we have no battle logic yet
      setIsExecuting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsExecuting(false)
    }
  }

  const clearResults = () => {
    setBattleEvents([])
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
    isExecuting,
    error,
    executeBattle,
    clearResults,
  }
}
