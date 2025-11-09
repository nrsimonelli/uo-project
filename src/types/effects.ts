import type { StatKey } from './base-stats'
import type { Condition, AfflictionType } from './conditions'
import type { CombatantType } from './core'
import type { ExtraStats } from './equipment'

export const FLAGS = [
  // Combat modifiers
  'TrueStrike',
  'Unguardable',
  'Uncoverable',
  'TrueCritical',
  'InflictGuardSeal', // Next attack inflicts Guard Seal affliction
  'NegateMagicDamage', // Negates magic damage
  'NegatePhysicalDamage', // Negates physical damage
  'AfflictionImmunity', // Immune to afflictions
  'DebuffImmunity', // Immune to debuffs
  // Skill properties
  'Charge', // Executes on following round
  'GroundBased', // Can only hit Cavalry and Infantry
  'Piercing', // Can target back-row units even if melee (bypasses front-row blocking)
  'NoCrit',
  'Overheal',
  'ExcludeSelf', // Excludes the acting unit from ally targeting
] as const
export type Flag = (typeof FLAGS)[number]

export interface DamageEffect {
  kind: 'Damage'
  potency: { physical?: number; magical?: number }
  hitRate: number | 'True'
  hitCount: number
  conditions?: Condition[] | readonly Condition[]
}

/**
 * GrantFlagEffect - Instant-use flags for the current skill execution
 *
 * ⚠️ IMPORTANT: GrantFlag effects do NOT support durations or persistence.
 * Flags are only available during the skill execution that grants them and are
 * immediately consumed/checked during that same execution.
 *
 * When to use GrantFlag:
 * - Flag is only needed during the skill execution that grants it
 * - Flag modifies the current attack/skill being executed
 * - Examples: TrueStrike for current attack, Unguardable for current attack,
 *   TrueCritical for current attack, NoCrit for current attack
 *
 * When to use BuffEffect instead:
 * - Effect must persist beyond the skill execution
 * - Effect needs to be checked later (on next attack, when attacked, etc.)
 * - Examples: Sniping Order, Row Barrier, Night Vision
 *
 * Rule of thumb: If the effect needs to exist AFTER the skill finishes executing,
 * use BuffEffect with the appropriate stat/flag (e.g., TrueStrike, s).
 */
export interface GrantFlagEffect {
  kind: 'GrantFlag'
  flag: Flag
  // Note: Duration is NOT supported - flags are instant-use only
  // Use BuffEffect with duration if persistence is needed
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
  applyTo?: 'User' | 'Target'
  conditions?: Condition[] | readonly Condition[]
}
export interface HealPotencyEffect {
  kind: 'Heal'
  potency: { physical?: number; magical?: number }
  hitCount: number
  conditions?: Condition[] | readonly Condition[]
}
interface BaseEffect {
  stat: StatKey | ExtraStats
  value: number
  scaling: 'flat' | 'percent'
  applyTo?: 'User' | 'Target'
  duration?:
    | 'UntilNextAction'
    | 'UntilNextAttack'
    | 'UntilAttacked'
    | 'UntilDebuffed'
  conditions?: Condition[] | readonly Condition[]
}

/**
 * BuffEffect - Persistent effects stored on units with duration tracking
 *
 * Buffs are stored on units and persist until consumed or expired based on duration.
 * Supports full duration tracking: UntilNextAction, UntilNextAttack, UntilAttacked,
 * UntilDebuffed, or Indefinite.
 *
 * Special buff stats for immunity/consumable mechanics:
 * - 'SurviveLethal': Prevents one lethal blow, consumed when triggered
 * - 'DebuffImmunity': Blocks next debuff/affliction/resource steal, consumed when triggered
 * - 'NegateMagicDamage': Negates all incoming magic damage, consumed when triggered
 * - 'NegatePhysicalDamage': Negates all incoming physical damage, consumed when triggered
 * - 'AfflictionImmunity': Blocks next affliction, consumed when triggered
 * - 'TrueStrike': Guarantees next attack hits, consumed when used
 *
 * Use BuffEffect when:
 * - Effect must persist beyond the skill execution
 * - Effect needs duration tracking (UntilNextAttack, UntilAttacked, etc.)
 * - Effect should be stored on the unit until consumed/expired
 *
 * For instant-use flags (no persistence), use GrantFlagEffect instead.
 */
export interface BuffEffect extends BaseEffect {
  kind: 'Buff'
  stacks?: boolean
  /**
   * Optional condition that must be met on the target for this buff to apply.
   * If specified, the buff only applies when the attacker is targeting a unit
   * that matches the condition (e.g., only when attacking Cavalry units).
   */
  conditionalOnTarget?: {
    combatantType?: CombatantType
  }
}

export interface DebuffEffect extends BaseEffect {
  kind: 'Debuff'
  stacks?: boolean
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
  applyTo?: 'Target' | 'User'
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

export interface EvadeEffect {
  kind: 'Evade'
  evadeType: 'entireAttack' | 'singleHit' | 'twoHits'
  applyTo?: 'User' | 'Target'
  duration?: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
  conditions?: Condition[] | readonly Condition[]
}

export interface DamageImmunityEffect {
  kind: 'DamageImmunity'
  immunityType: 'entireAttack' | 'singleHit' | 'multipleHits'
  hitCount?: number // Required when immunityType === 'multipleHits'
  applyTo?: 'User' | 'Target'
  duration?: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
  conditions?: Condition[] | readonly Condition[]
}

export interface AfflictionEffect {
  kind: 'Affliction'
  affliction: AfflictionType
  level?: number // For Burn stacking - how many levels to apply
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
  target: 'Buffs' | 'Debuffs' | 'Afflictions' | AfflictionType
  applyTo?: 'User' | 'Target'
  conditions?: Condition[] | readonly Condition[]
}

export interface DebuffAmplificationEffect {
  kind: 'DebuffAmplification'
  multiplier: number // 1.5 for 150% effectiveness
  applyTo?: 'User' | 'Target'
  duration?: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
  conditions?: Condition[] | readonly Condition[]
}

export interface ConferralEffect {
  kind: 'Conferral'
  potency: number // Magic potency to add (e.g., 50)
  applyTo?: 'Target' // Who receives the conferral buff
  duration?: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked' // When the effect expires
  conditions?: Condition[] | readonly Condition[]
}

export interface ResurrectEffect {
  kind: 'Resurrect'
  value: number
  scaling: 'flat' | 'percent'
  applyTo?: 'Target' // Who to resurrect
  conditions?: Condition[] | readonly Condition[]
}

export interface OwnHPBasedDamageEffect {
  kind: 'OwnHPBasedDamage'
  type: 'percentRemaining' | 'percentMissing'
  amount: number
  conditions?: Condition[] | readonly Condition[]
}

export interface TargetHPBasedDamageEffect {
  kind: 'TargetHPBasedDamage'
  type: 'percentCurrent' | 'percentMax' | 'percentMissing'
  amount: number // Percentage (e.g., 25 for 25%)
  conditions?: Condition[] | readonly Condition[]
}

export interface LifeshareEffect {
  kind: 'Lifeshare'
  percentage: number // Percentage of current HP to sacrifice (e.g., 50 for 50%)
  applyTo?: 'Target' // Who receives the heal (always Target for lifeshare)
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
  | EvadeEffect
  | DamageImmunityEffect
  | AfflictionEffect
  | LifeStealEffect
  | ResourceStealEffect
  | SacrificeEffect
  | CleanseEffect
  | ResurrectEffect
  | DebuffAmplificationEffect
  | ConferralEffect
  | OwnHPBasedDamageEffect
  | TargetHPBasedDamageEffect
  | LifeshareEffect
