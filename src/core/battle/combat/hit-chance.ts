import { getEffectiveStatsForTarget } from './status-effects'

import type { RandomNumberGeneratorType } from '@/core/random'
import { clamp } from '@/lib/utils'
import type { BattleContext } from '@/types/battle-engine'
import type { DamageEffect, Flag } from '@/types/effects'

export const calculateHitChance = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  flags: Flag[] = [],
  attackType?: 'Melee' | 'Ranged' | 'Magical'
) => {
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

  const effectiveStats = getEffectiveStatsForTarget(attacker, target)
  const accuracy = effectiveStats.ACC
  const evasion = target.combatStats.EVA
  const skillHitRate = damageEffect.hitRate

  const rawHitChance = ((100 + accuracy - evasion) * skillHitRate) / 100

  const targetIsFlying = target.combatantTypes.includes('Flying')
  const flyingEvasionBonus = targetIsFlying && attackType === 'Melee' ? 0.5 : 1

  const adjustedHitChance = rawHitChance * flyingEvasionBonus
  const clampedHitChance = clamp(adjustedHitChance, 0, 100)

  return clampedHitChance
}

export const rollHit = (rng: RandomNumberGeneratorType, hitChance: number) => {
  const roll = rng.random() * 100
  const hit = roll < hitChance
  return hit
}
