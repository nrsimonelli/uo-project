import { findEffectivenessRule } from '@/core/effectiveness-rules'
import type { Flag } from '@/types/effects'

export const BUFF_STATS = {
  NEGATE_MAGIC_DAMAGE: 'NegateMagicDamage',
  NEGATE_PHYSICAL_DAMAGE: 'NegatePhysicalDamage',
  TRUE_STRIKE: 'TrueStrike',
  TRUE_CRITICAL: 'TrueCritical',
  UNGUARDABLE: 'Unguardable',
} as const

export type ConsumableBuffStat = (typeof BUFF_STATS)[keyof typeof BUFF_STATS]

export interface DamageResult {
  hit: boolean
  damage: number
  wasCritical: boolean
  wasGuarded: boolean
  wasDodged: boolean
  hitChance: number
  breakdown: {
    rawBaseDamage: number // Raw (attack - defense) before potency
    afterPotency: number // After potency multiplier is applied
    afterCrit: number
    afterGuard: number
    afterEffectiveness: number
    targetHPBasedDamage?: number
    targetStatBasedDamage?: number
    afterDmgReduction: number
  }
}

export interface AttackContext {
  combinedFlags: Flag[]
  attackType: 'Melee' | 'Ranged' | 'Magical'
  damageType: string
  hasPhysical: boolean
  hasMagical: boolean
}

export interface HitResolution {
  hit: boolean
  hitChance: number
  wasDodged: boolean
  finalHit: boolean
}

export interface DamageComponents {
  physicalDamage: number
  magicalDamage: number
  conferralDamage: number
  totalDamage: number
  rawBaseDamage: number
  afterPotencyDamage: number
  afterCritDamage: number
}

export interface DamageModifiers {
  effectiveness: number
  effectivenessRule: ReturnType<typeof findEffectivenessRule> | null
  afterEffectiveness: number
  finalDamage: number
  dmgReductionPercent: number
}
