import { getEquipmentById } from '@/core/equipment-lookup'
import type { EquippedItem } from '@/types/equipment'

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
  DmgReductionPercent: 0,
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
  DmgReductionPercent: 'DmgReductionPercent',
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
  'DrainEff',
  'PursuitPotency',
  'CounterAttackPotency',
  'CritDmg',
]

/**
 * Process a single stat value using the existing stat processors
 */
export const processStatValue = (
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

/**
 * Process a single equipment item with normal logic
 */
export const processEquipmentItem = (
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
  const validStats = Object.entries(item.stats).filter(
    ([, value]) => typeof value === 'number'
  )
  validStats.forEach(([statKey, value]) => {
    processStatValue(statKey, value as number, result, baseStats)
  })
}

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
    // For now, handle dual equipment inline to avoid circular dependency
    // TODO: Refactor this when we resolve the circular dependency
    return calculateDualEquipmentBonusInline(equipment, baseStats, classKey)
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
    const validStats = Object.entries(item.stats).filter(
      ([, value]) => typeof value === 'number'
    )

    validStats.forEach(([statKey, value]) => {
      processStatValue(statKey, value as number, result, baseStats)
    })
  })

  return result
}

/**
 * Temporary inline implementation to avoid circular dependency
 * TODO: Refactor this when we resolve the circular dependency issue
 */
const calculateDualEquipmentBonusInline = (
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
    return (
      equipItem?.type !== 'Sword' &&
      equipItem?.type !== 'Shield' &&
      equipItem?.type !== 'Greatshield'
    )
  })

  // Process dual swords for Swordmaster
  if (classKey === 'Swordmaster' && swords.length === 2) {
    processDualSwordsInline(swords, result, baseStats)
  } else {
    // Process swords normally if not dual or not Swordmaster
    for (const sword of swords) {
      processEquipmentItem(sword, result, baseStats)
    }
  }

  // Process dual shields for Crusader/Valkyria
  if (
    (classKey === 'Crusader' || classKey === 'Valkyria') &&
    shields.length === 2
  ) {
    processDualShieldsInline(shields, result, baseStats)
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

const processDualSwordsInline = (
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

  const [primaryPATK, secondaryPATK] =
    sword1PATK >= sword2PATK
      ? [sword1PATK, sword2PATK]
      : [sword2PATK, sword1PATK]
  const [primaryMATK, secondaryMATK] =
    sword1MATK >= sword2MATK
      ? [sword1MATK, sword2MATK]
      : [sword2MATK, sword1MATK]

  // Apply 100% of primary + 50% of secondary for PATK/MATK
  result.PATK += primaryPATK + Math.round(secondaryPATK * 0.5)
  result.MATK += primaryMATK + Math.round(secondaryMATK * 0.5)

  // Process all other stats from both swords at 100%
  const swordsToProcess = [sword1, sword2]
  swordsToProcess.forEach(sword => {
    Object.entries(sword.stats).forEach(([statKey, value]) => {
      const isValidStat =
        typeof value === 'number' && statKey !== 'PATK' && statKey !== 'MATK'
      if (isValidStat) {
        processStatValue(statKey, value, result, baseStats)
      }
    })
  })
}

const processDualShieldsInline = (
  shields: EquippedItem[],
  result: typeof initialEquipmentData,
  baseStats?: Record<string, number>
) => {
  const shield1 = getEquipmentById(shields[0].itemId!)
  const shield2 = getEquipmentById(shields[1].itemId!)

  if (!shield1 || !shield2) return

  const shield1PDEF = shield1.stats.PDEF || 0
  const shield1GRD = shield1.stats.GRD || 0
  const shield1GuardEff = shield1.stats.GuardEff || 0
  const shield2PDEF = shield2.stats.PDEF || 0
  const shield2GRD = shield2.stats.GRD || 0
  const shield2GuardEff = shield2.stats.GuardEff || 0

  const [primaryPDEF, secondaryPDEF] =
    shield1PDEF >= shield2PDEF
      ? [shield1PDEF, shield2PDEF]
      : [shield2PDEF, shield1PDEF]
  const [primaryGRD, secondaryGRD] =
    shield1GRD >= shield2GRD
      ? [shield1GRD, shield2GRD]
      : [shield2GRD, shield1GRD]
  const primaryGuardEff =
    shield1GuardEff >= shield2GuardEff ? shield1GuardEff : shield2GuardEff

  // Apply 100% of primary + 50% of secondary for PDEF/GRD, but only highest GuardEff
  result.PDEF += primaryPDEF + Math.round(secondaryPDEF * 0.5)
  result.GRD += primaryGRD + Math.round(secondaryGRD * 0.5)
  result.GuardEff += primaryGuardEff // Only the highest GuardEff, no 50% bonus

  // Process all other stats from both shields at 100%
  const shieldsToProcess = [shield1, shield2]
  shieldsToProcess.forEach(shield => {
    Object.entries(shield.stats).forEach(([statKey, value]) => {
      const isValidStat =
        typeof value === 'number' &&
        statKey !== 'PDEF' &&
        statKey !== 'GRD' &&
        statKey !== 'GuardEff'
      if (isValidStat) {
        processStatValue(statKey, value, result, baseStats)
      }
    })
  })
}

export { initialEquipmentData }
