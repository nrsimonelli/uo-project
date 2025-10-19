import type { BattleContext } from '@/types/battle-engine'

/**
 * Utility functions for tactical evaluators using lookup tables instead of switch statements
 */

// Operator lookup table
const OPERATORS = {
  gt: (value: number, threshold: number) => value > threshold,
  lt: (value: number, threshold: number) => value < threshold,
  gte: (value: number, threshold: number) => value >= threshold,
  lte: (value: number, threshold: number) => value <= threshold,
  eq: (value: number, threshold: number) => value === threshold,
  neq: (value: number, threshold: number) => value !== threshold,
} as const

export const compareWithOperator = (
  value: number,
  threshold: number,
  operator: string
) => {
  const operatorFn = OPERATORS[operator as keyof typeof OPERATORS]
  return operatorFn ? operatorFn(value, threshold) : false
}

export const getHpPercent = (unit: BattleContext) => {
  return (unit.currentHP / unit.combatStats.HP) * 100
}

// Status check lookup table
const STATUS_CHECKERS = {
  Buff: (unit: BattleContext) => unit.buffs.length > 0,
  Debuff: (unit: BattleContext) =>
    unit.debuffs.length > 0 || unit.afflictions.length > 0,
  Afflicted: (unit: BattleContext) => unit.afflictions.length > 0,
  Poisoned: (unit: BattleContext) =>
    unit.afflictions.some(aff => aff.type === 'Poison'),
  Burning: (unit: BattleContext) =>
    unit.afflictions.some(aff => aff.type === 'Burn'),
  Frozen: (unit: BattleContext) =>
    unit.afflictions.some(aff => aff.type === 'Freeze'),
  Stunned: (unit: BattleContext) =>
    unit.afflictions.some(aff => aff.type === 'Stun'),
  Blinded: (unit: BattleContext) =>
    unit.afflictions.some(aff => aff.type === 'Blind'),
  'Passive Sealed': (unit: BattleContext) =>
    unit.afflictions.some(aff => aff.type === 'PassiveSeal'),
  'Guard Sealed': (unit: BattleContext) =>
    unit.afflictions.some(aff => aff.type === 'GuardSeal'),
} as const

export const hasStatus = (unit: BattleContext, statusName: string) => {
  const checker = STATUS_CHECKERS[statusName as keyof typeof STATUS_CHECKERS]
  if (checker) {
    return checker(unit)
  }

  // Fallback for custom status names
  return (
    unit.afflictions.some(aff => aff.name === statusName) ||
    unit.buffs.some(buff => buff.name === statusName) ||
    unit.debuffs.some(debuff => debuff.name === statusName)
  )
}

// Stat value lookup table
const STAT_GETTERS = {
  'Max HP': (unit: BattleContext) => unit.combatStats.HP,
  PATK: (unit: BattleContext) => unit.combatStats.PATK,
  PDEF: (unit: BattleContext) => unit.combatStats.PDEF,
  MATK: (unit: BattleContext) => unit.combatStats.MATK,
  MDEF: (unit: BattleContext) => unit.combatStats.MDEF,
  ACC: (unit: BattleContext) => unit.combatStats.ACC,
  EVA: (unit: BattleContext) => unit.combatStats.EVA,
  CRT: (unit: BattleContext) => unit.combatStats.CRT,
  GRD: (unit: BattleContext) => unit.combatStats.GRD,
  INIT: (unit: BattleContext) => unit.combatStats.INIT,
  'Max AP': () => 4, // Both AP and PP are capped at 4
  'Max PP': () => 4,
} as const

export const getStatValue = (unit: BattleContext, statName: string) => {
  const getter = STAT_GETTERS[statName as keyof typeof STAT_GETTERS]
  if (getter) {
    return getter(unit)
  }

  console.warn(`Unknown stat name: ${statName}`)
  return 0
}

// User condition lookup table
const USER_CONDITION_CHECKERS = {
  self: () => true, // For "User" condition - always true for self
  others: () => false, // For "Other Combatants" condition - false for self
  buffed: (unit: BattleContext) => unit.buffs.length > 0,
  debuffed: (unit: BattleContext) =>
    unit.debuffs.length > 0 || unit.afflictions.length > 0,
} as const

export const evaluateUserCondition = (
  unit: BattleContext,
  userCondition: string
) => {
  const checker =
    USER_CONDITION_CHECKERS[
      userCondition as keyof typeof USER_CONDITION_CHECKERS
    ]
  if (checker) {
    return checker(unit)
  }

  console.warn(`Unknown userCondition: ${userCondition}`)
  return true
}

// Formation type lookup table
const FORMATION_CHECKERS = {
  'front-row': (unit: BattleContext) => unit.position.row === 1,
  'back-row': (unit: BattleContext) => unit.position.row === 0,
  daytime: (
    _unit: BattleContext,
    context?: { battlefield: { isNight: boolean } }
  ) => !(context?.battlefield.isNight ?? false),
  nighttime: (
    _unit: BattleContext,
    context?: { battlefield: { isNight: boolean } }
  ) => context?.battlefield.isNight ?? false,
} as const

export const evaluateBasicFormation = (
  unit: BattleContext,
  formationType: string,
  context?: { battlefield: { isNight: boolean } }
) => {
  const checker =
    FORMATION_CHECKERS[formationType as keyof typeof FORMATION_CHECKERS]
  if (checker) {
    return checker(unit, context)
  }

  return true
}
