import type { AFFLICTIONS } from '../data/status'
import type { COMBATANT_TYPES } from '../data/constants'

export type AfflictionType = (typeof AFFLICTIONS)[number]

export const Traits = [
  'Unguardable',
  'Uncoverable',
  'Grounded',
  'Charge',
  'Limited',
  'Piercing',
  'Healing',
] as const
export type Trait = (typeof Traits)[number]

export const TargetGroups = ['Enemy', 'Ally'] as const
export type TargetGroup = (typeof TargetGroups)[number]

export const TargetPatterns = [
  'Single',
  'Column',
  'Row',
  'All',
  'Self',
] as const
export type TargetPattern = (typeof TargetPatterns)[number]

export interface Targeting {
  group: TargetGroup
  pattern: TargetPattern
}

export const AttackTypes = ['Melee', 'Ranged'] as const
export type AttackType = (typeof AttackTypes)[number]

export const DamageTypes = ['Physical', 'Magical', 'Hybrid'] as const
export type DamageType = (typeof DamageTypes)[number]

export type Target = 'Self' | 'Ally' | 'Enemy'

import type { StatKey } from './base-stats'

export type CombatantType = (typeof COMBATANT_TYPES)[number]

export type EqualityComparator = 'EqualTo' | 'NotEqualTo'
export type NumericComparator =
  | EqualityComparator
  | 'GreaterThan'
  | 'LessThan'
  | 'GreaterOrEqual'
  | 'LessOrEqual'

// --- Boolean-based conditions (must be true to apply) ---
export type Condition =
  | {
      kind: 'Stat'
      target: Target
      stat: StatKey | 'AP' | 'PP' | 'MaxHP'
      comparator: NumericComparator
      value: number
    }
  | {
      kind: 'Trait'
      target: Target
      trait: Trait
      comparator: EqualityComparator
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
      flag: AfflictionType
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
