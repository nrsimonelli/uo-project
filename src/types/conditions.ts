import type { StatKey } from './base-stats'
import type { Target, CombatantType } from './core'
import type { Flag } from './effects'
import type { ExtraStats } from './equipment'

import type { AFFLICTIONS } from '@/data/constants'

export type AfflictionType = (typeof AFFLICTIONS)[number]
export type EqualityComparator = 'EqualTo' | 'NotEqualTo'
export type NumericComparator =
  | EqualityComparator
  | 'GreaterThan'
  | 'LessThan'
  | 'GreaterOrEqual'
  | 'LessOrEqual'

export type Condition =
  | {
      kind: 'Stat'
      target: Target
      stat: StatKey | ExtraStats
      comparator: NumericComparator
      value: number
      percent?: boolean
    }
  | {
      kind: 'Affliction'
      target: Target
      affliction: AfflictionType
      comparator: EqualityComparator
    }
  | {
      kind: 'Flag'
      target: Target
      flag: Flag
      comparator: EqualityComparator
    }
  | {
      kind: 'CombatantType'
      target: Target
      combatantType: CombatantType
      comparator: EqualityComparator
    }
  | {
      kind: 'AnyAffliction'
      target: Target
      comparator: EqualityComparator
    }
  | {
      kind: 'HitCheck'
      comparator: EqualityComparator
      value: boolean
    }
  | {
      kind: 'TargetDefeated'
      comparator: EqualityComparator
      value: boolean
    }
