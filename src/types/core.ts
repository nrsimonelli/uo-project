import type { Condition } from './conditions'

import type { COMBATANT_TYPES } from '@/data/constants'

export const TargetGroups = ['Enemy', 'Ally', 'Self'] as const
export type TargetGroup = (typeof TargetGroups)[number]
export type Target = 'Self' | 'Ally' | 'Enemy'

export const TargetPatterns = [
  'Single',
  'Two', // Target exactly 2 different enemies (e.g., Dual Shot)
  'Three', // Target exactly 3 different enemies (e.g., Triple shatter)
  'Column',
  'Row', // TODO: For Row Protection - need "SameRow" pattern to target only allies in user's row
  'All',
  'Self',
] as const
export type TargetPattern = (typeof TargetPatterns)[number]

export interface Targeting {
  group: TargetGroup
  pattern: TargetPattern
  /**
   * Optional conditional pattern that overrides the base pattern when conditions are met.
   * If conditions are met, the conditionalPattern will be used instead of the base pattern.
   */
  conditionalPattern?: {
    pattern: TargetPattern
    conditions: readonly Condition[] | Condition[]
  }
}

export const AttackTypes = ['Melee', 'Ranged', 'Magical'] as const
export type AttackType = (typeof AttackTypes)[number]

export const DamageTypes = ['Physical', 'Magical', 'Hybrid'] as const
export type DamageType = (typeof DamageTypes)[number]

export const SkillCategories = [
  'Damage', // All Damage skills
  'Counter',
  'Pursuit',
  'Heal',
  'Sabotage', // Debuff/affliction skills
  'Utility', // Buff/utility skills
  'Cover',
  'Guard',
  'Parry', // Defensive skills that work against all attacks including Unguardable
] as const
export type SkillCategory = (typeof SkillCategories)[number]

export type CombatantType = (typeof COMBATANT_TYPES)[number]
