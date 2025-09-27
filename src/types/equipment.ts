import type { StatKey } from './base-stats'

export const WEAPONS = ['Sword', 'Axe', 'Lance', 'Bow', 'Staff'] as const
export const EQUIPMENT_SLOTS = ['Shield', 'Greatshield', 'Accessory'] as const

export type WeaponSlotType = (typeof WEAPONS)[number]
export type EquipmentSlotType =
  | WeaponSlotType
  | (typeof EQUIPMENT_SLOTS)[number]

// Work in progress...
export interface Equipment {
  id: string
  name: string
  type: EquipmentSlotType
  stats: Partial<Record<StatKey, number>> // attack, defense, etc.
  ability?: string // references an ability id if it grants one
  bonuses?: {
    ap?: number
    pp?: number
    nullify?: string[]
  }
  restrictedToClasses?: string[] // optional list of class ids
}

export interface EquippedItem {
  slot: EquipmentSlotType
  itemId: string
}
