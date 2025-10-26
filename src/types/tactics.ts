import type { TacticConditionKey } from '@/data/tactics/tactic-condition-meta'
import type { TACTIC_CATEGORIES } from '@/data/tactics/tactic-conditions'

export type TacticCategoryKey =
  (typeof TACTIC_CATEGORIES)[keyof typeof TACTIC_CATEGORIES]

export interface TacticalCondition {
  category: TacticCategoryKey
  key: TacticConditionKey
  // TODO: refine this
  parameters?: Record<string, unknown>
}
