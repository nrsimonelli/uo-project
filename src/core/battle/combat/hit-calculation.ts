import {
  checkAndConsumeBlind,
  processAfflictionsOnHit,
} from './affliction-manager'
import { checkAndConsumeTrueStrike, hasFlagOrBuff } from './buff-consumption'
import { logCombat } from './combat-utils'
import { BUFF_STATS } from './damage-calculator-types'
import type { AttackContext, HitResolution } from './damage-calculator-types'
import { checkAndConsumeEvade } from './evade-system'
import { calculateHitChance, rollHit } from './hit-chance'

import type { RandomNumberGeneratorType } from '@/core/random'
import type { BattleContext } from '@/types/battle-engine'
import type { DamageEffect, Flag } from '@/types/effects'

export const resolveHit = (
  attacker: BattleContext,
  target: BattleContext,
  damageEffect: DamageEffect,
  context: AttackContext,
  rng: RandomNumberGeneratorType,
  twoHitsRemaining?: number
): HitResolution | null => {
  const blindMiss = checkAndConsumeBlind(attacker)
  if (blindMiss) {
    return null
  }

  const isTrueStrike = hasFlagOrBuff(
    context.combinedFlags,
    attacker.buffs,
    BUFF_STATS.TRUE_STRIKE as Flag,
    BUFF_STATS.TRUE_STRIKE
  )

  const hitChance = calculateHitChance(
    attacker,
    target,
    damageEffect,
    context.combinedFlags,
    context.attackType
  )

  const hasTrueStrikeBuff = attacker.buffs.some(
    buff => buff.stat === BUFF_STATS.TRUE_STRIKE
  )
  if (hasTrueStrikeBuff) {
    checkAndConsumeTrueStrike(attacker)
  }

  if (isTrueStrike) {
    logCombat('🎯 TrueStrike Active - guaranteed hit')
  }

  const hit = rollHit(rng, hitChance) || isTrueStrike

  const evadeResult = checkAndConsumeEvade(
    target,
    isTrueStrike,
    hit,
    twoHitsRemaining
  )

  const wasDodged = evadeResult.dodged && !isTrueStrike
  const finalHit = hit && !wasDodged

  if (finalHit) {
    processAfflictionsOnHit(target)
  }

  return {
    hit,
    hitChance,
    wasDodged,
    finalHit,
  }
}
