import type { AllClassType, StatKey } from './base-stats'
import type { AfflictionType } from './conditions'

import type { ActiveSkillsId } from '@/generated/skills-active'
import type { PassiveSkillsId } from '@/generated/skills-passive'

// Temporary type to handle equipment skills that may not exist in skills files yet
export type EquipmentSkillId = ActiveSkillsId | PassiveSkillsId | string

export const WEAPONS = ['Sword', 'Axe', 'Lance', 'Bow', 'Staff'] as const
export const EQUIPMENT_SLOTS = ['Shield', 'Greatshield', 'Accessory'] as const

export type WeaponSlotType = (typeof WEAPONS)[number]
export type EquipmentSlotType =
  | WeaponSlotType
  | (typeof EQUIPMENT_SLOTS)[number]

// Work in progress...
export type ExtraStats =
  | 'MaxHP'
  | 'AP'
  | 'PP'
  | 'CritDmg'
  | 'AllStats'
  | 'GoldGainPercent'
  | 'ExpGainPercent'
  | 'PATKPercent'
  | 'PDEFPercent'
  | 'MATKPercent'
  | 'MDEFPercent'
  | 'MaxHPPercent'
  | 'OnActiveHealPercent'
  | 'DmgReductionPercent'
  | 'GuardEff'
  | 'DrainEff'
  | 'PursuitPotency'
  | 'CounterAttackPotency'
  | 'Defense'
  | 'Attack'
  | 'Faeries'
  | 'Taunt'
  | 'Evade'
export type EquipmentStatKey = StatKey | ExtraStats
export interface Equipment {
  id: string
  name: string
  type: EquipmentSlotType
  stats: Partial<Record<EquipmentStatKey, number>> // attack, defense, etc.
  skillId: EquipmentSkillId | null
  nullifications: ('Debuff' | 'Affliction' | AfflictionType)[]
  classRestrictions: AllClassType[]
}

export interface EquippedItem {
  slot: EquipmentSlotType
  itemId: string | null
}
