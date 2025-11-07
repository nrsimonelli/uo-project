import { describe, it, expect } from 'vitest'

import { calculateSkillDamage } from '../../core/battle/combat/damage-calculator'
import { mockRngPresets } from '../utils/mock-rng'
import {
  createMockTacticalContext,
  createDamageEffect,
} from '../utils/tactical-test-utils'

describe('Damage Calculation', () => {
  it('should calculate basic physical damage', () => {
    const damageEffect = createDamageEffect()

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
    const damageEffect = createDamageEffect({ hitRate: 50 })

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
