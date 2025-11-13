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

/**
 * Validates if an equipment item is valid for a given slot and class
 * Returns validation result with reason if invalid
 */
export function validateEquipmentForSlot(
  itemId: string | null,
  slot: string,
  classKey: AllClassType
): EquipmentValidationResult {
  // Null itemId is valid (empty slot)
  if (itemId === null) {
    return { isValid: true }
  }

  // Validate equipment reference exists
  if (!validateEquipmentReference(itemId)) {
    return {
      isValid: false,
      reason: `Equipment "${itemId}" does not exist`,
    }
  }

  // Get equipment to check type matches slot
  const equipmentItem = getEquipmentById(itemId)
  if (!equipmentItem) {
    return {
      isValid: false,
      reason: `Equipment "${itemId}" not found`,
    }
  }

  // Validate equipment type matches slot type
  if (equipmentItem.type !== slot) {
    return {
      isValid: false,
      reason: `Equipment "${itemId}" type "${equipmentItem.type}" does not match slot "${slot}"`,
    }
  }

  // Validate unit can equip this item (class restrictions)
  if (!validateEquipmentForUnit(itemId, classKey)) {
    return {
      isValid: false,
      reason: `Unit class "${classKey}" cannot equip "${itemId}"`,
    }
  }

  return { isValid: true }
}

/**
 * Finds duplicate equipment IDs in an equipment array
 * Returns a map of itemId -> array of indices where it appears
 */
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

  // Filter to only return duplicates
  const duplicates: Record<string, number[]> = {}
  for (const [itemId, indices] of Object.entries(equipmentIds)) {
    if (indices.length > 1) {
      duplicates[itemId] = indices
    }
  }

  return duplicates
}
