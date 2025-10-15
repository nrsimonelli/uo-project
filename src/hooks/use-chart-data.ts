import { useMemo } from 'react'

import {
  calculateBaseStats,
  calculateBaseAPPP,
  calculateGrowthRanks,
} from '@/core/calculations/base-stats'
import { calculateEquipmentBonus } from '@/core/calculations/equipment-bonuses'
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
  baseStats: Record<CombatStat, number> & {
    AP: number
    PP: number
    GuardEff: number
  }
  totalStats: Record<CombatStat, number> & {
    AP: number
    PP: number
    GuardEff: number
  }
  equipmentBonus: { AP: number; PP: number; GuardEff: number } & Record<
    string,
    number
  >
} => {
  return useMemo(() => {
    if (!unit) {
      return {
        chartData: [],
        baseStats: {} as Record<CombatStat, number> & {
          AP: number
          PP: number
          GuardEff: number
        },
        totalStats: {} as Record<CombatStat, number> & {
          AP: number
          PP: number
          GuardEff: number
        },
        equipmentBonus: {} as {
          AP: number
          PP: number
          GuardEff: number
        } & Record<string, number>,
      }
    }

    const { classKey, level, growths, equipment } = unit

    const growthValues = COMBINED_CLASS_GROWTH_TABLE[classKey]
    const baseCombatStats = calculateBaseStats(level, classKey, growths)
    const baseAPPP = calculateBaseAPPP(classKey)
    const baseStats = { ...baseCombatStats, ...baseAPPP, GuardEff: 0 }
    const growthRanks = calculateGrowthRanks(classKey)
    const equipmentBonus = calculateEquipmentBonus(
      equipment,
      baseCombatStats,
      classKey
    )

    const totalStats = Object.keys(baseStats).reduce(
      (acc, stat) => {
        acc[stat as keyof typeof baseStats] =
          baseStats[stat as keyof typeof baseStats] +
          (equipmentBonus[stat as keyof typeof equipmentBonus] ?? 0)
        return acc
      },
      {} as typeof baseStats
    )

    // Only create chart data for combat stats (exclude AP/PP/GuardEff from chart)
    const chartData: ChartDatum[] = Object.entries(baseCombatStats).map(
      ([statKey, value]) => ({
        stat: statKey, // Raw stat key for axis (MDEF, PATK, etc.)
        growth: growthValues[statKey as keyof typeof growthValues],
        total: totalStats[statKey as keyof typeof totalStats],
        base: value,
        rank: growthRanks[statKey as keyof typeof growthRanks],
      })
    )

    return { chartData, baseStats, totalStats, equipmentBonus }
  }, [unit])
}
