import { useMemo } from 'react'

import type { EquipmentTypeFilter } from '@/components/equipment-builder/equipment-type-filter'
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
import { getSkillDisplayName } from '@/utils/equipment-skills'

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
  searchTerm: string,
  equipmentTypeFilter: EquipmentTypeFilter = 'all'
) => {
  return useMemo(() => {
    const items = equipmentMap[slotType] || []

    return items.filter(item => {
      // Check search term filter
      if (searchTerm) {
        const equipmentNameMatch = item.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        const skillName = getSkillDisplayName(item.skillId)
        const skillNameMatch = skillName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        if (!equipmentNameMatch && !skillNameMatch) {
          return false
        }
      }

      // Check class restrictions filter
      if (item.classRestrictions.length > 0) {
        if (unitClass !== 'All') {
          const isAllowed = (
            item.classRestrictions as readonly AllClassType[]
          ).includes(unitClass)
          if (!isAllowed) {
            return false
          }
        }
        // If unitClass === 'All', allow items with any class restrictions
      }

      // Apply equipment type filter
      if (equipmentTypeFilter === 'skill') {
        return item.skillId !== null
      }

      if (equipmentTypeFilter === 'appp') {
        const stats = item.stats as Record<string, unknown>
        const hasAP = typeof stats.AP === 'number' && stats.AP !== 0
        const hasPP = typeof stats.PP === 'number' && stats.PP !== 0
        return hasAP || hasPP
      }

      return true
    })
  }, [slotType, unitClass, searchTerm, equipmentTypeFilter])
}
