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

export const isUnitActionableActive = (unit: BattleContext) => {
  if (unit.currentHP <= 0) {
    return false
  }
  // Must have AP remaining
  if (unit.currentAP <= 0) {
    return false
  }
  // Cannot act if frozen
  const isFrozen = isUnitAfflicted(unit, ['Freeze'])

  return !isFrozen
}

export const isUnitActionablePassive = (unit: BattleContext) => {
  if (unit.currentHP <= 0) {
    return false
  }
  // Must have PP remaining
  if (unit.currentPP <= 0) {
    return false
  }
  // Cannot act if frozen, stunned, or passive sealed
  const isActionable = !isUnitAfflicted(unit, [
    'Stun',
    'Freeze',
    'Passive Seal',
  ])

  return isActionable
}

/**
 * Remove current unit from active skill queue
 * Returns new state with updated queue
 */
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

/**
 * Remove ineligible units from front of queue
 * Returns new state with cleaned queue
 */
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

/**
 * Set the next active unit (first in queue)
 * Returns new state with updated activeUnitId
 */
export const setNextActiveUnit = (state: BattlefieldState) => {
  const activeUnitId =
    state.activeSkillQueue.length > 0 ? state.activeSkillQueue[0] : ''

  return {
    ...state,
    activeUnitId,
  }
}

/**
 * Advance to the next unit in turn order
 * Returns new battlefield state with updated turn order
 */
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

/**
 * Handle when the active skill queue is empty
 * RULE 6: When queue contains only inactive units, the round is over and queue is repopulated
 * Returns new state either starting new round or ending battle
 */
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
  const newQueue = calculateTurnOrder(
    Object.fromEntries(
      allLivingUnits.map(unit => [
        `${unit.team === 'home-team' ? 'home' : 'away'}-${unit.unit.id}`,
        unit,
      ])
    ),
    state.rng
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
        `${unit.team === 'home-team' ? 'home' : 'away'}-${unit.unit.id}`,
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
/**
 * Check if the battle should continue
 * Returns false if one team is eliminated, all units are out of AP, stalemate, or round limit
 */
export const shouldContinueBattle = (state: BattlefieldState) => {
  // Get living units and actionable units
  const livingUnits = Object.values(state.units).filter(
    unit => unit.currentHP > 0
  )
  const actionableUnits = Object.values(state.units).filter(
    unit => unit.currentHP > 0 && isUnitActionableActive(unit)
  )

  const homeLiving = livingUnits.filter(unit => unit.team === 'home-team')
  const awayLiving = livingUnits.filter(unit => unit.team === 'away-team')
  // Check actionable units by team (for future use if needed)
  // const homeActionable = actionableUnits.filter(unit => unit.team === 'home-team')
  // const awayActionable = actionableUnits.filter(unit => unit.team === 'away-team')

  // Battle ends if:
  // 1. One team is completely eliminated (HP = 0)
  if (homeLiving.length === 0 || awayLiving.length === 0) {
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
