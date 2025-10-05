import type { AllClassType, GrowthTuple } from './base-stats'
import type { EquippedItem } from './equipment'
import type { SkillSlot } from './skills'

export const COLS = [0, 1, 2] as const

export type Row = 0 | 1
export type Col = (typeof COLS)[number]

export interface Position {
  row: Row
  col: Col
}

export interface Unit {
  id: string
  name: string
  classKey: AllClassType
  level: number
  growths: GrowthTuple
  equipment: EquippedItem[]
  skillSlots: SkillSlot[]
  // Used for team building/editor convenience
  position?: Position
}

export type FormationSlots = Array<Unit | null>

export interface Team {
  id: string
  name: string
  formation: FormationSlots
}
