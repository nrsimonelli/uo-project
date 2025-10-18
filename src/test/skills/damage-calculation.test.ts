import { describe, it, expect } from 'vitest'

import { calculateSkillDamage } from '../../core/battle/combat/damage-calculator'
import type { DamageEffect } from '../../types/effects'
import { mockRngPresets } from '../utils/mock-rng'
import { createMockTacticalContext } from '../utils/tactical-test-utils'

describe('Damage Calculation', () => {
  it('should calculate basic physical damage', () => {
    const damageEffect: DamageEffect = {
      kind: 'Damage',
      potency: { physical: 100 },
      hitRate: 100,
      hitCount: 1,
    }

    const context = createMockTacticalContext()
    const result = calculateSkillDamage(
      damageEffect,
      [], // skillFlags
      ['Damage'], // skillCategories
      context.actingUnit,
      context.allEnemies[0],
      mockRngPresets.alwaysHit()
    )

    expect(result.hit).toBe(true)
    expect(result.damage).toBeGreaterThan(0)
  })

  it('should miss when RNG says so', () => {
    const damageEffect: DamageEffect = {
      kind: 'Damage',
      potency: { physical: 100 },
      hitRate: 50,
      hitCount: 1,
    }

    const context = createMockTacticalContext()
    const result = calculateSkillDamage(
      damageEffect,
      [], // skillFlags
      ['Damage'], // skillCategories
      context.actingUnit,
      context.allEnemies[0],
      mockRngPresets.alwaysMiss()
    )

    expect(result.hit).toBe(false)
    expect(result.damage).toBe(0)
  })
})
