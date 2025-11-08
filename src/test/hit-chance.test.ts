import { describe, it, expect } from 'vitest'

import { calculateSkillDamage } from '@/core/battle/combat/damage-calculator'
import { calculateHitChance } from '@/core/battle/combat/hit-chance'
import { mockRngPresets } from '@/test/utils/mock-rng'
import {
  createStandardAttacker,
  createStandardTarget,
  createDamageEffect,
} from '@/test/utils/tactical-test-utils'

describe('Hit Chance Calculation - Flying Evasion', () => {
  describe('Melee vs Flying target', () => {
    it('should halve hit chance for melee attacks against flying targets', () => {
      const attacker = createStandardAttacker({
        unit: {
          id: 'melee-attacker',
          name: 'Melee Attacker',
          classKey: 'Fighter', // Fighter = Melee attack type
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
      })
      attacker.combatStats.ACC = 100

      const flyingTarget = createStandardTarget({
        unit: {
          id: 'flying-target',
          name: 'Flying Target',
          classKey: 'Gryphon Knight',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Flying'],
      })
      flyingTarget.combatStats.EVA = 50

      const nonFlyingTarget = createStandardTarget({
        unit: {
          id: 'ground-target',
          name: 'Ground Target',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Infantry'], // Not flying
      })
      nonFlyingTarget.combatStats.EVA = 50

      const damageEffect = createDamageEffect({ hitRate: 100 })

      // Calculate hit chance directly
      const hitChanceVsFlying = calculateHitChance(
        attacker,
        flyingTarget,
        damageEffect,
        [],
        'Melee'
      )
      const hitChanceVsGround = calculateHitChance(
        attacker,
        nonFlyingTarget,
        damageEffect,
        [],
        'Melee'
      )

      // Formula: ((100 + ACC - EVA) * hitRate) / 100
      // Ground: ((100 + 100 - 50) * 100) / 100 = 150%
      // Flying (melee): 150% * 0.5 = 75% (clamped to 100%, but shows the halving)

      // With same stats, flying should have half the hit chance
      // Raw: (100 + 100 - 50) * 100 / 100 = 150
      // Flying: 150 * 0.5 = 75
      // Ground: 150 * 1 = 150 (clamped to 100)

      expect(hitChanceVsGround).toBe(100) // Clamped from 150%
      expect(hitChanceVsFlying).toBe(75) // 150% * 0.5 = 75%
    })

    it('should verify flying penalty through full damage calculation', () => {
      const attacker = createStandardAttacker({
        unit: {
          id: 'melee-attacker',
          name: 'Melee Attacker',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
      })
      attacker.combatStats.ACC = 80

      const flyingTarget = createStandardTarget({
        unit: {
          id: 'flying-target',
          name: 'Flying Target',
          classKey: 'Gryphon Knight',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Flying'],
      })
      flyingTarget.combatStats.EVA = 60

      const damageEffect = createDamageEffect({ hitRate: 100 })

      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        flyingTarget,
        mockRngPresets.alwaysHit()
      )

      // Formula: ((100 + 80 - 60) * 100) / 100 = 120%
      // Flying (melee): 120% * 0.5 = 60%
      expect(result.hitChance).toBe(60)
    })
  })

  describe('Ranged/Magical vs Flying target', () => {
    it('should NOT apply penalty for ranged attacks against flying targets', () => {
      const attacker = createStandardAttacker({
        unit: {
          id: 'ranged-attacker',
          name: 'Ranged Attacker',
          classKey: 'Hunter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
      })
      attacker.combatStats.ACC = 100

      const flyingTarget = createStandardTarget({
        unit: {
          id: 'flying-target',
          name: 'Flying Target',
          classKey: 'Gryphon Knight',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Flying'],
      })
      flyingTarget.combatStats.EVA = 50

      const damageEffect = createDamageEffect({ hitRate: 100 })

      const hitChanceRanged = calculateHitChance(
        attacker,
        flyingTarget,
        damageEffect,
        [],
        'Ranged'
      )
      const hitChanceMagical = calculateHitChance(
        attacker,
        flyingTarget,
        damageEffect,
        [],
        'Magical'
      )

      // Ranged/Magical should have full hit chance (no penalty)
      // Formula: ((100 + 100 - 50) * 100) / 100 = 150% (clamped to 100%)
      expect(hitChanceRanged).toBe(100)
      expect(hitChanceMagical).toBe(100)
    })
  })

  describe('Edge cases', () => {
    it('should handle low hit chance with flying penalty', () => {
      const attacker = createStandardAttacker({
        unit: {
          id: 'melee-attacker',
          name: 'Melee Attacker',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
      })
      attacker.combatStats.ACC = 50

      const flyingTarget = createStandardTarget({
        unit: {
          id: 'flying-target',
          name: 'Flying Target',
          classKey: 'Gryphon Knight',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Flying'],
      })
      flyingTarget.combatStats.EVA = 100

      const damageEffect = createDamageEffect({ hitRate: 100 })

      const hitChance = calculateHitChance(
        attacker,
        flyingTarget,
        damageEffect,
        [],
        'Melee'
      )

      // Formula: ((100 + 50 - 100) * 100) / 100 = 50%
      // Flying (melee): 50% * 0.5 = 25%
      expect(hitChance).toBe(25)
    })

    it('should return zero hit chance when evasion greatly exceeds accuracy', () => {
      const attacker = createStandardAttacker({
        unit: {
          id: 'low-acc-attacker',
          name: 'Low Accuracy Attacker',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
      })
      attacker.combatStats.ACC = 80

      const highEvasionTarget = createStandardTarget({
        unit: {
          id: 'high-eva-target',
          name: 'High Evasion Target',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Infantry'],
      })
      highEvasionTarget.combatStats.EVA = 180

      const damageEffect = createDamageEffect({ hitRate: 100 })

      const hitChance = calculateHitChance(
        attacker,
        highEvasionTarget,
        damageEffect,
        [],
        'Melee'
      )

      // Formula: ((100 + 80 - 180) * 100) / 100 = 0%
      // Clamped to 0%
      expect(hitChance).toBe(0)
    })

    it('should return the correct hit chance for melee vs flying with extreme evasion disparity', () => {
      const attacker = createStandardAttacker({
        unit: {
          id: 'melee-attacker',
          name: 'Melee Attacker',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
      })
      attacker.combatStats.ACC = 90

      const flyingTarget = createStandardTarget({
        unit: {
          id: 'flying-target',
          name: 'Flying Target',
          classKey: 'Gryphon Knight',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Flying'],
      })
      flyingTarget.combatStats.EVA = 188

      const damageEffect = createDamageEffect({ hitRate: 100 })

      const hitChance = calculateHitChance(
        attacker,
        flyingTarget,
        damageEffect,
        [],
        'Melee'
      )

      // Formula: ((100 + 90 - 188) * 100) / 100 = 2%
      // Flying (melee): 2% * 0.5 = 1%
      // Clamped to 0%
      expect(hitChance).toBe(1)
    })
  })
})
