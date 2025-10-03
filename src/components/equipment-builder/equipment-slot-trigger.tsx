import { Button } from '../ui/button'

import { EquipmentSlotIcon } from './equipment-icons'

import { cn } from '@/lib/utils'
import type { EquipmentSlotType } from '@/types/equipment'
import type { GeneratedEquipment } from '@/types/generated-equipment'

interface EquipmentSlotTriggerProps {
  slotType: EquipmentSlotType
  currentItem: GeneratedEquipment | null
  onClick?: () => void
}

export function EquipmentSlotTrigger({
  slotType,
  currentItem,
  onClick,
}: EquipmentSlotTriggerProps) {
  return (
    <Button
      variant="outline"
      className="justify-start h-auto p-3 min-h-[60px] w-full"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
          <EquipmentSlotIcon slotType={slotType} className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-start gap-1 flex-1">
          <div className="text-xs text-muted-foreground">{slotType}</div>
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
  )
}
