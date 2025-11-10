import { calculateBaseStats } from '@/core/calculations/base-stats'
import { ADVANCED_CLASSES, BASE_CLASSES } from '@/data/constants'
import { CLASS_DATA } from '@/data/units/class-data'
import type { AllClassType, GrowthType } from '@/types/base-stats'
import type { EquipmentSlotType } from '@/types/equipment'

export interface ClassTableRow {
  id: AllClassType
  equipment: EquipmentSlotType[]
  race: string | null
  trait: string | null
  movementType: string
  HP: number
  PATK: number
  PDEF: number
  MATK: number
  MDEF: number
  GRD: number
  CRT: number
  EVA: number
  ACC: number
  INIT: number
}

export function processClassData(
  level: number = 1,
  growthA: GrowthType = 'All-Rounder',
  growthB: GrowthType = 'All-Rounder',
  isNighttime: boolean = false,
  selectedClassTypes: string[] = []
): ClassTableRow[] {
  const results: ClassTableRow[] = []
  let classesToProcess: Record<string, AllClassType> = {}

  if (selectedClassTypes.length === 0) {
    // Show all classes when no filter is selected
    classesToProcess = { ...BASE_CLASSES, ...ADVANCED_CLASSES }
  } else {
    // Only show selected class types
    if (selectedClassTypes.includes('Base')) {
      classesToProcess = { ...classesToProcess, ...BASE_CLASSES }
    }
    if (selectedClassTypes.includes('Advanced')) {
      classesToProcess = { ...classesToProcess, ...ADVANCED_CLASSES }
    }
  }

  for (const classValue of Object.values(classesToProcess)) {
    const classData = CLASS_DATA[classValue as AllClassType]

    if (!classData) {
      console.warn(`Missing class data for ${classValue}`)
    } else {
      const stats = calculateBaseStats(level, classValue, [growthA, growthB], {
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
      })

      // Apply nighttime bonus for Bestral units (x1.2 to all stats except HP)
      if (isNighttime && classData.race === 'Bestral') {
        stats.PATK = Math.round(stats.PATK * 1.2)
        stats.PDEF = Math.round(stats.PDEF * 1.2)
        stats.MATK = Math.round(stats.MATK * 1.2)
        stats.MDEF = Math.round(stats.MDEF * 1.2)
        stats.GRD = Math.round(stats.GRD * 1.2)
        stats.CRT = Math.round(stats.CRT * 1.2)
        stats.EVA = Math.round(stats.EVA * 1.2)
        stats.ACC = Math.round(stats.ACC * 1.2)
        stats.INIT = Math.round(stats.INIT * 1.2)
      }

      results.push({
        id: classData.id,
        equipment: classData.allowedSlots.filter(slot => slot !== 'Accessory'),
        race: classData.race,
        trait: classData.trait,
        movementType: classData.movementType,
        HP: stats.HP,
        PATK: stats.PATK,
        PDEF: stats.PDEF,
        MATK: stats.MATK,
        MDEF: stats.MDEF,
        GRD: stats.GRD,
        CRT: stats.CRT,
        EVA: stats.EVA,
        ACC: stats.ACC + 100, // Add 100 for display
        INIT: stats.INIT,
      })
    }
  }

  return results.sort((a, b) => a.id.localeCompare(b.id))
}

export function getUniqueEquipmentSlots(): EquipmentSlotType[] {
  const allSlots: EquipmentSlotType[] = []

  for (const classData of Object.values(CLASS_DATA)) {
    allSlots.push(...classData.allowedSlots)
  }

  // Remove duplicates and sort
  const uniqueSlots = allSlots.filter(
    (slot, index) => allSlots.indexOf(slot) === index
  )
  return uniqueSlots.sort()
}

export function getUniqueRaces(): string[] {
  const allRaces: string[] = []

  for (const classData of Object.values(CLASS_DATA)) {
    if (classData.race) {
      allRaces.push(classData.race)
    }
  }

  // Remove duplicates and sort
  const uniqueRaces = allRaces.filter(
    (race, index) => allRaces.indexOf(race) === index
  )
  return uniqueRaces.sort()
}

export function getUniqueTraits(): string[] {
  const allTraits: string[] = []

  for (const classData of Object.values(CLASS_DATA)) {
    if (classData.trait) {
      allTraits.push(classData.trait)
    }
  }

  // Remove duplicates and sort
  const uniqueTraits = allTraits.filter(
    (trait, index) => allTraits.indexOf(trait) === index
  )
  return uniqueTraits.sort()
}

export function getUniqueMovementTypes(): string[] {
  const allMovementTypes: string[] = []

  for (const classData of Object.values(CLASS_DATA)) {
    allMovementTypes.push(classData.movementType)
  }

  // Remove duplicates and sort
  const uniqueMovementTypes = allMovementTypes.filter(
    (type, index) => allMovementTypes.indexOf(type) === index
  )
  return uniqueMovementTypes.sort()
}
