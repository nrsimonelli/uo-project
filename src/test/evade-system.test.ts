import { describe, it, expect, beforeEach } from 'vitest'

import { calculateSkillDamage } from '@/core/battle/combat/damage-calculator'
import { calculateMultiHitDamage } from '@/core/battle/combat/multi-hit-damage'
import { mockRngPresets } from '@/test/utils/mock-rng'
import {
  createStandardAttacker,
  createStandardTarget,
  createDamageEffect,
  DEFAULT_DEWS,
} from '@/test/utils/tactical-test-utils'
import type { BattleContext, EvadeStatus } from '@/types/battle-engine'

/**
 * Comprehensive tests for the Evade system
 * Tests singleHit, twoHits, and entireAttack evade functionality
 */

const createEvadeStatus = (
  evadeType: 'entireAttack' | 'singleHit' | 'twoHits',
  skillId = 'test-evade-skill',
  source = 'test-source'
): EvadeStatus => ({
  skillId,
  evadeType,
  duration: 'UntilAttacked',
  source,
})

describe('Evade System', () => {
  let attacker: BattleContext
  let target: BattleContext

  beforeEach(() => {
    attacker = createStandardAttacker({
      unit: {
        id: 'attacker',
        name: 'Attacker',
        classKey: 'Fighter',
        level: 10,
        growths: ['Hardy', 'Hardy'],
        dews: DEFAULT_DEWS,
        equipment: [],
        skillSlots: [],
      },
    })
    attacker.combatStats.ACC = 100
    attacker.combatStats.MATK = 40
    target = createStandardTarget({
      unit: {
        id: 'target',
        name: 'Target',
        classKey: 'Fighter',
        level: 10,
        growths: ['Hardy', 'Hardy'],
        dews: DEFAULT_DEWS,
        equipment: [],
        skillSlots: [],
      },
    })
  })

  describe('singleHit Evade', () => {
    it('should dodge the first successful hit of a single-hit attack', () => {
      target.evades = [createEvadeStatus('singleHit')]

      const damageEffect = createDamageEffect()

      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(result.wasDodged).toBe(true)
      expect(result.hit).toBe(false)
      expect(result.damage).toBe(0)
      expect(target.evades).toHaveLength(0) // Evade consumed
    })

    it('should not dodge if the attack would naturally miss', () => {
      target.evades = [createEvadeStatus('singleHit')]

      // Lower ACC/EVA to ensure misses are possible with alwaysMiss RNG
      // alwaysMiss returns 0.99, so we need hitChance < 99 for it to miss
      // With ACC 20, EVA 100, hitRate 50: ((100 + 20 - 100) * 50) / 100 = 10% hit chance
      attacker.combatStats.ACC = 20
      target.combatStats.EVA = 100

      const damageEffect = createDamageEffect({
        hitRate: 50, // Lower hit rate to ensure miss with alwaysMiss RNG
      })

      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysMiss()
      )

      expect(result.wasDodged).toBe(false)
      expect(result.hit).toBe(false)
      expect(result.damage).toBe(0)
      expect(target.evades).toHaveLength(1) // Evade not consumed on miss
    })

    it('should protect first successful hit in multi-hit attack', () => {
      target.evades = [createEvadeStatus('singleHit')]
      // Set deterministic stats: no crit, no guard
      attacker.combatStats.CRT = 0
      target.combatStats.GRD = 0

      const damageEffect = createDamageEffect({ hitCount: 3 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      // First hit should be dodged
      expect(results[0].wasDodged).toBe(true)
      expect(results[0].hit).toBe(false)
      expect(results[0].damage).toBe(0)

      // Remaining hits should land with exact damage
      // Base: (50 - 25) * 100 / 100 = 25, no crit, no guard, effectiveness 1.0, no reduction = 25
      expect(results[1].wasDodged).toBe(false)
      expect(results[1].hit).toBe(true)
      expect(results[1].damage).toBe(25)

      expect(results[2].wasDodged).toBe(false)
      expect(results[2].hit).toBe(true)
      expect(results[2].damage).toBe(25)

      expect(target.evades).toHaveLength(0) // Evade consumed
    })

    it('should not waste evade on natural misses', () => {
      target.evades = [createEvadeStatus('singleHit')]

      const damageEffect = createDamageEffect({
        hitRate: 0, // Guaranteed miss
      })

      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysMiss()
      )

      // Should miss naturally, evade not consumed
      expect(result.hit).toBe(false)
      expect(result.wasDodged).toBe(false)
      expect(target.evades).toHaveLength(1) // Evade not consumed
    })
  })

  describe('twoHits Evade', () => {
    it('should protect up to 2 successful hits', () => {
      target.evades = [createEvadeStatus('twoHits')]

      const damageEffect = createDamageEffect({ hitCount: 3 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      // First two hits should be dodged
      expect(results[0].wasDodged).toBe(true)
      expect(results[0].hit).toBe(false)
      expect(results[1].wasDodged).toBe(true)
      expect(results[1].hit).toBe(false)

      // Third hit should land (evade exhausted)
      // Base: (50 - 25) * 100 / 100 = 25, no crit, no guard, effectiveness 1.0, no reduction = 25
      expect(results[2].wasDodged).toBe(false)
      expect(results[2].hit).toBe(true)
      expect(results[2].damage).toBe(25)

      expect(target.evades).toHaveLength(0) // Evade consumed after 2 uses
    })

    it('should track remaining uses correctly', () => {
      target.evades = [createEvadeStatus('twoHits')]

      const damageEffect = createDamageEffect({ hitCount: 2 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      expect(results[0].wasDodged).toBe(true)
      expect(results[1].wasDodged).toBe(true)

      // Evade should be consumed after both uses are exhausted
      expect(target.evades).toHaveLength(0)
    })

    it('should only protect successful hits, not misses', () => {
      target.evades = [createEvadeStatus('twoHits')]

      const damageEffect = createDamageEffect({ hitCount: 4 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      // With alwaysHit RNG, all hits should land
      // First two should be dodged by twoHits
      expect(results[0].wasDodged).toBe(true)
      expect(results[1].wasDodged).toBe(true)

      // Next two should land (evade exhausted)
      expect(results[2].wasDodged).toBe(false)
      expect(results[2].hit).toBe(true)
      expect(results[3].wasDodged).toBe(false)
      expect(results[3].hit).toBe(true)

      // Evade should be consumed
      expect(target.evades).toHaveLength(0)
    })
  })

  describe('entireAttack Evade', () => {
    it('should dodge entire single-hit attack', () => {
      target.evades = [createEvadeStatus('entireAttack')]

      const damageEffect = createDamageEffect()

      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(result.wasDodged).toBe(true)
      expect(result.hit).toBe(false)
      expect(result.damage).toBe(0)
      expect(target.evades).toHaveLength(0)
    })

    it('should dodge entire multi-hit attack', () => {
      target.evades = [createEvadeStatus('entireAttack')]

      const damageEffect = createDamageEffect({ hitCount: 5 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      // All hits should be dodged
      results.forEach(result => {
        expect(result.wasDodged).toBe(true)
        expect(result.hit).toBe(false)
        expect(result.damage).toBe(0)
      })

      expect(target.evades).toHaveLength(0)
    })

    it('should consume all evade buffs when entireAttack is used', () => {
      target.evades = [
        createEvadeStatus('entireAttack', 'skill1'),
        createEvadeStatus('singleHit', 'skill2'),
        createEvadeStatus('twoHits', 'skill3'),
      ]

      const damageEffect = createDamageEffect()

      calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      // All evades should be consumed
      expect(target.evades).toHaveLength(0)
    })
  })

  describe('Evade Priority', () => {
    it('should prioritize entireAttack over twoHits and singleHit', () => {
      target.evades = [
        createEvadeStatus('singleHit', 'single-skill'),
        createEvadeStatus('twoHits', 'two-skill'),
        createEvadeStatus('entireAttack', 'entire-skill'),
      ]

      const damageEffect = createDamageEffect({ hitCount: 3 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      // All hits should be dodged by entireAttack
      results.forEach(result => {
        expect(result.wasDodged).toBe(true)
      })

      // All evades should be consumed
      expect(target.evades).toHaveLength(0)
    })

    it('should prioritize twoHits over singleHit', () => {
      target.evades = [
        createEvadeStatus('singleHit', 'single-skill'),
        createEvadeStatus('twoHits', 'two-skill'),
      ]

      const damageEffect = createDamageEffect({ hitCount: 3 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      // First two hits should be dodged by twoHits
      expect(results[0].wasDodged).toBe(true)
      expect(results[1].wasDodged).toBe(true)

      // Third hit should be dodged by singleHit
      expect(results[2].wasDodged).toBe(true)

      expect(target.evades).toHaveLength(0)
    })
  })

  describe('TrueStrike Interaction', () => {
    it('should bypass evade but still consume UntilAttacked evades', () => {
      target.evades = [createEvadeStatus('singleHit')]

      const damageEffect = createDamageEffect({
        hitRate: 0, // Would normally miss
      })

      const result = calculateSkillDamage(
        damageEffect,
        ['TrueStrike'],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysMiss()
      )

      expect(result.hit).toBe(true) // TrueStrike bypasses miss
      expect(result.wasDodged).toBe(false) // TrueStrike bypasses evade
      // Base: (50 - 25) * 100 / 100 = 25, no crit, no guard, effectiveness 1.0, no reduction = 25
      expect(result.damage).toBe(25)
      expect(target.evades).toHaveLength(0) // Evade still consumed
    })

    it('should bypass entireAttack evade', () => {
      target.evades = [createEvadeStatus('entireAttack')]

      const damageEffect = createDamageEffect({ hitCount: 3 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit(),
        ['TrueStrike']
      )

      // All hits should land despite evade
      results.forEach(result => {
        expect(result.hit).toBe(true)
        expect(result.wasDodged).toBe(false)
      })

      expect(target.evades).toHaveLength(0) // Evade consumed
    })
  })

  describe('Blind Override', () => {
    it('should override TrueStrike and cause miss even with evade', () => {
      target.evades = [createEvadeStatus('singleHit')]
      attacker.afflictions = [{ type: 'Blind', name: 'Blind', source: 'test' }]

      const damageEffect = createDamageEffect()

      const result = calculateSkillDamage(
        damageEffect,
        ['TrueStrike'],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(result.hit).toBe(false) // Blind causes miss
      expect(result.wasDodged).toBe(false) // Not dodged, just missed
      expect(target.evades).toHaveLength(1) // Evade not consumed on miss
    })
  })

  describe('Multiple Evades Interaction', () => {
    it('should consume multiple evades appropriately', () => {
      target.evades = [
        createEvadeStatus('singleHit', 'skill1'),
        createEvadeStatus('singleHit', 'skill2'),
      ]

      const damageEffect = createDamageEffect({ hitCount: 2 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      // Both hits should be dodged
      expect(results[0].wasDodged).toBe(true)
      expect(results[1].wasDodged).toBe(true)

      // Both evades should be consumed
      expect(target.evades).toHaveLength(0)
    })

    it('should handle mixed evade types correctly', () => {
      target.evades = [
        createEvadeStatus('twoHits', 'two-skill'),
        createEvadeStatus('singleHit', 'single-skill'),
      ]

      const damageEffect = createDamageEffect({ hitCount: 4 })

      const results = calculateMultiHitDamage(
        attacker,
        target,
        damageEffect,
        mockRngPresets.alwaysHit()
      )

      // First two dodged by twoHits
      expect(results[0].wasDodged).toBe(true)
      expect(results[1].wasDodged).toBe(true)

      // Third dodged by singleHit
      expect(results[2].wasDodged).toBe(true)

      // Fourth should land
      expect(results[3].wasDodged).toBe(false)
      expect(results[3].hit).toBe(true)
    })
  })
})
