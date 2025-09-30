import { ALL_CLASSES } from '@/data/class-types'
import type { AllClassType } from '@/types/base-stats'
import type { NumericComparator, EqualityComparator } from '@/types/conditions'

export function isValidClass(className: string): className is AllClassType {
  return Object.values(ALL_CLASSES).includes(className as AllClassType)
}

export function generateRandomId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export const numericComparators: Record<
  NumericComparator,
  (a: number, b: number) => boolean
> = {
  EqualTo: (a, b) => a === b,
  NotEqualTo: (a, b) => a !== b,
  GreaterThan: (a, b) => a > b,
  LessThan: (a, b) => a < b,
  GreaterOrEqual: (a, b) => a >= b,
  LessOrEqual: (a, b) => a <= b,
}

export const equalityComparators: Record<
  EqualityComparator,
  (a: boolean, b: boolean) => boolean
> = {
  EqualTo: (a, b) => a === b,
  NotEqualTo: (a, b) => a !== b,
}
