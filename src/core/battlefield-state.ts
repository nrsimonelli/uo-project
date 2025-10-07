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
  const equipmentBonus = calculateEquipmentBonus(unit.equipment, baseStats)

  // Combine base stats and equipment bonuses for combat stats
  const combatStats = Object.keys(baseStats).reduce(
    (acc, stat) => {
      const key = stat as keyof typeof baseStats
      acc[key] = baseStats[key] + (equipmentBonus[key] ?? 0)
      return acc
    },
    {} as Record<StatKey, number>
  )

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
 */
export const createFormationArrays = (
  allBattleContexts: Record<string, BattleContext>
): { allies: (string | null)[][]; enemies: (string | null)[][] } => {
  const homeFormation: (string | null)[][] = [[], []]
  const awayFormation: (string | null)[][] = [[], []]

  Object.entries(allBattleContexts).forEach(([unitId, context]) => {
    const formation =
      context.team === 'home-team' ? homeFormation : awayFormation
    const { row, col } = context.position

    // Ensure the formation array has the correct size
    while (formation[row].length <= col) formation[row].push(null)
    formation[row][col] = unitId
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
    activeUnitId: turnOrder[0] || '',
    formations,
    activeSkillQueue: turnOrder,
    passiveSkillQueue: [],
    battlePhase: 'setup',
    isNight: false,
    turnCount: 0,
    actionHistory: [],
    rng,
    currentRound: 1,
    activeSkillTurnCounter: 0,
    passiveResponseTracking: {},
    inactivityCounter: 0,
    lastActionRound: 0,
  }
}
