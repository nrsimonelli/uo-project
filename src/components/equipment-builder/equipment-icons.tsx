import {
  Sword,
  Axe,
  Slice,
  Wand2,
  ShieldPlus,
  Shield,
  Torus,
  BowArrow,
} from 'lucide-react'

import { type EquipmentSlotType } from '@/types/equipment'

// Equipment slot icon mapping
const EQUIPMENT_ICONS = {
  Sword,
  Axe,
  Lance: Slice,
  Bow: BowArrow,
  Staff: Wand2,
  Shield: Shield,
  Greatshield: ShieldPlus,
  Accessory: Torus,
} as const

// eslint-disable-next-line react-refresh/only-export-components
export function getEquipmentIcon(slotType: EquipmentSlotType) {
  return EQUIPMENT_ICONS[slotType] || Torus
}

export function EquipmentSlotIcon({
  slotType,
  className = 'w-4 h-4',
  ...props
}: {
  slotType: EquipmentSlotType
  className?: string
} & React.ComponentProps<'svg'>) {
  const IconComponent = getEquipmentIcon(slotType)
  return <IconComponent className={className} {...props} />
}
