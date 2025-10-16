import type { EffectProcessingResult } from './effect-processor'

import { calculateBaseStats } from '@/core/calculations/base-stats'
import { calculateEquipmentBonus } from '@/core/calculations/equipment-bonuses'
import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { StatKey } from '@/types/base-stats'
import type { BattleContext, Buff, Debuff } from '@/types/battle-engine'

/**
 * Get skill name from skillId for both active and passive skills
 */
const getSkillName = (skillId: string): string => {
  const activeSkill = ActiveSkillsMap[skillId as keyof typeof ActiveSkillsMap]
  if (activeSkill) return activeSkill.name

  const passiveSkill =
    PassiveSkillsMap[skillId as keyof typeof PassiveSkillsMap]
  if (passiveSkill) return passiveSkill.name

  return skillId // Fallback to skillId if skill not found
}

/**
 * Apply processed effects from skill execution to battle contexts
 */
export const applyStatusEffects = (
  effectResults: EffectProcessingResult,
  attacker: BattleContext,
  targets: BattleContext[]
): void => {
  const unitsToRecalculate = new Set<BattleContext>()

  // Apply buffs to appropriate targets
  effectResults.buffsToApply.forEach(buffToApply => {
    const targetUnit = buffToApply.target === 'User' ? attacker : targets[0]
    if (!targetUnit) return

    const skillName = getSkillName(buffToApply.skillId)
    const buff: Buff = {
      name: `${skillName} (+${buffToApply.stat})`,
      stat: buffToApply.stat as StatKey,
      value: buffToApply.value,
      duration: mapDuration(buffToApply.duration),
      scaling: buffToApply.scaling,
      source: attacker.unit.id,
      skillId: buffToApply.skillId,
    }

    applyBuff(targetUnit, buff, buffToApply.stacks)
    unitsToRecalculate.add(targetUnit)
  })

  // Apply debuffs to appropriate targets
  effectResults.debuffsToApply.forEach(debuffToApply => {
    const targetUnit = debuffToApply.target === 'User' ? attacker : targets[0]
    if (!targetUnit) return

    // Remove expired buffs that trigger on debuff application
    removeExpiredBuffs(targetUnit, 'debuff')

    const skillName = getSkillName(debuffToApply.skillId)
    const debuff: Debuff = {
      name: `${skillName} (-${debuffToApply.stat})`,
      stat: debuffToApply.stat as StatKey,
      value: debuffToApply.value,
      duration: mapDuration(debuffToApply.duration) as
        | 'indefinite'
        | 'next-attack',
      scaling: debuffToApply.scaling,
      source: attacker.unit.id,
      skillId: debuffToApply.skillId,
    }

    applyDebuff(targetUnit, debuff, debuffToApply.stacks)
    unitsToRecalculate.add(targetUnit)
  })

  // Recalculate stats for all affected units
  unitsToRecalculate.forEach(unit => {
    recalculateStats(unit)
  })
}

/**
 * Apply a buff to a unit with stacking logic
 */
const applyBuff = (
  unit: BattleContext,
  newBuff: Buff,
  allowStacks: boolean
): void => {
  // Check for existing effect with same skillId
  const existingIndex = unit.buffs.findIndex(
    existing => existing.skillId === newBuff.skillId
  )

  if (existingIndex !== -1 && !allowStacks) {
    // Replace existing buff from same skill (no stacking)
    unit.buffs[existingIndex] = newBuff
  } else {
    // Add new buff (either no existing buff or stacking is allowed)
    unit.buffs.push(newBuff)
  }
}

/**
 * Apply a debuff to a unit with stacking logic
 */
const applyDebuff = (
  unit: BattleContext,
  newDebuff: Debuff,
  allowStacks: boolean
): void => {
  // Check immunity before applying
  if (isImmuneToDebuff(unit)) {
    console.log(`${unit.unit.name} is immune to ${newDebuff.name}`)
    return
  }

  // Check for existing effect with same skillId
  const existingIndex = unit.debuffs.findIndex(
    existing => existing.skillId === newDebuff.skillId
  )

  if (existingIndex !== -1 && !allowStacks) {
    // Replace existing debuff from same skill (no stacking)
    unit.debuffs[existingIndex] = newDebuff
  } else {
    // Add new debuff (either no existing debuff or stacking is allowed)
    unit.debuffs.push(newDebuff)
  }
}

/**
 * Check if a unit is immune to a specific debuff
 */
const isImmuneToDebuff = (unit: BattleContext): boolean => {
  return unit.immunities.some(immunity => {
    if (immunity === 'Debuff') return true
    // TODO: Add more specific immunity checks
    return false
  })
}

/**
 * Map effect processor duration format to battle engine duration format
 */
const mapDuration = (
  duration?: 'NextAction'
): 'indefinite' | 'next-attack' | 'next-debuff' => {
  if (duration === 'NextAction') {
    return 'next-attack'
  }
  // Default duration is indefinite
  return 'indefinite'
}

/**
 * Remove expired buffs from a unit based on trigger conditions
 */
export const removeExpiredBuffs = (
  unit: BattleContext,
  trigger: 'attack' | 'debuff'
): void => {
  const initialCount = unit.buffs.length

  if (trigger === 'attack') {
    unit.buffs = unit.buffs.filter(buff => buff.duration !== 'next-attack')
  } else if (trigger === 'debuff') {
    unit.buffs = unit.buffs.filter(buff => buff.duration !== 'next-debuff')
  }

  // Recalculate stats if any buffs were removed
  if (unit.buffs.length !== initialCount) {
    recalculateStats(unit)
  }
}

/**
 * Remove expired debuffs from a unit based on trigger conditions
 */
export const removeExpiredDebuffs = (
  unit: BattleContext,
  trigger: 'attack'
): void => {
  const initialCount = unit.debuffs.length

  if (trigger === 'attack') {
    unit.debuffs = unit.debuffs.filter(
      debuff => debuff.duration !== 'next-attack'
    )
  }

  // Recalculate stats if any debuffs were removed
  if (unit.debuffs.length !== initialCount) {
    recalculateStats(unit)
  }
}

/**
 * Get all buffs affecting a specific stat
 */
export const getBuffsForStat = (unit: BattleContext, stat: StatKey): Buff[] => {
  return unit.buffs.filter(buff => buff.stat === stat)
}

/**
 * Get all debuffs affecting a specific stat
 */
export const getDebuffsForStat = (
  unit: BattleContext,
  stat: StatKey
): Debuff[] => {
  return unit.debuffs.filter(debuff => debuff.stat === stat)
}

/**
 * Calculate the total modifier for a stat from all active buffs and debuffs
 */
export const calculateStatModifier = (
  unit: BattleContext,
  stat: StatKey
): {
  flatModifier: number
  percentModifier: number
} => {
  const buffs = getBuffsForStat(unit, stat)
  const debuffs = getDebuffsForStat(unit, stat)

  let flatModifier = 0
  let percentModifier = 0

  // Apply buffs
  buffs.forEach(buff => {
    if (buff.scaling === 'flat') {
      flatModifier += buff.value
    } else if (buff.scaling === 'percent') {
      percentModifier += buff.value
    }
  })

  // Apply debuffs (subtract since they're negative effects)
  debuffs.forEach(debuff => {
    if (debuff.scaling === 'flat') {
      flatModifier -= debuff.value
    } else if (debuff.scaling === 'percent') {
      percentModifier -= debuff.value
    }
  })

  return { flatModifier, percentModifier }
}

/**
 * Check if a unit has any buffs
 */
export const hasBuffs = (unit: BattleContext): boolean => {
  return unit.buffs.length > 0
}

/**
 * Check if a unit has any debuffs
 */
export const hasDebuffs = (unit: BattleContext): boolean => {
  return unit.debuffs.length > 0
}

/**
 * Check if a unit has a specific affliction
 */
export const hasAffliction = (
  unit: BattleContext,
  afflictionType: string
): boolean => {
  return unit.afflictions.some(affliction => affliction.type === afflictionType)
}

/**
 * Store the base + equipment stats foundation on the unit for efficient recalculation
 * This should be called once when the BattleContext is created
 */
export const initializeStatFoundation = (unit: BattleContext): void => {
  const baseStats = calculateBaseStats(
    unit.unit.level,
    unit.unit.classKey,
    unit.unit.growths
  )
  const equipmentBonus = calculateEquipmentBonus(
    unit.unit.equipment,
    baseStats,
    unit.unit.classKey
  )

  // Store the foundation (base + equipment) for efficient recalculation
  unit.statFoundation = {
    HP: baseStats.HP + (equipmentBonus.HP ?? 0),
    PATK: baseStats.PATK + (equipmentBonus.PATK ?? 0),
    PDEF: baseStats.PDEF + (equipmentBonus.PDEF ?? 0),
    MATK: baseStats.MATK + (equipmentBonus.MATK ?? 0),
    MDEF: baseStats.MDEF + (equipmentBonus.MDEF ?? 0),
    ACC: baseStats.ACC + (equipmentBonus.ACC ?? 0),
    EVA: baseStats.EVA + (equipmentBonus.EVA ?? 0),
    CRT: baseStats.CRT + (equipmentBonus.CRT ?? 0),
    GRD: baseStats.GRD + (equipmentBonus.GRD ?? 0),
    INIT: baseStats.INIT + (equipmentBonus.INIT ?? 0),
    GuardEff: equipmentBonus.GuardEff ?? 0,
  }

  // Initialize combatStats to foundation values
  recalculateStats(unit)
}

/**
 * Recalculate a unit's combat stats by applying buffs/debuffs to the stored foundation
 * Uses additive percentage scaling: multiple percentage modifiers are summed together
 */
export const recalculateStats = (unit: BattleContext): void => {
  // Get the stored foundation (base + equipment)
  const foundation = unit.statFoundation

  // Apply modifiers to each stat
  const statKeys = [
    'HP',
    'PATK',
    'PDEF',
    'MATK',
    'MDEF',
    'ACC',
    'EVA',
    'CRT',
    'GRD',
    'INIT',
  ] as const

  for (const statKey of statKeys) {
    const foundationValue = foundation[statKey]
    const modifiers = calculateStatModifier(unit, statKey)

    // Apply flat modifier first
    const afterFlat = foundationValue + modifiers.flatModifier

    // Apply percentage modifier (additive: 15% + 30% - 20% = 25% total)
    const percentMultiplier = 1 + modifiers.percentModifier / 100
    const final = Math.round(afterFlat * percentMultiplier)

    // HP has minimum of 1, all other stats can go to 0
    const minimum = statKey === 'HP' ? 1 : 0
    unit.combatStats[statKey] = Math.max(final, minimum)
  }

  // Handle GuardEff separately (no buff/debuff modifiers yet)
  unit.combatStats.GuardEff = foundation.GuardEff
}
