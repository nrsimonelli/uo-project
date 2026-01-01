import { memo } from 'react'

import { Badge } from '@/components/ui/badge'
import type { EquipmentSlotType } from '@/types/equipment'

interface EquipmentBadgesProps {
  equipment: EquipmentSlotType[]
}

// TODO: revisit for color variants
const BADGE_COLOR_MAP = {
  Lance: 'outline',
  Sword: 'outline',
  Bow: 'outline',
  Axe: 'outline',
  Staff: 'outline',
  Greatshield: 'outline',
  Shield: 'outline',
} as const

function EquipmentBadgesComponent({ equipment }: EquipmentBadgesProps) {
  const nonAccessorySlots = equipment.filter(slot => slot !== 'Accessory')
  // filter out doubles
  const uniqueNonAccessorySlots = nonAccessorySlots.filter(
    (slot, index) => nonAccessorySlots.indexOf(slot) === index
  )

  return (
    <div className="flex flex-wrap gap-1">
      {uniqueNonAccessorySlots.map((slot, index) => (
        <Badge
          key={index}
          variant={BADGE_COLOR_MAP[slot]}
          className="text-xs rounded"
        >
          {slot}
        </Badge>
      ))}
    </div>
  )
}

export const EquipmentBadges = memo(EquipmentBadgesComponent)
