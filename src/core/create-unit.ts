import { isValidClass, getEquipmentSlots } from '@/core/helpers'
import type { GrowthTuple } from '@/types/base-stats'
import type { Position, Unit } from '@/types/team'

export const createUnit = (
  id: string,
  className: string,
  position: Position
): Unit => {
  if (!isValidClass(className)) {
    throw new Error(`Unknown class: ${className}`)
  }

  // Initialize equipment slots based on class
  const equipmentSlots = getEquipmentSlots(className)
  const equipment = equipmentSlots.map(slot => ({ slot, itemId: null }))

  return {
    id: id,
    class: className,
    name: className,
    level: 1,
    growths: ['All-Rounder', 'All-Rounder'] as GrowthTuple,
    equipment,
    skillSlots: [],
    position,
  }
}
