import { useMemo } from 'react'

import {
  calculateBaseStats,
  calculateEquipmentBonus,
  calculateGrowthRanks,
} from '@/core/calculations'
import { STATS } from '@/data/constants'
import { COMBINED_CLASS_GROWTH_TABLE } from '@/data/units/class-growth-table'
import type { StatKey } from '@/types/base-stats'
import type { Unit } from '@/types/team'

export type ChartDatum = {
  stat: string
  growth: number
  total: number
  base: number
  rank: string
}

type CombatStat = Exclude<StatKey, 'EXP' | 'LV' | 'MOV'>

export const useChartData = (
  unit: Unit | null
): {
  chartData: ChartDatum[]
  baseStats: Record<CombatStat, number>
  totalStats: Record<CombatStat, number>
} => {
  return useMemo(() => {
    if (!unit) {
      return {
        chartData: [],
        baseStats: {} as Record<CombatStat, number>,
        totalStats: {} as Record<CombatStat, number>,
      }
    }

    const { classKey, level, growths, equipment } = unit

    const growthValues = COMBINED_CLASS_GROWTH_TABLE[classKey]
    const baseStats = calculateBaseStats(level, classKey, growths)
    const growthRanks = calculateGrowthRanks(classKey)
    const equipmentBonus = calculateEquipmentBonus(equipment, baseStats)

    const totalStats = Object.keys(baseStats).reduce(
      (acc, stat) => {
        acc[stat as CombatStat] =
          baseStats[stat as keyof typeof baseStats] +
          (equipmentBonus[stat as keyof typeof equipmentBonus] ?? 0)
        return acc
      },
      {} as Record<CombatStat, number>
    )

    const chartData: ChartDatum[] = Object.entries(baseStats).map(
      ([stat, value]) => ({
        stat: STATS[stat as StatKey] || stat,
        growth: growthValues[stat as keyof typeof growthValues],
        total: totalStats[stat as CombatStat],
        base: value,
        rank: growthRanks[stat as keyof typeof growthRanks],
      })
    )

    return { chartData, baseStats, totalStats }
  }, [unit])
}
