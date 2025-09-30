import type { COMBATANT_TYPES } from '../data/constants'

export const TargetGroups = ['Enemy', 'Ally'] as const
export type TargetGroup = (typeof TargetGroups)[number]
export type Target = 'Self' | 'Ally' | 'Enemy'

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

export type CombatantType = (typeof COMBATANT_TYPES)[number]
