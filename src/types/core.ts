import type {
  GROWTHS,
  GROWTH_RANKS,
  STATS,
  BASE_CLASSES,
  ADVANCED_CLASSES,
  AFFLICTIONS,
} from '../data/constants'

// --- Growths & Stats ---
export type GrowthKey = keyof typeof GROWTHS
export type GrowthType = (typeof GROWTHS)[GrowthKey]

export type GrowthRank = keyof typeof GROWTH_RANKS

export type StatKey = keyof typeof STATS
export type StatValue = (typeof STATS)[StatKey]

// --- Classes ---
type BaseClassKey = keyof typeof BASE_CLASSES
export type BaseClassType = (typeof BASE_CLASSES)[BaseClassKey]

type AdvancedClassKey = keyof typeof ADVANCED_CLASSES
export type AdvancedClassType = (typeof ADVANCED_CLASSES)[AdvancedClassKey]

export type ClassType = BaseClassType | AdvancedClassType

// --- Afflictions & Traits ---
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

// --- Targeting ---
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

// --- Damage / Attack ---
export const AttackTypes = ['Melee', 'Ranged'] as const
export type AttackType = (typeof AttackTypes)[number]

export const DamageTypes = ['Physical', 'Magical', 'Hybrid'] as const
export type DamageType = (typeof DamageTypes)[number]

// --- Utility Types ---
export type Target = 'Self' | 'Ally' | 'Enemy'
export type Comparator = '>=' | '<=' | '==' | '!=' | '>' | '<'
