import type { StatKey } from './base-stats'
import type { Target, CombatantType } from './core'
import type { Flag } from './effects'
import type { ExtraStats } from './equipment'

import { AFFLICTIONS } from '@/data/constants'

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
      // TODO: For Bastard's Cross & Vengeful Axe - need dynamic scaling based on HP percentage
      // Currently uses simple threshold, but should scale potency proportionally
      // Vengeful Axe: +100 max potency as HP decreases (50 base + up to 100 scaling)
      // Both skills need proportional scaling instead of binary conditions
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
      kind: 'AnyBuff'
      target: Target
      comparator: EqualityComparator
    }
  | {
      kind: 'AnyDebuff'
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
  | {
      kind: 'Position'
      target: Target
      row: number // 0 = back row, 1 = front row
      comparator: EqualityComparator
    }
  | {
      kind: 'FirstHitGuarded'
      comparator: EqualityComparator
      value: boolean // true if first hit was guarded, false if not
    }
  | {
      kind: 'UnitSize'
      target: Target
      comparator: NumericComparator
      value: number
    }
  | {
      kind: 'IsNightCycle'
      comparator: EqualityComparator
      value: boolean
    }
