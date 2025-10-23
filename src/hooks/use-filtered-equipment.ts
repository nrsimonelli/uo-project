import { useMemo } from 'react'

import { EquipmentAccessory } from '@/generated/equipment-accessory'
import { EquipmentAxe } from '@/generated/equipment-axe'
import { EquipmentBow } from '@/generated/equipment-bow'
import { EquipmentGreatshield } from '@/generated/equipment-greatshield'
import { EquipmentLance } from '@/generated/equipment-lance'
import { EquipmentShield } from '@/generated/equipment-shield'
import { EquipmentStaff } from '@/generated/equipment-staff'
import { EquipmentSword } from '@/generated/equipment-sword'
import type { AllClassType } from '@/types/base-stats'
import type { EquipmentSlotType } from '@/types/equipment'

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

export const useFilteredEquipment = (
  slotType: EquipmentSlotType,
  unitClass: AllClassType | 'All',
  searchTerm: string
) => {
  return useMemo(() => {
    const items = equipmentMap[slotType] || []

    return items.filter(item => {
      if (
        searchTerm &&
        !item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      if (item.classRestrictions.length > 0) {
        if (unitClass === 'All') {
          return true
        }

        return (item.classRestrictions as readonly AllClassType[]).includes(
          unitClass
        )
      }

      return true
    })
  }, [slotType, unitClass, searchTerm])
}
