import {
  compareWithOperator,
  getHpPercent,
  hasStatus,
  getStatValue,
  evaluateUserCondition,
  evaluateBasicFormation,
} from './tactical-utils'

import type { ConditionMetadata } from '@/data/tactics/tactic-condition-meta'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { ActiveSkill, PassiveSkill } from '@/types/skills'

/**
 * Context for evaluating tactical conditions
 */
export interface TacticalContext {
  actingUnit: BattleContext
  battlefield: BattlefieldState
  skill: ActiveSkill | PassiveSkill
  allAllies: BattleContext[]
  allEnemies: BattleContext[]
}

/**
 * Function signature for skip condition evaluators
 */
export type SkipEvaluator = (
  metadata: ConditionMetadata,
  context: TacticalContext
) => boolean

/**
 * Function signature for target filter evaluators
 */
export type FilterEvaluator = (
  targets: BattleContext[],
  metadata: ConditionMetadata,
  context: TacticalContext
) => BattleContext[]

/**
 * Function signature for target sort evaluators
 */
export type SortEvaluator = (
  targets: BattleContext[],
  metadata: ConditionMetadata,
  context: TacticalContext
) => BattleContext[]

/**
 * Function signature for target comparison evaluators
 */
export type CompareEvaluator = (
  a: BattleContext,
  b: BattleContext,
  metadata: ConditionMetadata,
  context: TacticalContext
) => number

// ============================================================================
// SKIP EVALUATORS (for shouldSkipSkillForTactic)
// ============================================================================

const skipOwnHpPercent: SkipEvaluator = (metadata, context) => {
  const hpPercent = getHpPercent(context.actingUnit)
  return !compareWithOperator(
    hpPercent,
    metadata.threshold!,
    metadata.operator!
  )
}

const skipOwnAp: SkipEvaluator = (metadata, context) => {
  return !compareWithOperator(
    context.actingUnit.currentAP,
    metadata.threshold!,
    metadata.operator!
  )
}

const skipOwnPp: SkipEvaluator = (metadata, context) => {
  return !compareWithOperator(
    context.actingUnit.currentPP,
    metadata.threshold!,
    metadata.operator!
  )
}

const skipUserCondition: SkipEvaluator = (metadata, context) => {
  return !evaluateUserCondition(context.actingUnit, metadata.userCondition!)
}

const skipActionNumber: SkipEvaluator = (metadata, context) => {
  const unitActionCount = context.battlefield.actionHistory.filter(
    action => action.unitId === context.actingUnit.unit.id
  ).length
  const expectedActionNumber = metadata.actionNumber!
  return unitActionCount !== expectedActionNumber - 1
}

const skipEnemyPresence: SkipEvaluator = (metadata, context) => {
  const hasEnemyType = context.allEnemies.some(enemy =>
    enemy.combatantTypes.includes(metadata.combatantType!)
  )
  return metadata.negated ? hasEnemyType : !hasEnemyType
}

const skipUnitCount: SkipEvaluator = (metadata, context) => {
  const targetUnits =
    metadata.unitTarget === 'allies' ? context.allAllies : context.allEnemies
  return !compareWithOperator(
    targetUnits.length,
    metadata.threshold!,
    metadata.operator!
  )
}

const skipFormation: SkipEvaluator = (metadata, context) => {
  if (
    metadata.formationType === 'daytime' ||
    metadata.formationType === 'nighttime'
  ) {
    return !evaluateBasicFormation(context.actingUnit, metadata.formationType, {
      battlefield: context.battlefield,
    })
  }
  return false
}

// ============================================================================
// FILTER EVALUATORS (for filterTargets)
// ============================================================================

const filterHpPercent: FilterEvaluator = (targets, metadata) => {
  return targets.filter(target => {
    const hpPercent = getHpPercent(target)
    return compareWithOperator(
      hpPercent,
      metadata.threshold!,
      metadata.operator!
    )
  })
}

const filterHpAverage: FilterEvaluator = (targets, metadata, context) => {
  return targets.filter(target => {
    const targetGroup =
      target.team === context.actingUnit.team
        ? context.allAllies
        : context.allEnemies

    const totalHpPercent = targetGroup.reduce((sum, unit) => {
      return sum + getHpPercent(unit)
    }, 0)

    const averageHpPercent =
      targetGroup.length > 0 ? totalHpPercent / targetGroup.length : 0
    return compareWithOperator(
      averageHpPercent,
      metadata.threshold!,
      metadata.operator!
    )
  })
}

const filterAp: FilterEvaluator = (targets, metadata) => {
  return targets.filter(target =>
    compareWithOperator(
      target.currentAP,
      metadata.threshold!,
      metadata.operator!
    )
  )
}

const filterPp: FilterEvaluator = (targets, metadata) => {
  return targets.filter(target =>
    compareWithOperator(
      target.currentPP,
      metadata.threshold!,
      metadata.operator!
    )
  )
}

const filterCombatantType: FilterEvaluator = (targets, metadata) => {
  return targets.filter(target =>
    target.combatantTypes.includes(metadata.combatantType!)
  )
}

const filterStatus: FilterEvaluator = (targets, metadata) => {
  const statusName = metadata.statusName!
  const isNegated = metadata.negated || false

  return targets.filter(target => {
    const targetHasStatus = hasStatus(target, statusName)
    return isNegated ? !targetHasStatus : targetHasStatus
  })
}

const filterFormation: FilterEvaluator = (targets, metadata, context) => {
  return targets.filter(target => {
    // Handle basic formation types
    if (
      metadata.formationType === 'front-row' ||
      metadata.formationType === 'back-row' ||
      metadata.formationType === 'daytime' ||
      metadata.formationType === 'nighttime'
    ) {
      return evaluateBasicFormation(target, metadata.formationType!, {
        battlefield: context.battlefield,
      })
    }

    // Handle advanced formation types (simplified for now)
    // In full implementation, would include the complex logic from evaluateAdvancedFormationFilter
    return true
  })
}

const filterUserConditionOnTarget: FilterEvaluator = (
  targets,
  metadata,
  context
) => {
  return targets.filter(target => {
    if (metadata.userCondition === 'self') {
      return target.unit.id === context.actingUnit.unit.id
    } else if (metadata.userCondition === 'others') {
      return target.unit.id !== context.actingUnit.unit.id
    } else {
      return evaluateUserCondition(target, metadata.userCondition!)
    }
  })
}

const filterAttackHistory: FilterEvaluator = (targets, _metadata, context) => {
  const recentActions = context.battlefield.actionHistory.slice(-5)

  return targets.filter(target => {
    // Simplified attack history check
    return recentActions.some(action =>
      action.targetIds.includes(target.unit.id)
    )
  })
}

// ============================================================================
// SORT EVALUATORS (for sortTargets)
// ============================================================================

const sortHpPercent: SortEvaluator = (targets, metadata) => {
  return [...targets].sort((a, b) => {
    const aPercent = getHpPercent(a)
    const bPercent = getHpPercent(b)

    if (metadata.statName?.includes('Highest') || metadata.operator === 'gt') {
      return bPercent - aPercent // Descending
    } else {
      return aPercent - bPercent // Ascending
    }
  })
}

const sortAp: SortEvaluator = (targets, metadata) => {
  return [...targets].sort((a, b) => {
    if (metadata.statName?.includes('Most')) {
      return b.currentAP - a.currentAP // Descending
    } else {
      return a.currentAP - b.currentAP // Ascending
    }
  })
}

const sortPp: SortEvaluator = (targets, metadata) => {
  return [...targets].sort((a, b) => {
    if (metadata.statName?.includes('Most')) {
      return b.currentPP - a.currentPP // Descending
    } else {
      return a.currentPP - b.currentPP // Ascending
    }
  })
}

const sortCombatantType: SortEvaluator = (targets, metadata) => {
  return [...targets].sort((a, b) => {
    const aHasType = a.combatantTypes.includes(metadata.combatantType!)
    const bHasType = b.combatantTypes.includes(metadata.combatantType!)

    if (aHasType && !bHasType) return -1 // a comes first
    if (!aHasType && bHasType) return 1 // b comes first
    return 0 // tie
  })
}

const sortStatus: SortEvaluator = (targets, metadata) => {
  const statusName = metadata.statusName!

  return [...targets].sort((a, b) => {
    const aHasStatus = hasStatus(a, statusName)
    const bHasStatus = hasStatus(b, statusName)

    if (aHasStatus && !bHasStatus) return -1 // a comes first
    if (!aHasStatus && bHasStatus) return 1 // b comes first
    return 0 // tie
  })
}

const sortFormation: SortEvaluator = (targets, metadata) => {
  return [...targets].sort((a, b) => {
    if (metadata.formationType === 'front-row') {
      return b.position.row - a.position.row // Front row (1) comes before back row (0)
    } else if (metadata.formationType === 'back-row') {
      return a.position.row - b.position.row // Back row (0) comes before front row (1)
    }
    return 0
  })
}

const sortStats: SortEvaluator = (targets, metadata) => {
  const statName = metadata.statName!
  const isHighStat = metadata.valueType === 'stat-high'

  return [...targets].sort((a, b) => {
    const aValue = getStatValue(a, statName)
    const bValue = getStatValue(b, statName)

    if (isHighStat) {
      return bValue - aValue // Descending for "Highest X"
    } else {
      return aValue - bValue // Ascending for "Lowest X"
    }
  })
}

// ============================================================================
// COMPARE EVALUATORS (for hasTrueTie comparison)
// ============================================================================

const compareHpPercent: CompareEvaluator = (a, b, metadata) => {
  const aPercent = getHpPercent(a)
  const bPercent = getHpPercent(b)

  if (metadata.statName?.includes('Highest') || metadata.operator === 'gt') {
    return bPercent - aPercent
  } else {
    return aPercent - bPercent
  }
}

const compareAp: CompareEvaluator = (a, b, metadata) => {
  if (metadata.statName?.includes('Most')) {
    return b.currentAP - a.currentAP
  } else {
    return a.currentAP - b.currentAP
  }
}

const comparePp: CompareEvaluator = (a, b, metadata) => {
  if (metadata.statName?.includes('Most')) {
    return b.currentPP - a.currentPP
  } else {
    return a.currentPP - b.currentPP
  }
}

const compareCombatantType: CompareEvaluator = (a, b, metadata) => {
  const aHasType = a.combatantTypes.includes(metadata.combatantType!)
  const bHasType = b.combatantTypes.includes(metadata.combatantType!)

  if (aHasType && !bHasType) return -1
  if (!aHasType && bHasType) return 1
  return 0
}

const compareFormation: CompareEvaluator = (a, b, metadata) => {
  if (metadata.formationType === 'front-row') {
    return b.position.row - a.position.row
  } else if (metadata.formationType === 'back-row') {
    return a.position.row - b.position.row
  }
  return 0
}

const compareStats: CompareEvaluator = (a, b, metadata) => {
  const statName = metadata.statName!
  const isHighStat = metadata.valueType === 'stat-high'

  const aValue = getStatValue(a, statName)
  const bValue = getStatValue(b, statName)

  if (isHighStat) {
    return bValue - aValue
  } else {
    return aValue - bValue
  }
}

// ============================================================================
// EVALUATOR REGISTRY - The replacement for switch statements
// ============================================================================

export const SKIP_EVALUATORS: Record<string, SkipEvaluator> = {
  'own-hp-percent': skipOwnHpPercent,
  'own-ap': skipOwnAp,
  'own-pp': skipOwnPp,
  'user-condition': skipUserCondition,
  'action-number': skipActionNumber,
  'enemy-presence': skipEnemyPresence,
  'unit-count': skipUnitCount,
  formation: skipFormation,
}

export const FILTER_EVALUATORS: Record<string, FilterEvaluator> = {
  'hp-percent': filterHpPercent,
  'hp-average': filterHpAverage,
  ap: filterAp,
  pp: filterPp,
  'combatant-type': filterCombatantType,
  status: filterStatus,
  formation: filterFormation,
  'user-condition': filterUserConditionOnTarget,
  'attack-history': filterAttackHistory,
}

export const SORT_EVALUATORS: Record<string, SortEvaluator> = {
  'hp-percent': sortHpPercent,
  ap: sortAp,
  pp: sortPp,
  'combatant-type': sortCombatantType,
  status: sortStatus,
  formation: sortFormation,
  'stat-high': sortStats,
  'stat-low': sortStats,
}

export const COMPARE_EVALUATORS: Record<string, CompareEvaluator> = {
  'hp-percent': compareHpPercent,
  ap: compareAp,
  pp: comparePp,
  'combatant-type': compareCombatantType,
  formation: compareFormation,
  'stat-high': compareStats,
  'stat-low': compareStats,
}
