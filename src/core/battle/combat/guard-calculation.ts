import type { GuardLevel } from '@/core/calculations/combat-calculations'

export const calculateNaturalGuardMultiplier = (
  didGuard: boolean,
  equipmentGuardEff: number
) => {
  if (!didGuard) {
    return 1.0
  }

  const baseGuardEff = 25
  const totalGuardEff = baseGuardEff + equipmentGuardEff
  const reductionPercent = Math.min(totalGuardEff, 75)
  const multiplier = (100 - reductionPercent) / 100

  return multiplier
}

export const calculateSkillGuardMultiplier = (guardLevel: GuardLevel) => {
  const fixedMultipliers: Record<GuardLevel, number> = {
    none: 1.0,
    light: 0.75,
    medium: 0.5,
    heavy: 0.25,
  }

  return fixedMultipliers[guardLevel]
}
