import type { DamageModifiers } from './damage-calculator-types'
import { calculateEffectiveness } from './effectiveness-calculation'

import type { BattleContext } from '@/types/battle-engine'

const applyDamageReduction = (
  damage: number,
  dmgReductionPercent: number
): number => {
  const multiplier = (100 - dmgReductionPercent) / 100
  return Math.max(1, Math.round(damage * multiplier))
}

export const applyDamageModifiers = (
  attacker: BattleContext,
  target: BattleContext,
  totalDamage: number
): DamageModifiers => {
  const { multiplier: effectiveness, rule: effectivenessRule } =
    calculateEffectiveness(attacker, target, true)
  const afterEffectiveness = Math.max(
    1,
    Math.round(totalDamage * effectiveness)
  )

  const dmgReductionPercent = target.combatStats.DmgReductionPercent ?? 0
  const finalDamage = applyDamageReduction(
    afterEffectiveness,
    dmgReductionPercent
  )

  return {
    effectiveness,
    effectivenessRule,
    afterEffectiveness,
    finalDamage,
    dmgReductionPercent,
  }
}

export { applyDamageReduction }
