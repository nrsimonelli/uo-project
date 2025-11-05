import {
  checkAndConsumeBlind,
  canCrit,
  canGuard,
  processAfflictionsOnHit,
} from './affliction-manager'
import type { EffectProcessingResult } from './effect-processor'
import {
  removeExpiredConferrals,
  getSkillName,
  recalculateStats,
} from './status-effects'

import {
  getAttackType,
  getDamageType,
  getCombinedFlags,
} from '@/core/attack-types'
import {
  rollCrit,
  getCritMultiplier,
  rollGuard,
  type GuardLevel,
} from '@/core/calculations/combat-calculations'
import { findEffectivenessRule } from '@/core/effectiveness-rules'
import type { RandomNumberGeneratorType } from '@/core/random'
import { CLASS_DATA } from '@/data/units/class-data'
import { clamp } from '@/lib/utils'
import type { BattleContext, EvadeStatus } from '@/types/battle-engine'
import type { SkillCategory } from '@/types/core'
import type { DamageEffect, Flag } from '@/types/effects'

/**
 * Result of a damage calculation attempt
 */
export interface DamageResult {
  /** Whether the attack hit */
  hit: boolean
  /** Final damage dealt (0 if missed) */
  damage: number
  /** Whether the attack was a critical hit */
  wasCritical: boolean
  /** Whether the target guarded */
  wasGuarded: boolean
  /** Whether the attack was dodged by evade */
  wasDodged: boolean
  /** Hit chance percentage that was calculated */
  hitChance: number
  /** Breakdown of damage calculation steps */
  breakdown: {
    baseDamage: number
    afterPotency: number
    afterCrit: number
    afterGuard: number
    afterEffectiveness: number
    afterDmgReduction: number
  }
}

/**
 * Check if a unit has NegateMagicDamage buff and consume it if present
 * Returns true if magic damage should be negated
 */
const checkAndConsumeNegateMagicDamage = (target: BattleContext): boolean => {
  const negateBuffIndex = target.buffs.findIndex(
    buff => buff.stat === 'NegateMagicDamage'
  )

  if (negateBuffIndex !== -1) {
    // Remove the buff (it's consumed)
    const consumedBuff = target.buffs[negateBuffIndex]
    target.buffs.splice(negateBuffIndex, 1)
    console.log(
      `🛡️ ${target.unit.name}'s ${consumedBuff.name} buff consumed (negated magic damage)`
    )
    recalculateStats(target)
    return true
  }

  return false
}

/**
 * Check if a unit has TrueStrike buff and consume it if present
 * Returns true if the attack should always hit
 */
const checkAndConsumeTrueStrike = (attacker: BattleContext): boolean => {
  const trueStrikeBuffIndex = attacker.buffs.findIndex(
    buff => buff.stat === 'TrueStrike'
  )

  if (trueStrikeBuffIndex !== -1) {
    // Remove the buff (it's consumed)
    const consumedBuff = attacker.buffs[trueStrikeBuffIndex]
    attacker.buffs.splice(trueStrikeBuffIndex, 1)
    console.log(
      `🎯 ${attacker.unit.name}'s ${consumedBuff.name} buff consumed (guaranteed hit)`
    )
    recalculateStats(attacker)
    return true
  }

  return false
}

/**
 * Check if a unit has TrueCritical buff and consume it if present
 * Returns true if the attack should always crit
 */
const checkAndConsumeTrueCritical = (attacker: BattleContext): boolean => {
  const trueCriticalBuffIndex = attacker.buffs.findIndex(
    buff => buff.stat === 'TrueCritical'
  )

  if (trueCriticalBuffIndex !== -1) {
    // Remove the buff (it's consumed)
    const consumedBuff = attacker.buffs[trueCriticalBuffIndex]
    attacker.buffs.splice(trueCriticalBuffIndex, 1)
    console.log(
      `✨ ${attacker.unit.name}'s ${consumedBuff.name} buff consumed (guaranteed crit)`
    )
    recalculateStats(attacker)
    return true
  }

  return false
}

/**
 * Check if a unit has Unguardable buff and consume it if present
 * Returns true if the attack cannot be guarded
 */
const checkAndConsumeUnguardable = (attacker: BattleContext): boolean => {
  const unguardableBuffIndex = attacker.buffs.findIndex(
    buff => buff.stat === 'Unguardable'
  )

  if (unguardableBuffIndex !== -1) {
    // Note: Unguardable might not be consumed on use (could be indefinite)
    // For now, we'll check if it has a duration and consume accordingly
    const buff = attacker.buffs[unguardableBuffIndex]

    // If it's a consumable buff (has duration), consume it
    // If it's indefinite (warHorn), don't consume
    if (buff.duration) {
      attacker.buffs.splice(unguardableBuffIndex, 1)
      console.log(
        `⚡ ${attacker.unit.name}'s ${buff.name} buff consumed (guard bypassed)`
      )
      recalculateStats(attacker)
    }

    return true
  }

  return false
}

/**
 * Calculate hit chance for an attack
 * Formula: ((100 + attacker accuracy) - target evasion) * skill hitRate / 100
 * TODO: test flying math.
 * Special cases:
 * - If hitRate is "True" or TrueStrike flag is present, always hits
 * - Flying units get 50% evasion bonus against melee attacks
 */
export const calculateHitChance = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  flags: Flag[] = [],
  attackType?: 'Melee' | 'Ranged' | 'Magical'
) => {
  // Check for always-hit conditions
  // Check both flag (from GrantFlag) and buff (from Buff effect)
  const hasTrueStrikeFlag = flags.includes('TrueStrike')
  const hasTrueStrikeBuff = attacker.buffs.some(
    buff => buff.stat === 'TrueStrike'
  )

  if (
    damageEffect.hitRate === 'True' ||
    hasTrueStrikeFlag ||
    hasTrueStrikeBuff
  ) {
    return 100
  }

  // Calculate base hit chance
  const accuracy = attacker.combatStats.ACC
  const evasion = target.combatStats.EVA
  const skillHitRate = damageEffect.hitRate

  const rawHitChance = ((100 + accuracy - evasion) * skillHitRate) / 100

  // Apply flying evasion bonus against melee attacks
  const targetIsFlying = target.combatantTypes.includes('Flying')
  const flyingEvasionBonus = targetIsFlying && attackType === 'Melee' ? 0.5 : 1

  const adjustedHitChance = rawHitChance * flyingEvasionBonus
  const clampedHitChance = clamp(adjustedHitChance, 0, 100)

  return clampedHitChance
}

/**
 * Roll for hit success based on hit chance
 */
export const rollHit = (rng: RandomNumberGeneratorType, hitChance: number) => {
  const roll = rng.random() * 100
  const hit = roll < hitChance
  return hit
}

/**
 * Calculate base damage before modifiers
 * Formula: (attack - defense) * potency / 100
 * Applies potency bonuses and defense ignore modifiers from effects
 */
export const calculateBaseDamage = (
  attacker: BattleContext,
  target: BattleContext,
  potency: number,
  isPhysical: boolean,
  effectResults?: EffectProcessingResult
) => {
  const attack = isPhysical
    ? attacker.combatStats.PATK
    : attacker.combatStats.MATK

  let defense = isPhysical ? target.combatStats.PDEF : target.combatStats.MDEF

  // Apply potency bonus from effects
  let adjustedPotency = potency
  if (effectResults) {
    const bonusPercent = isPhysical
      ? effectResults.potencyModifiers.physical
      : effectResults.potencyModifiers.magical
    adjustedPotency *= 1 + bonusPercent / 100
  }

  // Apply defense ignore from effects
  if (effectResults && effectResults.defenseIgnoreFraction > 0) {
    defense *= 1 - effectResults.defenseIgnoreFraction
  }

  const baseDamage = attack - defense
  const afterPotency = (baseDamage * adjustedPotency) / 100
  const finalDamage = Math.max(1, afterPotency)

  return finalDamage
}

/**
 * Calculate natural guard multiplier using GuardEff as reduction percentage
 * All units have base 25% guard, equipment adds to this, capped at 75% (heavy guard level)
 */
export const calculateNaturalGuardMultiplier = (
  didGuard: boolean,
  equipmentGuardEff: number
) => {
  if (!didGuard) {
    return 1.0
  }

  // Base 25% guard for all units + equipment GuardEff, capped at 75% (heavy guard level)
  const baseGuardEff = 25
  const totalGuardEff = baseGuardEff + equipmentGuardEff
  const reductionPercent = Math.min(totalGuardEff, 75) // Cap at 75% (heavy guard level)
  const multiplier = (100 - reductionPercent) / 100

  return multiplier
}

/**
 * Calculate guard multiplier for guard skills/effects with fixed levels
 * These are used by guard skills and have fixed reduction values
 */
export const calculateSkillGuardMultiplier = (guardLevel: GuardLevel) => {
  const fixedMultipliers: Record<GuardLevel, number> = {
    none: 1.0,
    light: 0.75,
    medium: 0.5,
    heavy: 0.25,
  }

  return fixedMultipliers[guardLevel]
}

/**
 * Calculate effectiveness multiplier based on class/movement type matchups
 * Uses data-driven effectiveness rules for maintainable and extensible combat bonuses
 */
export const calculateEffectiveness = (
  attacker: BattleContext,
  target: BattleContext,
  isPhysical: boolean
) => {
  void isPhysical
  const attackerClassData = CLASS_DATA[attacker.unit.classKey]
  const targetClassData = CLASS_DATA[target.unit.classKey]

  if (!attackerClassData || !targetClassData) {
    console.warn(`Missing class data for effectiveness calculation:`, {
      attackerClass: attacker.unit.classKey,
      targetClass: target.unit.classKey,
      attackerClassData: !!attackerClassData,
      targetClassData: !!targetClassData,
    })
    return 1.0
  }

  // Find applicable effectiveness rule
  const effectivenessRule = findEffectivenessRule(
    attacker.unit.classKey,
    attackerClassData.movementType,
    attackerClassData.trait,
    target.unit.classKey,
    targetClassData.movementType,
    targetClassData.trait
  )

  return effectivenessRule ? effectivenessRule.multiplier : 1.0
}

/**
 * Helper: Remove evade from array and return consumed evade
 */
const consumeEvade = (
  evades: EvadeStatus[],
  evade: EvadeStatus
): EvadeStatus | null => {
  const index = evades.indexOf(evade)
  if (index !== -1) {
    evades.splice(index, 1)
    return evade
  }
  return null
}

/**
 * Helper: Get initial twoHits remaining uses
 */
const getInitialTwoHitsRemaining = (
  evades: EvadeStatus[],
  provided?: number
): number => {
  if (provided !== undefined && provided > 0) return provided

  const twoHitsEvades = evades.filter(evade => evade.evadeType === 'twoHits')
  return twoHitsEvades[0]?._remainingUses ?? (twoHitsEvades.length > 0 ? 2 : 0)
}

/**
 * Helper: Consume all evades with UntilAttacked duration
 */
const consumeAllUntilAttacked = (evades: EvadeStatus[]): EvadeStatus[] => {
  return evades.filter(evade => {
    if (evade.duration === 'UntilAttacked') {
      const index = evades.indexOf(evade)
      if (index !== -1) {
        evades.splice(index, 1)
        return true
      }
    }
    return false
  })
}

/**
 * Helper: Consume all evades (used by entireAttack)
 */
const consumeAllEvades = (evades: EvadeStatus[]): EvadeStatus[] => {
  const consumed = [...evades]
  evades.length = 0
  return consumed
}

/**
 * Check for and consume evade effects on target
 * Returns whether the attack was dodged and which evades were consumed
 * Priority: entireAttack > twoHits > singleHit
 *
 * NOTE: For future passive skill system - passive evade (incomingEvade) should
 * be checked after this function, only if hit would succeed
 *
 * @param twoHitsRemaining - For twoHits evade: remaining uses before consumption (0-2)
 */
export const checkAndConsumeEvade = (
  target: BattleContext,
  hasTrueStrike: boolean,
  hitWouldSucceed: boolean,
  twoHitsRemaining?: number
): {
  dodged: boolean
  consumedEvades: EvadeStatus[]
  twoHitsRemaining: number
} => {
  const evades = target.evades || []

  if (evades.length === 0) {
    return { dodged: false, consumedEvades: [], twoHitsRemaining: 0 }
  }

  // TrueStrike bypasses evade but still consumes it
  if (hasTrueStrike) {
    const consumedEvades = consumeAllUntilAttacked(target.evades)
    return { dodged: false, consumedEvades, twoHitsRemaining: 0 }
  }

  // Don't waste evade if hit wouldn't succeed
  if (!hitWouldSucceed) {
    const currentRemaining = getInitialTwoHitsRemaining(
      evades,
      twoHitsRemaining
    )
    return {
      dodged: false,
      consumedEvades: [],
      twoHitsRemaining: currentRemaining,
    }
  }

  // Group evades by type (priority order: entireAttack > twoHits > singleHit)
  const evadeByType = {
    entireAttack: evades.filter(evade => evade.evadeType === 'entireAttack'),
    twoHits: evades.filter(evade => evade.evadeType === 'twoHits'),
    singleHit: evades.filter(evade => evade.evadeType === 'singleHit'),
  }

  // Priority 1: entireAttack - consumes all evades
  if (evadeByType.entireAttack.length > 0) {
    const consumedEvades = consumeAllEvades(target.evades)
    console.log(
      `💨 ${target.unit.name} evaded entire attack using ${getSkillName(evadeByType.entireAttack[0].skillId)}`
    )
    return { dodged: true, consumedEvades, twoHitsRemaining: 0 }
  }

  // Priority 2: twoHits
  const currentRemaining = getInitialTwoHitsRemaining(evades, twoHitsRemaining)
  if (evadeByType.twoHits.length > 0 && currentRemaining > 0) {
    const evade = evadeByType.twoHits[0]
    const newRemaining = currentRemaining - 1
    evade._remainingUses = newRemaining

    const consumedEvades: EvadeStatus[] = []
    if (newRemaining === 0 && evade.duration === 'UntilAttacked') {
      const consumed = consumeEvade(target.evades, evade)
      if (consumed) consumedEvades.push(consumed)
    }

    console.log(
      `💨 ${target.unit.name} evaded hit using ${getSkillName(evade.skillId)} (twoHits: ${2 - newRemaining}/2 used)`
    )
    return { dodged: true, consumedEvades, twoHitsRemaining: newRemaining }
  }

  // Priority 3: singleHit
  if (evadeByType.singleHit.length > 0) {
    const evadeToConsume = evadeByType.singleHit[0]
    const consumedEvades: EvadeStatus[] = []
    if (evadeToConsume.duration === 'UntilAttacked') {
      const consumed = consumeEvade(target.evades, evadeToConsume)
      if (consumed) consumedEvades.push(consumed)
    }
    console.log(
      `💨 ${target.unit.name} evaded hit using ${getSkillName(evadeToConsume.skillId)} (singleHit)`
    )
    return { dodged: true, consumedEvades, twoHitsRemaining: 0 }
  }

  return { dodged: false, consumedEvades: [], twoHitsRemaining: 0 }
}

/**
 * Main damage calculation function
 * Handles hit chance, damage calculation, crit, guard, and effectiveness
 */
export const calculateSkillDamage = (
  damageEffect: DamageEffect,
  skillFlags: readonly Flag[] | Flag[] = [],
  skillCategories: readonly SkillCategory[] | SkillCategory[] = [],
  attacker: BattleContext,
  target: BattleContext,
  rng: RandomNumberGeneratorType,
  innateAttackType?: 'Magical' | 'Ranged',
  effectResults?: EffectProcessingResult,
  twoHitsRemaining?: number,
  magicNegatedOverride?: boolean // Optional override for multi-hit attacks
): DamageResult => {
  void skillCategories
  // Combine skill-level, damage effect flags, and granted flags from effects
  const combinedFlags = getCombinedFlags(
    skillFlags,
    effectResults?.grantedFlags || []
  )

  if (effectResults?.grantedFlags && effectResults.grantedFlags.length > 0) {
    console.log('🚩 Granted Flags Applied:', {
      grantedFlags: effectResults?.grantedFlags,
      allCombinedFlags: combinedFlags,
    })
  }

  // Determine attack type for this skill usage
  const attackType = getAttackType(attacker.unit.classKey, innateAttackType)

  // Determine damage type
  const damageType = getDamageType(damageEffect)
  const hasPhysical =
    damageEffect.potency.physical !== undefined &&
    damageEffect.potency.physical > 0
  const hasMagical =
    damageEffect.potency.magical !== undefined &&
    damageEffect.potency.magical > 0

  // Log combat stats for verification
  console.log('⚔️ Combat Stats:', {
    attacker: {
      name: attacker.unit.name,
      class: attacker.unit.classKey,
      attackType,
      stats: attacker.combatStats,
    },
    target: {
      name: target.unit.name,
      class: target.unit.classKey,
      hp: target.currentHP,
      stats: target.combatStats,
    },
    skill: {
      potency: damageEffect.potency,
      type: damageType,
      flags: combinedFlags,
    },
  })

  // Check for Blind - this overrides all hit calculations including TrueStrike
  const blindMiss = checkAndConsumeBlind(attacker)
  if (blindMiss) {
    return {
      hit: false,
      damage: 0,
      wasCritical: false,
      wasGuarded: false,
      hitChance: 0, // Blind guarantees miss
      wasDodged: false,
      breakdown: {
        baseDamage: 0,
        afterPotency: 0,
        afterCrit: 0,
        afterGuard: 0,
        afterEffectiveness: 0,
        afterDmgReduction: 0,
      },
    }
  }

  // Check for TrueStrike from flags (GrantFlag) or buffs (Buff effect)
  // Note: We check buffs here but don't consume yet - calculateHitChance also checks
  const isTrueStrikeFlag = combinedFlags.includes('TrueStrike')
  const hasTrueStrikeBuff = attacker.buffs.some(
    buff => buff.stat === 'TrueStrike'
  )
  const isTrueStrike = isTrueStrikeFlag || hasTrueStrikeBuff

  // Calculate hit chance (will check for TrueStrike buff internally)
  const hitChance = calculateHitChance(
    attacker,
    target,
    damageEffect,
    combinedFlags,
    attackType
  )

  // Consume TrueStrike buff if present (after hit chance calculation)
  if (hasTrueStrikeBuff) {
    checkAndConsumeTrueStrike(attacker)
  }

  if (isTrueStrike) {
    console.log('🎯 TrueStrike Active - guaranteed hit')
  }

  // Roll for hit
  const hit = rollHit(rng, hitChance) || isTrueStrike

  // Check for evade (after hit determination, before afflictions)
  // NOTE: For future passive skill system - this is where "beforeBeingAttacked"
  // window would open IF hit === true (passive evade only triggers on hits)
  const evadeResult = checkAndConsumeEvade(
    target,
    isTrueStrike,
    hit,
    twoHitsRemaining
  )

  // If dodged by buff-based evade (and not TrueStrike), treat as miss
  const wasDodged = evadeResult.dodged && !isTrueStrike
  const finalHit = hit && !wasDodged

  // If hit occurred (and not dodged), process afflictions (e.g., Freeze removal)
  // This happens regardless of damage amount
  if (finalHit) {
    processAfflictionsOnHit(target)
  }

  // If miss or dodged, return early
  if (!finalHit) {
    return {
      hit: false,
      damage: 0,
      wasCritical: false,
      wasGuarded: false,
      wasDodged,
      hitChance,
      breakdown: {
        baseDamage: 0,
        afterPotency: 0,
        afterCrit: 0,
        afterGuard: 0,
        afterEffectiveness: 0,
        afterDmgReduction: 0,
      },
    }
  }

  // Roll shared modifiers once
  const critRate = attacker.combatStats.CRT

  // Check for Crit Seal - this overrides TrueCritical as well
  const canLandCrit = canCrit(attacker)
  // Check for TrueCritical from flags (GrantFlag) or buffs (Buff effect)
  const hasTrueCriticalFlag = combinedFlags.includes('TrueCritical')
  const hasTrueCriticalBuff = checkAndConsumeTrueCritical(attacker)
  const hasTrueCritical = hasTrueCriticalFlag || hasTrueCriticalBuff
  const wasCritical =
    canLandCrit && (hasTrueCritical || rollCrit(rng, critRate))
  const critMultiplier = getCritMultiplier(wasCritical)
  if (hasTrueCritical) {
    console.log('✨ TrueCritical Active - guaranteed crit applied')
  }

  // Roll for guard (only affects physical damage)
  // Check for Unguardable from flags (GrantFlag) or buffs (Buff effect)
  const isUnguardableFlag = combinedFlags.includes('Unguardable')
  const isUnguardableBuff = checkAndConsumeUnguardable(attacker)
  const isUnguardable = isUnguardableFlag || isUnguardableBuff
  const canGuardAttack = hasPhysical && !isUnguardable && canGuard(target)
  const guardRate = canGuardAttack ? target.combatStats.GRD : 0
  let wasGuarded = canGuardAttack && rollGuard(rng, guardRate)
  if (isUnguardable) {
    console.log('⚡ Unguardable Active - guard bypassed')
  }
  const equipmentGuardEff = target.combatStats.GuardEff || 0
  let guardMultiplier = calculateNaturalGuardMultiplier(
    wasGuarded,
    equipmentGuardEff
  )

  // Skill Guard overrides natural guard for this attack instance (physical only)
  if (hasPhysical && target.incomingGuard) {
    const override =
      target.incomingGuard === 'full'
        ? 0
        : calculateSkillGuardMultiplier(target.incomingGuard)
    guardMultiplier = override
    wasGuarded = true
  }

  let totalDamage = 0
  let physicalDamage = 0
  let magicalDamage = 0
  let conferralDamage = 0

  // Check for NegateMagicDamage buff (consumed on use, negates all magic damage)
  // If magicNegatedOverride is provided (from multi-hit), use it; otherwise check and consume
  const magicNegated =
    magicNegatedOverride !== undefined
      ? magicNegatedOverride
      : checkAndConsumeNegateMagicDamage(target)

  // For HP-based damage: Apply damage reduction but skip other modifiers
  if (typeof effectResults?.ownHPBasedDamage === 'number') {
    // Still consume parry if it's a melee attack (but damage is not reduced)
    if (attackType === 'Melee' && target.incomingParry) {
      target.incomingParry = false
    }

    // Process and consume conferrals without calculating damage
    if (attacker.conferrals && attacker.conferrals.length > 0) {
      // Just remove expired conferrals
      removeExpiredConferrals(attacker, 'attacks')
    }

    // Apply damage reduction from DmgReductionPercent stat (only modifier that affects OwnHPBasedDamage)
    const dmgReductionPercent = target.combatStats.DmgReductionPercent ?? 0
    const dmgReductionMultiplier = (100 - dmgReductionPercent) / 100
    const finalDamage = Math.max(
      0,
      Math.round(effectResults.ownHPBasedDamage * dmgReductionMultiplier)
    )

    return {
      hit,
      damage: finalDamage,
      wasCritical: false,
      wasGuarded: false,
      wasDodged: false, // OwnHPBasedDamage cannot be dodged by evade (already handled earlier)
      hitChance,
      breakdown: {
        baseDamage: effectResults.ownHPBasedDamage,
        afterPotency: effectResults.ownHPBasedDamage,
        afterCrit: effectResults.ownHPBasedDamage,
        afterGuard: effectResults.ownHPBasedDamage,
        afterEffectiveness: effectResults.ownHPBasedDamage,
        afterDmgReduction: finalDamage,
      },
    }
  }

  // Calculate physical damage component (before effectiveness)
  if (hasPhysical) {
    let physicalBaseDamage = 0
    let parried = false

    // Parry: negate melee physical damage for one hit
    if (attackType === 'Melee' && target.incomingParry) {
      parried = true
      physicalBaseDamage = 0
      // consume one parry charge
      target.incomingParry = false
    } else {
      physicalBaseDamage = calculateBaseDamage(
        attacker,
        target,
        damageEffect.potency.physical!,
        true,
        effectResults
      )
    }

    const afterCrit = physicalBaseDamage * critMultiplier
    const afterGuard = afterCrit * guardMultiplier // Guard only affects physical
    physicalDamage = parried ? 0 : Math.max(1, Math.round(afterGuard))
    totalDamage += physicalDamage
  }

  // Calculate magical damage component (before effectiveness)
  if (hasMagical) {
    if (magicNegated) {
      magicalDamage = 0
      console.log(`🛡️ ${target.unit.name} negated magic damage`)
    } else {
      const magicalBaseDamage = calculateBaseDamage(
        attacker,
        target,
        damageEffect.potency.magical!,
        false,
        effectResults
      )
      const afterCrit = magicalBaseDamage * critMultiplier
      // No guard multiplier for magical damage
      magicalDamage = Math.max(1, Math.round(afterCrit))
    }
    totalDamage += magicalDamage
  }

  // Apply conferral magical damage (if attacker has active conferrals)
  // NegateMagicDamage also negates conferral magical damage
  if (attacker.conferrals && attacker.conferrals.length > 0) {
    if (magicNegated) {
      console.log(`🛡️ ${target.unit.name} negated conferral magic damage`)
      conferralDamage = 0
    } else {
      attacker.conferrals.forEach(conferral => {
        // Calculate magical damage using the stored caster's MATK
        const conferralBaseDamage =
          ((conferral.casterMATK - target.combatStats.MDEF) *
            conferral.potency) /
          100
        const conferralAfterCrit = conferralBaseDamage * critMultiplier
        // No guard multiplier for conferral magical damage
        conferralDamage += Math.max(1, Math.round(conferralAfterCrit))
      })
    }
    totalDamage += conferralDamage

    console.log('🪄 Conferral Effects Applied:', {
      conferralCount: attacker.conferrals.length,
      conferralDamage,
      conferrals: attacker.conferrals.map(c => ({
        skillId: c.skillId,
        potency: c.potency,
        casterMATK: c.casterMATK,
      })),
    })

    // Remove conferrals that expire when this unit attacks
    removeExpiredConferrals(attacker, 'attacks')
  }

  // Calculate effectiveness once and apply to total damage
  // Use physical=true as default, but effectiveness is class-based anyway
  const attackerClassData = CLASS_DATA[attacker.unit.classKey]
  const targetClassData = CLASS_DATA[target.unit.classKey]
  const effectivenessRule =
    attackerClassData && targetClassData
      ? findEffectivenessRule(
          attacker.unit.classKey,
          attackerClassData.movementType,
          attackerClassData.trait,
          target.unit.classKey,
          targetClassData.movementType,
          targetClassData.trait
        )
      : null
  const effectiveness = effectivenessRule ? effectivenessRule.multiplier : 1.0
  const afterEffectiveness = Math.max(
    1,
    Math.round(totalDamage * effectiveness)
  )

  // Apply damage reduction from DmgReductionPercent stat
  const dmgReductionPercent = target.combatStats.DmgReductionPercent ?? 0
  const dmgReductionMultiplier = (100 - dmgReductionPercent) / 100
  const finalDamage = Math.max(
    1,
    Math.round(afterEffectiveness * dmgReductionMultiplier)
  )

  console.log('🎲 Damage Calculation Complete', {
    attacker: attacker.unit.name,
    target: target.unit.name,
    attackType: `${attackType} Attack`,
    damageType: `${damageType} Damage`,
    damageBreakdown:
      hasPhysical && hasMagical
        ? `(${physicalDamage} physical + ${magicalDamage} magical${conferralDamage > 0 ? ` + ${conferralDamage} conferral` : ''}) × ${effectiveness}${dmgReductionPercent > 0 ? ` × ${((100 - dmgReductionPercent) / 100).toFixed(2)}` : ''} = ${finalDamage} total`
        : hasPhysical || hasMagical
          ? `${physicalDamage + magicalDamage} ${hasPhysical ? 'physical' : 'magical'}${conferralDamage > 0 ? ` + ${conferralDamage} conferral` : ''} × ${effectiveness}${dmgReductionPercent > 0 ? ` × ${((100 - dmgReductionPercent) / 100).toFixed(2)}` : ''} = ${finalDamage} final`
          : conferralDamage > 0
            ? `${conferralDamage} conferral × ${effectiveness}${dmgReductionPercent > 0 ? ` × ${((100 - dmgReductionPercent) / 100).toFixed(2)}` : ''} = ${finalDamage} final`
            : `${totalDamage} × ${effectiveness}${dmgReductionPercent > 0 ? ` × ${((100 - dmgReductionPercent) / 100).toFixed(2)}` : ''} = ${finalDamage} final`,
    hitChance: `${hitChance.toFixed(1)}%`,
    result: finalHit ? 'HIT' : wasDodged ? 'DODGED' : 'MISS',
    damage: finalHit ? `${finalDamage} damage` : '0 damage (missed)',
    effectiveness: effectivenessRule
      ? `×${effectiveness} - ${effectivenessRule.description}`
      : 'No effectiveness bonus',
    guardInfo: hit
      ? {
          equipmentGuardEff,
          totalGuardEff: wasGuarded ? Math.min(25 + equipmentGuardEff, 75) : 0,
          guardRate: `${guardRate}%`,
          wasGuarded,
        }
      : null,
    breakdown: hit
      ? {
          physicalDamage: hasPhysical ? physicalDamage : 0,
          magicalDamage: hasMagical ? magicalDamage : 0,
          conferralDamage: conferralDamage,
          subtotal: totalDamage,
          effectiveness: `×${effectiveness}`,
          critResult: wasCritical ? `CRIT ×${critMultiplier}` : 'no crit',
          guardResult: wasGuarded
            ? `GUARDED (${Math.min(25 + equipmentGuardEff, 75)}% reduction) - physical only`
            : 'no guard',
          final: `${finalDamage} total damage`,
          dmgReduction:
            dmgReductionPercent > 0
              ? `${dmgReductionPercent}% reduction applied`
              : 'no reduction',
        }
      : null,
  })

  return {
    hit: finalHit,
    damage: finalDamage,
    wasCritical,
    wasGuarded,
    wasDodged,
    hitChance,
    breakdown: {
      baseDamage:
        (hasPhysical ? physicalDamage : 0) + (hasMagical ? magicalDamage : 0),
      afterPotency: totalDamage,
      afterCrit: totalDamage,
      afterGuard: totalDamage,
      afterEffectiveness: afterEffectiveness,
      afterDmgReduction: finalDamage,
    },
  }
}

/**
 * Helper: Create a dodged result for a hit
 */
const createDodgedResult = (): DamageResult => ({
  hit: false,
  damage: 0,
  wasCritical: false,
  wasGuarded: false,
  wasDodged: true,
  hitChance: 0,
  breakdown: {
    baseDamage: 0,
    afterPotency: 0,
    afterCrit: 0,
    afterGuard: 0,
    afterEffectiveness: 0,
    afterDmgReduction: 0,
  },
})

/**
 * Helper: Get current twoHits remaining from evades
 */
const getCurrentTwoHitsRemaining = (evades: EvadeStatus[]): number => {
  const twoHitsEvade = evades.find(evade => evade.evadeType === 'twoHits')
  return twoHitsEvade?._remainingUses ?? (twoHitsEvade ? 2 : 0)
}

/**
 * Apply multiple hits from a skill (for skills with hitCount > 1)
 * Handles per-hit evade tracking for singleHit and twoHits evade types
 */
export const calculateMultiHitDamage = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  rng: RandomNumberGeneratorType,
  skillFlags: Flag[] = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _effectFlags: Flag[] = [],
  skillCategories: SkillCategory[] = ['Damage'],
  innateAttackType?: 'Magical' | 'Ranged',
  effectResults?: EffectProcessingResult
): DamageResult[] => {
  // Check and consume NegateMagicDamage buff once for the entire multi-hit attack
  // This ensures all hits in the attack have magic damage negated
  const magicNegated = checkAndConsumeNegateMagicDamage(target)

  const initialEntireAttackCount = target.evades.filter(
    evade => evade.evadeType === 'entireAttack'
  ).length
  const initialTwoHitsEvades = target.evades.filter(
    evade => evade.evadeType === 'twoHits'
  )

  const calculateHit = (
    twoHitsRemaining: number,
    entireAttackUsed: boolean
  ): {
    result: DamageResult
    nextRemaining: number
    nextEntireAttackUsed: boolean
  } => {
    if (entireAttackUsed) {
      return {
        result: createDodgedResult(),
        nextRemaining: twoHitsRemaining,
        nextEntireAttackUsed: true,
      }
    }

    const result = calculateSkillDamage(
      damageEffect,
      skillFlags,
      skillCategories,
      attacker,
      target,
      rng,
      innateAttackType,
      effectResults,
      twoHitsRemaining,
      magicNegated // Pass the pre-checked magicNegated flag
    )

    const currentEntireAttackCount = target.evades.filter(
      evade => evade.evadeType === 'entireAttack'
    ).length
    const nextEntireAttackUsed =
      result.wasDodged &&
      initialEntireAttackCount > 0 &&
      currentEntireAttackCount < initialEntireAttackCount

    const nextRemaining =
      result.wasDodged && initialTwoHitsEvades.length > 0
        ? getCurrentTwoHitsRemaining(target.evades)
        : twoHitsRemaining

    return { result, nextRemaining, nextEntireAttackUsed }
  }

  const initialTwoHitsRemaining =
    initialTwoHitsEvades[0]?._remainingUses ??
    (initialTwoHitsEvades.length > 0 ? 2 : 0)

  return Array.from({ length: damageEffect.hitCount }).reduce<{
    results: DamageResult[]
    remaining: number
    entireAttackUsed: boolean
  }>(
    acc => {
      const { result, nextRemaining, nextEntireAttackUsed } = calculateHit(
        acc.remaining,
        acc.entireAttackUsed
      )
      return {
        results: [...acc.results, result],
        remaining: nextRemaining,
        entireAttackUsed: nextEntireAttackUsed,
      }
    },
    { results: [], remaining: initialTwoHitsRemaining, entireAttackUsed: false }
  ).results
}
