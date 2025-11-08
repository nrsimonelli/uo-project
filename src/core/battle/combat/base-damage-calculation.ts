import type { EffectProcessingResult } from './effect-processor'
import { getEffectiveStatsForTarget } from './status-effects'

import type { BattleContext } from '@/types/battle-engine'

export const calculateBaseDamage = (
  attacker: BattleContext,
  target: BattleContext,
  potency: number,
  isPhysical: boolean,
  effectResults?: EffectProcessingResult
): { rawBase: number; afterPotency: number } => {
  const effectiveStats = getEffectiveStatsForTarget(attacker, target)
  const attack = isPhysical ? effectiveStats.PATK : effectiveStats.MATK

  let defense = isPhysical ? target.combatStats.PDEF : target.combatStats.MDEF

  let adjustedPotency = potency
  if (effectResults) {
    const bonusPercent = isPhysical
      ? effectResults.potencyModifiers.physical
      : effectResults.potencyModifiers.magical
    adjustedPotency *= 1 + bonusPercent / 100
  }

  if (effectResults && effectResults.defenseIgnoreFraction > 0) {
    defense *= 1 - effectResults.defenseIgnoreFraction
  }

  const rawBase = attack - defense
  const afterPotency = Math.max(1, (rawBase * adjustedPotency) / 100)

  return { rawBase, afterPotency }
}
