import type { TACTIC_CATEGORIES } from '@/data/tactics/tactic-conditions'

export type TacticCategoryKey =
  (typeof TACTIC_CATEGORIES)[keyof typeof TACTIC_CATEGORIES]

export interface Tactic {
  kind: string
  condition: TacticalCondition
}

export interface TacticalCondition {
  category: TacticCategoryKey
  key: string
  parameters?: Record<string, unknown>
}
