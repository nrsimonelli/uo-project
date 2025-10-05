import { Search, X } from 'lucide-react'

import { EquipmentItem } from './equipment-item'
import { EquipmentSlotTrigger } from './equipment-slot-trigger'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  })

  const handleItemSelect = (item: GeneratedEquipment) => {
    selectEquipment(item.id)
    closeModal()
  }

  const handleUnequip = () => {
    unequipCurrent()
    closeModal()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <EquipmentSlotTrigger slotType={slotType} currentItem={currentItem} />
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-md max-h-[80vh] h-full w-full overflow-hidden flex flex-col items-start"
      >
        <DialogHeader>
          <DialogTitle>Select {slotType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 items-start flex-col flex flex-1 w-full h-full justify-start pb-4">
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={updateSearchTerm}
          />

          <ScrollArea className="flex flex-col w-full overflow-y-auto">
            {itemId && <UnequipButton onUnequip={handleUnequip} />}

            <EquipmentList
              items={filteredItems}
              itemId={itemId}
              onItemSelect={handleItemSelect}
              isEquippedByCurrentUnit={isEquippedByCurrentUnit}
              getEquippedBy={getEquippedBy}
            />

            {filteredItems.length === 0 && (
              <EmptyState slotType={slotType} searchTerm={searchTerm} />
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SearchInputProps {
  searchTerm: string
  onSearchChange: (term: string) => void
}

function SearchInput({ searchTerm, onSearchChange }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-2 -translate-y-1/2 w-4 h-4" />
      <Input
        className="pl-8"
        placeholder="Search equipment..."
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
      />
    </div>
  )
}

interface UnequipButtonProps {
  onUnequip: () => void
}

function UnequipButton({ onUnequip }: UnequipButtonProps) {
  return (
    <Button
      variant="ghost"
      className="justify-start w-full p-3 h-auto mb-2 border-b"
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
    <>
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
    </>
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
