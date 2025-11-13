import { GROWTHS, STATS } from '@/data/constants'
import type { CombatStat } from '@/hooks/use-chart-data'

export const VALID_GROWTH_VALUES = Object.values(GROWTHS) as Array<
  (typeof GROWTHS)[keyof typeof GROWTHS]
>

export const VALID_COMBAT_STATS = Object.keys(STATS).filter(
  stat => stat !== 'EXP' && stat !== 'LV' && stat !== 'MOV'
) as CombatStat[]

export const VALID_DEW_COUNT = new Set([0, 1, 2, 3, 4, 5] as const)
export type ValidDewCount = 0 | 1 | 2 | 3 | 4 | 5

export const VALID_EQUIPMENT_SLOTS: Set<string> = new Set([
  'Sword',
  'Axe',
  'Lance',
  'Bow',
  'Staff',
  'Shield',
  'Greatshield',
  'Accessory',
])

