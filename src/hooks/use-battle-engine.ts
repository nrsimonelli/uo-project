import { useState, useEffect, useCallback } from 'react'

import { executeSkill } from '@/core/battle/combat/skill-executor'
import {
  removeExpiredBuffs,
  removeExpiredDebuffs,
} from '@/core/battle/combat/status-effects'
import {
  calculateTeamHpPercentages,
  createBattleEndEvent,
  createBattleStartEvent,
  determineBattleWinner,
} from '@/core/battle/engine/battle-utils'
import {
  createAllBattleContexts,
  createInitialBattlefieldState,
} from '@/core/battle/engine/battlefield-state'
import {
  applyCoverRedirection,
  clearDefenseForAction,
} from '@/core/battle/engine/defense'
import {
  transformSkillResults,
  applySkillDamageResults,
  applyOnActiveHealPercent,
  calculateOnActiveHealAmount,
} from '@/core/battle/engine/results'
import { trackSkillUsage } from '@/core/battle/engine/state-tracker'
import { processUnitTurnStart } from '@/core/battle/engine/turn-manager'
import {
  isUnitActionableActive,
  shouldContinueBattle,
  startNewRound,
} from '@/core/battle/engine/turn-manager'
import { deepCopyUnits } from '@/core/battle/engine/utils/immutability'
import { getStateIdForContext } from '@/core/battle/engine/utils/state-ids'
import { calculateTurnOrder } from '@/core/calculations/turn-order'
import { rng } from '@/core/random'
import { selectActiveSkill } from '@/core/skill-selection'
import type {
  BattleEvent,
  BattleResultSummary,
  BattlefieldState,
  BattleContext,
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

  const clearResults = useCallback(() => {
    setBattleEvents([])
    setBattlefieldState(null)
    setResultSummary(initialResultSummary)
    setError(null)
    setIsExecuting(false)
  }, [])
  const processUnitAction = useCallback(
    (unitId: string) => {
      if (!battlefieldState) return
      const unit = battlefieldState.units[unitId]
      if (!unit) return

      // Process afflictions at turn start
      const afflictionResult = processUnitTurnStart(unit)

      // If unit cannot act due to afflictions, create a single comprehensive event
      if (!afflictionResult.canAct) {
        // Create event for affliction effects that prevent action
        const afflictionEventData = afflictionResult.events[0] // Should only be one event for non-acting units
        let eventDescription = ''
        let eventType = 'affliction-effect'
        let afflictionData: BattleEvent['afflictionData'] | undefined

        if (afflictionEventData?.type === 'stun-clear') {
          // Treat stun clearing like a regular action (similar to Standby)
          eventDescription = `${unit.unit.name} cleared Stun`
          eventType = 'skill-execution' // Make it look like a regular action
          afflictionData = {
            afflictionType: 'Stun',
            applied: false, // Stun was removed
          }
        } else if (
          afflictionEventData?.type === 'burn-damage' ||
          afflictionEventData?.type === 'poison-damage'
        ) {
          // Only say "defeated by" if unit actually dies
          if (unit.currentHP <= 0) {
            eventDescription = `${unit.unit.name} is defeated by ${afflictionEventData.afflictionType.toLowerCase()} damage`
          } else {
            eventDescription = `${unit.unit.name} takes ${afflictionEventData.damage} ${afflictionEventData.afflictionType.toLowerCase()} damage (cannot act)`
          }
          eventType = afflictionEventData.type
          afflictionData = {
            afflictionType: afflictionEventData.afflictionType,
            damage: afflictionEventData.damage,
            level: afflictionEventData.level,
          }
        }

        const afflictionEvent: BattleEvent = {
          id: `affliction-${battlefieldState.currentActionId}-${unit.unit.id}`,
          type: eventType,
          turn: battlefieldState.currentActionId,
          description: eventDescription,
          actingUnit: {
            id: unit.unit.id,
            name: unit.unit.name,
            classKey: unit.unit.classKey,
            team: unit.team,
          },
          afflictionData,
        }
        setBattleEvents(prev => [...prev, afflictionEvent])

        // Update unit state - mark as having acted this round since they can't take normal action
        setBattlefieldState(prevState => {
          if (!prevState) return prevState
          const newState = { ...prevState }
          newState.units = {
            ...newState.units,
            [unitId]: {
              ...unit,
              currentHP: unit.currentHP <= 0 ? 0 : unit.currentHP, // Set to 0 if defeated
              hasActedThisRound: true, // Always mark as acted - stun clear, death, etc. all consume turn
            },
          }
          return newState
        })
        return
      }

      // Select skill first to determine proper trigger
      const skillSelection = selectActiveSkill(unit, battlefieldState)

      // Bump action id before skill execution
      setBattlefieldState(prev => {
        if (!prev) return prev
        return { ...prev, currentActionId: prev.currentActionId + 1 }
      })

      // Debug logging for skill selection
      console.debug(`🎯 ${unit.unit.name} selected skill:`, {
        skillName: skillSelection.skill.name,
        skillTargeting: skillSelection.skill.targeting,
        targetCount: skillSelection.targets.length,
        targetNames: skillSelection.targets.map(t => t.unit.name),
      })

      // Apply Cover redirection to targets (entire attack instance)
      const redirectedTargets: BattleContext[] = applyCoverRedirection(
        battlefieldState,
        skillSelection.targets
      )

      // Apply OnActiveHealPercent healing BEFORE skill execution
      // This is the regen effect that happens when taking an action
      const unitStateId = getStateIdForContext(unit)

      // Calculate heal amount (without mutating state)
      const healAmount = calculateOnActiveHealAmount(unit)

      // Create healed unit reference for skill execution (doesn't mutate state)
      // Cap logic:
      // - If currentHP <= maxHP: cap at maxHP
      // - If currentHP > maxHP (overhealed): cap at pre-heal currentHP (preserves overheal, doesn't increase)
      const preHealCurrentHP = unit.currentHP
      const newHP = preHealCurrentHP + healAmount
      const cap = Math.max(unit.combatStats.HP, preHealCurrentHP)
      const healedHP = Math.min(newHP, cap)

      const healedUnit: BattleContext = {
        ...unit,
        currentHP: healedHP,
      }

      // Execute skill with the healed unit (healing already calculated)
      const result = executeSkill(
        skillSelection.skill,
        healedUnit,
        redirectedTargets,
        battlefieldState.rng,
        battlefieldState
      )

      // Determine trigger type based on skill categories and remove expired effects
      const isDamageSkill =
        skillSelection.skill.skillCategories.includes('Damage')
      const trigger = isDamageSkill ? 'attacks' : 'action'
      removeExpiredBuffs(unit, trigger)
      removeExpiredDebuffs(unit, trigger)

      // Transform skill results for battle event
      const skillResults = transformSkillResults(result, redirectedTargets)

      // Create and add battle event (including any affliction processing from turn start)
      let eventDescription = `${unit.unit.name} used ${skillSelection.skill.name}`
      let afflictionData: BattleEvent['afflictionData'] | undefined

      // If there were affliction events this turn, update description and include data
      if (afflictionResult.events.length > 0) {
        const afflictionEvent = afflictionResult.events[0] // Take first/most significant
        if (
          afflictionEvent.type === 'burn-damage' ||
          afflictionEvent.type === 'poison-damage'
        ) {
          eventDescription = `${unit.unit.name} takes ${afflictionEvent.damage} ${afflictionEvent.afflictionType.toLowerCase()} damage, then used ${skillSelection.skill.name}`
          afflictionData = {
            afflictionType: afflictionEvent.afflictionType,
            damage: afflictionEvent.damage,
            level: afflictionEvent.level,
          }
        }
      }

      const battleEvent: BattleEvent = {
        id: `skill-${battlefieldState.currentActionId}-${unit.unit.id}`,
        type: 'skill-execution',
        turn: battlefieldState.currentActionId,
        description: eventDescription,
        actingUnit: {
          id: unit.unit.id,
          name: unit.unit.name,
          classKey: unit.unit.classKey,
          team: unit.team,
        },
        targets: redirectedTargets.map(t => t.unit.id),
        skillId: skillSelection.skill.id,
        skillResults,
        afflictionData,
      }
      setBattleEvents(prev => [...prev, battleEvent])

      // Update battlefield state
      setBattlefieldState(prevState => {
        if (!prevState) return prevState

        // Apply OnActiveHealPercent healing to prevState (only once, in state update)
        const healedState = applyOnActiveHealPercent(prevState, unitStateId)

        // Create new state with counter updates
        const skillTracking = trackSkillUsage(healedState, skillSelection.skill)

        // Deep copy the units object using shared helper
        const deepCopiedUnits = deepCopyUnits(healedState.units)

        const newState = {
          ...healedState,
          actionCounter: healedState.actionCounter + 1,
          turnCount: healedState.turnCount + 1,
          units: deepCopiedUnits,
          actionHistory: [
            ...healedState.actionHistory,
            {
              unitId: unit.unit.id,
              targetIds: redirectedTargets.map(t => t.unit.id),
              skillId: skillSelection.skill.id,
              turn: healedState.turnCount + 1,
            },
          ],
          consecutiveStandbyRounds:
            skillTracking.consecutiveStandbyRounds ??
            healedState.consecutiveStandbyRounds,
          lastActiveSkillRound:
            skillTracking.lastActiveSkillRound ??
            healedState.lastActiveSkillRound,
        }

        // Update acting unit's AP and status
        const actingUnit = newState.units[unitId]
        newState.units[unitId] = {
          ...actingUnit,
          currentAP: Math.max(
            0,
            actingUnit.currentAP - skillSelection.skill.ap
          ),
          hasActedThisRound: true,
        }

        // Apply damage to target units via shared helper
        applySkillDamageResults(newState, redirectedTargets, result)

        return newState
      })

      // Clear defensive states for this action (guard/parry/cover) if needed
      setBattlefieldState(prev => {
        if (!prev) return prev
        return clearDefenseForAction(prev, prev.currentActionId)
      })
    },
    [battlefieldState]
  )

  /**
   * Finalize the battle and set final results
   * Updates battle events and result summary
   */
  const finalizeBattle = useCallback(
    (finalState: BattlefieldState) => {
      if (!isExecuting) return

      const winner = determineBattleWinner(finalState)
      const teamHpPercentages = calculateTeamHpPercentages(finalState)
      const totalTurns = finalState.actionCounter || finalState.turnCount || 0

      const battleEndEvent = createBattleEndEvent(
        winner,
        totalTurns,
        finalState
      )
      setBattleEvents(prevEvents => [...prevEvents, battleEndEvent])

      setResultSummary({
        winner,
        endReason: winner === 'Draw' ? 'Turn limit or draw' : 'Team eliminated',
        totalTurns,
        totalEvents: battleEvents.length + 1,
        teamHpPercentages,
      })

      // Debug logging
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Battle Conclusion:', {
          winner,
          turns: totalTurns,
          teamHealth: teamHpPercentages,
          finalState: {
            units: Object.values(finalState.units).map(u => ({
              name: u.unit.name,
              team: u.team,
              finalHP: `${u.currentHP}/${u.combatStats.HP}`,
            })),
          },
        })
      }

      setIsExecuting(false)
    },
    [battleEvents, isExecuting]
  )

  /**
   * Process the next battle step whenever battlefield state changes
   */
  useEffect(() => {
    if (!battlefieldState || !isExecuting) return

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
        return unit && !unit.hasActedThisRound && isUnitActionableActive(unit)
      }
    )

    if (!nextActionableUnit) {
      // Start new round when no units can act
      const newRoundState = startNewRound(battlefieldState)

      setBattlefieldState(newRoundState)
      return
    }

    // Process the next unit's turn immediately
    processUnitAction(nextActionableUnit)
  }, [battlefieldState, isExecuting, finalizeBattle, processUnitAction])

  /**
   * Start a new battle between two teams
   * Initializes battlefield state and battle events
   */
  const executeBattle = (homeTeam: Team, awayTeam: Team, seed?: string) => {
    // Initialize RNG and state
    const battleSeed = seed || `battle-${Date.now()}`
    const randomData = rng(battleSeed)

    // Reset all battle state
    setBattleEvents([])
    setResultSummary(initialResultSummary)
    setError(null)
    setIsExecuting(true)

    // Create initial battlefield state
    const allBattleContexts = createAllBattleContexts(homeTeam, awayTeam)
    const turnOrder = calculateTurnOrder(allBattleContexts, randomData)
    const initialState = createInitialBattlefieldState(
      allBattleContexts,
      turnOrder,
      randomData
    )

    // Create and add battle start event
    const battleStartEvent = createBattleStartEvent(
      homeTeam.name,
      awayTeam.name
    )
    setBattleEvents([battleStartEvent])

    // Initialize battle state
    setBattlefieldState(initialState)
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
