import { CLASS_DATA } from '@/data/units/class-data'
import type { AllClassType } from '@/types/base-stats'
import type { SkillCategory } from '@/types/core'
import type { DamageEffect, Flag } from '@/types/effects'

/**
 * Determine the final attack type for a skill based on innateAttackType and attacker class
 *
 * Logic:
 * 1. If innateAttackType is provided -> use that (highest priority)
 * 2. If unit's movement type is Flying or trait is Archer -> Ranged
 * 3. Otherwise -> Melee
 *
 * Important constraints:
 * - This function should only be called for damage skills
 * - Only Damage skills can acquire the Melee attack type
 * - Non-damage skills should not call this function
 */
export const getAttackType = (
  attackerClass: AllClassType,
  innateAttackType?: 'Magical' | 'Ranged'
) => {
  // Innate attack type takes highest precedence
  if (innateAttackType) {
    return innateAttackType
  }

  const classData = CLASS_DATA[attackerClass]

  // Flying units or Archers make attacks Ranged
  if (classData.movementType === 'Flying' || classData.trait === 'Archer') {
    return 'Ranged'
  }

  // Default to Melee (should only be called for damage skills)
  return 'Melee'
}

export const getDamageType = (damageEffect: DamageEffect) => {
  const hasPhysical =
    damageEffect.potency.physical !== undefined &&
    damageEffect.potency.physical > 0
  const hasMagical =
    damageEffect.potency.magical !== undefined &&
    damageEffect.potency.magical > 0

  if (hasPhysical && hasMagical) {
    return 'Hybrid'
  } else if (hasMagical) {
    return 'Magical'
  } else {
    return 'Physical'
  }
}

export const isPhysicalDamage = (damageEffect: DamageEffect) => {
  return (
    damageEffect.potency.physical !== undefined &&
    damageEffect.potency.physical > 0
  )
}

export const isMagicalDamage = (damageEffect: DamageEffect) => {
  return (
    damageEffect.potency.magical !== undefined &&
    damageEffect.potency.magical > 0
  )
}

export const canTargetMovementType = (
  flags: readonly Flag[] | Flag[] = [],
  targetMovementType: 'Infantry' | 'Cavalry' | 'Flying'
) => {
  // GroundBased attacks can only hit Cavalry and Infantry
  if (flags.includes('GroundBased')) {
    return targetMovementType === 'Cavalry' || targetMovementType === 'Infantry'
  }

  // Non-GroundBased attacks can hit any movement type
  return true
}

export const getCombinedFlags = (
  skillFlags: readonly Flag[] | Flag[] = [],
  effectFlags: readonly Flag[] | Flag[] = []
): Flag[] => {
  const combined = [...skillFlags, ...effectFlags]

  const deduplicated: Flag[] = []
  for (const flag of combined) {
    if (!deduplicated.includes(flag)) {
      deduplicated.push(flag)
    }
  }

  return deduplicated
}

export const hasCategory = (
  skillCategories: readonly SkillCategory[] | SkillCategory[],
  category: SkillCategory
) => {
  return skillCategories.includes(category)
}

export const skillRequiresHitCheck = (
  skillCategories: readonly SkillCategory[] | SkillCategory[]
) => {
  // Only Damage and Sabotage skills require hit checks
  return (
    hasCategory(skillCategories, 'Damage') ||
    hasCategory(skillCategories, 'Sabotage')
  )
}

export const isDamageSkill = (
  skillCategories: readonly SkillCategory[] | SkillCategory[]
) => {
  return hasCategory(skillCategories, 'Damage')
}

export const isHostileSkill = (
  skillCategories: readonly SkillCategory[] | SkillCategory[]
) => {
  // Only Damage and Sabotage skills are hostile
  return (
    hasCategory(skillCategories, 'Damage') ||
    hasCategory(skillCategories, 'Sabotage')
  )
}

export const isAllyOnlySkill = (
  skillCategories: readonly SkillCategory[] | SkillCategory[]
) => {
  // Skills that don't have Damage or Sabotage categories
  return !isHostileSkill(skillCategories)
}

export const isCounterSkill = (
  skillCategories: readonly SkillCategory[] | SkillCategory[]
) => {
  return hasCategory(skillCategories, 'Counter')
}

export const isPursuitSkill = (
  skillCategories: readonly SkillCategory[] | SkillCategory[]
) => {
  return hasCategory(skillCategories, 'Pursuit')
}
