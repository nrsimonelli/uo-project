import { useMemo } from 'react'
import type { EquipmentSlotType } from '@/types/equipment'
import type { AllClassType } from '@/types/base-stats'
import { EquipmentSword } from '@/generated/equipment-sword'
import { EquipmentAxe } from '@/generated/equipment-axe'
import { EquipmentLance } from '@/generated/equipment-lance'
import { EquipmentBow } from '@/generated/equipment-bow'
import { EquipmentStaff } from '@/generated/equipment-staff'
import { EquipmentShield } from '@/generated/equipment-shield'
import { EquipmentGreatshield } from '@/generated/equipment-greatshield'
import { EquipmentAccessory } from '@/generated/equipment-accessory'

const equipmentMap = {
  Sword: EquipmentSword,
  Axe: EquipmentAxe,
  Lance: EquipmentLance,
  Bow: EquipmentBow,
  Staff: EquipmentStaff,
  Shield: EquipmentShield,
  Greatshield: EquipmentGreatshield,
  Accessory: EquipmentAccessory,
} as const

export function useFilteredEquipment(
  slotType: EquipmentSlotType,
  unitClass: AllClassType,
  searchTerm: string
) {
  return useMemo(() => {
    const items = equipmentMap[slotType] || []

    return items.filter((item) => {
      if (
        searchTerm &&
        !item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      if (
        item.classRestrictions.length > 0 &&
        !(item.classRestrictions as readonly AllClassType[]).includes(unitClass)
      ) {
        return false
      }

      return true
    })
  }, [slotType, unitClass, searchTerm])
}
