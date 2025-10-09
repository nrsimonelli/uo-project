import {
  validateEquipmentForUnit,
  validateEquipmentReference,
} from './equipment-validation'
import { validateSkillReference } from './skill-validation'

import type { Unit } from '@/types/team'

export const cleanUnitData = (unit: Unit): Unit => {
  // Validate and clean skill slots
  const cleanedSkillSlots =
    unit.skillSlots?.map(slot => {
      if (slot.skillId && !validateSkillReference(slot.skillId)) {
        console.warn(
          `Invalid skill reference: ${slot.skillId}. Removing from slot.`
        )
        return {
          ...slot,
          skillId: null,
          skillType: null,
          tactics: [null, null] as [null, null],
        }
      }
      return slot
    }) || []

  // Validate and clean equipment
  const cleanedEquipment =
    unit.equipment?.map(equippedItem => {
      if (!equippedItem.itemId) return equippedItem

      // Check if equipment exists
      if (!validateEquipmentReference(equippedItem.itemId)) {
        console.warn(
          `Invalid equipment reference: ${equippedItem.itemId}. Removing from unit ${unit.name}.`
        )
        return { ...equippedItem, itemId: null }
      }

      // Check if unit can equip this item
      if (!validateEquipmentForUnit(equippedItem.itemId, unit.classKey)) {
        console.warn(
          `Unit ${unit.name} (${unit.classKey}) cannot equip ${equippedItem.itemId}. Removing equipment.`
        )
        return { ...equippedItem, itemId: null }
      }

      return equippedItem
    }) || []

  return {
    ...unit,
    skillSlots: cleanedSkillSlots,
    equipment: cleanedEquipment,
  }
}
