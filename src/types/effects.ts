import type { StatKey } from './base-stats'
import type { Condition, AfflictionType } from './conditions'
import type { ExtraStats } from './equipment'

export const FLAGS = [
  // Combat modifiers
  'TrueStrike',
  'Unguardable',
  'Uncoverable',
  'TrueCritical',

  // Skill properties
  'Charge', // Executes on following round
  'GroundBased', // Can only hit Cavalry and Infantry
] as const
export type Flag = (typeof FLAGS)[number]

export interface DamageEffect {
  kind: 'Damage'
  potency: { physical?: number; magical?: number }
  hitRate: number | 'True'
  hitCount: number
  flags?: Flag[] | readonly Flag[]
  conditions?: Condition[] | readonly Condition[]
}
export interface GrantFlagEffect {
  kind: 'GrantFlag'
  flag: Flag
  duration?: 'NextAction'
  applyTo?: 'Target' | 'User'
  conditions?: Condition[] | readonly Condition[]
}
export interface IgnoreDefenseEffect {
  kind: 'IgnoreDefense'
  fraction: number
  conditions?: Condition[] | readonly Condition[]
}
export interface PotencyBoostEffect {
  kind: 'PotencyBoost'
  amount: { physical?: number; magical?: number }
  conditions?: Condition[] | readonly Condition[]
}
export interface HealPercentEffect {
  kind: 'HealPercent'
  value: number
  conditions?: Condition[] | readonly Condition[]
}
export interface HealPotencyEffect {
  kind: 'Heal'
  potency: { physical?: number; magical?: number }
  conditions?: Condition[] | readonly Condition[]
}
interface BaseEffect {
  stat: StatKey | ExtraStats
  value: number
  scaling: 'flat' | 'percent'
  applyTo?: 'User' | 'Target'
  duration?: 'NextAction'
  conditions?: Condition[] | readonly Condition[]
}
export interface BuffEffect extends BaseEffect {
  kind: 'Buff'
}

export interface DebuffEffect extends BaseEffect {
  kind: 'Debuff'
}

export interface CoverEffect {
  kind: 'Cover'
  guard: 'none' | 'light' | 'medium' | 'heavy' | 'full'
  conditions?: Condition[] | readonly Condition[]
}

export interface ResourceGainEffect {
  kind: 'ResourceGain'
  resource: 'AP' | 'PP'
  amount: number
  conditions?: Condition[] | readonly Condition[]
}

export interface GuardEffect {
  kind: 'Guard'
  guard: 'light' | 'medium' | 'heavy' | 'full'
  conditions?: Condition[] | readonly Condition[]
}

export interface AfflictionEffect {
  kind: 'Affliction'
  affliction: AfflictionType
  applyTo?: 'Target' | 'User'
  conditions?: Condition[] | readonly Condition[]
}

export interface LifeStealEffect {
  kind: 'LifeSteal'
  percentage: number // Percentage of damage dealt to heal (e.g., 50 for 50%)
  applyTo?: 'User'
  conditions?: Condition[] | readonly Condition[]
}

export type Effect =
  | DamageEffect
  | HealPercentEffect
  | HealPotencyEffect
  | BuffEffect
  | DebuffEffect
  | GrantFlagEffect
  | IgnoreDefenseEffect
  | PotencyBoostEffect
  | ResourceGainEffect
  | CoverEffect
  | GuardEffect
  | AfflictionEffect
  | LifeStealEffect
