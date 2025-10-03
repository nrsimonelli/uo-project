import { EquipmentAccessory } from '@/generated/equipment-accessory'
import { EquipmentAxe } from '@/generated/equipment-axe'
import { EquipmentBow } from '@/generated/equipment-bow'
import { EquipmentGreatshield } from '@/generated/equipment-greatshield'
import { EquipmentLance } from '@/generated/equipment-lance'
import { EquipmentShield } from '@/generated/equipment-shield'
import { EquipmentStaff } from '@/generated/equipment-staff'
import { EquipmentSword } from '@/generated/equipment-sword'
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
allEquipment.forEach(item => {
  equipmentLookup[item.id] = item
})

export const getEquipmentById = (id: string) => {
  return equipmentLookup[id] || null
}

export const getAllEquipment = () => {
  return allEquipment
}
