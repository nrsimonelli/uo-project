import { hasAfflictionImmunity } from './effect-processor'
import { recalculateStats } from './status-effects'

import type { BattleContext, Affliction } from '@/types/battle-engine'
import type { AfflictionType } from '@/types/conditions'

/**
 * Check if a unit has AfflictionImmunity buff and consume it if present
 * Returns true if the affliction should be blocked
 */
const checkAndConsumeAfflictionImmunity = (unit: BattleContext) => {
  const immunityBuffIndex = unit.buffs.findIndex(
    buff => buff.stat === 'AfflictionImmunity'
  )

  if (immunityBuffIndex !== -1) {
    // Remove the immunity buff (it's consumed)
    const consumedBuff = unit.buffs[immunityBuffIndex]
    unit.buffs.splice(immunityBuffIndex, 1)
    console.log(
      `🛡️ ${unit.unit.name}'s ${consumedBuff.name} buff consumed (blocked affliction)`
    )
    recalculateStats(unit)
    return true
  }

  return false
}

/**
 * Apply an affliction to a unit with stacking and immunity checks
 */
export const applyAffliction = (
  unit: BattleContext,
  afflictionType: AfflictionType,
  source: string,
  level?: number
) => {
  // Check permanent immunities first (not consumed)
  if (hasAfflictionImmunity(unit.immunities, afflictionType)) {
    console.log(`${unit.unit.name} is immune to ${afflictionType}`)
    return false
  }

  // Check for AfflictionImmunity buff (consumed on use)
  if (checkAndConsumeAfflictionImmunity(unit)) {
    console.log(
      `${unit.unit.name} blocked ${afflictionType} via AfflictionImmunity buff`
    )
    return false
  }

  // Handle Deathblow immediately
  if (afflictionType === 'Deathblow') {
    console.log(`💀 ${unit.unit.name} receives Deathblow - HP set to 0`)
    unit.currentHP = 0
    // Don't add Deathblow to afflictions array since it's instant
    return true
  }

  // Handle Burn stacking
  if (afflictionType === 'Burn') {
    const existingBurn = unit.afflictions.find(aff => aff.type === 'Burn')
    if (existingBurn) {
      // Stack burn by increasing level
      existingBurn.level = (existingBurn.level || 1) + (level || 1)
      console.log(
        `🔥 ${unit.unit.name} Burn stacked to level ${existingBurn.level}`
      )
      return true
    }
  }

  // Check for existing affliction of same type (no stacking except Burn)
  const existingIndex = unit.afflictions.findIndex(
    aff => aff.type === afflictionType
  )

  const newAffliction: Affliction = {
    type: afflictionType,
    name: afflictionType,
    level: afflictionType === 'Burn' ? level || 1 : undefined,
    source,
  }

  if (existingIndex !== -1) {
    // Replace existing affliction (refresh from same or different source)
    unit.afflictions[existingIndex] = newAffliction
    console.log(`${unit.unit.name} ${afflictionType} refreshed`)
  } else {
    // Add new affliction
    unit.afflictions.push(newAffliction)
    console.log(`${unit.unit.name} afflicted with ${afflictionType}`)
  }

  return true
}

export const removeAffliction = (
  unit: BattleContext,
  afflictionType: AfflictionType
) => {
  const initialLength = unit.afflictions.length
  unit.afflictions = unit.afflictions.filter(aff => aff.type !== afflictionType)

  const wasRemoved = unit.afflictions.length < initialLength
  if (wasRemoved) {
    console.log(`${unit.unit.name} ${afflictionType} removed`)
  }

  return wasRemoved
}

export const hasAffliction = (
  unit: BattleContext,
  afflictionType: AfflictionType
) => {
  return unit.afflictions.some(aff => aff.type === afflictionType)
}

/**
 * Get the level/stacks of a specific affliction (for Burn)
 */
export const getAfflictionLevel = (
  unit: BattleContext,
  afflictionType: AfflictionType
) => {
  const affliction = unit.afflictions.find(aff => aff.type === afflictionType)
  return affliction?.level || 0
}

/**
 * Result of processing afflictions at turn start
 */
export interface AfflictionTurnResult {
  canAct: boolean // Whether unit can take normal action
  events: Array<{
    type: 'burn-damage' | 'poison-damage' | 'stun-clear'
    afflictionType: AfflictionType
    damage?: number
    level?: number
  }>
}

/**
 * Process afflictions at the start of a unit's turn
 * Returns result with action capability and events for battle log
 */
export const processAfflictionsAtTurnStart = (
  unit: BattleContext
): AfflictionTurnResult => {
  const events: AfflictionTurnResult['events'] = []
  let canAct = true

  // Process Burn damage
  if (hasAffliction(unit, 'Burn')) {
    const burnLevel = getAfflictionLevel(unit, 'Burn')
    const burnDamage = burnLevel * 20
    unit.currentHP = Math.max(0, unit.currentHP - burnDamage)
    console.log(
      `🔥 ${unit.unit.name} takes ${burnDamage} burn damage (level ${burnLevel}). HP: ${unit.currentHP}`
    )

    events.push({
      type: 'burn-damage',
      afflictionType: 'Burn',
      damage: burnDamage,
      level: burnLevel,
    })

    // Check if unit is defeated by burn
    if (unit.currentHP <= 0) {
      console.log(`💀 ${unit.unit.name} defeated by burn damage`)
      canAct = false
    }
  }

  // Process Poison damage
  if (hasAffliction(unit, 'Poison')) {
    const poisonDamage = Math.floor(unit.combatStats.HP * 0.3)
    unit.currentHP = Math.max(0, unit.currentHP - poisonDamage)
    console.log(
      `☠️ ${unit.unit.name} takes ${poisonDamage} poison damage (30% max HP). HP: ${unit.currentHP}`
    )

    events.push({
      type: 'poison-damage',
      afflictionType: 'Poison',
      damage: poisonDamage,
    })

    // Check if unit is defeated by poison
    if (unit.currentHP <= 0) {
      console.log(`💀 ${unit.unit.name} defeated by poison damage`)
      canAct = false
    }
  }

  // Process Stun - unit must spend turn clearing it
  if (hasAffliction(unit, 'Stun')) {
    removeAffliction(unit, 'Stun')
    console.log(`😵 ${unit.unit.name} spends turn clearing Stun`)

    events.push({
      type: 'stun-clear',
      afflictionType: 'Stun',
    })

    canAct = false // Turn is consumed clearing stun
  }

  return { canAct, events }
}

/**
 * Check if a unit can use active skills (not frozen)
 */
export const canUseActiveSkills = (unit: BattleContext) => {
  if (unit.currentHP <= 0) return false
  if (unit.currentAP <= 0) return false

  return !hasAffliction(unit, 'Freeze')
}

export const canUsePassiveSkills = (unit: BattleContext) => {
  if (unit.currentHP <= 0) return false
  if (unit.currentPP <= 0) return false

  // Cannot use passives if stunned, frozen, or passive sealed
  return !(
    hasAffliction(unit, 'Stun') ||
    hasAffliction(unit, 'Freeze') ||
    hasAffliction(unit, 'PassiveSeal')
  )
}

export const canGuard = (unit: BattleContext) => {
  if (unit.currentHP <= 0) return false

  // Cannot guard if stunned, frozen, or guard sealed
  return !(
    hasAffliction(unit, 'Stun') ||
    hasAffliction(unit, 'Freeze') ||
    hasAffliction(unit, 'GuardSeal')
  )
}

export const canEvade = (unit: BattleContext) => {
  if (unit.currentHP <= 0) return false

  // Cannot evade if stunned or frozen
  return !(hasAffliction(unit, 'Stun') || hasAffliction(unit, 'Freeze'))
}

export const canCrit = (unit: BattleContext) => {
  return !hasAffliction(unit, 'CritSeal')
}

/**
 * Check if a unit's attack will miss due to Blind
 * If blind, removes the affliction after checking
 */
export const checkAndConsumeBlind = (unit: BattleContext) => {
  if (hasAffliction(unit, 'Blind')) {
    removeAffliction(unit, 'Blind')
    console.log(`👁️ ${unit.unit.name} misses due to Blind (now removed)`)
    return true // Attack will miss
  }
  return false // Attack hits normally
}

/**
 * Process afflictions when a unit is hit by an attack
 * Handles Freeze removal when hit (regardless of damage amount)
 */
export const processAfflictionsOnHit = (unit: BattleContext) => {
  if (hasAffliction(unit, 'Freeze')) {
    removeAffliction(unit, 'Freeze')
    console.log(`🧊 ${unit.unit.name} Freeze removed by being hit`)
  }
}

/**
 * Clear all afflictions from a unit (for cleanup/healing effects)
 */
export const clearAllAfflictions = (unit: BattleContext) => {
  const hadAfflictions = unit.afflictions.length > 0
  unit.afflictions = []

  if (hadAfflictions) {
    console.log(`✨ ${unit.unit.name} all afflictions cleared`)
  }
}

export const getAfflictionSummary = (unit: BattleContext) => {
  return unit.afflictions.map(aff => {
    if (aff.type === 'Burn' && aff.level && aff.level > 1) {
      return `${aff.type} (Level ${aff.level})`
    }
    return aff.type
  })
}
