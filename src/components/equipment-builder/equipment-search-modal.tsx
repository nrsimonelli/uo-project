import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'
import type { EquipmentSlotType } from '@/types/equipment'
import type { AllClassType } from '@/types/base-stats'

import { ScrollArea } from '../ui/scroll-area'
import { Search, X } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { SPRITES } from '@/data/sprites'
import { EquipmentSlotIcon } from './equipment-icons'
import { useEquipmentManager } from '@/hooks/use-equipment-manager'
import { cn } from '@/lib/utils'

export const EquipmentSearchModal = ({
  slotType,
  itemId,
  idx,
  unitClass,
  unitId,
}: {
  slotType: EquipmentSlotType
  itemId: string | null
  idx: number
  unitClass: AllClassType
  unitId: string
}) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleItemSelect = (item: { id: string }) => {
    selectEquipment(item.id)
    setOpen(false)
  }

  const handleUnequip = () => {
    unequipCurrent()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='justify-start h-auto p-3 min-h-[60px] w-full'
        >
          <div className='flex items-center gap-3 w-full'>
            <div className='w-8 h-8 bg-muted rounded flex items-center justify-center'>
              <EquipmentSlotIcon slotType={slotType} className='w-5 h-5' />
            </div>
            <div className='flex flex-col items-start gap-1 flex-1'>
              <div className='text-xs text-muted-foreground'>{slotType}</div>
              <div
                className={cn(
                  'text-sm font-medium text-left',
                  !currentItem && 'text-muted-foreground'
                )}
              >
                {currentItem ? currentItem.name : '-'}
              </div>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby='modal-description'
        className='sm:max-w-md max-h-[80vh] h-full w-full overflow-hidden flex flex-col items-start'
      >
        <DialogHeader>
          <DialogTitle>Select {slotType}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 items-start flex-col flex flex-1 w-full h-full justify-start pb-4'>
          <div className='relative w-full'>
            <Search className='absolute top-1/2 left-2 -translate-y-1/2 w-4 h-4' />
            <Input
              className='pl-8'
              placeholder='Search equipment...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className='flex flex-col w-full overflow-y-auto'>
            {/* Unequip option */}
            {itemId && (
              <Button
                variant='ghost'
                className='justify-start w-full p-3 h-auto mb-2 border-b'
                onClick={handleUnequip}
              >
                <div className='flex items-center gap-2 w-full'>
                  <X className='w-4 h-4' />
                  <div className='text-left'>
                    <div className='font-medium'>Unequip</div>
                    <div className='text-xs text-muted-foreground'>
                      Remove current item
                    </div>
                  </div>
                </div>
              </Button>
            )}

            {/* Equipment List */}
            {filteredItems.map((item) => {
              const equippedBy = getEquippedBy(item.id)
              const isCurrentlyEquipped = itemId === item.id
              const isEquippedByCurrentUnitElsewhere = isEquippedByCurrentUnit(
                item.id
              )

              return (
                <Button
                  key={item.id}
                  variant='ghost'
                  className='justify-start w-full p-4 h-auto border-b border-border/50 last:border-b-0'
                  onClick={() => handleItemSelect(item)}
                  disabled={
                    isCurrentlyEquipped || isEquippedByCurrentUnitElsewhere
                  }
                >
                  <div className='flex items-start gap-3 w-full'>
                    <div className='w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0'>
                      <EquipmentSlotIcon
                        slotType={item.type}
                        className='w-6 h-6'
                      />
                    </div>
                    <div className='flex flex-col items-start gap-1 w-full min-w-0'>
                      <div className='flex items-center gap-2 w-full'>
                        <div className='font-medium truncate'>{item.name}</div>
                        {equippedBy &&
                          !isCurrentlyEquipped &&
                          !isEquippedByCurrentUnitElsewhere && (
                            <Badge
                              variant='secondary'
                              className='text-xs flex-shrink-0 flex items-center gap-1 px-2 py-1'
                            >
                              <img
                                src={SPRITES[equippedBy.unitClass]}
                                alt={equippedBy.unitName}
                                className='w-3 h-3 rounded-sm'
                              />
                              Equipped
                            </Badge>
                          )}
                        {(isCurrentlyEquipped ||
                          isEquippedByCurrentUnitElsewhere) && (
                          <Badge
                            variant='default'
                            className='text-xs flex-shrink-0'
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      {/* Show key stats */}
                      {Object.keys(item.stats).length > 0 && (
                        <div className='text-xs text-muted-foreground flex flex-wrap gap-2'>
                          {Object.entries(item.stats)
                            .slice(0, 4)
                            .map(([stat, value]) => (
                              <span
                                key={stat}
                                className='bg-muted/50 px-1.5 py-0.5 rounded'
                              >
                                {stat}: +{value}
                              </span>
                            ))}
                        </div>
                      )}
                      {/* Show skill if any */}
                      {item.skillId && (
                        <div className='text-xs text-blue-600 dark:text-blue-400'>
                          Skill: {item.skillId}
                        </div>
                      )}
                      {/* Show class restrictions if any */}
                      {item.classRestrictions.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='text-xs text-orange-600 dark:text-orange-400 cursor-help'>
                              Restricted to:{' '}
                              {item.classRestrictions.length > 3
                                ? `${item.classRestrictions
                                    .slice(0, 3)
                                    .join(', ')}... (+${
                                    item.classRestrictions.length - 3
                                  } more)`
                                : item.classRestrictions.join(', ')}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className='max-w-xs'>
                            <div className='text-xs'>
                              <div className='font-semibold mb-1'>
                                Restricted to:
                              </div>
                              {item.classRestrictions.join(', ')}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </Button>
              )
            })}

            {filteredItems.length === 0 && (
              <div className='text-center text-muted-foreground py-8'>
                No {slotType.toLowerCase()} items found matching "{searchTerm}"
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
