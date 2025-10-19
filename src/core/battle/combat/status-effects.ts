import { applyAffliction } from './affliction-manager'
import type { EffectProcessingResult } from './effect-processor'

import { calculateBaseStats } from '@/core/calculations/base-stats'
import { calculateEquipmentBonus } from '@/core/calculations/equipment-bonuses'
import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { StatKey } from '@/types/base-stats'
import type {
  BattleContext,
  Buff,
  Debuff,
  ConferralStatus,
} from '@/types/battle-engine'

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
) => {
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
    removeExpiredBuffs(targetUnit, 'debuffed')

    const skillName = getSkillName(debuffToApply.skillId)
    const debuff: Debuff = {
      name: `${skillName} (-${debuffToApply.stat})`,
      stat: debuffToApply.stat as StatKey,
      value: debuffToApply.value,
      duration: mapDuration(debuffToApply.duration) as
        | 'Indefinite'
        | 'UntilNextAttack'
        | 'UntilNextAction',
      scaling: debuffToApply.scaling,
      source: attacker.unit.id,
      skillId: debuffToApply.skillId,
    }

    applyDebuff(targetUnit, debuff, debuffToApply.stacks)
    unitsToRecalculate.add(targetUnit)
  })

  // Apply debuff amplifications as special debuffs
  effectResults.debuffAmplificationsToApply.forEach(amplificationToApply => {
    const targetUnit =
      amplificationToApply.target === 'User' ? attacker : targets[0]
    if (!targetUnit) return

    const skillName = getSkillName(amplificationToApply.skillId)
    const amplificationDebuff: Debuff = {
      name: `${skillName} (Debuff Amplification)`,
      stat: 'DebuffAmplification' as StatKey, // Special reserved stat
      value: amplificationToApply.multiplier,
      duration: mapDuration(amplificationToApply.duration) as
        | 'Indefinite'
        | 'UntilNextAttack'
        | 'UntilNextAction',
      scaling: 'flat', // Store the raw multiplier value
      source: attacker.unit.id,
      skillId: amplificationToApply.skillId,
    }

    applyDebuff(targetUnit, amplificationDebuff, false) // Don't allow stacking of amplification
    unitsToRecalculate.add(targetUnit)
  })

  // Apply conferral effects to appropriate targets
  effectResults.conferralsToApply.forEach(conferralToApply => {
    const targetUnit =
      conferralToApply.target === 'User' ? attacker : targets[0]
    if (!targetUnit) return

    const conferral: ConferralStatus = {
      skillId: conferralToApply.skillId,
      potency: conferralToApply.potency,
      casterMATK: conferralToApply.casterMATK,
      duration: conferralToApply.duration || 'UntilNextAttack',
    }

    applyConferral(targetUnit, conferral)
  })

  // Apply afflictions to appropriate targets
  effectResults.afflictionsToApply.forEach(afflictionToApply => {
    const targetUnit =
      afflictionToApply.target === 'User' ? attacker : targets[0]
    if (!targetUnit) return

    applyAffliction(
      targetUnit,
      afflictionToApply.afflictionType,
      attacker.unit.id,
      afflictionToApply.level
    )

    // If Deathblow was applied and unit was defeated, add to recalculation set
    // (though Deathblow doesn't affect stats, this ensures proper cleanup)
    if (
      afflictionToApply.afflictionType === 'Deathblow' ||
      targetUnit.currentHP <= 0
    ) {
      unitsToRecalculate.add(targetUnit)
    }
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
) => {
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
) => {
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
 * Apply a conferral effect to a unit
 */
const applyConferral = (unit: BattleContext, newConferral: ConferralStatus) => {
  // Check for existing conferral with same skillId (replace if found)
  const existingIndex = unit.conferrals.findIndex(
    existing => existing.skillId === newConferral.skillId
  )

  if (existingIndex !== -1) {
    // Replace existing conferral from same skill
    unit.conferrals[existingIndex] = newConferral
  } else {
    // Add new conferral
    unit.conferrals.push(newConferral)
  }

  console.log(
    `${unit.unit.name} received conferral: +${newConferral.potency} magical potency from caster MATK ${newConferral.casterMATK}`
  )
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
  duration?: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
):
  | 'Indefinite'
  | 'UntilNextAttack'
  | 'UntilAttacked'
  | 'UntilDebuffed'
  | 'UntilNextAction' => {
  if (duration === 'UntilAttacked') {
    return 'UntilAttacked'
  }
  if (duration === 'UntilNextAttack') {
    return 'UntilNextAttack'
  }
  if (duration === 'UntilNextAction') {
    return 'UntilNextAction'
  }
  // Default duration is indefinite
  return 'Indefinite'
}

/**
 * Remove expired buffs from a unit based on trigger conditions
 */
export const removeExpiredBuffs = (
  unit: BattleContext,
  trigger: 'attacks' | 'attacked' | 'debuffed' | 'action'
) => {
  const initialCount = unit.buffs.length

  if (trigger === 'attacks') {
    unit.buffs = unit.buffs.filter(buff => buff.duration !== 'UntilNextAttack')
  } else if (trigger === 'attacked') {
    unit.buffs = unit.buffs.filter(buff => buff.duration !== 'UntilAttacked')
  } else if (trigger === 'debuffed') {
    unit.buffs = unit.buffs.filter(buff => buff.duration !== 'UntilDebuffed')
  } else if (trigger === 'action') {
    unit.buffs = unit.buffs.filter(buff => buff.duration !== 'UntilNextAction')
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
  trigger: 'attacks' | 'action'
) => {
  const initialCount = unit.debuffs.length

  if (trigger === 'attacks') {
    unit.debuffs = unit.debuffs.filter(
      debuff => debuff.duration !== 'UntilNextAttack'
    )
  } else if (trigger === 'action') {
    unit.debuffs = unit.debuffs.filter(
      debuff => debuff.duration !== 'UntilNextAction'
    )
  }

  // Recalculate stats if any debuffs were removed
  if (unit.debuffs.length !== initialCount) {
    recalculateStats(unit)
  }
}

/**
 * Remove expired conferrals from a unit based on trigger conditions
 */
export const removeExpiredConferrals = (
  unit: BattleContext,
  trigger: 'attacks' | 'attacked' | 'action'
) => {
  const initialCount = unit.conferrals.length

  if (trigger === 'attacks') {
    unit.conferrals = unit.conferrals.filter(
      conferral => conferral.duration !== 'UntilNextAttack'
    )
  } else if (trigger === 'attacked') {
    unit.conferrals = unit.conferrals.filter(
      conferral => conferral.duration !== 'UntilAttacked'
    )
  } else if (trigger === 'action') {
    unit.conferrals = unit.conferrals.filter(
      conferral => conferral.duration !== 'UntilNextAction'
    )
  }

  if (unit.conferrals.length !== initialCount) {
    console.log(`${unit.unit.name} conferrals expired (${trigger})`)
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

  // Get debuff amplification multiplier
  const amplificationDebuffs = unit.debuffs.filter(
    debuff => debuff.stat === ('DebuffAmplification' as StatKey)
  )
  const amplificationMultiplier =
    amplificationDebuffs.length > 0
      ? amplificationDebuffs[0].value // Use the first/most recent amplification
      : 1.0 // No amplification

  let flatModifier = 0
  let percentModifier = 0

  // Apply buffs (no amplification for buffs)
  buffs.forEach(buff => {
    if (buff.scaling === 'flat') {
      flatModifier += buff.value
    } else if (buff.scaling === 'percent') {
      percentModifier += buff.value
    }
  })

  // Apply debuffs with amplification (subtract since they're negative effects)
  debuffs.forEach(debuff => {
    // Skip the amplification debuffs themselves
    if (debuff.stat === ('DebuffAmplification' as StatKey)) {
      return
    }

    const amplifiedValue = debuff.value * amplificationMultiplier
    if (debuff.scaling === 'flat') {
      flatModifier -= amplifiedValue
    } else if (debuff.scaling === 'percent') {
      percentModifier -= amplifiedValue
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
export const hasAffliction = (unit: BattleContext, afflictionType: string) => {
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
