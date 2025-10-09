import { CLASS_DATA } from '@/data/units/class-data'
import type { AllClassType } from '@/types/base-stats'
import type { AttackType, DamageType, DamageEffect, Flag } from '@/types/effects'

/**
 * Determine the final attack type for a skill based on flags and attacker class
 * 
 * Priority order:
 * 1. Magical flag (always becomes Magical attack type)
 * 2. Flying unit class (makes non-magical attacks Ranged)
 * 3. Archer trait (makes non-magical attacks Ranged)
 * 4. Ranged flag (explicit ranged attack)
 * 5. Default to Melee
 */
export const getAttackType = (flags: Flag[] = [], attackerClass: AllClassType): AttackType => {
  const classData = CLASS_DATA[attackerClass]
  
  // Magical flag takes precedence over everything
  if (flags.includes('Magical')) {
    return 'Magical'
  }
  
  // Flying units make all attacks ranged (unless magical)
  if (classData.movementType === 'Flying') {
    return 'Ranged'
  }
  
  // Archer trait makes all attacks ranged (unless magical)  
  if (classData.trait === 'Archer') {
    return 'Ranged'
  }
  
  // Explicit Ranged flag
  if (flags.includes('Ranged')) {
    return 'Ranged'
  }
  
  // Default to Melee
  return 'Melee'
}

/**
 * Determine damage type based on damage effect potency
 */
export const getDamageType = (damageEffect: DamageEffect): DamageType => {
  const hasPhysical = damageEffect.potency.physical !== undefined && damageEffect.potency.physical > 0
  const hasMagical = damageEffect.potency.magical !== undefined && damageEffect.potency.magical > 0
  
  if (hasPhysical && hasMagical) {
    return 'Hybrid'
  } else if (hasMagical) {
    return 'Magical'
  } else {
    return 'Physical'
  }
}

/**
 * Check if damage effect deals physical damage (including hybrid)
 */
export const isPhysicalDamage = (damageEffect: DamageEffect): boolean => {
  return damageEffect.potency.physical !== undefined && damageEffect.potency.physical > 0
}

/**
 * Check if damage effect deals magical damage (including hybrid)
 */
export const isMagicalDamage = (damageEffect: DamageEffect): boolean => {
  return damageEffect.potency.magical !== undefined && damageEffect.potency.magical > 0
}

/**
 * Check if attack can target a specific movement type based on GroundBased flag
 */
export const canTargetMovementType = (
  flags: Flag[] = [], 
  targetMovementType: 'Infantry' | 'Cavalry' | 'Flying'
): boolean => {
  // GroundBased attacks can only hit Cavalry and Infantry
  if (flags.includes('GroundBased')) {
    return targetMovementType === 'Cavalry' || targetMovementType === 'Infantry'
  }
  
  // Non-GroundBased attacks can hit any movement type
  return true
}

/**
 * Get all flags that should apply to a damage effect, combining skill-level and effect-level flags
 */
export const getCombinedFlags = (skillFlags: Flag[] = [], effectFlags: Flag[] = []): Flag[] => {
  // Combine flags from both arrays
  const combined = [...skillFlags, ...effectFlags]
  
  // Deduplicate by filtering out flags that already exist at earlier indices
  const deduplicated: Flag[] = []
  for (const flag of combined) {
    if (!deduplicated.includes(flag)) {
      deduplicated.push(flag)
    }
  }
  
  return deduplicated
}
