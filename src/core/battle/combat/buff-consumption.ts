import { logCombat } from './combat-utils'
import type { ConsumableBuffStat } from './damage-calculator-types'
import { recalculateStats } from './status-effects'

import type { BattleContext, Buff } from '@/types/battle-engine'
import type { Flag } from '@/types/effects'

export const hasFlagOrBuff = (
  flags: Flag[],
  buffs: BattleContext['buffs'],
  flagName: Flag,
  buffStat: string
) => {
  return flags.includes(flagName) || buffs.some(buff => buff.stat === buffStat)
}

const checkAndConsumeBuff = (
  unit: BattleContext,
  stat: ConsumableBuffStat,
  options?: {
    consumeOnUse?: (buff: Buff) => boolean
    logMessage?: (unitName: string, buffName: string) => string
  }
) => {
  const buffIndex = unit.buffs.findIndex(buff => buff.stat === stat)
  if (buffIndex === -1) return false

  const buff = unit.buffs[buffIndex]

  // Permanent buffs cannot be consumed
  if (buff.permanent) {
    return true
  }

  const shouldConsume =
    options?.consumeOnUse !== undefined
      ? options.consumeOnUse(buff)
      : stat === 'Unguardable'
        ? buff.duration !== 'Indefinite'
        : true

  if (shouldConsume) {
    unit.buffs.splice(buffIndex, 1)
    const logMsg =
      options?.logMessage?.(unit.unit.name, buff.name) ||
      `${unit.unit.name}'s ${buff.name} buff consumed`
    logCombat(logMsg)
    recalculateStats(unit)
  }

  return true
}

export const checkAndConsumeNegateMagicDamage = (target: BattleContext) => {
  return checkAndConsumeBuff(target, 'NegateMagicDamage', {
    logMessage: (name, buffName) =>
      `🛡️ ${name}'s ${buffName} buff consumed (negated magic damage)`,
  })
}

export const checkAndConsumeNegatePhysicalDamage = (target: BattleContext) => {
  return checkAndConsumeBuff(target, 'NegatePhysicalDamage', {
    logMessage: (name, buffName) =>
      `🛡️ ${name}'s ${buffName} buff consumed (negated physical damage)`,
  })
}

export const checkAndConsumeTrueStrike = (attacker: BattleContext) => {
  return checkAndConsumeBuff(attacker, 'TrueStrike', {
    logMessage: (name, buffName) =>
      `🎯 ${name}'s ${buffName} buff consumed (guaranteed hit)`,
  })
}

export const checkAndConsumeTrueCritical = (attacker: BattleContext) => {
  return checkAndConsumeBuff(attacker, 'TrueCritical', {
    logMessage: (name, buffName) =>
      `✨ ${name}'s ${buffName} buff consumed (guaranteed crit)`,
  })
}

export const checkAndConsumeUnguardable = (attacker: BattleContext) => {
  return checkAndConsumeBuff(attacker, 'Unguardable', {
    consumeOnUse: buff => buff.duration !== 'Indefinite',
    logMessage: (name, buffName) =>
      `⚡ ${name}'s ${buffName} buff consumed (guard bypassed)`,
  })
}
