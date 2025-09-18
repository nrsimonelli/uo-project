import type { Unit } from '@/components/team-builder/team-context'
import {
  calculateBaseStats,
  calculateEquipmentBonus,
  calculateGrowthRanks,
} from '@/core/utils/calculations'
import { COMBINED_CLASS_GROWTH_TABLE } from '@/data/units/class-growth-table'
import { STATS } from '@/data/units/constants'
import type { StatKey } from '@/types/base-stats'
import { useMemo } from 'react'

export const useChartData = (
  unit: Unit | null
): {
  // all stat keys except for LV, EXP, MOV
  stat: string
  growth: number
  total: number
  base: number
  rank: string
}[] => {
  return useMemo(() => {
    if (!unit) return []

    const { class: classType, level, growths, equipment } = unit

    const growthValues = COMBINED_CLASS_GROWTH_TABLE[classType]
    const baseStats = calculateBaseStats(level, classType, growths)
    const growthRanks = calculateGrowthRanks(classType)
    const equipmentBonus = calculateEquipmentBonus(equipment)

    return Object.entries(baseStats).map(([stat, value]) => ({
      stat: STATS[stat as StatKey] || stat,
      growth: growthValues[stat as keyof typeof growthValues],
      total: value + equipmentBonus[stat as keyof typeof equipmentBonus],
      base: value,
      rank: growthRanks[stat as keyof typeof growthRanks],
    }))
  }, [unit])
}
