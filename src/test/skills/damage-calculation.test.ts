import { describe, it, expect } from 'vitest'

import { mockRngPresets } from '../utils/mock-rng'
import { createMockContext } from '../utils/test-factories'

import { calculateSkillDamage } from '@/core/battle-damage'
import type { DamageEffect } from '@/types/effects'

describe('Damage Calculation', () => {
  it('should calculate basic physical damage', () => {
    const damageEffect: DamageEffect = {
      kind: 'Damage',
      potency: { physical: 100 },
      hitRate: 100,
      hitCount: 1
    }

    const context = createMockContext()
    const result = calculateSkillDamage(
      damageEffect,
      [], // skillFlags
      ['Damage'], // skillCategories
      context.attacker,
      context.target,
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
      hitCount: 1
    }

    const context = createMockContext()
    const result = calculateSkillDamage(
      damageEffect,
      [], // skillFlags
      ['Damage'], // skillCategories
      context.attacker,
      context.target,
      mockRngPresets.alwaysMiss()
    )

    expect(result.hit).toBe(false)
    expect(result.damage).toBe(0)
  })
})