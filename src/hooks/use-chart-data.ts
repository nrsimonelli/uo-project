import { useMemo } from 'react'

import {
  calculateBaseStats,
  calculateBaseAPPP,
  calculateGrowthRanks,
} from '@/core/calculations/base-stats'
import { calculateEquipmentBonus } from '@/core/calculations/equipment-bonuses'
import { STATS } from '@/data/constants'
import { COMBINED_CLASS_GROWTH_TABLE } from '@/data/units/class-growth-table'
import type { StatKey } from '@/types/base-stats'
import type { ExtraStats } from '@/types/equipment'
import type { Unit } from '@/types/team'

export type ChartDatum = {
  stat: string
  growth: number
  total: number
  base: number
  rank: string
}

export type CombatStat = Exclude<StatKey, 'EXP' | 'LV' | 'MOV'>

export const COMBAT_STATS = Object.keys(STATS).filter(
  stat => stat !== 'EXP' && stat !== 'LV' && stat !== 'MOV'
) as CombatStat[]
type OtherStat = 'AP' | 'PP' | 'GuardEff'
type StatDataKey = CombatStat | OtherStat
type StatData = Record<StatDataKey, number>

export const useChartData = (
  unit: Unit | null
): {
  chartData: ChartDatum[]
  baseStats: StatData
  totalStats: StatData
  equipmentBonus: { AP: number; PP: number; GuardEff: number } & Record<
    string,
    number
  >
} => {
  return useMemo(() => {
    if (!unit) {
      return {
        chartData: [],
        baseStats: {} as StatData,
        totalStats: {} as StatData,
        equipmentBonus: {} as StatData & Record<ExtraStats, number>,
      }
    }

    const { classKey, level, growths, dews, equipment } = unit

    const growthValues = COMBINED_CLASS_GROWTH_TABLE[classKey]
    const baseCombatStats = calculateBaseStats(level, classKey, growths, dews)
    const baseAPPP = calculateBaseAPPP(classKey)
    const baseStats = { ...baseCombatStats, ...baseAPPP, GuardEff: 0 }
    const growthRanks = calculateGrowthRanks(classKey)
    const equipmentBonus = calculateEquipmentBonus(
      equipment,
      baseCombatStats,
      classKey
    )

    // TODO: consider adding 100 for ACC?
    const totalStats = Object.keys(baseStats).reduce(
      (acc, stat) => {
        acc[stat as StatDataKey] = Math.max(
          baseStats[stat as StatDataKey] +
            (equipmentBonus[stat as keyof typeof equipmentBonus] ?? 0) +
            (stat === 'ACC' ? 100 : 0),
          0
        )
        return acc
      },
      {} as typeof baseStats
    )

    // Only create chart data for combat stats (exclude AP/PP/GuardEff from chart)
    const chartData: ChartDatum[] = Object.entries(baseCombatStats).map(
      ([statKey, value]) => ({
        stat: statKey, // Raw stat key for axis (MDEF, PATK, etc.)
        growth: growthValues[statKey as CombatStat],
        total: totalStats[statKey as CombatStat],
        base: value,
        rank: growthRanks[statKey as CombatStat],
      })
    )

    return { chartData, baseStats, totalStats, equipmentBonus }
  }, [unit])
}
