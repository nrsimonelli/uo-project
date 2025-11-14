import type { BattleContext, BattlefieldState } from '@/types/battle-engine'

export const MAX_AP = 4
export const MAX_PP = 4

export function clampAP(value: number) {
  return Math.min(MAX_AP, Math.max(0, value))
}

export function clampPP(value: number) {
  return Math.min(MAX_PP, Math.max(0, value))
}

export function deepCopyUnits(
  units: BattlefieldState['units']
): BattlefieldState['units'] {
  return Object.fromEntries(
    Object.entries(units).map(([id, u]) => [
      id,
      {
        ...u,
        unit: { ...u.unit },
        combatStats: { ...u.combatStats },
        afflictions: [...u.afflictions],
        buffs: [...u.buffs],
        debuffs: [...u.debuffs],
        conferrals: [...u.conferrals],
        evades: [...u.evades],
        damageImmunities: [...(u.damageImmunities || [])],
        debuffAmplifications: [...(u.debuffAmplifications || [])],
      } as BattleContext,
    ])
  )
}

export function cloneContext(ctx: BattleContext): BattleContext {
  return {
    ...ctx,
    unit: { ...ctx.unit },
    combatStats: { ...ctx.combatStats },
    afflictions: [...ctx.afflictions],
    buffs: [...ctx.buffs],
    debuffs: [...ctx.debuffs],
    conferrals: [...ctx.conferrals],
    evades: [...ctx.evades],
    damageImmunities: [...(ctx.damageImmunities || [])],
    debuffAmplifications: [...(ctx.debuffAmplifications || [])],
  }
}
