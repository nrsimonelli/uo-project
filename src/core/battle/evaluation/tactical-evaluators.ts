import { getDamageType, isDamageSkill } from '@/core/attack-types'
import {
  compareWithOperator,
  getHpPercent,
  hasStatus,
  getStatValue,
  evaluateUserCondition,
  evaluateBasicFormation,
} from '@/core/tactical-utils'
import type { ConditionMetadata } from '@/data/tactics/tactic-condition-meta'
import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { DamageEffect } from '@/types/effects'
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
  if (metadata.actionNumber === undefined) {
    console.error('metadata actionNumber is undefined', metadata)
    return false
  }
  const unitActionCount = context.battlefield.actionHistory.filter(
    action => action.unitId === context.actingUnit.unit.id
  ).length
  const expectedActionNumber = metadata.actionNumber
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
      // Look up skill from action history and check damage type
      return recentActions.some(action => {
        if (!action.targetIds.includes(target.unit.id)) {
          return false
        }

        // Look up the skill used in this action
        const skill =
          ActiveSkillsMap[action.skillId as keyof typeof ActiveSkillsMap] ||
          PassiveSkillsMap[action.skillId as keyof typeof PassiveSkillsMap]

        if (!skill) {
          // Skill not found - fallback to basic check
          return true
        }

        // Check if skill has damage effects
        if (!isDamageSkill(skill.skillCategories)) {
          return false
        }

        // Find damage effects in the skill
        const damageEffects = skill.effects.filter(
          (effect): effect is DamageEffect => effect.kind === 'Damage'
        )

        if (damageEffects.length === 0) {
          return false
        }

        // Check if any damage effect matches the attack type
        for (const damageEffect of damageEffects) {
          const damageType = getDamageType(damageEffect)

          if (metadata.attackType === 'physical') {
            // Physical attack: check for Physical or Hybrid damage
            if (damageType === 'Physical' || damageType === 'Hybrid') {
              return true
            }
          } else if (metadata.attackType === 'magical') {
            // Magical attack: check for Magical or Hybrid damage
            if (damageType === 'Magical' || damageType === 'Hybrid') {
              return true
            }
          }
        }

        return false
      })
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
const sortHpRaw: SortEvaluator = (targets, metadata) => {
  const conditionKey = metadata.conditionKey || ''
  const statName = metadata.statName || ''
  const isHighestHp =
    conditionKey.includes('Highest') || statName.includes('Highest')

  return [...targets].sort((a, b) => {
    if (isHighestHp) {
      return b.currentHP - a.currentHP // Descending (highest first)
    } else {
      return a.currentHP - b.currentHP // Ascending (lowest first)
    }
  })
}

const sortHpPercent: SortEvaluator = (targets, metadata) => {
  const conditionKey = metadata.conditionKey || ''
  const statName = metadata.statName || ''
  const isHighestHp =
    conditionKey.includes('Highest') || statName.includes('Highest')

  return [...targets].sort((a, b) => {
    const aPercent = getHpPercent(a)
    const bPercent = getHpPercent(b)

    if (isHighestHp) {
      return bPercent - aPercent // Descending (highest first)
    } else {
      return aPercent - bPercent // Ascending (lowest first)
    }
  })
}

const sortAp: SortEvaluator = (targets, metadata) => {
  const conditionKey = metadata.conditionKey || ''
  const statName = metadata.statName || ''
  const isMostAp = conditionKey.includes('Most') || statName.includes('Most')
  const isLeastAp = conditionKey.includes('Least') || statName.includes('Least')

  return [...targets].sort((a, b) => {
    if (isMostAp) {
      return b.currentAP - a.currentAP // Descending (most first)
    } else if (isLeastAp) {
      return a.currentAP - b.currentAP // Ascending (least first)
    } else {
      return a.currentAP - b.currentAP // Default to ascending
    }
  })
}

const sortPp: SortEvaluator = (targets, metadata) => {
  const conditionKey = metadata.conditionKey || ''
  const statName = metadata.statName || ''
  const isMostPp = conditionKey.includes('Most') || statName.includes('Most')
  const isLeastPp = conditionKey.includes('Least') || statName.includes('Least')

  return [...targets].sort((a, b) => {
    if (isMostPp) {
      return b.currentPP - a.currentPP // Descending (most first)
    } else if (isLeastPp) {
      return a.currentPP - b.currentPP // Ascending (least first)
    } else {
      return a.currentPP - b.currentPP // Default to ascending
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
  const rowCounts = {
    frontRow: 0,
    backRow: 0,
  }

  for (const target of targets) {
    if (target.position.row === 1) {
      rowCounts.frontRow += 1
    }
    if (target.position.row === 0) {
      rowCounts.backRow += 1
    }
  }

  const largestRow =
    rowCounts.frontRow < rowCounts.backRow ? 'back-row' : 'front-row'

  return [...targets].sort((a, b) => {
    if (metadata.formationType === 'front-row') {
      return b.position.row - a.position.row // Front row (1) comes before back row (0)
    }
    if (metadata.formationType === 'back-row') {
      return a.position.row - b.position.row // Back row (0) comes before front row (1)
    }
    if (metadata.formationType === 'most-combatants') {
      if (largestRow === 'back-row') {
        return a.position.row - b.position.row // Back row (0) comes before front row (1)
      } else {
        return b.position.row - a.position.row // Front row (1) comes before back row (0)
      }
    }
    if (metadata.formationType === 'least-combatants') {
      if (largestRow === 'front-row') {
        return a.position.row - b.position.row // Back row (0) comes before front row (1)
      } else {
        return b.position.row - a.position.row // Front row (1) comes before back row (0)
      }
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

const sortAttackHistory: SortEvaluator = (targets, _metadata, context) => {
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

  // Check the original condition key to determine comparison direction
  const conditionKey = metadata.conditionKey || ''
  const isHighestHp = conditionKey.includes('Highest')

  if (isHighestHp) {
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

const compareHpRaw: CompareEvaluator = (a, b, metadata) => {
  const conditionKey = metadata.conditionKey || ''
  const isHighestHp = conditionKey.includes('Highest')

  if (isHighestHp) {
    return b.currentHP - a.currentHP
  } else {
    return a.currentHP - b.currentHP
  }
}

const compareHpAverage: CompareEvaluator = (a, b, metadata, context) => {
  // Get average HP for target groups
  const aGroup =
    a.team === context.actingUnit.team ? context.allAllies : context.allEnemies
  const bGroup =
    b.team === context.actingUnit.team ? context.allAllies : context.allEnemies

  const aTotalHpPercent = aGroup.reduce((sum, unit) => {
    return sum + getHpPercent(unit)
  }, 0)
  const bTotalHpPercent = bGroup.reduce((sum, unit) => {
    return sum + getHpPercent(unit)
  }, 0)

  const aAverageHpPercent =
    aGroup.length > 0 ? aTotalHpPercent / aGroup.length : 0
  const bAverageHpPercent =
    bGroup.length > 0 ? bTotalHpPercent / bGroup.length : 0

  // For average HP filters, we compare based on whether they meet the threshold
  // Since this is used for tie-breaking, we just compare the averages
  const operator = metadata.operator || 'gt'

  // If operator is >, higher average is better; if <, lower average is better
  if (operator === 'gt' || operator === 'gte') {
    return bAverageHpPercent - aAverageHpPercent
  } else {
    return aAverageHpPercent - bAverageHpPercent
  }
}

const compareStatus: CompareEvaluator = (a, b, metadata) => {
  const statusName = metadata.statusName!
  const aHasStatus = hasStatus(a, statusName)
  const bHasStatus = hasStatus(b, statusName)

  if (aHasStatus && !bHasStatus) return -1
  if (!aHasStatus && bHasStatus) return 1
  return 0
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

const compareAttackHistory: CompareEvaluator = (a, b, _metadata, context) => {
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
// EVALUATOR REGISTRY
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
  'hp-raw': sortHpRaw,
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
  'hp-raw': compareHpRaw,
  'hp-percent': compareHpPercent,
  'hp-average': compareHpAverage,
  ap: compareAp,
  pp: comparePp,
  'combatant-type': compareCombatantType,
  status: compareStatus,
  formation: compareFormation,
  'stat-high': compareStats,
  'stat-low': compareStats,
  'unit-count': compareUnitCount,
  'enemy-presence': compareEnemyPresence,
  'attack-history': compareAttackHistory,
}
