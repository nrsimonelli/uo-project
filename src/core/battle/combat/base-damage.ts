import { calculateBaseDamage } from './base-damage-calculation'
import { logCombat } from './combat-utils'
import type { DamageComponents, AttackContext } from './damage-calculator-types'
import type { EffectProcessingResult } from './effect-processor'
import { removeExpiredConferrals } from './status-effects'

import type { BattleContext } from '@/types/battle-engine'
import type { DamageEffect } from '@/types/effects'

export const calculateDamageComponents = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  context: AttackContext,
  critMultiplier: number,
  guardMultiplier: number,
  effectResults?: EffectProcessingResult,
  magicNegated?: boolean
): DamageComponents => {
  let totalDamage = 0
  let physicalDamage = 0
  let magicalDamage = 0
  let conferralDamage = 0
  let baseDamage = 0
  let afterCritDamage = 0

  const calculateDamageComponent = (
    potency: number,
    isPhysical: boolean,
    isNegated: boolean,
    negateMessage: string
  ): { damage: number; base: number; afterCrit: number } => {
    if (isNegated) {
      logCombat(negateMessage)
      return { damage: 0, base: 0, afterCrit: 0 }
    }

    if (isPhysical && context.attackType === 'Melee' && target.incomingParry) {
      target.incomingParry = false
      return { damage: 0, base: 0, afterCrit: 0 }
    }

    const componentBase = calculateBaseDamage(
      attacker,
      target,
      potency,
      isPhysical,
      effectResults
    )
    const componentAfterCrit = componentBase * critMultiplier
    const componentAfterGuard = isPhysical
      ? componentAfterCrit * guardMultiplier
      : componentAfterCrit
    return {
      damage: Math.max(1, Math.round(componentAfterGuard)),
      base: componentBase,
      afterCrit: componentAfterCrit,
    }
  }

  if (context.hasPhysical) {
    const physicalResult = calculateDamageComponent(
      damageEffect.potency.physical!,
      true,
      false,
      ''
    )
    physicalDamage = physicalResult.damage
    baseDamage += physicalResult.base
    afterCritDamage += Math.round(physicalResult.afterCrit)
    totalDamage += physicalDamage
  }

  if (context.hasMagical) {
    const magicalResult = calculateDamageComponent(
      damageEffect.potency.magical!,
      false,
      magicNegated ?? false,
      `🛡️ ${target.unit.name} negated magic damage`
    )
    magicalDamage = magicalResult.damage
    baseDamage += magicalResult.base
    afterCritDamage += Math.round(magicalResult.afterCrit)
    totalDamage += magicalDamage
  }

  if (attacker.conferrals && attacker.conferrals.length > 0) {
    if (magicNegated) {
      logCombat(`🛡️ ${target.unit.name} negated conferral magic damage`)
      conferralDamage = 0
    } else {
      attacker.conferrals.forEach(conferral => {
        const conferralBaseDamage =
          ((conferral.casterMATK - target.combatStats.MDEF) *
            conferral.potency) /
          100
        const conferralAfterCrit = conferralBaseDamage * critMultiplier
        const conferralFinal = Math.max(1, Math.round(conferralAfterCrit))
        conferralDamage += conferralFinal
        baseDamage += conferralBaseDamage
        afterCritDamage += Math.round(conferralAfterCrit)
      })
    }
    totalDamage += conferralDamage

    logCombat('🪄 Conferral Effects Applied:', {
      conferralCount: attacker.conferrals.length,
      conferralDamage,
      conferrals: attacker.conferrals.map(c => ({
        skillId: c.skillId,
        potency: c.potency,
        casterMATK: c.casterMATK,
      })),
    })

    removeExpiredConferrals(attacker, 'attacks')
  }

  return {
    physicalDamage,
    magicalDamage,
    conferralDamage,
    totalDamage,
    baseDamage: Math.round(baseDamage),
    afterCritDamage: Math.round(afterCritDamage),
  }
}
