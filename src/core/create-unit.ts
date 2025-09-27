import type {
  GrowthTuple,
  Position,
  Unit,
} from '@/components/team-builder/team-context'
import { isValidClass } from '@/core/helpers'

export const createUnit = (
  id: string,
  className: string,
  position: Position
): Unit => {
  if (!isValidClass(className)) {
    throw new Error(`Unknown class: ${className}`)
  }

  return {
    id: id,
    class: className,
    name: className,
    level: 1,
    growths: ['All-Rounder', 'All-Rounder'] as GrowthTuple,
    equipment: [],
    activeSkills: [],
    passiveSkills: [],
    position,
  }
}
