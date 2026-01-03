import {
  canUseActiveSkills,
  canUsePassiveSkills,
  processAfflictionsAtTurnStart,
} from '../combat/affliction-manager'

import { calculateTurnOrder } from '@/core/calculations/turn-order'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { AfflictionType } from '@/types/conditions'

export const isUnitAfflicted = (
  unit: BattleContext,
  affliction: AfflictionType[]
) => {
  if (unit.afflictions.length === 0) {
    return false
  }
  return unit.afflictions.some(aff => affliction.includes(aff.type))
}

// Use new affliction manager functions
export const isUnitActionableActive = canUseActiveSkills
export const isUnitActionablePassive = canUsePassiveSkills

export const processUnitTurnStart = processAfflictionsAtTurnStart

export const removeCurrentUnitFromQueue = (state: BattlefieldState) => {
  const currentIndex = state.activeSkillQueue.indexOf(state.activeUnitId)

  if (currentIndex >= 0) {
    const newQueue = [...state.activeSkillQueue]
    newQueue.splice(currentIndex, 1)

    return {
      ...state,
      activeSkillQueue: newQueue,
    }
  }

  return state // No changes needed
}

export const cleanIneligibleUnits = (state: BattlefieldState) => {
  const newQueue = [...state.activeSkillQueue]

  while (newQueue.length > 0) {
    const nextUnitId = newQueue[0]
    const nextUnit = state.units[nextUnitId]

    if (nextUnit && isUnitActionableActive(nextUnit)) {
      // Found eligible unit - stop cleaning
      break
    } else {
      // Unit can't act - remove from queue
      newQueue.shift()
    }
  }

  return {
    ...state,
    activeSkillQueue: newQueue,
  }
}

export const setNextActiveUnit = (state: BattlefieldState) => {
  const activeUnitId =
    state.activeSkillQueue.length > 0 ? state.activeSkillQueue[0] : ''

  return {
    ...state,
    activeUnitId,
  }
}

export const advanceToNextUnit = (state: BattlefieldState) => {
  // Step 1: Remove current unit from queue
  let newState = removeCurrentUnitFromQueue(state)

  // Step 2: Clean ineligible units from front of queue
  newState = cleanIneligibleUnits(newState)

  // Step 3: Set next active unit
  newState = setNextActiveUnit(newState)

  // Step 4: Handle empty queue if needed
  if (newState.activeSkillQueue.length === 0) {
    newState = handleEmptyQueue(newState)
  }

  return newState
}

export const handleEmptyQueue = (state: BattlefieldState) => {
  // Check if any units can still act this round
  const actionableUnits = Object.values(state.units).filter(
    isUnitActionableActive
  )

  // Check if we have living units (for battle continuation)
  const livingUnits = Object.values(state.units).filter(
    unit => unit.currentHP > 0
  )

  console.log('🏁 Queue empty - Round end check:', {
    actionableUnits: actionableUnits.length,
    livingUnits: livingUnits.length,
    currentRound: state.currentRound,
  })

  if (livingUnits.length === 0) {
    // No living units - end battle
    console.log('💀 No living units remaining - ending battle')
    return {
      ...state,
      battlePhase: 'cleanup',
      activeUnitId: '',
    }
  }

  if (actionableUnits.length > 0) {
    // Some units can still act - start new round
    console.log('🔄 Starting new round - actionable units remain')
    return startNewRound(state)
  } else {
    // No units can act but some are alive - end battle due to stalemate
    console.log('🚫 No actionable units - ending battle due to stalemate')
    return {
      ...state,
      battlePhase: 'cleanup',
      activeUnitId: '',
    }
  }
}

/**
 * Start a new round by rebuilding the active skill queue
 * RULE 2: Every unit is placed in the active queue at the start of the round
 * Returns new state with fresh queue of ALL units (both active and inactive)
 */
export const startNewRound = (state: BattlefieldState) => {
  // Get ALL living units, not just actionable ones
  const allLivingUnits = Object.values(state.units).filter(
    unit => unit.currentHP > 0
  )

  if (allLivingUnits.length === 0) {
    return {
      ...state,
      battlePhase: 'cleanup',
      activeUnitId: '',
    }
  }

  // Rebuild queue with ALL living units in initiative order
  const queueMap = Object.fromEntries(
    allLivingUnits.map(unit => [
      `${unit.team === 'defending-team' ? 'defending' : 'attacking'}-${unit.unit.id}`,
      unit,
    ])
  )
  const newQueue = calculateTurnOrder(queueMap, state.rng).filter(
    unitId => unitId in state.units
  )

  // Check if the previous round was all standby actions
  // We can detect this by checking if lastActiveSkillRound is behind current round
  const wasStandbyRound = state.lastActiveSkillRound < state.currentRound
  const updatedConsecutiveStandbyRounds = wasStandbyRound
    ? state.consecutiveStandbyRounds + 1
    : state.consecutiveStandbyRounds

  // Reset hasActedThisRound for all units at start of new round
  // Preserve all unit state including updated HP values
  const unitsWithResetFlags = Object.fromEntries(
    Object.entries(state.units).map(([unitId, unit]) => [
      unitId,
      {
        ...unit,
        unit: { ...unit.unit },
        combatStats: { ...unit.combatStats },
        afflictions: [...unit.afflictions],
        buffs: [...unit.buffs],
        hasActedThisRound: false,
      },
    ])
  )

  return {
    ...state,
    units: unitsWithResetFlags,
    activeSkillQueue: newQueue,
    activeUnitId: newQueue[0] || '',
    currentRound: state.currentRound + 1,
    lastActiveSkillRound: state.lastActiveSkillRound, // Preserve this value
    consecutiveStandbyRounds: updatedConsecutiveStandbyRounds, // Use updated value
  }
}

/**
 * Reorder remaining units in queue after initiative changes
 * Current unit keeps their turn, only remaining queue is reordered
 * Returns new state with reordered queue
 */
export const reorderRemainingUnits = (state: BattlefieldState) => {
  const { activeSkillQueue, activeUnitId, units, rng } = state

  // Get remaining units (exclude current unit)
  const remainingUnitIds = activeSkillQueue.filter(
    unitId => unitId !== activeUnitId
  )
  const remainingUnits = remainingUnitIds
    .map(unitId => units[unitId])
    .filter(unit => unit && isUnitActionableActive(unit))

  if (remainingUnits.length <= 1) {
    // No need to reorder
    return state
  }

  // Recalculate order for remaining units
  const reorderedQueue = calculateTurnOrder(
    Object.fromEntries(
      remainingUnits.map(unit => [
        `${unit.team === 'defending-team' ? 'defending' : 'attacking'}-${unit.unit.id}`,
        unit,
      ])
    ),
    rng
  )

  // New queue: current unit first, then reordered remaining units
  const newQueue = [activeUnitId, ...reorderedQueue]

  return {
    ...state,
    activeSkillQueue: newQueue,
  }
}
export const shouldContinueBattle = (state: BattlefieldState) => {
  // Get living units and actionable units
  const livingUnits = Object.values(state.units).filter(
    unit => unit.currentHP > 0
  )
  const actionableUnits = Object.values(state.units).filter(
    unit => unit.currentHP > 0 && isUnitActionableActive(unit)
  )

  const defendingLiving = livingUnits.filter(
    unit => unit.team === 'defending-team'
  )
  const attackingLiving = livingUnits.filter(
    unit => unit.team === 'attacking-team'
  )
  // Check actionable units by team (for future use if needed)
  // const defendingActionable = actionableUnits.filter(unit => unit.team === 'defending-team')
  // const attackingActionable = actionableUnits.filter(unit => unit.team === 'attacking-team')

  // Battle ends if:
  // 1. One team is completely eliminated (HP = 0)
  if (defendingLiving.length === 0 || attackingLiving.length === 0) {
    console.log('💥 Battle ending: Team eliminated')
    return false
  }

  // 2. No units on either team can act (all out of AP)
  if (actionableUnits.length === 0) {
    console.log('💪 Battle ending: All units out of AP')
    return false
  }

  // 3. Round limit reached (safety check)
  if (state.currentRound >= 100) {
    console.log('⏰ Battle ending: Round limit reached (100 rounds)')
    return false
  }

  // 4. Stalemate - no active skills used for 3 consecutive rounds
  if (state.consecutiveStandbyRounds >= 3) {
    console.log(
      '🔄 Battle ending: Stalemate - 3 rounds of only Standby actions'
    )
    return false
  }

  // Battle continues
  return true
}
