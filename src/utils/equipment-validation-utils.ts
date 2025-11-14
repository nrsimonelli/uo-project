import {
  validateEquipmentForUnit,
  validateEquipmentReference,
} from './equipment-validation'

import { getEquipmentById } from '@/core/equipment-lookup'
import type { AllClassType } from '@/types/base-stats'

export interface EquipmentValidationResult {
  isValid: boolean
  reason?: string
}

export function validateEquipmentForSlot(
  itemId: string | null,
  slot: string,
  classKey: AllClassType
): EquipmentValidationResult {
  // Null itemId is valid (empty slot)
  if (itemId === null) {
    return { isValid: true }
  }

  if (!validateEquipmentReference(itemId)) {
    return {
      isValid: false,
      reason: `Equipment "${itemId}" does not exist`,
    }
  }

  const equipmentItem = getEquipmentById(itemId)
  if (!equipmentItem) {
    return {
      isValid: false,
      reason: `Equipment "${itemId}" not found`,
    }
  }

  if (equipmentItem.type !== slot) {
    return {
      isValid: false,
      reason: `Equipment "${itemId}" type "${equipmentItem.type}" does not match slot "${slot}"`,
    }
  }

  if (!validateEquipmentForUnit(itemId, classKey)) {
    return {
      isValid: false,
      reason: `Unit class "${classKey}" cannot equip "${itemId}"`,
    }
  }

  return { isValid: true }
}

export function findDuplicateEquipmentIds(
  equipment: unknown[]
): Record<string, number[]> {
  const equipmentIds: Record<string, number[]> = {}

  equipment.forEach((item, index) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const itemObj = item as Record<string, unknown>
      const itemId = itemObj.itemId
      if (typeof itemId === 'string' && itemId) {
        if (!equipmentIds[itemId]) {
          equipmentIds[itemId] = []
        }
        equipmentIds[itemId].push(index)
      }
    }
  })

  const duplicates: Record<string, number[]> = {}
  for (const [itemId, indices] of Object.entries(equipmentIds)) {
    if (indices.length > 1) {
      duplicates[itemId] = indices
    }
  }

  return duplicates
}
