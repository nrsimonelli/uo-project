import { describe, it, expect, beforeEach } from 'vitest'

import { mockRngPresets } from './utils/mock-rng'
import {
  createStandardAttacker,
  createStandardTarget,
  DEFAULT_DEWS,
  DEFAULT_STATS,
} from './utils/tactical-test-utils'

import { calculateSkillDamage } from '@/core/battle/combat/damage-calculator'
import { processEffects } from '@/core/battle/combat/effect-processor'
import { applyStatusEffects } from '@/core/battle/combat/status-effects'
import {
  getEffectiveStatsForTarget,
  recalculateStats,
} from '@/core/battle/combat/status-effects'
import type { ConditionEvaluationContext } from '@/core/battle/evaluation/condition-evaluator'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { BattleContext } from '@/types/battle-engine'
import type { DamageEffect } from '@/types/effects'

/**
 * Helper to apply a passive skill's buffs to a target unit
 * This simulates the skill being triggered and applying its effects
 */
const applyPassiveSkillBuffs = (
  skillId: 'phalanxShift' | 'aerialShift',
  caster: BattleContext,
  target: BattleContext
): void => {
  const skill = PassiveSkillsMap[skillId]
  if (!skill) {
    throw new Error(`Skill ${skillId} not found`)
  }

  // Create condition context (no battlefield needed for these skills)
  const conditionContext: ConditionEvaluationContext = {
    attacker: caster,
    target,
  }

  // Process the skill's effects
  const effectResults = processEffects(
    skill.effects,
    conditionContext,
    skill.id,
    caster.combatStats.MATK
  )

  // Apply the status effects (buffs) to the target
  applyStatusEffects(effectResults, caster, [target], true)
}

/**
 * Tests for conditional buffs using real skills (Phalanx Shift, Aerial Shift)
 * Conditional buffs only apply when attacking specific target types
 */
describe('Conditional Buffs', () => {
  let attacker: BattleContext
  let cavalryTarget: BattleContext
  let infantryTarget: BattleContext
  let caster: BattleContext // Unit that has the passive skill

  beforeEach(() => {
    // Create a caster unit that will apply the passive skill
    caster = createStandardAttacker({
      unit: {
        id: 'caster',
        name: 'Caster',
        classKey: 'Fighter',
        level: 10,
        growths: ['Hardy', 'Hardy'],
        dews: DEFAULT_DEWS,
        equipment: [],
        skillSlots: [],
      },
    })

    // Create attacker that will receive the buffs from the passive skill
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

    // Apply Phalanx Shift buffs to the attacker
    applyPassiveSkillBuffs('phalanxShift', caster, attacker)

    // Create targets
    cavalryTarget = createStandardTarget({
      unit: {
        id: 'cavalry-target',
        name: 'Cavalry Target',
        classKey: 'Fighter',
        level: 10,
        growths: ['Hardy', 'Hardy'],
        dews: DEFAULT_DEWS,
        equipment: [],
        skillSlots: [],
      },
      combatantTypes: ['Cavalry'],
    })

    infantryTarget = createStandardTarget({
      unit: {
        id: 'infantry-target',
        name: 'Infantry Target',
        classKey: 'Fighter',
        level: 10,
        growths: ['Hardy', 'Hardy'],
        dews: DEFAULT_DEWS,
        equipment: [],
        skillSlots: [],
      },
      combatantTypes: ['Infantry'],
    })
  })

  describe('Buff Storage', () => {
    it('should store conditional buffs from Phalanx Shift on the unit', () => {
      expect(attacker.buffs).toHaveLength(2)
      expect(attacker.buffs[0].stat).toBe('Attack')
      expect(attacker.buffs[0].conditionalOnTarget?.combatantType).toBe(
        'Cavalry'
      )
      expect(attacker.buffs[1].stat).toBe('CRT')
      expect(attacker.buffs[1].conditionalOnTarget?.combatantType).toBe(
        'Cavalry'
      )
    })
  })

  describe('Normal Stat Recalculation', () => {
    it('should exclude conditional buffs from normal stat recalculation', () => {
      recalculateStats(attacker)
      expect(attacker.combatStats.PATK).toBe(DEFAULT_STATS.PATK)
      expect(attacker.combatStats.MATK).toBe(DEFAULT_STATS.MATK)
      expect(attacker.combatStats.CRT).toBe(DEFAULT_STATS.CRT)
    })
  })

  describe('Effective Stats for Target', () => {
    it('should include conditional buffs when attacking Cavalry targets', () => {
      const stats = getEffectiveStatsForTarget(attacker, cavalryTarget)
      // Phalanx Shift: +20% Attack, +40 CRT (flat)
      expect(stats.PATK).toBe(60) // 50 * 1.2
      expect(stats.MATK).toBe(24) // 20 * 1.2
      expect(stats.CRT).toBe(50) // 10 + 40
    })

    it('should exclude conditional buffs when attacking non-Cavalry targets', () => {
      const stats = getEffectiveStatsForTarget(attacker, infantryTarget)
      expect(stats.PATK).toBe(DEFAULT_STATS.PATK)
      expect(stats.MATK).toBe(DEFAULT_STATS.MATK)
      expect(stats.CRT).toBe(DEFAULT_STATS.CRT)
    })

    it('should not affect other stats when conditional buffs apply', () => {
      const statsCav = getEffectiveStatsForTarget(attacker, cavalryTarget)
      const statsInf = getEffectiveStatsForTarget(attacker, infantryTarget)
      expect(statsCav.PDEF).toBe(statsInf.PDEF)
      expect(statsCav.MDEF).toBe(statsInf.MDEF)
      expect(statsCav.ACC).toBe(statsInf.ACC)
      expect(statsCav.EVA).toBe(statsInf.EVA)
      expect(statsCav.GRD).toBe(statsInf.GRD)
      expect(statsCav.INIT).toBe(statsInf.INIT)
      expect(statsCav.HP).toBe(statsInf.HP)
    })
  })

  describe('Damage Calculation', () => {
    it('should apply conditional buffs to damage when attacking Cavalry', () => {
      const damageEffect: DamageEffect = {
        kind: 'Damage',
        potency: { physical: 100 },
        hitRate: 100,
        hitCount: 1,
      }

      const resultCavalry = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        cavalryTarget,
        mockRngPresets.alwaysHit()
      )

      const resultInfantry = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        infantryTarget,
        mockRngPresets.alwaysHit()
      )

      expect(resultCavalry.hit).toBe(true)
      expect(resultInfantry.hit).toBe(true)
      expect(resultCavalry.breakdown.rawBaseDamage).toBe(35) // Raw: 60-25
      expect(resultCavalry.breakdown.afterPotency).toBe(35) // After 100% potency
      expect(resultInfantry.breakdown.rawBaseDamage).toBe(25) // Raw: 50-25
      expect(resultInfantry.breakdown.afterPotency).toBe(25) // After 100% potency
      expect(resultCavalry.damage).toBe(39) // 35*1.5*0.75
      expect(resultInfantry.damage).toBe(28) // 25*1.5*0.75
      expect(resultCavalry.damage - resultInfantry.damage).toBe(11)
    })

    it('should apply conditional buffs to crit rate when attacking Cavalry', () => {
      const damageEffect: DamageEffect = {
        kind: 'Damage',
        potency: { physical: 100 },
        hitRate: 100,
        hitCount: 1,
      }

      const rngForCrit = mockRngPresets.alwaysCrit()

      const resultCavalry = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        cavalryTarget,
        rngForCrit
      )

      const resultInfantry = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        infantryTarget,
        rngForCrit
      )

      expect(resultCavalry.hit).toBe(true)
      expect(resultInfantry.hit).toBe(true)
      expect(resultCavalry.wasCritical).toBe(true)
      expect(resultInfantry.wasCritical).toBe(true)

      const statsCav = getEffectiveStatsForTarget(attacker, cavalryTarget)
      const statsInf = getEffectiveStatsForTarget(attacker, infantryTarget)
      expect(statsCav.CRT).toBe(50) // 10 + 40
      expect(statsInf.CRT).toBe(10)

      // Cavalry: Base (60-25)*100/100 = 35, crit: 35*1.5 = 52.5 → 53 (rounded)
      expect(resultCavalry.breakdown.afterCrit).toBe(53)
      // Infantry: Base (50-25)*100/100 = 25, crit: 25*1.5 = 37.5 → 38 (rounded)
      expect(resultInfantry.breakdown.afterCrit).toBe(38)
    })
  })

  describe('Mixed Conditional and Non-Conditional Buffs', () => {
    it('should apply non-conditional buffs regardless of target', () => {
      attacker.buffs.push({
        name: 'General Boost (+PDEF)',
        stat: 'PDEF',
        value: 10,
        duration: 'Indefinite',
        scaling: 'flat',
        source: 'generalBoost',
        skillId: 'generalBoost',
      })

      const statsCav = getEffectiveStatsForTarget(attacker, cavalryTarget)
      const statsInf = getEffectiveStatsForTarget(attacker, infantryTarget)
      expect(statsCav.PDEF).toBe(40) // 30 + 10
      expect(statsInf.PDEF).toBe(40) // 30 + 10
      expect(statsCav.PATK).toBe(60) // 50 * 1.2 (conditional)
      expect(statsInf.PATK).toBe(50) // no conditional buff
    })
  })

  describe('Mixed Potency Weapons', () => {
    it('should apply Attack conditional buff to both physical and magical damage', () => {
      const damageEffect: DamageEffect = {
        kind: 'Damage',
        potency: { physical: 100, magical: 100 },
        hitRate: 100,
        hitCount: 1,
      }

      const resultCavalry = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        cavalryTarget,
        mockRngPresets.alwaysHit()
      )

      const resultInfantry = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        infantryTarget,
        mockRngPresets.alwaysHit()
      )

      const statsCav = getEffectiveStatsForTarget(attacker, cavalryTarget)
      const statsInf = getEffectiveStatsForTarget(attacker, infantryTarget)

      expect(statsCav.PATK).toBe(60) // 50 * 1.2
      expect(statsInf.PATK).toBe(50)
      expect(statsCav.MATK).toBe(24) // 20 * 1.2
      expect(statsInf.MATK).toBe(20)

      // Mixed potency: physical (60-25=35) + magical (24-20=4) = 39 base
      // baseDamage is now the sum of raw (attack - defense) for both physical and magical
      expect(resultCavalry.breakdown.rawBaseDamage).toBe(39) // 35 + 4
      expect(resultInfantry.breakdown.rawBaseDamage).toBe(25) // (50-25=25) + (20-20=0, but minimum 1 for magical after potency)
      // Note: magical damage has minimum 1 after potency, but baseDamage is raw sum before potency
      // So baseDamage = 25 + 0 = 25, but afterPotency will include the minimum 1 for magical
      expect(resultCavalry.damage).toBe(45) // 35*1.5*0.75 + 4*1.5
      expect(resultInfantry.damage).toBe(30) // 25*1.5*0.75 + 1*1.5
    })
  })

  describe('Aerial Shift', () => {
    it('should apply conditional buffs vs non-flying, flying, and flying with effective damage (bows)', () => {
      // Create attacker with Aerial Shift buffs
      const aerialAttackerNonArcher = createStandardAttacker({
        unit: {
          id: 'aerial-attacker-non-archer',
          name: 'Aerial Attacker (Non-Archer)',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          dews: DEFAULT_DEWS,
          equipment: [],
          skillSlots: [],
        },
      })

      const aerialAttackerArcher = createStandardAttacker({
        unit: {
          id: 'aerial-attacker-archer',
          name: 'Aerial Attacker (Archer)',
          classKey: 'Hunter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          dews: DEFAULT_DEWS,
          equipment: [],
          skillSlots: [],
        },
      })

      // Apply Aerial Shift buffs
      applyPassiveSkillBuffs('aerialShift', caster, aerialAttackerNonArcher)
      applyPassiveSkillBuffs('aerialShift', caster, aerialAttackerArcher)

      const nonFlyingTarget = createStandardTarget({
        unit: {
          id: 'non-flying-target',
          name: 'Non-Flying Target',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          dews: DEFAULT_DEWS,
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Infantry'],
      })

      const flyingTarget = createStandardTarget({
        unit: {
          id: 'flying-target',
          name: 'Flying Target',
          classKey: 'Gryphon Knight',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          dews: DEFAULT_DEWS,
          equipment: [],
          skillSlots: [],
        },
        combatantTypes: ['Flying'],
      })

      const damageEffect: DamageEffect = {
        kind: 'Damage',
        potency: { physical: 100 },
        hitRate: 100,
        hitCount: 1,
      }

      const resultNonFlying = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        aerialAttackerNonArcher,
        nonFlyingTarget,
        mockRngPresets.alwaysHit()
      )

      const resultFlying = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        aerialAttackerNonArcher,
        flyingTarget,
        mockRngPresets.alwaysHit()
      )

      const resultFlyingEffective = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        aerialAttackerArcher,
        flyingTarget,
        mockRngPresets.alwaysHit()
      )

      const statsNonFlying = getEffectiveStatsForTarget(
        aerialAttackerNonArcher,
        nonFlyingTarget
      )
      const statsFlying = getEffectiveStatsForTarget(
        aerialAttackerNonArcher,
        flyingTarget
      )
      const statsFlyingEffective = getEffectiveStatsForTarget(
        aerialAttackerArcher,
        flyingTarget
      )

      // Non-flying: no buffs
      expect(statsNonFlying.PATK).toBe(50)
      expect(statsNonFlying.CRT).toBe(10)
      expect(resultNonFlying.breakdown.rawBaseDamage).toBe(25)
      expect(resultNonFlying.damage).toBe(28)

      // Flying: buffs apply, no effectiveness
      expect(statsFlying.PATK).toBe(60) // 50 * 1.2
      expect(statsFlying.CRT).toBe(50) // 10 + 40
      expect(resultFlying.breakdown.rawBaseDamage).toBe(35)
      expect(resultFlying.damage).toBe(39)

      // Flying with effectiveness: buffs + 2x effectiveness
      expect(statsFlyingEffective.PATK).toBe(60) // 50 * 1.2
      expect(statsFlyingEffective.CRT).toBe(50) // 10 + 40
      expect(resultFlyingEffective.breakdown.rawBaseDamage).toBe(35)
      expect(resultFlyingEffective.damage).toBe(78) // 39 * 2.0

      // Non-flying: 28, Flying: 39, Flying with effectiveness: 78
      expect(resultFlying.damage).toBe(39)
      expect(resultFlyingEffective.damage).toBe(78)
    })
  })
})
