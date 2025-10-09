import { getEquipmentById } from './equipment-lookup'
import type { RandomNumberGeneratorType } from './random'

import { GROWTH_RANKS, ADVANCED_CLASSES } from '@/data/constants'
import { COMBINED_CLASS_GROWTH_TABLE } from '@/data/units/class-growth-table'
import {
  GROWTH_CORRECTION_TABLE_A,
  GROWTH_CORRECTION_TABLE_B,
} from '@/data/units/growth-correction-table'
import { UNIVERSAL_STAT_TABLE } from '@/data/units/universal-stat-table'
import { clamp } from '@/lib/utils'
import type { GrowthType, AllClassType } from '@/types/base-stats'
import type { BattleContext } from '@/types/battle-engine'
import type { EquippedItem } from '@/types/equipment'

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

// Separate object for equipment bonuses that includes AP/PP
const initialEquipmentData = {
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
  AP: 0,
  PP: 0,
  GuardEff: 0,
}

export const calculateBaseStats = (
  level: ValidLevel,
  classKey: AllClassType,
  growthType: [GrowthType, GrowthType]
) => {
  const baseStats = { ...initialStatData }
  const universalBaseStats = UNIVERSAL_STAT_TABLE[level]
  const growthCorrectionA = calculateGrowthCorrectionA(classKey, growthType)
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
  classKey: AllClassType,
  growthType: [GrowthType, GrowthType]
) => {
  const finalGrowthCorrectionA = {
    ...initialStatData,
  }
  const growthTypeOneCorrection = GROWTH_CORRECTION_TABLE_A[growthType[0]]
  const growthTypeTwoCorrection = GROWTH_CORRECTION_TABLE_A[growthType[1]]
  const baseRates = COMBINED_CLASS_GROWTH_TABLE[classKey]

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
  classKey: AllClassType,
  growthType: [GrowthType, GrowthType]
) => {
  // base + equipment + dews + rapports
  const result = calculateBaseStats(level, classKey, growthType)
  return result
}

export const calculateGrowthRanks = (classKey: AllClassType) => {
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

  const classGrowth = COMBINED_CLASS_GROWTH_TABLE[classKey]

  for (const stat in result) {
    const key = stat as keyof typeof result
    result[key] = getGrowthRank(classGrowth[key])
  }

  return result
}

const getGrowthRank = (value: number) => {
  if (value < GROWTH_RANKS.E) return 'F'
  if (value < GROWTH_RANKS.D) return 'E'
  if (value < GROWTH_RANKS.C) return 'D'
  if (value < GROWTH_RANKS.B) return 'C'
  if (value < GROWTH_RANKS.A) return 'B'
  if (value < GROWTH_RANKS.S) return 'A'
  return 'S'
}

// Equipment stat processing functions
type StatProcessor = (
  result: typeof initialEquipmentData,
  value: number,
  baseStats?: Record<string, number>
) => void

const directStatMappings: Record<string, keyof typeof initialEquipmentData> = {
  HP: 'HP',
  MaxHP: 'HP',
  PATK: 'PATK',
  PDEF: 'PDEF',
  MATK: 'MATK',
  MDEF: 'MDEF',
  ACC: 'ACC',
  EVA: 'EVA',
  CRT: 'CRT',
  GRD: 'GRD',
  INIT: 'INIT',
  AP: 'AP',
  PP: 'PP',
  GuardEff: 'GuardEff',
}

const specialStatProcessors: Record<string, StatProcessor> = {
  Attack: (result, value) => {
    result.PATK += value
    result.MATK += value
  },
  Defense: (result, value) => {
    result.PDEF += value
    result.MDEF += value
  },
  AllStats: (result, value) => {
    result.HP += value
    result.PATK += value
    result.PDEF += value
    result.MATK += value
    result.MDEF += value
    result.ACC += value
    result.EVA += value
    result.CRT += value
    result.GRD += value
    result.INIT += value
  },
}

const percentageStatProcessors: Record<string, StatProcessor> = {
  PATKPercent: (result, value, baseStats) => {
    if (baseStats?.PATK) {
      result.PATK += Math.round((baseStats.PATK * value) / 100)
    }
  },
  PDEFPercent: (result, value, baseStats) => {
    if (baseStats?.PDEF) {
      result.PDEF += Math.round((baseStats.PDEF * value) / 100)
    }
  },
  MATKPercent: (result, value, baseStats) => {
    if (baseStats?.MATK) {
      result.MATK += Math.round((baseStats.MATK * value) / 100)
    }
  },
  MDEFPercent: (result, value, baseStats) => {
    if (baseStats?.MDEF) {
      result.MDEF += Math.round((baseStats.MDEF * value) / 100)
    }
  },
  MaxHPPercent: (result, value, baseStats) => {
    if (baseStats?.HP) {
      result.HP += Math.round((baseStats.HP * value) / 100)
    }
  },
}

const ignoredStats = [
  'GoldGainPercent',
  'ExpGainPercent',
  'OnActiveHealPercent',
  'DmgReductionPercent',
  'DrainEff',
  'PursuitPotency',
  'CounterAttackPotency',
  'CritDmg',
]

export const calculateEquipmentBonus = (
  equipment: EquippedItem[],
  baseStats?: Record<string, number>,
  classKey?: string
) => {
  const result = {
    ...initialEquipmentData,
  }

  // Handle special dual equipment classes
  if (classKey && ['Swordmaster', 'Crusader', 'Valkyria'].includes(classKey)) {
    return calculateDualEquipmentBonus(equipment, baseStats, classKey)
  }

  // Filter valid equipment items and process them
  const validEquipment = equipment.filter(equippedItem => {
    if (!equippedItem?.itemId) return false
    
    const item = getEquipmentById(equippedItem.itemId)
    if (!item) {
      console.warn(`Equipment item not found: ${equippedItem.itemId}`)
      return false
    }
    return true
  })

  validEquipment.forEach(equippedItem => {
    const item = getEquipmentById(equippedItem.itemId!)! // Safe because we filtered

    // Process each stat on the equipment
    const validStats = Object.entries(item.stats).filter(([, value]) => typeof value === 'number')
    
    validStats.forEach(([statKey, value]) => {
      processStatValue(statKey, value as number, result, baseStats)
    })
  })

  return result
}

/**
 * Calculate equipment bonuses for classes with dual sword or dual shield configurations
 * Swordmaster: 100% of highest PATK/MATK + 50% of lower, all other stats 100%
 * Crusader/Valkyria: 100% of highest PDEF/MDEF/GuardEff + 50% of lower, all other stats 100%
 */
const calculateDualEquipmentBonus = (
  equipment: EquippedItem[],
  baseStats?: Record<string, number>,
  classKey?: string
) => {
  const result = {
    ...initialEquipmentData,
  }

  // Separate equipment by type for dual equipment processing
  const swords = equipment.filter(item => {
    if (!item?.itemId) return false
    const equipItem = getEquipmentById(item.itemId)
    return equipItem?.type === 'Sword'
  })

  const shields = equipment.filter(item => {
    if (!item?.itemId) return false
    const equipItem = getEquipmentById(item.itemId)
    return equipItem?.type === 'Shield' || equipItem?.type === 'Greatshield'
  })

  const otherEquipment = equipment.filter(item => {
    if (!item?.itemId) return false
    const equipItem = getEquipmentById(item.itemId)
    return equipItem?.type !== 'Sword' && equipItem?.type !== 'Shield' && equipItem?.type !== 'Greatshield'
  })

  // Process dual swords for Swordmaster
  if (classKey === 'Swordmaster' && swords.length === 2) {
    processDualSwords(swords, result, baseStats)
  } else {
    // Process swords normally if not dual or not Swordmaster
    for (const sword of swords) {
      processEquipmentItem(sword, result, baseStats)
    }
  }

  // Process dual shields for Crusader/Valkyria
  if ((classKey === 'Crusader' || classKey === 'Valkyria') && shields.length === 2) {
    processDualShields(shields, result, baseStats)
  } else {
    // Process shields normally if not dual or not shield-dual class
    for (const shield of shields) {
      processEquipmentItem(shield, result, baseStats)
    }
  }

  // Process other equipment normally
  for (const item of otherEquipment) {
    processEquipmentItem(item, result, baseStats)
  }

  return result
}

/**
 * Process dual swords for Swordmaster (100% highest PATK/MATK + 50% lower)
 */
const processDualSwords = (
  swords: EquippedItem[],
  result: typeof initialEquipmentData,
  baseStats?: Record<string, number>
) => {
  const sword1 = getEquipmentById(swords[0].itemId!)
  const sword2 = getEquipmentById(swords[1].itemId!)
  
  if (!sword1 || !sword2) return

  const sword1PATK = sword1.stats.PATK || 0
  const sword1MATK = sword1.stats.MATK || 0
  const sword2PATK = sword2.stats.PATK || 0
  const sword2MATK = sword2.stats.MATK || 0

  // Determine which sword has higher attack values
  const sword1Total = sword1PATK + sword1MATK
  const sword2Total = sword2PATK + sword2MATK
  
  const [primarySword, secondarySword] = sword1Total >= sword2Total ? [sword1, sword2] : [sword2, sword1]
  const [primaryPATK, secondaryPATK] = sword1Total >= sword2Total ? [sword1PATK, sword2PATK] : [sword2PATK, sword1PATK]
  const [primaryMATK, secondaryMATK] = sword1Total >= sword2Total ? [sword1MATK, sword2MATK] : [sword2MATK, sword1MATK]

  // Apply 100% of primary + 50% of secondary for PATK/MATK
  result.PATK += primaryPATK + Math.round(secondaryPATK * 0.5)
  result.MATK += primaryMATK + Math.round(secondaryMATK * 0.5)

  console.debug('Swordmaster dual sword calculation', {
    primary: { PATK: primaryPATK, MATK: primaryMATK },
    secondary: { PATK: secondaryPATK, MATK: secondaryMATK },
    finalPATK: result.PATK,
    finalMATK: result.MATK
  })

  // Process all other stats from both swords at 100%
  const swordsToProcess = [primarySword, secondarySword]
  swordsToProcess.forEach(sword => {
    Object.entries(sword.stats).forEach(([statKey, value]) => {
      const isValidStat = typeof value === 'number' && statKey !== 'PATK' && statKey !== 'MATK'
      if (isValidStat) {
        processStatValue(statKey, value, result, baseStats)
      }
    })
  })
}

/**
 * Process dual shields for Crusader/Valkyria (100% highest PDEF/MDEF + 50% lower, highest GuardEff only)
 */
const processDualShields = (
  shields: EquippedItem[],
  result: typeof initialEquipmentData,
  baseStats?: Record<string, number>
) => {
  const shield1 = getEquipmentById(shields[0].itemId!)
  const shield2 = getEquipmentById(shields[1].itemId!)
  
  if (!shield1 || !shield2) return

  const shield1PDEF = shield1.stats.PDEF || 0
  const shield1MDEF = shield1.stats.MDEF || 0
  const shield1GuardEff = shield1.stats.GuardEff || 0
  const shield2PDEF = shield2.stats.PDEF || 0
  const shield2MDEF = shield2.stats.MDEF || 0
  const shield2GuardEff = shield2.stats.GuardEff || 0

  // Determine which shield has higher defense values
  const shield1Total = shield1PDEF + shield1MDEF + shield1GuardEff
  const shield2Total = shield2PDEF + shield2MDEF + shield2GuardEff
  
  const [primaryShield, secondaryShield] = shield1Total >= shield2Total ? [shield1, shield2] : [shield2, shield1]
  const [primaryPDEF, secondaryPDEF] = shield1Total >= shield2Total ? [shield1PDEF, shield2PDEF] : [shield2PDEF, shield1PDEF]
  const [primaryMDEF, secondaryMDEF] = shield1Total >= shield2Total ? [shield1MDEF, shield2MDEF] : [shield2MDEF, shield1MDEF]
  const [primaryGuardEff, secondaryGuardEff] = shield1Total >= shield2Total ? [shield1GuardEff, shield2GuardEff] : [shield2GuardEff, shield1GuardEff]

  // Apply 100% of primary + 50% of secondary for PDEF/MDEF, but only highest GuardEff
  result.PDEF += primaryPDEF + Math.round(secondaryPDEF * 0.5)
  result.MDEF += primaryMDEF + Math.round(secondaryMDEF * 0.5)
  result.GuardEff += primaryGuardEff // Only the highest GuardEff, no 50% bonus

  console.debug('Dual shield calculation', {
    primary: { PDEF: primaryPDEF, MDEF: primaryMDEF, GuardEff: primaryGuardEff },
    secondary: { PDEF: secondaryPDEF, MDEF: secondaryMDEF, GuardEff: secondaryGuardEff },
    finalPDEF: result.PDEF,
    finalMDEF: result.MDEF,
    finalGuardEff: result.GuardEff,
    guardEffNote: 'Only highest GuardEff used, no 50% bonus applied'
  })

  // Process all other stats from both shields at 100%
  const shieldsToProcess = [primaryShield, secondaryShield]
  shieldsToProcess.forEach(shield => {
    Object.entries(shield.stats).forEach(([statKey, value]) => {
      const isValidStat = typeof value === 'number' && 
                          statKey !== 'PDEF' && 
                          statKey !== 'MDEF' && 
                          statKey !== 'GuardEff'
      if (isValidStat) {
        processStatValue(statKey, value, result, baseStats)
      }
    })
  })
}

/**
 * Process a single equipment item with normal logic
 */
const processEquipmentItem = (
  equippedItem: EquippedItem,
  result: typeof initialEquipmentData,
  baseStats?: Record<string, number>
) => {
  if (!equippedItem?.itemId) return

  const item = getEquipmentById(equippedItem.itemId)
  if (!item) {
    console.warn(`Equipment item not found: ${equippedItem.itemId}`)
    return
  }

  // Process each stat on the equipment
  const validStats = Object.entries(item.stats).filter(([, value]) => typeof value === 'number')
  validStats.forEach(([statKey, value]) => {
    processStatValue(statKey, value as number, result, baseStats)
  })
}

/**
 * Process a single stat value using the existing stat processors
 */
const processStatValue = (
  statKey: string,
  value: number,
  result: typeof initialEquipmentData,
  baseStats?: Record<string, number>
) => {
  // Check direct stat mappings first
  const directStat = directStatMappings[statKey]
  if (directStat) {
    result[directStat] += value
    return
  }

  // Check special stat processors
  const specialProcessor = specialStatProcessors[statKey]
  if (specialProcessor) {
    specialProcessor(result, value, baseStats)
    return
  }

  // Check percentage stat processors
  const percentageProcessor = percentageStatProcessors[statKey]
  if (percentageProcessor) {
    percentageProcessor(result, value, baseStats)
    return
  }

  // Check if it's an ignored stat
  if (ignoredStats.includes(statKey)) {
    return
  }

  // Log unknown stats for debugging
  console.warn(`Unknown equipment stat: ${statKey}`)
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

  return finalDamage
}

/**
 * Calculate base AP/PP values based on class type
 * Base classes: AP = 1, PP = 1
 * Advanced classes: AP = 2, PP = 2
 * Maximum AP/PP is capped at 4
 */
export const calculateBaseAPPP = (classKey: AllClassType) => {
  // Check if this is an advanced class
  const isAdvancedClass = (
    Object.values(ADVANCED_CLASSES) as readonly string[]
  ).includes(classKey)

  return {
    AP: isAdvancedClass ? 2 : 1,
    PP: isAdvancedClass ? 2 : 1,
  }
}

/**
 * Calculate final AP/PP values with equipment bonuses and cap at 4
 */
export const calculateFinalAPPP = (
  classKey: AllClassType,
  equipmentBonus: { AP?: number; PP?: number }
) => {
  const base = calculateBaseAPPP(classKey)

  return {
    AP: Math.min(4, base.AP + (equipmentBonus.AP ?? 0)),
    PP: Math.min(4, base.PP + (equipmentBonus.PP ?? 0)),
  }
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

/**
 * Calculate board position priority for initiative tiebreaking
 * Lower number = higher priority
 *
 * Priority order (0 = highest priority):
 * Row 1, Col 0 (front left) = 0
 * Row 1, Col 1 (front center) = 1
 * Row 1, Col 2 (front right) = 2
 * Row 0, Col 0 (back left) = 3
 * Row 0, Col 1 (back center) = 4
 * Row 0, Col 2 (back right) = 5
 */
const getBoardPositionPriority = (position: {
  row: number
  col: number
}) => {
  const { row, col } = position

  if (row === 1) {
    return col // Front row: 0, 1, 2
  } else {
    return col + 3 // Back row: 3, 4, 5
  }
}

/**
 * Calculate initiative order for units based on INIT stat with proper tiebreaking
 * 1. Higher INIT acts first
 * 2. Board position priority (front left = highest, back right = lowest)
 * 3. RNG for cross-team identical positions
 */
export const calculateTurnOrder = (
  units: Record<string, BattleContext>,
  rng: RandomNumberGeneratorType
) => {
  return Object.entries(units)
    .sort(([idA, contextA], [idB, contextB]) => {
      const initA = contextA.combatStats.INIT
      const initB = contextB.combatStats.INIT

      // Primary sort: Higher initiative goes first
      if (initA !== initB) {
        return initB - initA
      }

      // Tiebreaker 1: Board position priority
      const priorityA = getBoardPositionPriority(contextA.position)
      const priorityB = getBoardPositionPriority(contextB.position)

      if (priorityA !== priorityB) {
        return priorityA - priorityB // Lower priority value = higher precedence
      }

      // Tiebreaker 2: Cross-team RNG (if same team, maintain consistent order by ID)
      if (contextA.team !== contextB.team) {
        return rng.random() < 0.5 ? -1 : 1
      }

      // Same team, same position priority - use ID for deterministic order
      return idA.localeCompare(idB)
    })
    .map(([id]) => id)
}
