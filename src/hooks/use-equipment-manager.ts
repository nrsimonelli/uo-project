import { useMemo } from 'react'
import type { EquipmentSlotType } from '@/types/equipment'
import type { AllClassType } from '@/types/base-stats'
import { useCallback } from 'react'
import { useFilteredEquipment } from './use-filtered-equipment'
import { useTeam, useCurrentTeam } from './use-team'

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
}

export function useEquipmentManager({
  slotType,
  unitClass,
  searchTerm,
  currentItemId,
  currentSlotIndex,
  currentUnitId,
}: UseEquipmentManagerProps) {
  const { updateUnit, updateMultipleUnits } = useTeam()
  const team = useCurrentTeam() // Always use fresh team state
  const filteredItems = useFilteredEquipment(slotType, unitClass, searchTerm)

  const equippedItems = useMemo(() => {
    const equipped: Record<string, EquippedByInfo> = {}
    team.formation.forEach((unit) => {
      if (unit) {
        unit.equipment.forEach((equippedItem) => {
          if (equippedItem.itemId) {
            equipped[equippedItem.itemId] = {
              unitId: unit.id,
              unitClass: unit.class,
              unitName: unit.name,
            }
          }
        })
      }
    })
    return equipped
  }, [team])

  const currentUnitEquippedItems = useMemo(() => {
    const currentUnit = team.formation.find(
      (unit) => unit?.id === currentUnitId
    )

    if (!currentUnit) return []

    const equippedInOtherSlots: string[] = []
    currentUnit.equipment.forEach((equippedItem, index) => {
      if (equippedItem.itemId && index !== currentSlotIndex) {
        equippedInOtherSlots.push(equippedItem.itemId)
      }
    })
    return equippedInOtherSlots
  }, [team, currentSlotIndex, currentUnitId])

  const currentItem = useMemo(() => {
    if (!currentItemId) return null
    return filteredItems.find((item) => item.id === currentItemId) || null
  }, [currentItemId, filteredItems])

  const handleEquipmentChange = useCallback(
    (newItemId: string | null) => {
      const currentUnit = team.formation.find((u) => u?.id === currentUnitId)
      if (!currentUnit) {
        console.error(`Current unit not found: ${currentUnitId}`)
        return
      }

      if (
        currentSlotIndex < 0 ||
        currentSlotIndex >= currentUnit.equipment.length
      ) {
        console.error(
          `Invalid slot index: ${currentSlotIndex} for class ${currentUnit.class}. Equipment array length: ${currentUnit.equipment.length}`
        )
        return
      }

      const currentlyEquippedItem =
        currentUnit.equipment[currentSlotIndex]?.itemId

      if (newItemId) {
        const newItem = filteredItems.find((item) => item.id === newItemId)
        if (!newItem) {
          console.error(`Item not found: ${newItemId}`)
          return
        }

        if (
          newItem.classRestrictions.length > 0 &&
          !(newItem.classRestrictions as readonly AllClassType[]).includes(
            unitClass
          )
        ) {
          console.error(
            `Unit class ${unitClass} cannot equip item ${newItemId}`
          )
          return
        }

        const conflictingUnit = team.formation.find(
          (u) =>
            u &&
            u.id !== currentUnitId &&
            u.equipment.some((eq) => eq.itemId === newItemId)
        )

        if (conflictingUnit) {
          const conflictingSlotIndex = conflictingUnit.equipment.findIndex(
            (eq) => eq.itemId === newItemId
          )

          if (conflictingSlotIndex !== -1) {
            const conflictingUnitUpdatedEquipment = [
              ...conflictingUnit.equipment,
            ]

            if (currentlyEquippedItem) {
              // Try to swap items
              const currentItem = filteredItems.find(
                (i) => i.id === currentlyEquippedItem
              )
              const canConflictingUnitEquip =
                !currentItem ||
                currentItem.classRestrictions.length === 0 ||
                (
                  currentItem.classRestrictions as readonly AllClassType[]
                ).includes(conflictingUnit.class)

              if (canConflictingUnitEquip) {
                conflictingUnitUpdatedEquipment[conflictingSlotIndex] = {
                  ...conflictingUnitUpdatedEquipment[conflictingSlotIndex],
                  itemId: currentlyEquippedItem,
                }
              } else {
                conflictingUnitUpdatedEquipment[conflictingSlotIndex] = {
                  ...conflictingUnitUpdatedEquipment[conflictingSlotIndex],
                  itemId: null,
                }
              }
            } else {
              conflictingUnitUpdatedEquipment[conflictingSlotIndex] = {
                ...conflictingUnitUpdatedEquipment[conflictingSlotIndex],
                itemId: null,
              }
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
            return
          }
        }
      }

      const currentUnitUpdatedEquipment = [...currentUnit.equipment]
      currentUnitUpdatedEquipment[currentSlotIndex] = {
        ...currentUnitUpdatedEquipment[currentSlotIndex],
        itemId: newItemId,
      }
      updateUnit(currentUnit.id, { equipment: currentUnitUpdatedEquipment })
    },
    [
      team,
      currentUnitId,
      currentSlotIndex,
      unitClass,
      filteredItems,
      updateUnit,
      updateMultipleUnits,
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
