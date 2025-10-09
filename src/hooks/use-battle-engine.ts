import { useState, useEffect } from 'react'

import { trackSkillUsage } from '@/core/battle-state-tracking'
import {
  calculateTeamHpPercentages,
  createBattleEndEvent,
  createBattleStartEvent,
  determineBattleWinner,
} from '@/core/battle-utils'
import {
  createAllBattleContexts,
  createInitialBattlefieldState,
} from '@/core/battlefield-state'
import { calculateTurnOrder } from '@/core/calculations'
import { rng } from '@/core/random'
import { executeSkill } from '@/core/skill-execution'
import { selectActiveSkill } from '@/core/skill-selection'
import {
  isUnitActionableActive,
  shouldContinueBattle,
  startNewRound,
} from '@/core/turn-management'
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
  // Debug function to manually step through battle
  stepBattle: () => void
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
  const [resultSummary, setResultSummary] =
    useState<BattleResultSummary>(initialResultSummary)
  const [battlefieldState, setBattlefieldState] =
    useState<BattlefieldState | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearResults = () => {
    setBattleEvents([])
    setBattlefieldState(null)
    setResultSummary(initialResultSummary)
    setError(null)
    setIsExecuting(false)
  }

  // Process the next battle step whenever battlefield state changes
  useEffect(() => {
    if (!battlefieldState || !isExecuting) {
      return // No battle running
    }

    console.log('📊 Round', battlefieldState.currentRound, 'debug:', {
      totalUnits: Object.keys(battlefieldState.units).length,
      livingUnits: Object.values(battlefieldState.units).filter(
        u => u.currentHP > 0
      ).length,
      actionableUnits: Object.values(battlefieldState.units).filter(u =>
        isUnitActionableActive(u)
      ).length,
      unitsWhoHaventActed: Object.values(battlefieldState.units).filter(
        u => !u.hasActedThisRound && isUnitActionableActive(u)
      ).length,
      unitAPStatus: Object.entries(battlefieldState.units).map(
        ([, u]) =>
          `${u.unit.name}: ${u.currentAP}AP (acted: ${u.hasActedThisRound})`
      ),
    })

    // Check if battle should end
    if (!shouldContinueBattle(battlefieldState)) {
      console.log('🏁 Battle ending - no more units can fight')
      finalizeBattle(battlefieldState)
      return
    }

    // Find next unit that can act (hasn't acted this round + is actionable)
    const nextActionableUnit = battlefieldState.activeSkillQueue.find(
      unitId => {
        const unit = battlefieldState.units[unitId]
        return !unit.hasActedThisRound && isUnitActionableActive(unit)
      }
    )

    if (!nextActionableUnit) {
      console.log('🔄 No units can act - starting new round. Reason:')
      console.log('Units in queue:', battlefieldState.activeSkillQueue)
      console.log(
        'Units status:',
        Object.entries(battlefieldState.units).map(([id, u]) => ({
          id,
          name: u.unit.name,
          hasActed: u.hasActedThisRound,
          isActionable: isUnitActionableActive(u),
          currentAP: u.currentAP,
          currentHP: u.currentHP,
        }))
      )
      const newRoundState = startNewRound(battlefieldState)
      setBattlefieldState(newRoundState)
      return
    }

    // Process the next unit's turn immediately
    processUnitAction(nextActionableUnit)
  }, [battlefieldState, isExecuting])

  const processUnitAction = (unitId: string) => {
    if (!battlefieldState) return

    const unit = battlefieldState.units[unitId]
    if (!unit) return

    console.log(`⚔️ ${unit.unit.name} takes their turn (${unit.currentAP} AP)`)

    // Select skill to use
    const selectedSkill = selectActiveSkill(unit)
    console.log(
      `🎯 ${unit.unit.name} will use: ${selectedSkill.name} (${selectedSkill.ap} AP)`
    )

    // Execute skill and get results
    const { updatedBattlefield, battleEvent } = executeSkill(
      selectedSkill,
      unit,
      battlefieldState
    )

    // Add battle event
    setBattleEvents(prev => [...prev, battleEvent])

    // Update battlefield state with skill results and unit AP consumption
    setBattlefieldState(prevState => {
      if (!prevState) return prevState

      const actingUnit = updatedBattlefield.units[unitId]
      const updatedUnit = {
        ...actingUnit,
        currentAP: Math.max(0, actingUnit.currentAP - selectedSkill.ap),
        hasActedThisRound: true, // Mark as having acted
      }

      // Track skill usage for stalemate detection
      const skillTrackingUpdates = trackSkillUsage(prevState, selectedSkill)

      console.log('📋 Skill tracking update:', {
        skillUsed: selectedSkill.name,
        isStandby: selectedSkill.id === 'standby',
        currentRound: prevState.currentRound,
        consecutiveStandbyRounds:
          skillTrackingUpdates.consecutiveStandbyRounds ??
          prevState.consecutiveStandbyRounds,
        lastActiveSkillRound:
          skillTrackingUpdates.lastActiveSkillRound ??
          prevState.lastActiveSkillRound,
      })

      return {
        ...updatedBattlefield,
        ...skillTrackingUpdates, // Apply skill tracking updates
        units: {
          ...updatedBattlefield.units,
          [unitId]: updatedUnit,
        },
        actionCounter: prevState.actionCounter + 1,
        turnCount: prevState.turnCount + 1,
      }
    })
  }

  const executeBattle = (homeTeam: Team, awayTeam: Team, seed?: string) => {
    const battleSeed = seed || `mockbattle-${Date.now()}`
    const randomData = rng(battleSeed)

    console.log('executeBattle called with seed:', battleSeed)

    // Clear previous state
    setBattleEvents([])
    setResultSummary(initialResultSummary)
    setError(null)
    setIsExecuting(true)

    // Initialize battlefield
    const allBattleContexts = createAllBattleContexts(homeTeam, awayTeam)
    const turnOrder = calculateTurnOrder(allBattleContexts, randomData)
    const initialBattlefieldState = createInitialBattlefieldState(
      allBattleContexts,
      turnOrder,
      randomData
    )

    // Generate battle start event
    const battleStartEvent = createBattleStartEvent(
      homeTeam.name,
      awayTeam.name
    )
    setBattleEvents([battleStartEvent])

    console.log('Battle initialized:', {
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
    })

    // Set initial state and let React handle the next step
    setBattlefieldState(initialBattlefieldState)
  }

  // ✅ Removed old activeSkillLoop - replaced by processUnitAction + useEffect

  /**
   * Finalize the battle and set final results using proper React state patterns
   */
  const finalizeBattle = (finalState: BattlefieldState) => {
    // Guard against duplicate finalization
    if (!isExecuting) {
      console.log('🚫 Battle already finalized, skipping')
      return
    }

    console.log('🏆 Finalizing battle...')
    const winner = determineBattleWinner(finalState)
    const teamHpPercentages = calculateTeamHpPercentages(finalState)

    // Generate battle end event
    const battleEndEvent = createBattleEndEvent(
      winner,
      finalState.actionCounter || finalState.turnCount || 0
    )
    setBattleEvents(prevEvents => [...prevEvents, battleEndEvent])

    // Update result summary
    setResultSummary({
      winner,
      endReason: winner === 'Draw' ? 'Turn limit or draw' : 'Team eliminated',
      totalTurns: finalState.actionCounter || finalState.turnCount || 0,
      totalEvents: 0, // Will be calculated from events length
      teamHpPercentages,
    })

    console.log(`🏆 Battle concluded: ${winner || 'Draw'}`)

    // End battle execution
    setIsExecuting(false)
  }

  return {
    battleEvents,
    resultSummary,
    isExecuting,
    error,
    executeBattle,
    clearResults,
    // Remove stepBattle since we now auto-process
    stepBattle: () => {}, // Placeholder for compatibility
  }
}
