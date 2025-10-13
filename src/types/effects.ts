import type { StatKey } from './base-stats'
import type { Condition, AfflictionType } from './conditions'
import type { ExtraStats } from './equipment'

export const FLAGS = [
  // Combat modifiers
  'TrueStrike',
  'Unguardable',
  'Uncoverable',
  'TrueCritical',
  'SurviveLethal', // Unit survives one lethal blow
  'InflictGuardSeal', // Next attack inflicts Guard Seal affliction

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
  stacks?: boolean
}

export interface DebuffEffect extends BaseEffect {
  kind: 'Debuff'
  // TODO: Add source tracking for Taunt debuffs to enable proper targeting override
  // When stat === 'Taunt', the battle system needs to track which unit applied the taunt
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
  // TODO: For Berserk - need ResourceConsume effect to consume ALL PP before gaining AP
  // Currently only handles positive resource gains
  conditions?: Condition[] | readonly Condition[]
}

export interface GuardEffect {
  kind: 'Guard'
  guard: 'light' | 'medium' | 'heavy' | 'full'
  conditions?: Condition[] | readonly Condition[]
}

export interface ParryEffect {
  kind: 'Parry'
  // Parry always fully blocks physical damage and works against all attacks including Unguardable
  applyTo?: 'User'
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

export interface ResourceStealEffect {
  kind: 'ResourceSteal'
  resource: 'AP' | 'PP'
  amount: number | 'All' // Amount to steal, or 'All' for all remaining resources
  applyTo?: 'User' // Resource goes to user, taken from target
  conditions?: Condition[] | readonly Condition[]
}

export interface SacrificeEffect {
  kind: 'Sacrifice'
  resource: 'HP' // Currently only HP sacrifice is supported
  amount: number // Amount to sacrifice (percentage for HP)
  scaling: 'percent' // Currently only percentage-based sacrifice
  applyTo?: 'User' // Always applies to the user
  conditions?: Condition[] | readonly Condition[]
}

export interface CleanseEffect {
  kind: 'Cleanse'
  target: 'Debuffs' | 'Afflictions'
  applyTo?: 'User' | 'Target'
  conditions?: Condition[] | readonly Condition[]
}

export interface ResurrectEffect {
  kind: 'Resurrect'
  value: number
  scaling: 'flat' | 'percent'
  applyTo?: 'Target' // Who to resurrect
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
  | ParryEffect
  | AfflictionEffect
  | LifeStealEffect
  | ResourceStealEffect
  | SacrificeEffect
  | CleanseEffect
  | ResurrectEffect
