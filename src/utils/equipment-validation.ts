import { EquipmentAccessory } from '@/generated/equipment-accessory'
import { EquipmentAxe } from '@/generated/equipment-axe'
import { EquipmentBow } from '@/generated/equipment-bow'
import { EquipmentGreatshield } from '@/generated/equipment-greatshield'
import { EquipmentLance } from '@/generated/equipment-lance'
import { EquipmentShield } from '@/generated/equipment-shield'
import { EquipmentStaff } from '@/generated/equipment-staff'
import { EquipmentSword } from '@/generated/equipment-sword'
import type { AllClassType } from '@/types/base-stats'

// Consolidated equipment list for validation
const ALL_EQUIPMENT = [
  ...EquipmentSword,
  ...EquipmentAxe,
  ...EquipmentLance,
  ...EquipmentBow,
  ...EquipmentStaff,
  ...EquipmentShield,
  ...EquipmentGreatshield,
  ...EquipmentAccessory,
] as const

export const getAllEquipment = () => ALL_EQUIPMENT

export const findEquipmentById = (itemId: string) => {
  return ALL_EQUIPMENT.find(item => item.id === itemId) || null
}

export const validateEquipmentReference = (itemId: string) => {
  return ALL_EQUIPMENT.some(item => item.id === itemId)
}

export const validateEquipmentForUnit = (
  itemId: string,
  unitClassKey: AllClassType
) => {
  const equipment = findEquipmentById(itemId)
  if (!equipment) return false

  // If no class restrictions, anyone can equip it
  if (equipment.classRestrictions.length === 0) return true

  // Check if unit's class is in the allowed list
  return (equipment.classRestrictions as readonly AllClassType[]).includes(
    unitClassKey
  )
}

// Utility function that matches the pattern used in equipment manager
export const canUnitEquipItem = (
  unitClassKey: AllClassType,
  itemId: string | null
) => {
  if (!itemId) return true
  return validateEquipmentForUnit(itemId, unitClassKey)
}
