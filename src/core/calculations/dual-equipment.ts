import {
  initialEquipmentData,
  processEquipmentItem,
  processStatValue,
} from './equipment-bonuses'

import { getEquipmentById } from '@/core/equipment-lookup'
import type { EquippedItem } from '@/types/equipment'

export const calculateDualEquipmentBonus = (
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
    processDualSwords(swords, result, baseStats)
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

  console.debug('Swordmaster dual sword calculation', {
    primary: { PATK: primaryPATK, MATK: primaryMATK },
    secondary: { PATK: secondaryPATK, MATK: secondaryMATK },
    finalPATK: result.PATK,
    finalMATK: result.MATK,
  })

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

const processDualShields = (
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

  console.debug('Dual shield calculation', {
    primary: {
      PDEF: primaryPDEF,
      GRD: primaryGRD,
    },
    secondary: {
      PDEF: secondaryPDEF,
      GRD: secondaryGRD,
    },
    finalPDEF: result.PDEF,
    finalGRD: result.GRD,
    finalGuardEff: result.GuardEff,
    guardEffNote: 'Only highest GuardEff used, no 50% bonus applied',
  })

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
