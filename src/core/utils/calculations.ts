import { BASE_STAT_TABLE } from '../../data/units/base-stat-table'
import { COMBINED_CLASS_GROWTH_TABLE } from '../../data/units/class-growth-table'
import { GROWTH_RANKS } from '../../data/units/constants'
import {
  GROWTH_CORRECTION_TABLE_A,
  GROWTH_CORRECTION_TABLE_B,
} from '../../data/units/growth-correction-table'
import type {
  GrowthType,
  GrowthRank,
  AllClassType,
} from '../../types/base-stats'

type ValidLevel = keyof typeof BASE_STAT_TABLE
const initialStatData = {
  HP: 0,
  PATK: 0,
  PDEF: 0,
  MATK: 0,
  MDEF: 0,
  ACC: 0,
  EVA: 0,
  CRT: 0,
  GRD: 0,
  INIT: 0,
}

export const calculateBaseStats = (
  level: ValidLevel,
  classType: AllClassType,
  growthType: [GrowthType, GrowthType]
) => {
  const baseStats = { ...initialStatData }
  const universalBaseStats = BASE_STAT_TABLE[level]
  const growthCorrectionA = calculateGrowthCorrectionA(classType, growthType)
  const growthCorrectionB = calculateGrowthCorrectionB(growthType)

  for (const stat in baseStats) {
    const key = stat as keyof typeof baseStats
    baseStats[key] = Math.round(
      (universalBaseStats[key] / 100) * growthCorrectionA[key] +
        growthCorrectionB[key]
    )
  }

  return baseStats
}

const calculateGrowthCorrectionA = (
  classType: AllClassType,
  growthType: [GrowthType, GrowthType]
) => {
  const finalGrowthCorrectionA = {
    ...initialStatData,
  }
  const growthTypeOneCorrection = GROWTH_CORRECTION_TABLE_A[growthType[0]]
  const growthTypeTwoCorrection = GROWTH_CORRECTION_TABLE_A[growthType[1]]

  const baseRates = COMBINED_CLASS_GROWTH_TABLE[classType]

  for (const stat in finalGrowthCorrectionA) {
    const key = stat as keyof typeof finalGrowthCorrectionA
    finalGrowthCorrectionA[key] =
      Math.round(
        (growthTypeOneCorrection[key] + growthTypeTwoCorrection[key]) * 0.5
      ) + baseRates[key]
  }

  return finalGrowthCorrectionA
}

const calculateGrowthCorrectionB = (growthType: [GrowthType, GrowthType]) => {
  const finalGrowthCorrectionB = { ...initialStatData }
  const growthTypeOneCorrection = GROWTH_CORRECTION_TABLE_B[growthType[0]]
  const growthTypeTwoCorrection = GROWTH_CORRECTION_TABLE_B[growthType[1]]

  for (const stat in finalGrowthCorrectionB) {
    const key = stat as keyof typeof finalGrowthCorrectionB
    finalGrowthCorrectionB[key] = Math.round(
      (growthTypeOneCorrection[key] + growthTypeTwoCorrection[key]) * 0.5
    )
  }

  return finalGrowthCorrectionB
}

export const calculateFinalStats = (
  level: ValidLevel,
  classType: AllClassType,
  growthType: [GrowthType, GrowthType]
) => {
  // base + equipment + dews + rapports
  const result = calculateBaseStats(level, classType, growthType)
  return result
}

export const calculateGrowthRanks = (classType: AllClassType) => {
  const result = {
    HP: '',
    PATK: '',
    PDEF: '',
    MATK: '',
    MDEF: '',
    ACC: '',
    EVA: '',
    CRT: '',
    GRD: '',
    INIT: '',
  }

  const classGrowth = COMBINED_CLASS_GROWTH_TABLE[classType]

  for (const stat in result) {
    const key = stat as keyof typeof result
    result[key] = getGrowthRank(classGrowth[key])
  }

  return result
}

const getGrowthRank = (value: number): GrowthRank => {
  if (value < GROWTH_RANKS.E) return 'F'
  if (value < GROWTH_RANKS.D) return 'E'
  if (value < GROWTH_RANKS.C) return 'D'
  if (value < GROWTH_RANKS.B) return 'C'
  if (value < GROWTH_RANKS.A) return 'B'
  if (value < GROWTH_RANKS.S) return 'A'
  return 'S'
}
