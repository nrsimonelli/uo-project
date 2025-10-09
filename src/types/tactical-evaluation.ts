import type { BattleContext, BattleEvent } from './battle-engine'
import type { TacticalCondition } from './tactics'

import type { ActivationWindowId } from '@/data/activation-windows'

/**
 * Activation window for passive skills
 */
export interface ActivationWindow {
  id: string
  type: ActivationWindowId
  isLimited: boolean
  triggerEvent: BattleEvent
  eligibleUnits: string[]
  processedUnits: string[]
  isResolved: boolean
}

// Tactical evaluation types for future implementation
// Currently unused as we're using basic skill execution

export interface TargetEvaluationResult {
  validTargets: BattleContext[]
  primaryTarget: BattleContext | null
  additionalTargets: BattleContext[]
  evaluationPassed: boolean
  conditionResults: ConditionEvaluationResult[]
}

export interface ConditionEvaluationResult {
  condition: TacticalCondition
  type: 'filter' | 'sort'
  passed: boolean
  targetPool: BattleContext[]
  filteredTargets?: BattleContext[]
  sortedTargets?: BattleContext[]
  reason?: string
}
