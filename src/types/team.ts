import type { AllClassType, GrowthTuple } from './base-stats'
import type { EquippedItem } from './equipment'
import type { SkillSlot } from './skills'

import type { CombatStat } from '@/hooks/use-chart-data'

export const COLS = [0, 1, 2] as const

export type Row = 0 | 1
export type Col = (typeof COLS)[number]

export interface Position {
  row: Row
  col: Col
}

export const VALID_DEW_COUNTS = [0, 1, 2, 3, 4, 5] as const
export type ValidDewCount = (typeof VALID_DEW_COUNTS)[number]
export type DewCount = Record<CombatStat, ValidDewCount>

export interface Unit {
  id: string
  name: string
  classKey: AllClassType
  level: number
  growths: GrowthTuple
  equipment: EquippedItem[]
  skillSlots: SkillSlot[]
  dews: DewCount
  // Used for team building/editor convenience
  position?: Position
}

export type FormationSlots = Array<Unit | null>

export interface Team {
  id: string
  name: string
  formation: FormationSlots
}
