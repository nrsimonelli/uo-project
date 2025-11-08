import { logCombat, getSkillName } from './combat-utils'
import type { DamageResult } from './damage-calculator-types'

import type { BattleContext, EvadeStatus } from '@/types/battle-engine'

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

const getInitialTwoHitsRemaining = (
  evades: EvadeStatus[],
  provided?: number
): number => {
  if (provided !== undefined && provided > 0) return provided

  const twoHitsEvades = evades.filter(evade => evade.evadeType === 'twoHits')
  return twoHitsEvades[0]?._remainingUses ?? (twoHitsEvades.length > 0 ? 2 : 0)
}

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

const consumeAllEvades = (evades: EvadeStatus[]): EvadeStatus[] => {
  const consumed = [...evades]
  evades.length = 0
  return consumed
}

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

  if (hasTrueStrike) {
    const consumedEvades = consumeAllUntilAttacked(target.evades)
    return { dodged: false, consumedEvades, twoHitsRemaining: 0 }
  }

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

  const evadeByType = {
    entireAttack: evades.filter(evade => evade.evadeType === 'entireAttack'),
    twoHits: evades.filter(evade => evade.evadeType === 'twoHits'),
    singleHit: evades.filter(evade => evade.evadeType === 'singleHit'),
  }

  // Priority 1: entireAttack - consumes all evades
  if (evadeByType.entireAttack.length > 0) {
    const consumedEvades = consumeAllEvades(target.evades)
    logCombat(
      `💨 ${target.unit.name} evaded entire attack using ${getSkillName(evadeByType.entireAttack[0].skillId)}`
    )
    return { dodged: true, consumedEvades, twoHitsRemaining: 0 }
  }

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

    logCombat(
      `💨 ${target.unit.name} evaded hit using ${getSkillName(evade.skillId)} (twoHits: ${2 - newRemaining}/2 used)`
    )
    return { dodged: true, consumedEvades, twoHitsRemaining: newRemaining }
  }

  if (evadeByType.singleHit.length > 0) {
    const evadeToConsume = evadeByType.singleHit[0]
    const consumedEvades: EvadeStatus[] = []
    if (evadeToConsume.duration === 'UntilAttacked') {
      const consumed = consumeEvade(target.evades, evadeToConsume)
      if (consumed) consumedEvades.push(consumed)
    }
    logCombat(
      `💨 ${target.unit.name} evaded hit using ${getSkillName(evadeToConsume.skillId)} (singleHit)`
    )
    return { dodged: true, consumedEvades, twoHitsRemaining: 0 }
  }

  return { dodged: false, consumedEvades: [], twoHitsRemaining: 0 }
}

export const createDodgedResult = (): DamageResult => ({
  hit: false,
  damage: 0,
  wasCritical: false,
  wasGuarded: false,
  wasDodged: true,
  hitChance: 0,
  breakdown: {
    rawBaseDamage: 0,
    afterPotency: 0,
    afterCrit: 0,
    afterGuard: 0,
    afterEffectiveness: 0,
    afterDmgReduction: 0,
  },
})

export const getCurrentTwoHitsRemaining = (evades: EvadeStatus[]): number => {
  const twoHitsEvade = evades.find(evade => evade.evadeType === 'twoHits')
  return twoHitsEvade?._remainingUses ?? (twoHitsEvade ? 2 : 0)
}
