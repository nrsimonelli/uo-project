import {
  calculateBaseStats,
  calculateEquipmentBonus,
  calculateFinalAPPP,
} from './calculations'
import { getCombatantTypeFromClass } from './helpers'
import type { RandomNumberGeneratorType } from './random'

import type { StatKey } from '@/types/base-stats'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { Team, Unit } from '@/types/team'

/**
 * Convert a Unit into a BattleContext with calculated stats and battle state
 */
export const createBattleContext = (
  unit: Unit,
  team: 'home-team' | 'away-team',
  position: { row: number; col: number }
): BattleContext => {
  // Calculate combat stats from base stats + equipment
  const baseStats = calculateBaseStats(unit.level, unit.classKey, unit.growths)
  const equipmentBonus = calculateEquipmentBonus(unit.equipment, baseStats, unit.classKey)

  // Combine base stats and equipment bonuses for combat stats
  const combatStats = Object.keys(baseStats).reduce(
    (acc, stat) => {
      const key = stat as keyof typeof baseStats
      acc[key] = baseStats[key] + (equipmentBonus[key] ?? 0)
      return acc
    },
    {} as Record<StatKey | 'GuardEff', number>
  )

  // Add GuardEff from equipment (not in base stats)
  combatStats['GuardEff'] = equipmentBonus.GuardEff ?? 0

  // Calculate final AP/PP with equipment bonuses and cap at 4
  const finalAPPP = calculateFinalAPPP(unit.classKey, equipmentBonus)

  // Get combatant types for this unit's class
  const combatantTypes = getCombatantTypeFromClass(unit.classKey)

  return {
    unit,
    team,
    position,
    combatStats,
    currentHP: combatStats.HP, // Start at full health
    currentAP: finalAPPP.AP,
    currentPP: finalAPPP.PP,
    combatantTypes,

    // Initialize all status arrays empty
    buffs: [],
    debuffs: [],
    afflictions: [],
    flags: [],
    lastPassiveResponse: 0,
    isPassiveResponsive: true,
    immunities: [],
    hasActedThisRound: false, // Initialize as hasn't acted this round
  }
}

/**
 * Create battle contexts for all units in both teams
 */
export const createAllBattleContexts = (
  homeTeam: Team,
  awayTeam: Team
): Record<string, BattleContext> => {
  const allBattleContexts: Record<string, BattleContext> = {}

  // Process home team units
  homeTeam.formation.forEach(unit => {
    if (unit && unit.position) {
      const battleContext = createBattleContext(
        unit,
        'home-team',
        unit.position
      )
      allBattleContexts[`home-${unit.id}`] = battleContext
    }
  })

  // Process away team units
  awayTeam.formation.forEach(unit => {
    if (unit && unit.position) {
      const battleContext = createBattleContext(
        unit,
        'away-team',
        unit.position
      )
      allBattleContexts[`away-${unit.id}`] = battleContext
    }
  })

  return allBattleContexts
}

/**
 * Create formation arrays from battle contexts for battlefield state
 * Always creates proper 2x3 grids (2 rows, 3 columns) with null for empty positions
 */
export const createFormationArrays = (
  allBattleContexts: Record<string, BattleContext>
): { allies: (string | null)[][]; enemies: (string | null)[][] } => {
  // Initialize fixed 2x3 grids filled with null
  const homeFormation: (string | null)[][] = [
    [null, null, null], // Back row (row 0)
    [null, null, null], // Front row (row 1)
  ]
  const awayFormation: (string | null)[][] = [
    [null, null, null], // Back row (row 0)
    [null, null, null], // Front row (row 1)
  ]

  // Place units in their correct positions
  Object.entries(allBattleContexts).forEach(([unitId, context]) => {
    const formation =
      context.team === 'home-team' ? homeFormation : awayFormation
    const { row, col } = context.position

    // Validate position is within grid bounds
    if (row >= 0 && row <= 1 && col >= 0 && col <= 2) {
      formation[row][col] = unitId
    } else {
      console.warn(
        `Invalid position for unit ${unitId}: row=${row}, col=${col}`
      )
    }
  })

  return {
    allies: homeFormation,
    enemies: awayFormation,
  }
}

/**
 * Create the initial battlefield state for battle execution
 */
export const createInitialBattlefieldState = (
  allBattleContexts: Record<string, BattleContext>,
  turnOrder: string[],
  rng: RandomNumberGeneratorType
): BattlefieldState => {
  const formations = createFormationArrays(allBattleContexts)

  return {
    units: allBattleContexts,
    activeUnitId: '',
    formations,
    activeSkillQueue: turnOrder,
    passiveSkillQueue: [],
    battlePhase: 'setup',
    isNight: false,
    turnCount: 0,
    actionHistory: [],
    rng,
    currentRound: 1,
    actionCounter: 0,
    passiveResponseTracking: {},
    inactivityCounter: 0,
    lastActionRound: 0,
    lastActiveSkillRound: 1, // Initialize to round 1
    consecutiveStandbyRounds: 0, // Start with 0 consecutive standby rounds
  }
}
