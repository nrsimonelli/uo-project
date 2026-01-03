import { X } from 'lucide-react'
import { useState } from 'react'

import { EquipmentItem } from './equipment-item'
import { EquipmentSlotTrigger } from './equipment-slot-trigger'
import {
  EquipmentTypeFilterComponent,
  type EquipmentTypeFilter,
} from './equipment-type-filter'

import { SearchModal } from '@/components/search-modal'
import { Button } from '@/components/ui/button'
import { useEquipmentManager } from '@/hooks/use-equipment-manager'
import type { EquippedByInfo } from '@/hooks/use-equipment-manager'
import { useModalState } from '@/hooks/use-modal-state'
import type { AllClassType } from '@/types/base-stats'
import type { EquipmentSlotType } from '@/types/equipment'
import type { GeneratedEquipment } from '@/types/generated-equipment'

interface EquipmentSearchModalProps {
  slotType: EquipmentSlotType
  itemId: string | null
  idx: number
  unitClass: AllClassType
  unitId: string
}

export function EquipmentSearchModal({
  slotType,
  itemId,
  idx,
  unitClass,
  unitId,
}: EquipmentSearchModalProps) {
  const { open, searchTerm, closeModal, updateSearchTerm, setOpen } =
    useModalState()
  const [equipmentTypeFilter, setEquipmentTypeFilter] =
    useState<EquipmentTypeFilter>('all')

  const {
    filteredItems,
    currentItem,
    selectEquipment,
    unequipCurrent,
    isEquippedByCurrentUnit,
    getEquippedBy,
  } = useEquipmentManager({
    slotType,
    unitClass,
    searchTerm,
    currentItemId: itemId,
    currentSlotIndex: idx,
    currentUnitId: unitId,
    equipmentTypeFilter,
  })

  const handleItemSelect = (item: GeneratedEquipment) => {
    selectEquipment(item.id)
    closeModal()
  }

  const handleUnequip = () => {
    unequipCurrent()
    closeModal()
  }

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      updateSearchTerm('')
      setEquipmentTypeFilter('all')
    }
  }

  return (
    <SearchModal
      title={`Select ${slotType}`}
      trigger={
        <EquipmentSlotTrigger slotType={slotType} currentItem={currentItem} />
      }
      searchValue={searchTerm}
      onSearchChange={updateSearchTerm}
      searchPlaceholder="Search equipment..."
      filterComponent={
        <EquipmentTypeFilterComponent
          value={equipmentTypeFilter}
          onValueChange={setEquipmentTypeFilter}
        />
      }
      open={open}
      onOpenChange={handleModalClose}
      emptyState={
        filteredItems.length === 0 ? (
          <EmptyState slotType={slotType} searchTerm={searchTerm} />
        ) : null
      }
    >
      {itemId && <UnequipButton onUnequip={handleUnequip} />}
      <EquipmentList
        items={filteredItems}
        itemId={itemId}
        onItemSelect={handleItemSelect}
        isEquippedByCurrentUnit={isEquippedByCurrentUnit}
        getEquippedBy={getEquippedBy}
      />
    </SearchModal>
  )
}

interface UnequipButtonProps {
  onUnequip: () => void
}

function UnequipButton({ onUnequip }: UnequipButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start h-auto p-3 text-left mb-2"
      onClick={onUnequip}
    >
      <div className="flex items-center gap-2 w-full">
        <X className="w-4 h-4" />
        <div className="text-left">
          <div className="font-medium">Unequip</div>
          <div className="text-xs text-muted-foreground">
            Remove current item
          </div>
        </div>
      </div>
    </Button>
  )
}

interface EquipmentListProps {
  items: GeneratedEquipment[]
  itemId: string | null
  onItemSelect: (item: GeneratedEquipment) => void
  isEquippedByCurrentUnit: (itemId: string) => boolean
  getEquippedBy: (itemId: string) => EquippedByInfo | null
}

function EquipmentList({
  items,
  itemId,
  onItemSelect,
  isEquippedByCurrentUnit,
  getEquippedBy,
}: EquipmentListProps) {
  return (
    <div className="space-y-2">
      {items.map(item => {
        const equippedBy = getEquippedBy(item.id)
        const isCurrentlyEquipped = itemId === item.id
        const isEquippedByCurrentUnitElsewhere = isEquippedByCurrentUnit(
          item.id
        )

        return (
          <EquipmentItem
            key={item.id}
            item={item}
            equippedBy={equippedBy}
            isCurrentlyEquipped={isCurrentlyEquipped}
            isEquippedByCurrentUnitElsewhere={isEquippedByCurrentUnitElsewhere}
            onSelect={onItemSelect}
          />
        )
      })}
    </div>
  )
}

interface EmptyStateProps {
  slotType: EquipmentSlotType
  searchTerm: string
}

function EmptyState({ slotType, searchTerm }: EmptyStateProps) {
  return (
    <div className="text-center text-muted-foreground py-8">
      No {slotType.toLowerCase()} items found matching "{searchTerm}"
    </div>
  )
}
