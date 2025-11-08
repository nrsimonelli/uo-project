import { logCombat, getSkillName } from './combat-utils'

import type { BattleContext, DamageImmunityStatus } from '@/types/battle-engine'

const consumeDamageImmunity = (
  immunities: DamageImmunityStatus[],
  immunity: DamageImmunityStatus
): DamageImmunityStatus | null => {
  const index = immunities.indexOf(immunity)
  if (index !== -1) {
    immunities.splice(index, 1)
    return immunity
  }
  return null
}

const getInitialRemainingHits = (
  immunities: DamageImmunityStatus[],
  provided?: number
): number => {
  if (provided !== undefined && provided > 0) return provided

  const multipleHitsImmunity = immunities.find(
    immunity => immunity.immunityType === 'multipleHits'
  )
  return (
    multipleHitsImmunity?.remainingImmunityHits ??
    multipleHitsImmunity?.hitCount ??
    0
  )
}

const consumeAllDamageImmunities = (
  immunities: DamageImmunityStatus[]
): DamageImmunityStatus[] => {
  const consumed = [...immunities]
  immunities.length = 0
  return consumed
}

export const checkAndConsumeDamageImmunity = (
  target: BattleContext,
  remainingImmunityHits?: number
): {
  blocked: boolean
  consumedImmunities: DamageImmunityStatus[]
  remainingImmunityHits: number
} => {
  const immunities = target.damageImmunities || []

  if (immunities.length === 0) {
    return {
      blocked: false,
      consumedImmunities: [],
      remainingImmunityHits: 0,
    }
  }

  const immunityByType = {
    entireAttack: immunities.filter(
      immunity => immunity.immunityType === 'entireAttack'
    ),
    multipleHits: immunities.filter(
      immunity => immunity.immunityType === 'multipleHits'
    ),
    singleHit: immunities.filter(
      immunity => immunity.immunityType === 'singleHit'
    ),
  }

  // Priority 1: entireAttack - blocks all damage, consumes all immunities
  if (immunityByType.entireAttack.length > 0) {
    const consumedImmunities = consumeAllDamageImmunities(
      target.damageImmunities
    )
    logCombat(
      `🛡️ ${target.unit.name} blocked entire attack using ${getSkillName(immunityByType.entireAttack[0].skillId)}`
    )
    return { blocked: true, consumedImmunities, remainingImmunityHits: 0 }
  }

  const currentRemaining = getInitialRemainingHits(
    immunities,
    remainingImmunityHits
  )
  if (immunityByType.multipleHits.length > 0 && currentRemaining > 0) {
    const immunity = immunityByType.multipleHits[0]
    const newRemaining = currentRemaining - 1
    immunity.remainingImmunityHits = newRemaining

    const consumedImmunities: DamageImmunityStatus[] = []
    if (newRemaining === 0 && immunity.duration === 'UntilAttacked') {
      const consumed = consumeDamageImmunity(target.damageImmunities, immunity)
      if (consumed) consumedImmunities.push(consumed)
    }

    logCombat(
      `🛡️ ${target.unit.name} blocked damage using ${getSkillName(immunity.skillId)} (multipleHits: ${(immunity.hitCount ?? 0) - newRemaining}/${immunity.hitCount} used)`
    )
    return {
      blocked: true,
      consumedImmunities,
      remainingImmunityHits: newRemaining,
    }
  }

  if (immunityByType.singleHit.length > 0) {
    const immunityToConsume = immunityByType.singleHit[0]
    const consumedImmunities: DamageImmunityStatus[] = []
    if (immunityToConsume.duration === 'UntilAttacked') {
      const consumed = consumeDamageImmunity(
        target.damageImmunities,
        immunityToConsume
      )
      if (consumed) consumedImmunities.push(consumed)
    }
    logCombat(
      `🛡️ ${target.unit.name} blocked damage using ${getSkillName(immunityToConsume.skillId)} (singleHit)`
    )
    return { blocked: true, consumedImmunities, remainingImmunityHits: 0 }
  }

  return {
    blocked: false,
    consumedImmunities: [],
    remainingImmunityHits: 0,
  }
}
