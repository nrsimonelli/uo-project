import type { RandomNumberGeneratorType } from './random'
import { clamp } from './utils'

export const calculateDamage = (
  attack: number,
  defense: number,
  potency: number,
  critMultiplier: number,
  guardMultiplier: number,
  effectiveness: number,
  isPhysical: boolean
) => {
  const afterDefense = attack - defense
  const afterPotency = afterDefense * (potency / 100)
  const afterCrit = afterPotency * critMultiplier
  const afterGuard = isPhysical ? afterCrit * guardMultiplier : afterCrit
  const afterEffectiveness = afterGuard * effectiveness
  const finalDamage = Math.max(1, Math.round(afterEffectiveness))

  console.debug('Damage Calculation Trace', {
    attack,
    defense,
    potency,
    critMultiplier,
    guardMultiplier,
    effectiveness,
    isPhysical,
    afterDefense,
    afterPotency,
    afterCrit,
    afterGuard,
    afterEffectiveness,
    finalDamage,
  })

  return finalDamage
}

// Crit
export const rollCrit = (r: RandomNumberGeneratorType, critRate: number) => {
  const chance = clamp(critRate, 0, 100)
  const roll = r.random() * 100
  const didCrit = roll < chance
  console.debug('Crit Roll', { critRate, chance, roll, didCrit })
  return didCrit
}

export const getCritMultiplier = (
  didCrit: boolean,
  baseMultiplier = 1.5,
  bonusModifiers: number[] = []
) => {
  const totalMultiplier =
    baseMultiplier + bonusModifiers.reduce((a, b) => a + b, 0)
  const result = didCrit ? totalMultiplier : 1
  console.debug('Crit Multiplier', { didCrit, totalMultiplier, result })
  return result
}

// Guard
export type GuardLevel = 'none' | 'light' | 'medium' | 'heavy'

export const rollGuard = (r: RandomNumberGeneratorType, guardRate: number) => {
  const chance = clamp(guardRate, 0, 100)
  const roll = r.random() * 100
  const didGuard = roll < chance
  console.debug('Guard Roll', { guardRate, chance, roll, didGuard })
  return didGuard
}

export const getGuardMultiplier = (
  didGuard: boolean,
  guardLevel: GuardLevel
) => {
  const multipliers: Record<GuardLevel, number> = {
    none: 1,
    light: 0.75,
    medium: 0.5,
    heavy: 0.25,
  }
  const result = didGuard ? multipliers[guardLevel] : 1
  console.debug('Guard Multiplier', { didGuard, guardLevel, result })
  return result
}
