import type { Unit } from '@/components/team-builder/team-context'
import {
  calculateBaseStats,
  calculateEquipmentBonus,
  calculateGrowthRanks,
} from '@/core/calculations'
import { COMBINED_CLASS_GROWTH_TABLE } from '@/data/units/class-growth-table'
import { STATS } from '@/data/units/constants'
import type { StatKey } from '@/types/base-stats'
import { useMemo } from 'react'

export type ChartDatum = {
  stat: string
  growth: number
  total: number
  base: number
  rank: string
}

// type CombatStat = StatKey without Exp, Lv, and Move
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

    const { class: classType, level, growths, equipment } = unit

    const growthValues = COMBINED_CLASS_GROWTH_TABLE[classType]
    const baseStats = calculateBaseStats(level, classType, growths)
    const growthRanks = calculateGrowthRanks(classType)
    const equipmentBonus = calculateEquipmentBonus(equipment)

    const totalStats = Object.keys(baseStats).reduce((acc, stat) => {
      acc[stat as CombatStat] =
        baseStats[stat as keyof typeof baseStats] +
        (equipmentBonus[stat as keyof typeof equipmentBonus] ?? 0)
      return acc
    }, {} as Record<CombatStat, number>)

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
