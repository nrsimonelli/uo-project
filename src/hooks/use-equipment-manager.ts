import { useMemo } from 'react'
import { useCallback } from 'react'

import { useFilteredEquipment } from './use-filtered-equipment'
import { useTeam, useCurrentTeam } from './use-team'

import type { EquipmentTypeFilter } from '@/components/equipment-builder/equipment-type-filter'
import type { AllClassType } from '@/types/base-stats'
import type { EquipmentSlotType, EquippedItem } from '@/types/equipment'
import type { Unit } from '@/types/team'

export interface EquippedByInfo {
  unitId: string
  unitClass: AllClassType
  unitName: string
}

export interface UseEquipmentManagerProps {
  slotType: EquipmentSlotType
  unitClass: AllClassType
  searchTerm: string
  currentItemId: string | null
  currentSlotIndex: number
  currentUnitId: string
  equipmentTypeFilter?: EquipmentTypeFilter
}

export const useEquipmentManager = ({
  slotType,
  unitClass,
  searchTerm,
  currentItemId,
  currentSlotIndex,
  currentUnitId,
  equipmentTypeFilter = 'all',
}: UseEquipmentManagerProps) => {
  const { updateUnit, updateMultipleUnits } = useTeam()
  const team = useCurrentTeam() // Always use fresh team state
  const filteredItems = useFilteredEquipment(
    slotType,
    unitClass,
    searchTerm,
    equipmentTypeFilter
  )

  const equippedItems = useMemo(() => {
    const equipped: Record<string, EquippedByInfo> = {}
    team.formation.forEach(unit => {
      if (unit) {
        unit.equipment.forEach((equippedItem: EquippedItem) => {
          if (equippedItem.itemId) {
            equipped[equippedItem.itemId] = {
              unitId: unit.id,
              unitClass: unit.classKey,
              unitName: unit.name,
            }
          }
        })
      }
    })
    return equipped
  }, [team])

  const currentUnitEquippedItems = useMemo(() => {
    const currentUnit = team.formation.find(unit => unit?.id === currentUnitId)

    if (!currentUnit) return []

    const equippedInOtherSlots: string[] = []
    currentUnit.equipment.forEach(
      (equippedItem: EquippedItem, index: number) => {
        if (equippedItem.itemId && index !== currentSlotIndex) {
          equippedInOtherSlots.push(equippedItem.itemId)
        }
      }
    )
    return equippedInOtherSlots
  }, [team, currentSlotIndex, currentUnitId])

  const currentItem = useMemo(() => {
    if (!currentItemId) return null
    return filteredItems.find(item => item.id === currentItemId) || null
  }, [currentItemId, filteredItems])

  const validateAndGetCurrentUnit = useCallback(() => {
    const currentUnit = team.formation.find(u => u?.id === currentUnitId)
    if (!currentUnit) {
      console.error(`Current unit not found: ${currentUnitId}`)
      return null
    }
    return currentUnit
  }, [team, currentUnitId])

  const validateSlotIndex = useCallback(
    (unit: Unit) => {
      if (currentSlotIndex < 0 || currentSlotIndex >= unit.equipment.length) {
        console.error(
          `Invalid slot index: ${currentSlotIndex} for class ${unit.classKey}. Equipment array length: ${unit.equipment.length}`
        )
        return false
      }
      return true
    },
    [currentSlotIndex]
  )

  const validateAndGetNewItem = useCallback(
    (itemId: string) => {
      const newItem = filteredItems.find(item => item.id === itemId)
      if (!newItem) {
        console.error(`Item not found: ${itemId}`)
        return null
      }

      if (
        newItem.classRestrictions.length > 0 &&
        !(newItem.classRestrictions as readonly AllClassType[]).includes(
          unitClass
        )
      ) {
        console.error(`Unit class ${unitClass} cannot equip item ${itemId}`)
        return null
      }

      return newItem
    },
    [filteredItems, unitClass]
  )

  const findConflictingUnit = useCallback(
    (itemId: string) => {
      return team.formation.find(
        u =>
          u &&
          u.id !== currentUnitId &&
          u.equipment.some((eq: EquippedItem) => eq.itemId === itemId)
      )
    },
    [team, currentUnitId]
  )

  const canUnitEquipItem = useCallback(
    (unit: Unit, itemId: string | null) => {
      if (!itemId) return true

      const item = filteredItems.find(i => i.id === itemId)
      return (
        !item ||
        item.classRestrictions.length === 0 ||
        (item.classRestrictions as readonly AllClassType[]).includes(
          unit.classKey
        )
      )
    },
    [filteredItems]
  )

  const handleEquipmentConflict = useCallback(
    (currentUnit: Unit, conflictingUnit: Unit, newItemId: string) => {
      const conflictingSlotIndex = conflictingUnit.equipment.findIndex(
        (eq: EquippedItem) => eq.itemId === newItemId
      )

      if (conflictingSlotIndex === -1) return

      const currentlyEquippedItem =
        currentUnit.equipment[currentSlotIndex]?.itemId
      const conflictingUnitUpdatedEquipment = [...conflictingUnit.equipment]

      const itemToGiveConflictingUnit = canUnitEquipItem(
        conflictingUnit,
        currentlyEquippedItem
      )
        ? currentlyEquippedItem
        : null

      conflictingUnitUpdatedEquipment[conflictingSlotIndex] = {
        ...conflictingUnitUpdatedEquipment[conflictingSlotIndex],
        itemId: itemToGiveConflictingUnit,
      }

      const currentUnitUpdatedEquipment = [...currentUnit.equipment]
      currentUnitUpdatedEquipment[currentSlotIndex] = {
        ...currentUnitUpdatedEquipment[currentSlotIndex],
        itemId: newItemId,
      }

      updateMultipleUnits([
        {
          id: conflictingUnit.id,
          updates: { equipment: conflictingUnitUpdatedEquipment },
        },
        {
          id: currentUnit.id,
          updates: { equipment: currentUnitUpdatedEquipment },
        },
      ])
    },
    [currentSlotIndex, canUnitEquipItem, updateMultipleUnits]
  )

  const updateSingleUnitEquipment = useCallback(
    (unit: Unit, itemId: string | null) => {
      const updatedEquipment = [...unit.equipment]
      updatedEquipment[currentSlotIndex] = {
        ...updatedEquipment[currentSlotIndex],
        itemId,
      }
      updateUnit(unit.id, { equipment: updatedEquipment })
    },
    [currentSlotIndex, updateUnit]
  )

  const handleEquipmentChange = useCallback(
    (newItemId: string | null) => {
      const currentUnit = validateAndGetCurrentUnit()
      if (!currentUnit) return

      if (!validateSlotIndex(currentUnit)) return

      if (newItemId) {
        const newItem = validateAndGetNewItem(newItemId)
        if (!newItem) return

        const conflictingUnit = findConflictingUnit(newItemId)
        if (conflictingUnit) {
          handleEquipmentConflict(currentUnit, conflictingUnit, newItemId)
          return
        }
      }

      updateSingleUnitEquipment(currentUnit, newItemId)
    },
    [
      validateAndGetCurrentUnit,
      validateSlotIndex,
      validateAndGetNewItem,
      findConflictingUnit,
      handleEquipmentConflict,
      updateSingleUnitEquipment,
    ]
  )

  const selectEquipment = useCallback(
    (itemId: string) => {
      handleEquipmentChange(itemId)
    },
    [handleEquipmentChange]
  )

  const unequipCurrent = useCallback(() => {
    handleEquipmentChange(null)
  }, [handleEquipmentChange])

  const isEquippedByCurrentUnit = (itemId: string) => {
    return currentUnitEquippedItems.includes(itemId)
  }

  const getEquippedBy = (itemId: string) => {
    return equippedItems[itemId] || null
  }

  return {
    filteredItems,
    currentItem,
    selectEquipment,
    unequipCurrent,
    isEquippedByCurrentUnit,
    getEquippedBy,
  }
}
