import { EquipmentSword } from '@/generated/equipment-sword'
import { EquipmentAxe } from '@/generated/equipment-axe'
import { EquipmentLance } from '@/generated/equipment-lance'
import { EquipmentBow } from '@/generated/equipment-bow'
import { EquipmentStaff } from '@/generated/equipment-staff'
import { EquipmentShield } from '@/generated/equipment-shield'
import { EquipmentGreatshield } from '@/generated/equipment-greatshield'
import { EquipmentAccessory } from '@/generated/equipment-accessory'
import type { Equipment } from '@/types/equipment'

// Combine all equipment into a single lookup map
const allEquipment = [
  ...EquipmentSword,
  ...EquipmentAxe,
  ...EquipmentLance,
  ...EquipmentBow,
  ...EquipmentStaff,
  ...EquipmentShield,
  ...EquipmentGreatshield,
  ...EquipmentAccessory,
] as unknown as Equipment[]

// Create a lookup map for O(1) access
const equipmentLookup = new Map<string, Equipment>()
allEquipment.forEach(item => {
  equipmentLookup.set(item.id, item)
})

export const getEquipmentById = (id: string): Equipment | null => {
  return equipmentLookup.get(id) || null
}

export const getAllEquipment = (): Equipment[] => {
  return allEquipment
}