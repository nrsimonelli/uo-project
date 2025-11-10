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
    classKey: className,
    name: className,
    level: 35,
    growths: ['All-Rounder', 'All-Rounder'] as GrowthTuple,
    equipment,
    skillSlots: [],
    dews: {
      HP: 0,
      PATK: 0,
      PDEF: 0,
      MATK: 0,
      MDEF: 0,
      ACC: 0,
      EVA: 0,
      CRT: 0,
      GRD: 0,
      INIT: 0,
    },
    position,
  }
}
