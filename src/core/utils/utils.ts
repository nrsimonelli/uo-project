import type { EqualityComparator, NumericComparator } from '../../types/core'

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
