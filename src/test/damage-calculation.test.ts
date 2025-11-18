import { describe, it, expect, beforeEach } from 'vitest'

import { calculateBaseDamage } from '../core/battle/combat/base-damage-calculation'
import { calculateSkillDamage } from '../core/battle/combat/damage-calculator'
import { applyDamageModifiers } from '../core/battle/combat/damage-modifiers'
import type { EffectProcessingResult } from '../core/battle/combat/effect-processor'
import { calculateNaturalGuardMultiplier } from '../core/battle/combat/guard-calculation'
import {
  getCritMultiplier,
  rollCrit,
  rollGuard,
} from '../core/calculations/combat-calculations'

import { mockRngPresets, mockRng } from './utils/mock-rng'
import {
  createMockTacticalContext,
  createDamageEffect,
  createUnitWithStats,
  DEFAULT_STATS,
  TARGET_STATS,
} from './utils/tactical-test-utils'

import type { BattleContext } from '@/types/battle-engine'

describe('Damage Calculation', () => {
  let attacker: BattleContext
  let target: BattleContext

  beforeEach(() => {
    const context = createMockTacticalContext()
    attacker = context.actingUnit
    target = context.allEnemies[0]
  })

  describe('Base Damage Calculation', () => {
    it('should calculate base damage as (attack - defense) * potency / 100', () => {
      // Setup: attacker has 50 PATK, target has 30 PDEF, 100% potency
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30 }
      )

      const { rawBase, afterPotency } = calculateBaseDamage(
        attacker,
        target,
        100, // 100% potency
        true // physical
      )

      // Expected: rawBase = 50 - 30 = 20, afterPotency = 20 * 100 / 100 = 20
      expect(rawBase).toBe(20)
      expect(afterPotency).toBe(20)
    })

    it('should apply potency percentage correctly', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30 }
      )

      const { rawBase, afterPotency } = calculateBaseDamage(
        attacker,
        target,
        150, // 150% potency
        true
      )

      // Expected: rawBase = 50 - 30 = 20, afterPotency = 20 * 150 / 100 = 30
      expect(rawBase).toBe(20)
      expect(afterPotency).toBe(30)
    })

    it('should enforce minimum damage of 1', () => {
      // Setup: attacker has lower attack than target defense
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 10 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 50 }
      )

      const { rawBase, afterPotency } = calculateBaseDamage(
        attacker,
        target,
        100,
        true
      )

      // Expected: rawBase = 10 - 50 = -40, afterPotency = max(1, -40 * 100 / 100) = 1
      expect(rawBase).toBe(-40)
      expect(afterPotency).toBe(1)
    })

    it('should calculate magical damage using MATK and MDEF', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, MATK: 40 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, MDEF: 20 }
      )

      const { rawBase, afterPotency } = calculateBaseDamage(
        attacker,
        target,
        100,
        false // magical
      )

      // Expected: rawBase = 40 - 20 = 20, afterPotency = 20 * 100 / 100 = 20
      expect(rawBase).toBe(20)
      expect(afterPotency).toBe(20)
    })

    it('should handle defense ignore from effect results', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30 }
      )

      const effectResults: EffectProcessingResult = {
        sacrificeAmount: 0,
        sacrificePercentage: 0,
        ownHPBasedDamage: null,
        targetHPBasedDamage: null,
        targetStatBasedDamage: null,
        potencyModifiers: { physical: 0, magical: 0 },
        defenseIgnoreFraction: 0.5, // 50% defense ignore
        grantedFlags: [],
        healPercent: 0,
        healPotency: { physical: 0, magical: 0 },
        apGain: 0,
        ppGain: 0,
        resourceStealToApply: [],
        debuffAmplificationsToApply: [],
        conferralsToApply: [],
        afflictionsToApply: [],
        debuffsToApply: [],
        buffsToApply: [],
        damageImmunitiesToApply: [],
        evadesToApply: [],
        cleansesToApply: [],
        resurrectsToApply: [],
        lifeStealsToApply: [],
        lifeshareToApply: [],
        ownHPBasedHeal: null,
      }

      const { rawBase, afterPotency } = calculateBaseDamage(
        attacker,
        target,
        100,
        true,
        effectResults
      )

      // Expected: rawBase = 50 - 15 = 35 (30 * 0.5 = 15 defense after ignore), afterPotency = 35 * 100 / 100 = 35
      expect(rawBase).toBe(35)
      expect(afterPotency).toBe(35)
    })
  })

  describe('Critical Hit Calculation', () => {
    it('should apply 1.5x multiplier on critical hit', () => {
      const critMultiplier = getCritMultiplier(true)
      expect(critMultiplier).toBe(1.5)
    })

    it('should apply 1.0x multiplier when no critical hit', () => {
      const critMultiplier = getCritMultiplier(false)
      expect(critMultiplier).toBe(1.0)
    })

    it('should roll crit based on CRT stat and RNG', () => {
      // mockRng returns a value 0-1, rollCrit multiplies by 100
      // So mockRng(0.05) gives 5% roll, should crit with 10% CRT
      const highCritRng = mockRng(0.05)
      const didCrit = rollCrit(highCritRng, 10)
      expect(didCrit).toBe(true)

      // mockRng(0.15) gives 15% roll, should not crit with 10% CRT
      const lowCritRng = mockRng(0.15)
      const didNotCrit = rollCrit(lowCritRng, 10)
      expect(didNotCrit).toBe(false)
    })

    it('should apply crit multiplier to base damage in full calculation', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, CRT: 100 } // 100% crit rate
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 0 } // No guard
      )

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysCrit() // Force crit
      )

      expect(result.hit).toBe(true)
      expect(result.wasCritical).toBe(true)
      // Base damage: (50 - 30) * 100 / 100 = 20
      // After crit: 20 * 1.5 = 30
      expect(result.breakdown.rawBaseDamage).toBe(20)
      expect(result.breakdown.afterCrit).toBe(30)
      expect(result.breakdown.afterGuard).toBe(30) // No guard
      expect(result.breakdown.afterEffectiveness).toBe(30) // No effectiveness
      expect(result.breakdown.afterDmgReduction).toBe(30) // No reduction
      expect(result.damage).toBe(30)
    })

    it('should not apply crit when crit cannot land', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, CRT: 100 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 0 }
      )

      // Apply CritSeal to prevent crits
      attacker.afflictions = [
        { type: 'CritSeal', name: 'Crit Seal', source: 'test' },
      ]

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysCrit() // Even with always crit RNG
      )

      expect(result.hit).toBe(true)
      expect(result.wasCritical).toBe(false)
      // Base damage: 20, no crit multiplier
      expect(result.breakdown.rawBaseDamage).toBe(20)
      expect(result.breakdown.afterCrit).toBe(20)
      expect(result.breakdown.afterGuard).toBe(20)
      expect(result.breakdown.afterEffectiveness).toBe(20)
      expect(result.breakdown.afterDmgReduction).toBe(20)
      expect(result.damage).toBe(20)
    })
  })

  describe('Guard Calculation', () => {
    it('should calculate natural guard multiplier correctly', () => {
      // No guard
      const noGuard = calculateNaturalGuardMultiplier(false, 0)
      expect(noGuard).toBe(1.0)

      // Natural guard (25% base reduction)
      const naturalGuard = calculateNaturalGuardMultiplier(true, 0)
      expect(naturalGuard).toBe(0.75) // 100% - 25% = 75% = 0.75 multiplier

      // Guard with equipment bonus
      const guardWithEquipment = calculateNaturalGuardMultiplier(true, 10)
      // 25% base + 10% equipment = 35% reduction = 0.65 multiplier
      expect(guardWithEquipment).toBe(0.65)

      // Guard with max cap (75% total)
      const maxGuard = calculateNaturalGuardMultiplier(true, 100)
      // Capped at 75% reduction = 0.25 multiplier
      expect(maxGuard).toBe(0.25)
    })

    it('should only apply guard to physical damage', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, MATK: 40, CRT: 0 } // No crit
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, MDEF: 20, GRD: 100 } // 100% guard rate
      )

      // Test physical damage with guard
      const physicalEffect = createDamageEffect({ potency: { physical: 100 } })
      const physicalResult = calculateSkillDamage(
        physicalEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      // Test magical damage (should not be guarded)
      const magicalEffect = createDamageEffect({ potency: { magical: 100 } })
      const magicalResult = calculateSkillDamage(
        magicalEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit(),
        'Magical'
      )

      // Physical: Base 20, no crit, guard applies: 20 * 0.75 = 15
      expect(physicalResult.wasGuarded).toBe(true)
      expect(physicalResult.breakdown.rawBaseDamage).toBe(20)
      expect(physicalResult.breakdown.afterCrit).toBe(20)
      expect(physicalResult.breakdown.afterGuard).toBe(15)
      expect(physicalResult.breakdown.afterEffectiveness).toBe(15)
      expect(physicalResult.breakdown.afterDmgReduction).toBe(15)
      expect(physicalResult.damage).toBe(15)

      // Magical: Base 20, no crit, no guard: 20
      expect(magicalResult.wasGuarded).toBe(false)
      expect(magicalResult.breakdown.rawBaseDamage).toBe(20)
      expect(magicalResult.breakdown.afterCrit).toBe(20)
      expect(magicalResult.breakdown.afterGuard).toBe(20)
      expect(magicalResult.breakdown.afterEffectiveness).toBe(20)
      expect(magicalResult.breakdown.afterDmgReduction).toBe(20)
      expect(magicalResult.damage).toBe(20)
    })

    it('should roll guard based on GRD stat and RNG', () => {
      // mockRng returns a value 0-1, rollGuard multiplies by 100
      // So mockRng(0.05) gives 5% roll, should guard with 10% GRD
      const highGuardRng = mockRng(0.05)
      const didGuard = rollGuard(highGuardRng, 10)
      expect(didGuard).toBe(true)

      // mockRng(0.15) gives 15% roll, should not guard with 10% GRD
      const lowGuardRng = mockRng(0.15)
      const didNotGuard = rollGuard(lowGuardRng, 10)
      expect(didNotGuard).toBe(false)
    })

    it('should apply guard multiplier in full calculation', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, CRT: 0 } // No crit
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 100 } // 100% guard rate
      )

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      // Base: 20, no crit: 20, guard: 20 * 0.75 = 15
      expect(result.wasGuarded).toBe(true)
      expect(result.breakdown.rawBaseDamage).toBe(20)
      expect(result.breakdown.afterCrit).toBe(20)
      expect(result.breakdown.afterGuard).toBe(15)
      expect(result.breakdown.afterEffectiveness).toBe(15)
      expect(result.breakdown.afterDmgReduction).toBe(15)
      expect(result.damage).toBe(15)
    })

    it('should not guard when target cannot guard', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, CRT: 0 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 100 }
      )

      // Apply GuardSeal to prevent guarding
      target.afflictions = [
        { type: 'GuardSeal', name: 'Guard Seal', source: 'test' },
      ]

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(result.wasGuarded).toBe(false)
      expect(result.breakdown.rawBaseDamage).toBe(20)
      expect(result.breakdown.afterCrit).toBe(20)
      expect(result.breakdown.afterGuard).toBe(20)
      expect(result.breakdown.afterEffectiveness).toBe(20)
      expect(result.breakdown.afterDmgReduction).toBe(20)
      expect(result.damage).toBe(20)
    })
  })

  describe('Effectiveness Calculation', () => {
    it('should apply 1.0x multiplier when no effectiveness rule matches', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30 }
      )

      const modifiers = applyDamageModifiers(attacker, target, 20)
      // No effectiveness rule should match for default Fighter vs Fighter
      expect(modifiers.effectiveness).toBe(1.0)
      expect(modifiers.afterEffectiveness).toBe(20)
    })

    it('should apply effectiveness multiplier in full calculation', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, CRT: 0, GRD: 0 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 0 }
      )

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      // Base: 20, no crit: 20, no guard: 20, effectiveness 1.0x: 20
      expect(result.breakdown.rawBaseDamage).toBe(20)
      expect(result.breakdown.afterCrit).toBe(20)
      expect(result.breakdown.afterGuard).toBe(20)
      expect(result.breakdown.afterEffectiveness).toBe(20)
      expect(result.breakdown.afterDmgReduction).toBe(20)
      expect(result.damage).toBe(20)
    })
  })

  describe('Damage Reduction', () => {
    it('should apply damage reduction percentage', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, CRT: 0 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 0, DmgReductionPercent: 20 } // 20% damage reduction
      )

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      // Base: 20, no crit: 20, no guard: 20, effectiveness 1.0x: 20, reduction 20%: 20 * 0.8 = 16
      expect(result.breakdown.rawBaseDamage).toBe(20)
      expect(result.breakdown.afterCrit).toBe(20)
      expect(result.breakdown.afterGuard).toBe(20)
      expect(result.breakdown.afterEffectiveness).toBe(20)
      expect(result.breakdown.afterDmgReduction).toBe(16)
      expect(result.damage).toBe(16)
    })

    it('should enforce minimum damage of 1 after reduction', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 10, CRT: 0 }
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 0, DmgReductionPercent: 99 } // 99% reduction
      )

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      // baseDamage is raw (attack - defense) = 10 - 50 = -20
      // afterPotency applies minimum of 1, so afterPotency = 1
      // After all steps, final damage = 1 (minimum enforced)
      expect(result.breakdown.rawBaseDamage).toBe(-20) // Raw (attack - defense)
      expect(result.breakdown.afterPotency).toBe(1) // Minimum enforced
      expect(result.breakdown.afterCrit).toBe(1)
      expect(result.breakdown.afterGuard).toBe(1)
      expect(result.breakdown.afterEffectiveness).toBe(1)
      expect(result.breakdown.afterDmgReduction).toBe(1)
      expect(result.damage).toBe(1)
    })
  })

  describe('Complete Damage Formula Integration', () => {
    it('should calculate damage through all steps in correct order with crit and guard', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, CRT: 100 } // 100% crit rate
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 100, DmgReductionPercent: 0 } // 100% guard rate, no reduction
      )

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysCrit() // Force crit
      )

      expect(result.hit).toBe(true)
      expect(result.wasCritical).toBe(true)
      expect(result.wasGuarded).toBe(true)

      // Base: (50 - 30) * 100 / 100 = 20
      // After crit: 20 * 1.5 = 30
      // After guard: 30 * 0.75 = 22.5 → 23 (rounded)
      // After effectiveness: 23 * 1.0 = 23
      // After reduction: 23 * 1.0 = 23
      expect(result.breakdown.rawBaseDamage).toBe(20)
      expect(result.breakdown.afterPotency).toBe(20)
      expect(result.breakdown.afterCrit).toBe(30)
      expect(result.breakdown.afterGuard).toBe(23)
      expect(result.breakdown.afterEffectiveness).toBe(23)
      expect(result.breakdown.afterDmgReduction).toBe(23)
      expect(result.damage).toBe(23)
    })

    it('should handle miss correctly', () => {
      const damageEffect = createDamageEffect({ hitRate: 50 })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysMiss()
      )

      expect(result.hit).toBe(false)
      expect(result.damage).toBe(0)
      expect(result.breakdown.rawBaseDamage).toBe(0)
      expect(result.breakdown.afterPotency).toBe(0)
      expect(result.breakdown.afterCrit).toBe(0)
      expect(result.breakdown.afterGuard).toBe(0)
      expect(result.breakdown.afterEffectiveness).toBe(0)
      expect(result.breakdown.afterDmgReduction).toBe(0)
    })

    it('should calculate physical and magical damage separately', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, MATK: 40, CRT: 0 } // No crit
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, MDEF: 20, GRD: 100 } // 100% guard rate
      )

      const damageEffect = createDamageEffect({
        potency: { physical: 100, magical: 100 },
      })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(result.hit).toBe(true)
      expect(result.wasGuarded).toBe(true) // Physical is guarded

      // Physical: Base (50-30)*100/100 = 20, guard: 20*0.75 = 15
      // Magical: Base (40-20)*100/100 = 20, no guard: 20
      // Total: 15 + 20 = 35
      expect(result.breakdown.rawBaseDamage).toBe(40) // 20 physical + 20 magical
      expect(result.breakdown.afterCrit).toBe(40) // No crit
      expect(result.breakdown.afterGuard).toBe(35) // Physical guarded, magical not
      expect(result.breakdown.afterEffectiveness).toBe(35) // No effectiveness
      expect(result.breakdown.afterDmgReduction).toBe(35) // No reduction
      expect(result.damage).toBe(35)
    })

    it('should calculate full formula with crit, guard, and damage reduction', () => {
      attacker = createUnitWithStats(
        { id: 'attacker', name: 'Attacker' },
        { ...DEFAULT_STATS, PATK: 50, CRT: 100 } // 100% crit
      )
      target = createUnitWithStats(
        { id: 'target', name: 'Target' },
        { ...TARGET_STATS, PDEF: 30, GRD: 100, DmgReductionPercent: 20 } // 100% guard, 20% reduction
      )

      const damageEffect = createDamageEffect({ potency: { physical: 100 } })
      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysCrit()
      )

      expect(result.hit).toBe(true)
      expect(result.wasCritical).toBe(true)
      expect(result.wasGuarded).toBe(true)

      // Base: (50 - 30) * 100 / 100 = 20
      // After crit: 20 * 1.5 = 30
      // After guard: 30 * 0.75 = 22.5 → 23 (rounded)
      // After effectiveness: 23 * 1.0 = 23
      // After reduction: 23 * 0.8 = 18.4 → 18 (rounded)
      expect(result.breakdown.rawBaseDamage).toBe(20)
      expect(result.breakdown.afterCrit).toBe(30)
      expect(result.breakdown.afterGuard).toBe(23)
      expect(result.breakdown.afterEffectiveness).toBe(23)
      expect(result.breakdown.afterDmgReduction).toBe(18)
      expect(result.damage).toBe(18)
    })
  })
})
