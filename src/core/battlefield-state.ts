import {
  calculateBaseStats,
  calculateEquipmentBonus,
  calculateFinalAPPP,
} from './calculations'
import { getCombatantTypeFromClass } from './helpers'

import type { StatKey } from '@/types/base-stats'
import type { BattleContext } from '@/types/battle-engine'
import type { Unit } from '@/types/team'

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
