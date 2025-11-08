import { logCombat } from './combat-utils'

import { findEffectivenessRule } from '@/core/effectiveness-rules'
import { CLASS_DATA } from '@/data/units/class-data'
import type { BattleContext } from '@/types/battle-engine'

export const calculateEffectiveness = (
  attacker: BattleContext,
  target: BattleContext,
  isPhysical: boolean
): {
  multiplier: number
  rule: ReturnType<typeof findEffectivenessRule> | null
} => {
  void isPhysical
  const attackerClassData = CLASS_DATA[attacker.unit.classKey]
  const targetClassData = CLASS_DATA[target.unit.classKey]

  if (!attackerClassData || !targetClassData) {
    logCombat(`Missing class data for effectiveness calculation:`, {
      attackerClass: attacker.unit.classKey,
      targetClass: target.unit.classKey,
      attackerClassData: !!attackerClassData,
      targetClassData: !!targetClassData,
    })
    return { multiplier: 1.0, rule: null }
  }

  const effectivenessRule = findEffectivenessRule(
    attacker.unit.classKey,
    attackerClassData.movementType,
    attackerClassData.trait,
    target.unit.classKey,
    targetClassData.movementType,
    targetClassData.trait
  )

  return {
    multiplier: effectivenessRule ? effectivenessRule.multiplier : 1.0,
    rule: effectivenessRule,
  }
}
