import { ALL_CLASSES } from '@/data/units/constants'
import type { EqualityComparator, NumericComparator } from '../../types/core'
import type { AllClassType } from '@/types/base-stats'

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

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

export const isValidClass = (className: string): className is AllClassType => {
  return Object.values(ALL_CLASSES).includes(className as AllClassType)
}

export const generateRandomId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
