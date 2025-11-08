import { logCombat } from './combat-utils'
import { BUFF_STATS, type ConsumableBuffStat } from './damage-calculator-types'
import { recalculateStats } from './status-effects'

import type { BattleContext, Buff } from '@/types/battle-engine'
import type { Flag } from '@/types/effects'

export const hasFlagOrBuff = (
  flags: Flag[],
  buffs: BattleContext['buffs'],
  flagName: Flag,
  buffStat: string
): boolean => {
  return flags.includes(flagName) || buffs.some(buff => buff.stat === buffStat)
}

const checkAndConsumeBuff = (
  unit: BattleContext,
  stat: ConsumableBuffStat,
  options?: {
    consumeOnUse?: (buff: Buff) => boolean
    logMessage?: (unitName: string, buffName: string) => string
  }
): boolean => {
  const buffIndex = unit.buffs.findIndex(buff => buff.stat === stat)
  if (buffIndex === -1) return false

  const buff = unit.buffs[buffIndex]

  const shouldConsume =
    options?.consumeOnUse !== undefined
      ? options.consumeOnUse(buff)
      : stat === BUFF_STATS.UNGUARDABLE
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

export const checkAndConsumeNegateMagicDamage = (
  target: BattleContext
): boolean => {
  return checkAndConsumeBuff(target, BUFF_STATS.NEGATE_MAGIC_DAMAGE, {
    logMessage: (name, buffName) =>
      `🛡️ ${name}'s ${buffName} buff consumed (negated magic damage)`,
  })
}

export const checkAndConsumeTrueStrike = (attacker: BattleContext): boolean => {
  return checkAndConsumeBuff(attacker, BUFF_STATS.TRUE_STRIKE, {
    logMessage: (name, buffName) =>
      `🎯 ${name}'s ${buffName} buff consumed (guaranteed hit)`,
  })
}

export const checkAndConsumeTrueCritical = (
  attacker: BattleContext
): boolean => {
  return checkAndConsumeBuff(attacker, BUFF_STATS.TRUE_CRITICAL, {
    logMessage: (name, buffName) =>
      `✨ ${name}'s ${buffName} buff consumed (guaranteed crit)`,
  })
}

export const checkAndConsumeUnguardable = (
  attacker: BattleContext
): boolean => {
  return checkAndConsumeBuff(attacker, BUFF_STATS.UNGUARDABLE, {
    consumeOnUse: buff => buff.duration !== 'Indefinite',
    logMessage: (name, buffName) =>
      `⚡ ${name}'s ${buffName} buff consumed (guard bypassed)`,
  })
}
