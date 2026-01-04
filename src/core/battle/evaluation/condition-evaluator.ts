import { CLASS_DATA } from '@/data/units/class-data'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type {
  Condition,
  EqualityComparator,
  NumericComparator,
} from '@/types/conditions'

export interface ConditionEvaluationContext {
  attacker: BattleContext
  target: BattleContext
  isNight?: boolean
  alliesLiving?: number
  enemiesLiving?: number
  hitResult?: boolean
  targetDefeated?: boolean
  firstHitGuarded?: boolean
  wasCritical?: boolean
  battlefield?: BattlefieldState
}

export const evaluateCondition = (
  condition: Condition,
  context: ConditionEvaluationContext
) => {
  if (condition.kind === 'CombatantType') {
    return evaluateCombatantTypeCondition(condition, context)
  }
  if (condition.kind === 'Stat') {
    return evaluateStatCondition(condition, context)
  }
  if (condition.kind === 'Affliction') {
    return evaluateAfflictionCondition(condition, context)
  }
  if (condition.kind === 'AnyAffliction') {
    return evaluateAnyAfflictionCondition(condition, context)
  }
  if (condition.kind === 'AnyBuff') {
    return evaluateAnyBuffCondition(condition, context)
  }
  if (condition.kind === 'AnyDebuff') {
    return evaluateAnyDebuffCondition(condition, context)
  }
  if (condition.kind === 'Flag') {
    return evaluateFlagCondition(condition, context)
  }
  if (condition.kind === 'HitCheck') {
    return evaluateHitCheckCondition(condition, context)
  }
  if (condition.kind === 'TargetDefeated') {
    return evaluateTargetDefeatedCondition(condition, context)
  }
  if (condition.kind === 'Position') {
    return evaluatePositionCondition(condition, context)
  }
  if (condition.kind === 'FirstHitGuarded') {
    return evaluateFirstHitGuardedCondition(condition, context)
  }
  if (condition.kind === 'WasCritical') {
    return evaluateWasCriticalCondition(condition, context)
  }
  if (condition.kind === 'IsNightCycle') {
    return evaluateNightCycleCondition(condition, context)
  }
  if (condition.kind === 'UnitSize') {
    return evaluateUnitSizeCondition(condition, context)
  }
  if (condition.kind === 'UnitCountDifference') {
    return evaluateUnitCountDifferenceCondition(condition, context)
  }
  if (condition.kind === 'CombatantTypeCountInRow') {
    return evaluateCombatantTypeCountInRowCondition(condition, context)
  }
  // This case should be unreachable since we've handled all condition kinds
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn(`Unknown condition kind: ${(condition as any).kind}`)
  return false
}

export const evaluateAllConditions = (
  conditions: readonly Condition[] | Condition[] = [],
  context: ConditionEvaluationContext
) => {
  if (conditions.length === 0) {
    return true
  }

  return conditions.every(condition => evaluateCondition(condition, context))
}

const getTargetContext = (
  target: 'Self' | 'Ally' | 'Enemy',
  context: ConditionEvaluationContext
): BattleContext => {
  if (target === 'Self') {
    return context.attacker
  }
  if (target === 'Ally') {
    if (context.target && context.target.team === context.attacker.team) {
      return context.target
    }
    return context.attacker
  }
  if (target === 'Enemy') {
    return context.target
  }
  return context.target
}

const evaluateCombatantTypeCondition = (
  condition: Extract<Condition, { kind: 'CombatantType' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const classData = CLASS_DATA[targetContext.unit.classKey]

  if (!classData) {
    console.warn(`Missing class data for ${targetContext.unit.classKey}`)
    return false
  }

  const hasType = targetContext.combatantTypes.includes(condition.combatantType)

  return applyEqualityComparator(hasType, condition.comparator)
}

const evaluateStatCondition = (
  condition: Extract<Condition, { kind: 'Stat' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)

  let currentValue: number
  if (condition.stat === 'HP') {
    currentValue = condition.percent
      ? (targetContext.currentHP / targetContext.combatStats.HP) * 100
      : targetContext.currentHP
  } else if (condition.stat === 'AP') {
    currentValue = targetContext.currentAP
  } else if (condition.stat === 'PP') {
    currentValue = targetContext.currentPP
  } else {
    currentValue = targetContext.combatStats[
      condition.stat as keyof typeof targetContext.combatStats
    ] as number
    if (currentValue === undefined) {
      console.warn(`Unknown stat: ${condition.stat}`)
      return false
    }
  }

  return applyNumericComparator(
    currentValue,
    condition.value,
    condition.comparator
  )
}

const evaluateAfflictionCondition = (
  condition: Extract<Condition, { kind: 'Affliction' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasAffliction = targetContext.afflictions.some(
    affliction => affliction.type === condition.affliction
  )

  return applyEqualityComparator(hasAffliction, condition.comparator)
}

const evaluateAnyAfflictionCondition = (
  condition: Extract<Condition, { kind: 'AnyAffliction' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasAnyAffliction = targetContext.afflictions.length > 0

  return applyEqualityComparator(hasAnyAffliction, condition.comparator)
}

const evaluateAnyBuffCondition = (
  condition: Extract<Condition, { kind: 'AnyBuff' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasAnyBuff = targetContext.buffs.length > 0

  return applyEqualityComparator(hasAnyBuff, condition.comparator)
}

const evaluateAnyDebuffCondition = (
  condition: Extract<Condition, { kind: 'AnyDebuff' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasAnyDebuff = targetContext.debuffs.length > 0

  return applyEqualityComparator(hasAnyDebuff, condition.comparator)
}

const evaluateFlagCondition = (
  condition: Extract<Condition, { kind: 'Flag' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasFlag = targetContext.flags.includes(condition.flag)

  return applyEqualityComparator(hasFlag, condition.comparator)
}

const evaluateHitCheckCondition = (
  condition: Extract<Condition, { kind: 'HitCheck' }>,
  context: ConditionEvaluationContext
) => {
  const hitResult = context.hitResult ?? false
  return applyEqualityComparator(
    hitResult,
    condition.comparator,
    condition.value
  )
}

const evaluateTargetDefeatedCondition = (
  condition: Extract<Condition, { kind: 'TargetDefeated' }>,
  context: ConditionEvaluationContext
) => {
  const targetDefeated = context.targetDefeated ?? false
  return applyEqualityComparator(
    targetDefeated,
    condition.comparator,
    condition.value
  )
}

const evaluatePositionCondition = (
  condition: Extract<Condition, { kind: 'Position' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const actualRow = targetContext.position.row
  const expectedRow = condition.row

  return applyEqualityComparator(
    actualRow === expectedRow,
    condition.comparator
  )
}

const evaluateFirstHitGuardedCondition = (
  condition: Extract<Condition, { kind: 'FirstHitGuarded' }>,
  context: ConditionEvaluationContext
) => {
  const firstHitGuarded = context.firstHitGuarded ?? false
  return applyEqualityComparator(
    firstHitGuarded,
    condition.comparator,
    condition.value
  )
}

const evaluateWasCriticalCondition = (
  condition: Extract<Condition, { kind: 'WasCritical' }>,
  context: ConditionEvaluationContext
) => {
  const wasCritical = context.wasCritical ?? false
  return applyEqualityComparator(
    wasCritical,
    condition.comparator,
    condition.value
  )
}

const evaluateNightCycleCondition = (
  condition: Extract<Condition, { kind: 'IsNightCycle' }>,
  context: ConditionEvaluationContext
) => {
  const isNight = Boolean(context.isNight)
  return applyEqualityComparator(isNight, condition.comparator, condition.value)
}

const evaluateUnitSizeCondition = (
  condition: Extract<Condition, { kind: 'UnitSize' }>,
  context: ConditionEvaluationContext
) => {
  const isEnemyTarget = condition.target === 'Enemy'
  const count = isEnemyTarget
    ? (context.enemiesLiving ?? 0)
    : (context.alliesLiving ?? 0)

  return applyNumericComparator(count, condition.value, condition.comparator)
}

const evaluateUnitCountDifferenceCondition = (
  condition: Extract<Condition, { kind: 'UnitCountDifference' }>,
  context: ConditionEvaluationContext
) => {
  const enemiesCount = context.enemiesLiving ?? 0
  const alliesCount = context.alliesLiving ?? 0
  const difference = enemiesCount - alliesCount

  return applyNumericComparator(
    difference,
    condition.value,
    condition.comparator
  )
}

const evaluateCombatantTypeCountInRowCondition = (
  condition: Extract<Condition, { kind: 'CombatantTypeCountInRow' }>,
  context: ConditionEvaluationContext
) => {
  if (!context.battlefield) {
    console.warn(
      'CombatantTypeCountInRow condition requires battlefield context'
    )
    return false
  }

  const referenceUnit = getTargetContext(condition.target, context)
  const referenceRow = referenceUnit.position.row
  const referenceTeam = referenceUnit.team

  let count = 0
  for (const unit of Object.values(context.battlefield.units)) {
    if (unit.team !== referenceTeam) continue
    if (unit.position.row !== referenceRow) continue
    if (unit.currentHP <= 0) continue
    if (unit.combatantTypes.includes(condition.combatantType)) {
      count++
    }
  }

  return applyNumericComparator(count, condition.value, condition.comparator)
}

const applyEqualityComparator = (
  actualValue: boolean,
  comparator: EqualityComparator,
  expectedValue?: boolean
) => {
  const expected = expectedValue ?? true

  if (comparator === 'EqualTo') {
    return actualValue === expected
  }
  if (comparator === 'NotEqualTo') {
    return actualValue !== expected
  }
  console.warn(`Unknown equality comparator: ${comparator}`)
  return false
}

const applyNumericComparator = (
  actualValue: number,
  expectedValue: number,
  comparator: NumericComparator
) => {
  if (comparator === 'EqualTo') {
    return actualValue === expectedValue
  }
  if (comparator === 'NotEqualTo') {
    return actualValue !== expectedValue
  }
  if (comparator === 'GreaterThan') {
    return actualValue > expectedValue
  }
  if (comparator === 'LessThan') {
    return actualValue < expectedValue
  }
  if (comparator === 'GreaterOrEqual') {
    return actualValue >= expectedValue
  }
  if (comparator === 'LessOrEqual') {
    return actualValue <= expectedValue
  }
  console.warn(`Unknown numeric comparator: ${comparator}`)
  return false
}
