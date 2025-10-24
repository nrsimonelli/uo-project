import { CLASS_DATA } from '@/data/units/class-data'
import type { BattleContext } from '@/types/battle-engine'
import type {
  Condition,
  EqualityComparator,
  NumericComparator,
} from '@/types/conditions'

/**
 * Context for evaluating conditions during battle
 */
export interface ConditionEvaluationContext {
  attacker: BattleContext
  target: BattleContext
  hitResult?: boolean
  targetDefeated?: boolean
  firstHitGuarded?: boolean
}

/**
 * Main condition evaluation function
 * Returns true if the condition is met, false otherwise
 */
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
  if (condition.kind === 'IsNightCycle') {
    return evaluateNightCycleCondition(condition, context)
  }
  if (condition.kind === 'UnitSize') {
    return evaluateUnitSizeCondition(condition, context)
  }
  // This case should be unreachable since we've handled all condition kinds
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn(`Unknown condition kind: ${(condition as any).kind}`)
  return false
}

/**
 * Evaluate all conditions in an array (AND logic)
 * Returns true only if ALL conditions are met
 */
export const evaluateAllConditions = (
  conditions: Condition[] = [],
  context: ConditionEvaluationContext
) => {
  if (conditions.length === 0) {
    return true // No conditions = always true
  }

  return conditions.every(condition => evaluateCondition(condition, context))
}

/**
 * Get the battle context for a specific target
 */
const getTargetContext = (
  target: 'Self' | 'Ally' | 'Enemy',
  context: ConditionEvaluationContext
): BattleContext => {
  if (target === 'Self') {
    return context.attacker
  }
  if (target === 'Ally') {
    return context.attacker // For now, treat as self (could be enhanced for ally targeting)
  }
  if (target === 'Enemy') {
    return context.target
  }
  return context.target
}

/**
 * Evaluate combatant type conditions (e.g., "target is Armored")
 */
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

  // Check if the target has the specified combatant type
  const hasType = targetContext.combatantTypes.includes(condition.combatantType)

  return applyEqualityComparator(hasType, condition.comparator)
}

/**
 * Evaluate stat conditions (e.g., "target HP > 50%")
 */
const evaluateStatCondition = (
  condition: Extract<Condition, { kind: 'Stat' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)

  // Get current stat value
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
    // Other stats from combatStats
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

/**
 * Evaluate affliction conditions (e.g., "target is Poisoned")
 */
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

/**
 * Evaluate any affliction conditions (e.g., "target has any affliction")
 */
const evaluateAnyAfflictionCondition = (
  condition: Extract<Condition, { kind: 'AnyAffliction' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasAnyAffliction = targetContext.afflictions.length > 0

  return applyEqualityComparator(hasAnyAffliction, condition.comparator)
}

/**
 * Evaluate any buff conditions (e.g., "target has any buff")
 */
const evaluateAnyBuffCondition = (
  condition: Extract<Condition, { kind: 'AnyBuff' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasAnyBuff = targetContext.buffs.length > 0

  return applyEqualityComparator(hasAnyBuff, condition.comparator)
}

/**
 * Evaluate any debuff conditions (e.g., "target has any debuff")
 */
const evaluateAnyDebuffCondition = (
  condition: Extract<Condition, { kind: 'AnyDebuff' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasAnyDebuff = targetContext.debuffs.length > 0

  return applyEqualityComparator(hasAnyDebuff, condition.comparator)
}

/**
 * Evaluate flag conditions (e.g., "has TrueStrike flag")
 */
const evaluateFlagCondition = (
  condition: Extract<Condition, { kind: 'Flag' }>,
  context: ConditionEvaluationContext
) => {
  const targetContext = getTargetContext(condition.target, context)
  const hasFlag = targetContext.flags.includes(condition.flag)

  return applyEqualityComparator(hasFlag, condition.comparator)
}

/**
 * Evaluate hit check conditions (e.g., "attack hit")
 */
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

/**
 * Evaluate target defeated conditions (e.g., "target was defeated")
 */
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

/**
 * Evaluate position conditions (e.g., "user is in front row")
 */
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

/**
 * Evaluate first hit guarded conditions (e.g., "first hit was not guarded")
 */
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

// TODO: Day/Night Cycle
const evaluateNightCycleCondition = (
  condition: Extract<Condition, { kind: 'IsNightCycle' }>,
  context: ConditionEvaluationContext
) => {
  // TODO need to get access to "isNight" from BattlefieldState...
  const isNight = true
  return applyEqualityComparator(isNight, condition.comparator, condition.value)
}

// TODO: number of enemies remaining (Decimate)
const evaluateUnitSizeCondition = (
  condition: Extract<Condition, { kind: 'UnitSize' }>,
  context: ConditionEvaluationContext
) => {
  // TODO target -> num living members
  return applyNumericComparator(_, condition.value, condition.comparator)
}

/**
 * Apply equality comparator (EqualTo, NotEqualTo)
 */
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

/**
 * Apply numeric comparator (GreaterThan, LessThan, etc.)
 */
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
