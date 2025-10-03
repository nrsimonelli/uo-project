import { EquipmentSword } from '@/generated/equipment-sword'
import { EquipmentAxe } from '@/generated/equipment-axe'
import { EquipmentLance } from '@/generated/equipment-lance'
import { EquipmentBow } from '@/generated/equipment-bow'
import { EquipmentStaff } from '@/generated/equipment-staff'
import { EquipmentShield } from '@/generated/equipment-shield'
import { EquipmentGreatshield } from '@/generated/equipment-greatshield'
import { EquipmentAccessory } from '@/generated/equipment-accessory'
import type { Equipment } from '@/types/equipment'

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

const equipmentLookup: Record<string, Equipment> = {}
allEquipment.forEach((item) => {
  equipmentLookup[item.id] = item
})

export const getEquipmentById = (id: string) => {
  return equipmentLookup[id] || null
}

export const getAllEquipment = () => {
  return allEquipment
}
