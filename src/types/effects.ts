import type { StatKey } from './base-stats'
import type { Condition } from './conditions'
import type { ExtraStats } from './equipment'

export const FLAGS = [
  'TrueStrike',
  'Unguardable',
  'Uncoverable',
  'TrueCritical',
] as const
export type Flag = (typeof FLAGS)[number]

export interface DamageEffect {
  kind: 'Damage'
  potency: { physical?: number; magical?: number }
  hitRate: number | 'True'
  hitCount: number
  flags?: Flag[]
  conditions?: Condition[]
}
export interface GrantFlagEffect {
  kind: 'GrantFlag'
  flag: Flag
  duration?: 'NextAction'
  applyTo?: 'Target' | 'User'
  conditions?: Condition[]
}
export interface IgnoreDefenseEffect {
  kind: 'IgnoreDefense'
  fraction: number
  conditions?: Condition[]
}
export interface PotencyBoostEffect {
  kind: 'PotencyBoost'
  amount: { physical?: number; magical?: number }
  conditions?: Condition[]
}
export interface HealPercentEffect {
  kind: 'HealPercent'
  value: number
  conditions?: Condition[]
}
export interface HealPotencyEffect {
  kind: 'Heal'
  potency: { physical?: number; magical?: number }
  conditions?: Condition[]
}
interface BaseEffect {
  stat: StatKey | ExtraStats
  value: number
  scaling: 'flat' | 'percent'
  applyTo?: 'User' | 'Target'
  duration?: 'NextAction'
  conditions?: Condition[]
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
  conditions?: Condition[]
}

export interface ResourceGainEffect {
  kind: 'ResourceGain'
  resource: 'AP' | 'PP'
  amount: number
  conditions?: Condition[]
}

export interface GuardEffect {
  kind: 'Guard'
  guard: 'light' | 'medium' | 'heavy' | 'full'
  conditions?: Condition[]
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
