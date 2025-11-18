import {
  applyAffliction,
  removeAffliction,
  clearAllAfflictions,
} from './affliction-manager'
import { logCombat, getSkillName } from './combat-utils'
import type { EffectProcessingResult } from './effect-processor'

import { calculateBaseStats } from '@/core/calculations/base-stats'
import { calculateEquipmentBonus } from '@/core/calculations/equipment-bonuses'
import { AFFLICTIONS } from '@/data/constants'
import type { StatKey } from '@/types/base-stats'
import type {
  BattleContext,
  Buff,
  Debuff,
  ConferralStatus,
  EvadeStatus,
  DamageImmunityStatus,
  DebuffAmplificationStatus,
} from '@/types/battle-engine'
import type { AfflictionType } from '@/types/conditions'
import type { ExtraStats } from '@/types/equipment'

const CLEANSE_TARGETS = {
  BUFFS: 'Buffs',
  DEBUFFS: 'Debuffs',
  AFFLICTIONS: 'Afflictions',
} as const

const resolveEffectTarget = (
  effectTarget: 'User' | 'Target',
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean
): BattleContext | null => {
  // Skip target-directed effects if attack missed
  if (!attackHit && effectTarget === 'Target') {
    return null
  }
  return effectTarget === 'User' ? attacker : targets[0]
}

const removeExpiredStatus = <T extends { duration: string }>(
  statusArray: T[],
  trigger: 'attacks' | 'attacked' | 'debuffed' | 'action'
): T[] => {
  const durationMap = {
    attacks: 'UntilNextAttack',
    attacked: 'UntilAttacked',
    debuffed: 'UntilDebuffed',
    action: 'UntilNextAction',
  } as const

  const expiredDuration = durationMap[trigger]
  return statusArray.filter(status => status.duration !== expiredDuration)
}

/**
 * Generic helper to apply a status effect to an array
 * Handles finding existing by skillId and replacing or stacking
 */
const applyStatusEffect = <T extends { skillId: string }>(
  effectArray: T[],
  newEffect: T,
  allowStacks: boolean
): void => {
  // For buffs/debuffs, also check stat to allow multiple effects from same skill with different stats
  const isBuffOrDebuff = 'stat' in newEffect
  const existingIndex = effectArray.findIndex(existing => {
    if (isBuffOrDebuff && 'stat' in existing) {
      return (
        existing.skillId === newEffect.skillId &&
        (existing as { stat: unknown }).stat ===
          (newEffect as { stat: unknown }).stat
      )
    }
    return existing.skillId === newEffect.skillId
  })

  if (existingIndex !== -1 && !allowStacks) {
    effectArray[existingIndex] = newEffect
  } else {
    effectArray.push(newEffect)
  }
}

const applyCleanses = (
  cleansesToApply: EffectProcessingResult['cleansesToApply'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean,
  unitsToRecalculate: Set<BattleContext>
): void => {
  cleansesToApply.forEach(cleanse => {
    const skillName = getSkillName(cleanse.skillId)
    const targetUnit = resolveEffectTarget(
      cleanse.applyTo,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    const cleanseTarget = cleanse.target

    if (cleanseTarget === CLEANSE_TARGETS.BUFFS) {
      if (targetUnit.buffs.length > 0) {
        targetUnit.buffs = []
        logCombat(`✨ ${targetUnit.unit.name} buffs removed by ${skillName}`)
        unitsToRecalculate.add(targetUnit)
      }
    } else if (cleanseTarget === CLEANSE_TARGETS.DEBUFFS) {
      if (targetUnit.debuffs.length > 0) {
        targetUnit.debuffs = []
        logCombat(`✨ ${targetUnit.unit.name} debuffs removed by ${skillName}`)
        unitsToRecalculate.add(targetUnit)
      }
    } else if (cleanseTarget === CLEANSE_TARGETS.AFFLICTIONS) {
      clearAllAfflictions(targetUnit)
      unitsToRecalculate.add(targetUnit)
    } else if (AFFLICTIONS.includes(cleanseTarget as AfflictionType)) {
      // Target is a specific affliction type
      removeAffliction(targetUnit, cleanseTarget as AfflictionType)
      unitsToRecalculate.add(targetUnit)
    } else {
      // Target is a specific buff stat (StatKey | ExtraStats)
      const statTarget = cleanseTarget as StatKey | ExtraStats
      const initialBuffCount = targetUnit.buffs.length
      targetUnit.buffs = targetUnit.buffs.filter(
        buff => buff.stat !== statTarget
      )
      const removedCount = initialBuffCount - targetUnit.buffs.length
      if (removedCount > 0) {
        logCombat(
          `✨ ${targetUnit.unit.name} ${removedCount} ${statTarget} buff${removedCount > 1 ? 's' : ''} removed by ${skillName}`
        )
        unitsToRecalculate.add(targetUnit)
      }
    }
  })
}

const applyBuffsAndDebuffs = (
  effectResults: EffectProcessingResult,
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean,
  unitsToRecalculate: Set<BattleContext>
): void => {
  effectResults.buffsToApply.forEach(buffToApply => {
    const skillName = getSkillName(buffToApply.skillId)
    const targetUnit = resolveEffectTarget(
      buffToApply.target,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    const buff: Buff = {
      name: `${skillName} (+${buffToApply.stat})`,
      stat: buffToApply.stat as StatKey,
      value: buffToApply.value,
      duration: buffToApply.duration ?? 'Indefinite',
      scaling: buffToApply.scaling,
      source: attacker.unit.id,
      skillId: buffToApply.skillId,
      conditionalOnTarget: buffToApply.conditionalOnTarget,
    }

    applyBuff(targetUnit, buff, buffToApply.stacks)
    unitsToRecalculate.add(targetUnit)

    logCombat(
      `✅ Buff Applied: ${targetUnit.unit.name} +${buffToApply.value}${buffToApply.scaling === 'percent' ? '%' : ''} ${buffToApply.stat} (${buff.duration})`,
      { skillName, buffValue: buffToApply.value, scaling: buffToApply.scaling }
    )
  })

  effectResults.debuffsToApply.forEach(debuffToApply => {
    const skillName = getSkillName(debuffToApply.skillId)
    const targetUnit = resolveEffectTarget(
      debuffToApply.target,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    const debuff: Debuff = {
      name: `${skillName} (-${debuffToApply.stat})`,
      stat: debuffToApply.stat as StatKey,
      value: debuffToApply.value,
      duration: debuffToApply.duration ?? 'Indefinite',
      scaling: debuffToApply.scaling,
      source: attacker.unit.id,
      skillId: debuffToApply.skillId,
    }

    // Remove expired buffs that trigger on debuff application
    removeExpiredBuffs(targetUnit, 'debuffed')

    applyDebuff(targetUnit, debuff, debuffToApply.stacks)
    unitsToRecalculate.add(targetUnit)

    logCombat(
      `❌ Debuff Applied: ${targetUnit.unit.name} -${debuffToApply.value}${debuffToApply.scaling === 'percent' ? '%' : ''} ${debuffToApply.stat} (${debuff.duration})`,
      {
        skillName,
        debuffValue: debuffToApply.value,
        scaling: debuffToApply.scaling,
      }
    )
  })
}

const applyConferrals = (
  conferralsToApply: EffectProcessingResult['conferralsToApply'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean
): void => {
  conferralsToApply.forEach(conferralToApply => {
    const targetUnit = resolveEffectTarget(
      conferralToApply.target,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    const conferral: ConferralStatus = {
      skillId: conferralToApply.skillId,
      potency: conferralToApply.potency,
      casterMATK: conferralToApply.casterMATK,
      duration: conferralToApply.duration || 'UntilNextAttack',
      afflictions: conferralToApply.afflictions, // Store afflictions to apply when conferral is consumed
    }

    applyConferral(targetUnit, conferral)
  })
}

const applyDebuffAmplifications = (
  amplificationsToApply: EffectProcessingResult['debuffAmplificationsToApply'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean,
  unitsToRecalculate: Set<BattleContext>
): void => {
  amplificationsToApply.forEach(amplificationToApply => {
    const skillName = getSkillName(amplificationToApply.skillId)
    const targetUnit = resolveEffectTarget(
      amplificationToApply.target,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    const amplification: DebuffAmplificationStatus = {
      skillId: amplificationToApply.skillId,
      multiplier: amplificationToApply.multiplier,
      duration: amplificationToApply.duration || 'UntilNextAttack',
      source: attacker.unit.id,
    }

    applyDebuffAmplification(targetUnit, amplification)
    unitsToRecalculate.add(targetUnit)

    logCombat(
      `🔊 Debuff Amplification Applied: ${targetUnit.unit.name} ${amplification.multiplier}x debuff effectiveness (${amplification.duration})`,
      { skillName }
    )
  })
}

const applyEvades = (
  evadesToApply: EffectProcessingResult['evadesToApply'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean,
  unitsToRecalculate: Set<BattleContext>
): void => {
  evadesToApply.forEach(evadeToApply => {
    const targetUnit = resolveEffectTarget(
      evadeToApply.target,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    const evade: EvadeStatus = {
      skillId: evadeToApply.skillId,
      evadeType: evadeToApply.evadeType,
      duration: evadeToApply.duration || 'UntilAttacked',
      source: attacker.unit.id,
    }

    applyEvade(targetUnit, evade)
    unitsToRecalculate.add(targetUnit)

    logCombat(
      `✅ Evade Applied: ${targetUnit.unit.name} ${evadeToApply.evadeType} evade (${evade.duration})`,
      { skillName: getSkillName(evadeToApply.skillId) }
    )
  })
}

const applyDamageImmunities = (
  damageImmunitiesToApply: EffectProcessingResult['damageImmunitiesToApply'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean,
  unitsToRecalculate: Set<BattleContext>
): void => {
  damageImmunitiesToApply.forEach(immunityToApply => {
    const targetUnit = resolveEffectTarget(
      immunityToApply.target,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    const immunity: DamageImmunityStatus = {
      skillId: immunityToApply.skillId,
      immunityType: immunityToApply.immunityType,
      hitCount: immunityToApply.hitCount,
      duration: immunityToApply.duration || 'UntilAttacked',
      source: attacker.unit.id,
    }

    // Initialize remaining hits for multipleHits type
    if (immunity.immunityType === 'multipleHits' && immunity.hitCount) {
      immunity.remainingImmunityHits = immunity.hitCount
    }

    applyStatusEffect(targetUnit.damageImmunities, immunity, false)
    unitsToRecalculate.add(targetUnit)

    const hitCountText =
      immunity.immunityType === 'multipleHits'
        ? ` (${immunity.hitCount} hits)`
        : ''
    logCombat(
      `✅ Damage Immunity Applied: ${targetUnit.unit.name} ${immunityToApply.immunityType} immunity${hitCountText} (${immunity.duration})`,
      { skillName: getSkillName(immunityToApply.skillId) }
    )
  })
}

const applyResurrects = (
  resurrectsToApply: EffectProcessingResult['resurrectsToApply'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean
): void => {
  resurrectsToApply.forEach(resurrect => {
    const targetUnit = resolveEffectTarget(
      resurrect.target,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    if (targetUnit.currentHP <= 0) {
      const healAmount =
        resurrect.healType === 'percent'
          ? Math.round((targetUnit.combatStats.HP * resurrect.healAmount) / 100)
          : resurrect.healAmount

      targetUnit.afflictions = []
      targetUnit.buffs = []
      targetUnit.debuffs = []
      targetUnit.currentHP = healAmount
      targetUnit.isPassiveResponsive = true

      logCombat(`✨ ${targetUnit.unit.name} resurrected with ${healAmount} HP`)
    }
  })
}

const applyOwnHPBasedHeal = (
  ownHPBasedHeal: EffectProcessingResult['ownHPBasedHeal'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean,
  effectResults: EffectProcessingResult,
  unitsToRecalculate: Set<BattleContext>
) => {
  if (!ownHPBasedHeal) {
    return
  }

  const skillName = getSkillName(ownHPBasedHeal.skillId)
  const healAmount = ownHPBasedHeal.amount

  if (healAmount <= 0) {
    return
  }

  // Determine which units to heal
  const unitsToHeal =
    ownHPBasedHeal.target === 'User' ? [attacker] : attackHit ? targets : []

  const allowOverheal = effectResults.grantedFlags?.includes('Overheal')

  unitsToHeal.forEach(targetUnit => {
    const newHP = targetUnit.currentHP + healAmount
    const cappedHP = allowOverheal
      ? newHP
      : Math.min(newHP, targetUnit.combatStats.HP)

    const actualHeal = cappedHP - targetUnit.currentHP
    if (actualHeal > 0) {
      targetUnit.currentHP = cappedHP
      unitsToRecalculate.add(targetUnit)

      logCombat(
        `💚 ${targetUnit.unit.name} healed for ${actualHeal} HP (based on ${attacker.unit.name}'s HP) via ${skillName}`
      )
    } else {
      logCombat(
        `💚 ${targetUnit.unit.name} would have been healed for ${healAmount} HP via ${skillName}, but was already at max HP`
      )
    }
  })
}

const applyLifeshare = (
  lifeshareToApply: EffectProcessingResult['lifeshareToApply'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean,
  effectResults: EffectProcessingResult,
  unitsToRecalculate: Set<BattleContext>
) => {
  if (attacker.currentHP <= 0) {
    return
  }

  lifeshareToApply.forEach(lifeshare => {
    const targetUnit = resolveEffectTarget(
      lifeshare.target,
      attacker,
      targets,
      attackHit
    )
    if (!targetUnit) return

    const skillName = getSkillName(lifeshare.skillId)

    const sacrificeAmount = Math.floor(
      (attacker.currentHP * lifeshare.percentage) / 100
    )

    // Ensure user stays at minimum 1 HP
    const safeSacrifice = Math.min(sacrificeAmount, attacker.currentHP - 1)

    if (safeSacrifice > 0) {
      attacker.currentHP -= safeSacrifice
      unitsToRecalculate.add(attacker)

      logCombat(
        `💔 ${attacker.unit.name} sacrificed ${safeSacrifice} HP (${lifeshare.percentage}% of current HP) via ${skillName}`
      )

      const allowOverheal = effectResults.grantedFlags?.includes('Overheal')
      const newHP = targetUnit.currentHP + safeSacrifice
      const cappedHP = allowOverheal
        ? newHP
        : Math.min(newHP, targetUnit.combatStats.HP)

      const actualHeal = cappedHP - targetUnit.currentHP
      if (actualHeal > 0) {
        targetUnit.currentHP = cappedHP
        unitsToRecalculate.add(targetUnit)

        logCombat(
          `💚 ${targetUnit.unit.name} healed for ${actualHeal} HP via ${skillName}`
        )
      } else if (safeSacrifice > 0) {
        logCombat(
          `💚 ${targetUnit.unit.name} would have been healed for ${safeSacrifice} HP via ${skillName}, but was already at max HP`
        )
      }
    } else {
      logCombat(
        `💔 ${attacker.unit.name} cannot sacrifice HP via ${skillName} (at minimum HP)`
      )
    }
  })
}

const applyAfflictions = (
  afflictionsToApply: EffectProcessingResult['afflictionsToApply'],
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit: boolean,
  unitsToRecalculate: Set<BattleContext>
): void => {
  afflictionsToApply.forEach(afflictionToApply => {
    const targetUnit = resolveEffectTarget(
      afflictionToApply.target,
      attacker,
      targets,
      attackHit
    )
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
}

export const applyStatusEffects = (
  effectResults: EffectProcessingResult,
  attacker: BattleContext,
  targets: BattleContext[],
  attackHit = true
) => {
  const unitsToRecalculate = new Set<BattleContext>()

  // Sacrifice is now handled as an upfront skill cost in executeSkill

  // Apply cleanses before applying new effects
  applyCleanses(
    effectResults.cleansesToApply,
    attacker,
    targets,
    attackHit,
    unitsToRecalculate
  )

  applyBuffsAndDebuffs(
    effectResults,
    attacker,
    targets,
    attackHit,
    unitsToRecalculate
  )

  applyConferrals(effectResults.conferralsToApply, attacker, targets, attackHit)

  applyDebuffAmplifications(
    effectResults.debuffAmplificationsToApply,
    attacker,
    targets,
    attackHit,
    unitsToRecalculate
  )

  applyEvades(
    effectResults.evadesToApply,
    attacker,
    targets,
    attackHit,
    unitsToRecalculate
  )

  applyDamageImmunities(
    effectResults.damageImmunitiesToApply,
    attacker,
    targets,
    attackHit,
    unitsToRecalculate
  )

  applyResurrects(effectResults.resurrectsToApply, attacker, targets, attackHit)

  applyLifeshare(
    effectResults.lifeshareToApply,
    attacker,
    targets,
    attackHit,
    effectResults,
    unitsToRecalculate
  )

  applyOwnHPBasedHeal(
    effectResults.ownHPBasedHeal,
    attacker,
    targets,
    attackHit,
    effectResults,
    unitsToRecalculate
  )

  applyAfflictions(
    effectResults.afflictionsToApply,
    attacker,
    targets,
    attackHit,
    unitsToRecalculate
  )

  unitsToRecalculate.forEach(unit => {
    recalculateStats(unit)
  })
}

export const applyBuff = (
  unit: BattleContext,
  newBuff: Buff,
  allowStacks: boolean
) => {
  applyStatusEffect(unit.buffs, newBuff, allowStacks)
}

const applyDebuff = (
  unit: BattleContext,
  newDebuff: Debuff,
  allowStacks: boolean
) => {
  if (isImmuneToDebuff(unit)) {
    logCombat(`${unit.unit.name} is immune to ${newDebuff.name}`)
    return
  }

  applyStatusEffect(unit.debuffs, newDebuff, allowStacks)
}

const applyConferral = (unit: BattleContext, newConferral: ConferralStatus) => {
  applyStatusEffect(unit.conferrals, newConferral, false)

  logCombat(
    `${unit.unit.name} received conferral: +${newConferral.potency} magical potency from caster MATK ${newConferral.casterMATK}`
  )
}

const applyDebuffAmplification = (
  unit: BattleContext,
  newAmplification: DebuffAmplificationStatus
) => {
  applyStatusEffect(unit.debuffAmplifications, newAmplification, false)
}

const applyEvade = (unit: BattleContext, newEvade: EvadeStatus) => {
  applyStatusEffect(unit.evades, newEvade, false)
}

export const checkAndConsumeSurviveLethal = (
  unit: BattleContext,
  newHP: number
) => {
  if (newHP > 0) return newHP

  const surviveLethalBuffIndex = unit.buffs.findIndex(
    buff => buff.stat === 'SurviveLethal'
  )

  if (surviveLethalBuffIndex !== -1) {
    const consumedBuff = unit.buffs[surviveLethalBuffIndex]
    unit.buffs.splice(surviveLethalBuffIndex, 1)
    logCombat(
      `💚 ${unit.unit.name}'s ${consumedBuff.name} buff consumed (survived lethal blow)`
    )
    recalculateStats(unit)
    return 1
  }

  return 0
}

const isImmuneToDebuff = (unit: BattleContext) => {
  // Check permanent immunities first (not consumed)
  const hasPermanentImmunity = unit.immunities.some(immunity => {
    return immunity === 'Debuff'
  })

  // Check for DebuffImmunity buff (consumed on use)
  const immunityBuffIndex = unit.buffs.findIndex(
    buff => buff.stat === 'DebuffImmunity'
  )

  if (immunityBuffIndex !== -1) {
    const consumedBuff = unit.buffs[immunityBuffIndex]
    unit.buffs.splice(immunityBuffIndex, 1)
    logCombat(
      `🛡️ ${unit.unit.name}'s ${consumedBuff.name} buff consumed (blocked debuff)`
    )
    recalculateStats(unit)
    return true
  }

  if (hasPermanentImmunity) {
    return true
  }

  return false
}

export const removeExpiredBuffs = (
  unit: BattleContext,
  trigger: 'attacks' | 'attacked' | 'debuffed' | 'action'
) => {
  const initialBuffCount = unit.buffs.length
  const expiredBuffs: Buff[] = []
  const durationMap = {
    attacks: 'UntilNextAttack',
    attacked: 'UntilAttacked',
    debuffed: 'UntilDebuffed',
    action: 'UntilNextAction',
  } as const
  const expiredDuration = durationMap[trigger]

  expiredBuffs.push(
    ...unit.buffs.filter(buff => buff.duration === expiredDuration)
  )
  unit.buffs = removeExpiredStatus(unit.buffs, trigger)

  // Also remove expired conferrals, evades, damage immunities, and debuff amplifications
  const initialConferralCount = (unit.conferrals || []).length
  const initialEvadeCount = (unit.evades || []).length
  const initialDamageImmunityCount = (unit.damageImmunities || []).length
  const initialDebuffAmplificationCount = (unit.debuffAmplifications || [])
    .length

  if (trigger === 'attacks' || trigger === 'attacked' || trigger === 'action') {
    unit.conferrals = removeExpiredStatus(unit.conferrals || [], trigger)
    unit.evades = removeExpiredStatus(unit.evades || [], trigger)
    unit.damageImmunities = removeExpiredStatus(
      unit.damageImmunities || [],
      trigger
    )
    unit.debuffAmplifications = removeExpiredStatus(
      unit.debuffAmplifications || [],
      trigger
    )
  }

  const buffsChanged = unit.buffs.length !== initialBuffCount
  const conferralsChanged =
    (unit.conferrals || []).length !== initialConferralCount
  const evadesChanged = (unit.evades || []).length !== initialEvadeCount
  const damageImmunitiesChanged =
    (unit.damageImmunities || []).length !== initialDamageImmunityCount
  const debuffAmplificationsChanged =
    (unit.debuffAmplifications || []).length !== initialDebuffAmplificationCount

  if (
    buffsChanged ||
    conferralsChanged ||
    evadesChanged ||
    damageImmunitiesChanged ||
    debuffAmplificationsChanged
  ) {
    logCombat(
      `🔄 Status Expired for ${unit.unit.name} (trigger: ${trigger}):`,
      {
        expiredBuffs: expiredBuffs.map(b => ({
          name: b.name,
          stat: b.stat,
          value: b.value,
        })),
        remainingBuffs: unit.buffs.length,
        remainingConferrals: (unit.conferrals || []).length,
        remainingEvades: (unit.evades || []).length,
        statAfterRecalc: unit.combatStats,
      }
    )
    if (buffsChanged) {
      recalculateStats(unit)
    }
  }
}

export const removeExpiredDebuffs = (
  unit: BattleContext,
  trigger: 'attacks' | 'action'
) => {
  const initialCount = unit.debuffs.length
  const durationMap = {
    attacks: 'UntilNextAttack',
    action: 'UntilNextAction',
  } as const
  const expiredDuration = durationMap[trigger]
  const expiredDebuffs: Debuff[] = unit.debuffs.filter(
    debuff => debuff.duration === expiredDuration
  )

  unit.debuffs = removeExpiredStatus(unit.debuffs, trigger)

  if (unit.debuffs.length !== initialCount) {
    logCombat(
      `🔄 Debuffs Expired for ${unit.unit.name} (trigger: ${trigger}):`,
      {
        expiredDebuffs: expiredDebuffs.map(d => ({
          name: d.name,
          stat: d.stat,
          value: d.value,
        })),
        remainingDebuffs: unit.debuffs.length,
        statAfterRecalc: unit.combatStats,
      }
    )
    recalculateStats(unit)
  }
}

export const removeExpiredConferrals = (
  unit: BattleContext,
  trigger: 'attacks' | 'attacked' | 'action'
) => {
  const initialCount = (unit.conferrals || []).length
  unit.conferrals = removeExpiredStatus(unit.conferrals || [], trigger)

  if ((unit.conferrals || []).length !== initialCount) {
    logCombat(`${unit.unit.name} conferrals expired (${trigger})`)
  }
}

export const getBuffsForStat = (
  unit: BattleContext,
  stat: StatKey | ExtraStats
): Buff[] => {
  return unit.buffs.filter(buff => buff.stat === stat)
}

export const getDebuffsForStat = (
  unit: BattleContext,
  stat: StatKey | ExtraStats
): Debuff[] => {
  return unit.debuffs.filter(debuff => debuff.stat === stat)
}

const shouldApplyConditionalBuff = (
  buff: Buff,
  target: BattleContext | null
) => {
  if (!buff.conditionalOnTarget) {
    return true
  }

  if (!target) {
    return false
  }

  if (buff.conditionalOnTarget.combatantType) {
    return target.combatantTypes.includes(
      buff.conditionalOnTarget.combatantType
    )
  }

  // If condition exists but no specific check, don't apply (safety)
  return false
}

export const calculateStatModifier = (
  unit: BattleContext,
  stat: StatKey | ExtraStats,
  target?: BattleContext | null
) => {
  const buffs = getBuffsForStat(unit, stat)
  const debuffs = getDebuffsForStat(unit, stat)

  const amplificationMultiplier =
    unit.debuffAmplifications.length > 0
      ? unit.debuffAmplifications[0].multiplier
      : 1.0

  let flatModifier = 0
  let percentModifier = 0

  // Apply buffs (no amplification for buffs)
  buffs.forEach(buff => {
    if (!shouldApplyConditionalBuff(buff, target ?? null)) {
      return
    }

    if (buff.scaling === 'flat') {
      flatModifier += buff.value
    } else if (buff.scaling === 'percent') {
      percentModifier += buff.value
    }
  })

  // Apply debuffs (debuff values are already negative, so add them directly)
  debuffs.forEach(debuff => {
    const amplifiedValue = debuff.value * amplificationMultiplier
    if (debuff.scaling === 'flat') {
      flatModifier += amplifiedValue
    } else if (debuff.scaling === 'percent') {
      percentModifier += amplifiedValue
    }
  })

  return { flatModifier, percentModifier }
}

export const hasBuffs = (unit: BattleContext) => {
  return (
    unit.buffs.length > 0 ||
    (unit.conferrals || []).length > 0 ||
    (unit.evades?.length ?? 0) > 0
  )
}

export const hasDebuffs = (unit: BattleContext) => {
  return unit.debuffs.length > 0
}

export const hasAffliction = (unit: BattleContext, afflictionType: string) => {
  return unit.afflictions.some(affliction => affliction.type === afflictionType)
}

export const initializeStatFoundation = (unit: BattleContext) => {
  const baseStats = calculateBaseStats(
    unit.unit.level,
    unit.unit.classKey,
    unit.unit.growths,
    unit.unit.dews
  )
  const equipmentBonus = calculateEquipmentBonus(
    unit.unit.equipment,
    baseStats,
    unit.unit.classKey
  )

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
    DmgReductionPercent: equipmentBonus.DmgReductionPercent ?? 0,
  }

  recalculateStats(unit)
}

/**
 * Stat keys that are recalculated with buff/debuff modifiers (flat + percent)
 * These match the keys in statFoundation/combatStats that support buff/debuff modifiers
 */
const RECALCULATED_STAT_KEYS: Array<
  keyof Pick<
    BattleContext['statFoundation'],
    | 'HP'
    | 'PATK'
    | 'PDEF'
    | 'MATK'
    | 'MDEF'
    | 'ACC'
    | 'EVA'
    | 'CRT'
    | 'GRD'
    | 'INIT'
  >
> = ['HP', 'PATK', 'PDEF', 'MATK', 'MDEF', 'ACC', 'EVA', 'CRT', 'GRD', 'INIT']

export const recalculateStats = (unit: BattleContext) => {
  const foundation = unit.statFoundation

  // Handle "Attack" stat buffs/debuffs (affects both PATK and MATK)
  // No target provided = exclude conditional buffs
  const attackModifiers = calculateStatModifier(unit, 'Attack' as ExtraStats)

  // Handle "Defense" stat buffs/debuffs (affects both PDEF and MDEF)
  // No target provided = exclude conditional buffs
  const defenseModifiers = calculateStatModifier(unit, 'Defense' as ExtraStats)

  for (const statKey of RECALCULATED_STAT_KEYS) {
    const foundationValue = foundation[statKey]
    // No target provided = exclude conditional buffs
    const modifiers = calculateStatModifier(unit, statKey)

    let finalFlatModifier = modifiers.flatModifier
    let finalPercentModifier = modifiers.percentModifier

    if (statKey === 'PATK' || statKey === 'MATK') {
      finalFlatModifier += attackModifiers.flatModifier
      finalPercentModifier += attackModifiers.percentModifier
    }

    if (statKey === 'PDEF' || statKey === 'MDEF') {
      finalFlatModifier += defenseModifiers.flatModifier
      finalPercentModifier += defenseModifiers.percentModifier
    }

    const afterFlat = foundationValue + finalFlatModifier

    const percentMultiplier = 1 + finalPercentModifier / 100
    const final = Math.round(afterFlat * percentMultiplier)

    // HP has minimum of 1, all other stats can go to 0
    const minimum = statKey === 'HP' ? 1 : 0
    unit.combatStats[statKey] = Math.max(final, minimum)
  }

  // Handle GuardEff separately (no buff/debuff modifiers yet)
  unit.combatStats.GuardEff = foundation.GuardEff

  // Handle DmgReductionPercent with buff/debuff modifiers (only flat scaling)
  const dmgReductionModifiers = calculateStatModifier(
    unit,
    'DmgReductionPercent'
  )
  unit.combatStats.DmgReductionPercent = Math.max(
    0,
    foundation.DmgReductionPercent + dmgReductionModifiers.flatModifier
  )
}

export const getEffectiveStatsForTarget = (
  attacker: BattleContext,
  target: BattleContext
): BattleContext['combatStats'] => {
  const foundation = attacker.statFoundation

  const effectiveStats: BattleContext['combatStats'] = {
    ...attacker.combatStats,
  }

  // Handle "Attack" stat buffs/debuffs (affects both PATK and MATK)
  const attackModifiers = calculateStatModifier(
    attacker,
    'Attack' as ExtraStats,
    target
  )

  // Handle "Defense" stat buffs/debuffs (affects both PDEF and MDEF)
  const defenseModifiers = calculateStatModifier(
    attacker,
    'Defense' as ExtraStats,
    target
  )

  // Recalculate stats that support buff/debuff modifiers (with target for conditional buffs)
  for (const statKey of RECALCULATED_STAT_KEYS) {
    const foundationValue = foundation[statKey]
    // Include conditional buffs when target matches
    const modifiers = calculateStatModifier(attacker, statKey, target)

    let finalFlatModifier = modifiers.flatModifier
    let finalPercentModifier = modifiers.percentModifier

    if (statKey === 'PATK' || statKey === 'MATK') {
      finalFlatModifier += attackModifiers.flatModifier
      finalPercentModifier += attackModifiers.percentModifier
    }

    if (statKey === 'PDEF' || statKey === 'MDEF') {
      finalFlatModifier += defenseModifiers.flatModifier
      finalPercentModifier += defenseModifiers.percentModifier
    }

    const afterFlat = foundationValue + finalFlatModifier

    const percentMultiplier = 1 + finalPercentModifier / 100
    const final = Math.round(afterFlat * percentMultiplier)

    // HP has minimum of 1, all other stats can go to 0
    const minimum = statKey === 'HP' ? 1 : 0
    effectiveStats[statKey] = Math.max(final, minimum)
  }

  // GuardEff and DmgReductionPercent don't change with target
  effectiveStats.GuardEff = attacker.combatStats.GuardEff
  effectiveStats.DmgReductionPercent = attacker.combatStats.DmgReductionPercent

  return effectiveStats
}
