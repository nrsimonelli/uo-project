import { UNIVERSAL_STAT_TABLE } from '../data/universal-stat-table'
import { COMBINED_CLASS_GROWTH_TABLE } from '../data/class-growth-table'
import { GROWTH_RANKS } from '../data/constants'
import {
  GROWTH_CORRECTION_TABLE_A,
  GROWTH_CORRECTION_TABLE_B,
} from '../data/growth-correction-table'
import type { GrowthType, GrowthRank, AllClassType } from '../types/base-stats'
import type { EquippedItem } from '@/types/equipment'
import type { RandomNumberGeneratorType } from './random'
import { clamp } from '@/lib/utils'

type ValidLevel = keyof typeof UNIVERSAL_STAT_TABLE
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
  const universalBaseStats = UNIVERSAL_STAT_TABLE[level]
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

// TODO: implement actual equipment logic
export const calculateEquipmentBonus = (equipment: EquippedItem[]) => {
  console.log('Equipment:', equipment)

  const result = {
    ...initialStatData,
  }
  // for (const item of equipment) {
  // if (!item){

  // }
  // }
  // for (const item of equipment) {
  //   const stat = item.stat
  //   const value = item.value
  //   if (stat in result) {
  //     result[stat] += value
  //   } else {
  //     result[stat] = value
  //   }
  // }
  return result
}

export const calculateDamage = (
  attack: number,
  defense: number,
  potency: number,
  critMultiplier: number,
  guardMultiplier: number,
  effectiveness: number,
  isPhysical: boolean
) => {
  const afterDefense = attack - defense
  const afterPotency = afterDefense * (potency / 100)
  const afterCrit = afterPotency * critMultiplier
  const afterGuard = isPhysical ? afterCrit * guardMultiplier : afterCrit
  const afterEffectiveness = afterGuard * effectiveness
  const finalDamage = Math.max(1, Math.round(afterEffectiveness))

  console.debug('Damage Calculation Trace', {
    attack,
    defense,
    potency,
    critMultiplier,
    guardMultiplier,
    effectiveness,
    isPhysical,
    afterDefense,
    afterPotency,
    afterCrit,
    afterGuard,
    afterEffectiveness,
    finalDamage,
  })

  return finalDamage
}

// Crit
export const rollCrit = (r: RandomNumberGeneratorType, critRate: number) => {
  const chance = clamp(critRate, 0, 100)
  const roll = r.random() * 100
  const didCrit = roll < chance
  console.debug('Crit Roll', { critRate, chance, roll, didCrit })
  return didCrit
}

export const getCritMultiplier = (
  didCrit: boolean,
  baseMultiplier = 1.5,
  bonusModifiers: number[] = []
) => {
  const totalMultiplier =
    baseMultiplier + bonusModifiers.reduce((a, b) => a + b, 0)
  const result = didCrit ? totalMultiplier : 1
  console.debug('Crit Multiplier', { didCrit, totalMultiplier, result })
  return result
}

// Guard
export type GuardLevel = 'none' | 'light' | 'medium' | 'heavy'

export const rollGuard = (r: RandomNumberGeneratorType, guardRate: number) => {
  const chance = clamp(guardRate, 0, 100)
  const roll = r.random() * 100
  const didGuard = roll < chance
  console.debug('Guard Roll', { guardRate, chance, roll, didGuard })
  return didGuard
}

export const getGuardMultiplier = (
  didGuard: boolean,
  guardLevel: GuardLevel
) => {
  const multipliers: Record<GuardLevel, number> = {
    none: 1,
    light: 0.75,
    medium: 0.5,
    heavy: 0.25,
  }
  const result = didGuard ? multipliers[guardLevel] : 1
  console.debug('Guard Multiplier', { didGuard, guardLevel, result })
  return result
}
