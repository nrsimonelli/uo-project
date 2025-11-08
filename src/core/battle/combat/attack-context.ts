import { logCombat } from './combat-utils'
import type { AttackContext } from './damage-calculator-types'
import type { EffectProcessingResult } from './effect-processor'

import {
  getAttackType,
  getDamageType,
  getCombinedFlags,
} from '@/core/attack-types'
import type { BattleContext } from '@/types/battle-engine'
import type { DamageEffect, Flag } from '@/types/effects'

export const prepareAttackContext = (
  damageEffect: DamageEffect,
  skillFlags: readonly Flag[] | Flag[],
  attacker: BattleContext,
  innateAttackType?: 'Magical' | 'Ranged',
  effectResults?: EffectProcessingResult
): AttackContext => {
  const combinedFlags = getCombinedFlags(
    skillFlags,
    effectResults?.grantedFlags || []
  )

  if (effectResults?.grantedFlags && effectResults.grantedFlags.length > 0) {
    logCombat('🚩 Granted Flags Applied:', {
      grantedFlags: effectResults?.grantedFlags,
      allCombinedFlags: combinedFlags,
    })
  }

  const attackType = getAttackType(attacker.unit.classKey, innateAttackType)
  const damageType = getDamageType(damageEffect)
  const hasPhysical =
    damageEffect.potency.physical !== undefined &&
    damageEffect.potency.physical > 0
  const hasMagical =
    damageEffect.potency.magical !== undefined &&
    damageEffect.potency.magical > 0

  return {
    combinedFlags,
    attackType,
    damageType,
    hasPhysical,
    hasMagical,
  }
}
