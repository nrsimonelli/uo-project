import {
  compareWithOperator,
  getHpPercent,
  hasStatus,
  getStatValue,
  evaluateUserCondition,
  evaluateBasicFormation,
} from '@/core/tactical-utils'
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

    // Handle Full Column condition
    if (metadata.formationType === 'full-column') {
      // For Full Column, check if this target's column has multiple units
      const targetColumn = target.position.col
      const unitsInSameColumn = targets.filter(
        unit => unit.position.col === targetColumn
      )

      // In a 2x3 grid, a "full column" means 2 units in the same column
      const isFullColumn = unitsInSameColumn.length >= 2

      console.debug(`🎯 Full Column check for ${target.unit.name}:`, {
        targetColumn,
        unitsInColumn: unitsInSameColumn.map(u => ({
          name: u.unit.name,
          pos: u.position,
        })),
        isFullColumn,
        result: isFullColumn ? 'INCLUDE' : 'EXCLUDE',
      })

      if (!isFullColumn) {
        // If this column is not full, exclude ALL targets from this column
        // This ensures the skill is only used when there's actually a full column available
        return false
      }

      // Only return targets that are in a full column
      return true
    }

    // Handle Row with specific combatant count conditions
    if (metadata.formationType === 'min-combatants') {
      // For "Row with X+ Combatants", check if this target's row has enough units
      const targetRow = target.position.row
      const unitsInSameRow = targets.filter(
        unit => unit.position.row === targetRow
      )

      const hasEnoughCombatants =
        unitsInSameRow.length >= metadata.minCombatants!

      console.debug(
        `🎯 Row with ${metadata.minCombatants}+ check for ${target.unit.name}:`,
        {
          targetRow,
          unitsInRow: unitsInSameRow.map(u => ({
            name: u.unit.name,
            pos: u.position,
          })),
          count: unitsInSameRow.length,
          required: metadata.minCombatants,
          hasEnoughCombatants,
          result: hasEnoughCombatants ? 'INCLUDE' : 'EXCLUDE',
        }
      )

      return hasEnoughCombatants
    }

    // Handle "Row with Most Combatants"
    if (metadata.formationType === 'most-combatants') {
      // Find the row with the most units
      const rowCounts = new Map<number, number>()
      targets.forEach(unit => {
        const row = unit.position.row
        rowCounts.set(row, (rowCounts.get(row) || 0) + 1)
      })

      const maxCount = Math.max(...rowCounts.values())
      const targetRow = target.position.row
      const targetRowCount = rowCounts.get(targetRow) || 0
      const isMaxRow = targetRowCount === maxCount

      console.debug(
        `🎯 Row with Most Combatants check for ${target.unit.name}:`,
        {
          targetRow,
          targetRowCount,
          maxCount,
          allRowCounts: Object.fromEntries(rowCounts),
          isMaxRow,
          result: isMaxRow ? 'INCLUDE' : 'EXCLUDE',
        }
      )

      return isMaxRow
    }

    // Handle "Row with Least Combatants"
    if (metadata.formationType === 'least-combatants') {
      // Find the row with the fewest units
      const rowCounts = new Map<number, number>()
      targets.forEach(unit => {
        const row = unit.position.row
        rowCounts.set(row, (rowCounts.get(row) || 0) + 1)
      })

      const minCount = Math.min(...rowCounts.values())
      const targetRow = target.position.row
      const targetRowCount = rowCounts.get(targetRow) || 0
      const isMinRow = targetRowCount === minCount

      console.debug(
        `🎯 Row with Least Combatants check for ${target.unit.name}:`,
        {
          targetRow,
          targetRowCount,
          minCount,
          allRowCounts: Object.fromEntries(rowCounts),
          isMinRow,
          result: isMinRow ? 'INCLUDE' : 'EXCLUDE',
        }
      )

      return isMinRow
    }

    // Handle other advanced formation types (placeholder for future implementation)
    console.warn(`Unimplemented formation type: ${metadata.formationType}`)
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

const filterUnitCount: FilterEvaluator = (targets, metadata, context) => {
  const targetUnits =
    metadata.unitTarget === 'allies' ? context.allAllies : context.allEnemies
  const unitCount = targetUnits.length

  const meetsCondition = compareWithOperator(
    unitCount,
    metadata.threshold!,
    metadata.operator!
  )

  // If the condition is met, return all targets; otherwise return empty array
  return meetsCondition ? targets : []
}

const filterEnemyPresence: FilterEvaluator = (targets, metadata, context) => {
  const hasEnemyType = context.allEnemies.some(enemy =>
    enemy.combatantTypes.includes(metadata.combatantType!)
  )

  const shouldIncludeTargets = metadata.negated ? !hasEnemyType : hasEnemyType

  // If the presence condition is met, return all targets; otherwise return empty array
  return shouldIncludeTargets ? targets : []
}

const filterAttackHistory: FilterEvaluator = (targets, metadata, context) => {
  const recentActions = context.battlefield.actionHistory.slice(-10) // Increased window

  return targets.filter(target => {
    if (
      metadata.attackType === 'physical' ||
      metadata.attackType === 'magical'
    ) {
      // TODO: Filter by attack type - requires skill lookup from skillId
      // For now, treat as basic attack history check
      return recentActions.some(action =>
        action.targetIds.includes(target.unit.id)
      )
    } else if (metadata.attackType === 'row') {
      // Check if target's row was attacked
      return recentActions.some(action =>
        action.targetIds.some(targetId => {
          const attackedUnit = Object.values(context.battlefield.units).find(
            u => u.unit.id === targetId
          )
          return (
            attackedUnit && attackedUnit.position.row === target.position.row
          )
        })
      )
    } else if (metadata.attackType === 'column') {
      // Check if target's column was attacked
      return recentActions.some(action =>
        action.targetIds.some(targetId => {
          const attackedUnit = Object.values(context.battlefield.units).find(
            u => u.unit.id === targetId
          )
          return (
            attackedUnit && attackedUnit.position.col === target.position.col
          )
        })
      )
    } else if (metadata.attackType === 'all-allies') {
      // Check if all allies were attacked in recent history
      const allAlliesAttacked = context.allAllies.every(ally =>
        recentActions.some(action => action.targetIds.includes(ally.unit.id))
      )
      return allAlliesAttacked ? targets : []
    } else if (metadata.attackType === 'by-type') {
      // Check if attacked by specific combatant type
      return recentActions.some(action => {
        if (action.targetIds.includes(target.unit.id)) {
          const attacker = Object.values(context.battlefield.units).find(
            u => u.unit.id === action.unitId
          )
          return attacker?.combatantTypes.includes(metadata.combatantType!)
        }
        return false
      })
    } else {
      // Fallback: basic attack history check
      return recentActions.some(action =>
        action.targetIds.includes(target.unit.id)
      )
    }
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

const sortUnitCount: SortEvaluator = (
  targets,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _metadata,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context
) => {
  // Sort targets based on unit count conditions
  // This is mainly a pass-through since unit count affects the entire target pool
  return targets
}

const sortEnemyPresence: SortEvaluator = (
  targets,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _metadata,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context
) => {
  // Sort targets based on enemy presence
  // This is mainly a pass-through since enemy presence affects the entire battlefield
  return targets
}

const sortAttackHistory: SortEvaluator = (targets, metadata, context) => {
  const recentActions = context.battlefield.actionHistory.slice(-10)

  return [...targets].sort((a, b) => {
    const aRecentlyAttacked = recentActions.some(action =>
      action.targetIds.includes(a.unit.id)
    )
    const bRecentlyAttacked = recentActions.some(action =>
      action.targetIds.includes(b.unit.id)
    )

    // Prioritize recently attacked units
    if (aRecentlyAttacked && !bRecentlyAttacked) return -1
    if (!aRecentlyAttacked && bRecentlyAttacked) return 1
    return 0
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

const compareUnitCount: CompareEvaluator = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _a,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _b,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _metadata,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context
) => {
  // Unit count comparison doesn't really apply at the individual target level
  return 0
}

const compareEnemyPresence: CompareEvaluator = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _a,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _b,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _metadata,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context
) => {
  // Enemy presence comparison doesn't really apply at the individual target level
  return 0
}

const compareAttackHistory: CompareEvaluator = (a, b, metadata, context) => {
  const recentActions = context.battlefield.actionHistory.slice(-10)

  const aRecentlyAttacked = recentActions.some(action =>
    action.targetIds.includes(a.unit.id)
  )
  const bRecentlyAttacked = recentActions.some(action =>
    action.targetIds.includes(b.unit.id)
  )

  // Prioritize recently attacked units
  if (aRecentlyAttacked && !bRecentlyAttacked) return -1
  if (!aRecentlyAttacked && bRecentlyAttacked) return 1
  return 0
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
  'unit-count': filterUnitCount,
  'enemy-presence': filterEnemyPresence,
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
  'unit-count': sortUnitCount,
  'enemy-presence': sortEnemyPresence,
  'attack-history': sortAttackHistory,
}

export const COMPARE_EVALUATORS: Record<string, CompareEvaluator> = {
  'hp-percent': compareHpPercent,
  ap: compareAp,
  pp: comparePp,
  'combatant-type': compareCombatantType,
  formation: compareFormation,
  'stat-high': compareStats,
  'stat-low': compareStats,
  'unit-count': compareUnitCount,
  'enemy-presence': compareEnemyPresence,
  'attack-history': compareAttackHistory,
}
