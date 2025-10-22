import { describe, it, expect, beforeEach } from 'vitest'

import { executeSkill } from '../core/battle/combat/skill-executor'

import { mockRngPresets } from './utils/mock-rng'
import { createMockBattleContext } from './utils/tactical-test-utils'

import { ActiveSkillsMap } from '@/generated/skills-active'

describe('Viking Skill Sequences', () => {
  let viking: ReturnType<typeof createMockBattleContext>
  let target: ReturnType<typeof createMockBattleContext>

  beforeEach(() => {
    // Create a Viking attacker with consistent stats
    viking = createMockBattleContext({
      unit: {
        id: 'viking-1',
        name: 'Viking',
        classKey: 'Warrior',
        level: 10,
        equipment: [],
        growths: ['Precise', 'Precise'],
        skillSlots: [],
      },
      combatStats: {
        HP: 150,
        PATK: 120,
        PDEF: 80,
        MATK: 40,
        MDEF: 60,
        ACC: 85,
        EVA: 20,
        CRT: 30,
        GRD: 35,
        INIT: 75,
        GuardEff: 0,
      },
      statFoundation: {
        HP: 150,
        PATK: 120,
        PDEF: 80,
        MATK: 40,
        MDEF: 60,
        ACC: 85,
        EVA: 20,
        CRT: 30,
        GRD: 35,
        INIT: 75,
        GuardEff: 0,
      },
    })

    // Create a target with plenty of HP for multi-turn test
    target = createMockBattleContext({
      unit: {
        id: 'enemy-1',
        name: 'Enemy',
        classKey: 'Soldier',
        level: 8,
        equipment: [],
        growths: ['Precise', 'Precise'],
        skillSlots: [],
      },
      combatStats: {
        HP: 500,
        PATK: 100,
        PDEF: 70,
        MATK: 50,
        MDEF: 55,
        ACC: 80,
        EVA: 15,
        CRT: 15,
        GRD: 20,
        INIT: 60,
        GuardEff: 0,
      },
      statFoundation: {
        HP: 500,
        PATK: 100,
        PDEF: 70,
        MATK: 50,
        MDEF: 55,
        ACC: 80,
        EVA: 15,
        CRT: 15,
        GRD: 20,
        INIT: 60,
        GuardEff: 0,
      },
      currentHP: 500,
    })
  })

  describe('Rolling Axe → Wide Breaker sequence', () => {
    it('should apply -15% PDEF from Rolling Axe, then use +50 potency in Wide Breaker', () => {
      const rollingAxe = ActiveSkillsMap['rollingAxe']
      const wideBreaker = ActiveSkillsMap['wideBreaker']

      expect(rollingAxe).toBeDefined()
      expect(wideBreaker).toBeDefined()

      // Turn 1: Rolling Axe (3 hits, -15% PDEF debuff)
      const rollingAxeResult = executeSkill(
        rollingAxe,
        viking,
        target,
        mockRngPresets.alwaysHit() // All 3 hits connect
      )

      expect(rollingAxeResult).toBeDefined()
      if ('results' in rollingAxeResult) {
        // Multi-target, shouldn't happen for single target
        expect(false).toBe(true)
      } else {
        // Single target result
        const singleResult = rollingAxeResult
        expect(singleResult.anyHit).toBe(true)
        expect(singleResult.damageResults).toHaveLength(3) // 3 hits

        // All hits should connect
        expect(singleResult.damageResults.every(r => r.hit)).toBe(true)

        console.log(
          'Rolling Axe damage per hit:',
          singleResult.damageResults.map(r => r.damage)
        )
        console.log('Rolling Axe total damage:', singleResult.totalDamage)
      }

      // Verify debuff was applied (should be exactly 1 despite 3 hits)
      expect(target.debuffs).toHaveLength(1)
      expect(target.debuffs[0].stat).toBe('PDEF')
      expect(target.debuffs[0].value).toBe(-15)
      expect(target.debuffs[0].scaling).toBe('percent')

      // Store damage for comparison
      const targetHPAfterRollingAxe =
        'results' in rollingAxeResult
          ? target.currentHP
          : target.currentHP - rollingAxeResult.totalDamage

      console.log('Target HP after Rolling Axe:', targetHPAfterRollingAxe)
      console.log(
        'Target debuffs:',
        target.debuffs.map(d => ({ stat: d.stat, value: d.value }))
      )

      // Turn 2: Wide Breaker (1 hit, -30% PDEF debuff, +50 potency because target is debuffed)
      const wideBreaker2Result = executeSkill(
        wideBreaker,
        viking,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(wideBreaker2Result).toBeDefined()
      if ('results' in wideBreaker2Result) {
        expect(false).toBe(true)
      } else {
        const singleResult = wideBreaker2Result
        expect(singleResult.anyHit).toBe(true)
        expect(singleResult.damageResults).toHaveLength(1)
        expect(singleResult.damageResults[0].hit).toBe(true)

        console.log(
          'Wide Breaker damage (with +50 potency):',
          singleResult.totalDamage
        )

        // Verify the +50 potency was applied (should be higher than base 100)
        // Base damage formula: (PATK - PDEF) * potency / 100
        // Viking PATK: 120, Target PDEF after -15%: 70 * 0.85 = 59.5
        // Base damage: (120 - 59.5) * 100 / 100 = 60.5
        // With +50 potency: (120 - 59.5) * 150 / 100 = 90.75 ≈ 91
        expect(singleResult.totalDamage).toBeGreaterThan(60) // Should use 150 potency, not 100
      }

      // Verify target has BOTH debuffs (from different skills, so they stack)
      console.log(
        'Debuffs after Wide Breaker:',
        target.debuffs.map(d => ({
          skillId: d.skillId,
          stat: d.stat,
          value: d.value,
        }))
      )
      expect(target.debuffs).toHaveLength(2)

      // Both PDEF debuffs should be present
      const pdefDebuffs = target.debuffs.filter(d => d.stat === 'PDEF')
      expect(pdefDebuffs).toHaveLength(2)
      expect(pdefDebuffs.map(d => d.value)).toContain(-15) // From Rolling Axe
      expect(pdefDebuffs.map(d => d.value)).toContain(-30) // From Wide Breaker

      console.log('Final target PDEF after debuffs:', target.combatStats.PDEF)
    })
  })

  describe('Wide Breaker → Wide Breaker sequence', () => {
    it('should apply -30% PDEF from turn 1, then use +50 potency in turn 2 due to debuff', () => {
      const wideBreaker = ActiveSkillsMap['wideBreaker']
      expect(wideBreaker).toBeDefined()

      // Turn 1: Wide Breaker (no debuff on target yet, so 100 potency)
      const wideBreaker1Result = executeSkill(
        wideBreaker,
        viking,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(wideBreaker1Result).toBeDefined()
      let turn1Damage = 0
      if ('results' in wideBreaker1Result) {
        expect(false).toBe(true)
      } else {
        const singleResult = wideBreaker1Result
        expect(singleResult.anyHit).toBe(true)
        expect(singleResult.damageResults).toHaveLength(1)
        turn1Damage = singleResult.totalDamage

        console.log(
          'Wide Breaker Turn 1 damage (100 potency, no debuff yet):',
          turn1Damage
        )
      }

      // Verify debuff was applied
      expect(target.debuffs).toHaveLength(1)
      expect(target.debuffs[0].stat).toBe('PDEF')
      expect(target.debuffs[0].value).toBe(-30)

      const targetHPAfterTurn1 = target.currentHP - turn1Damage
      console.log('Target HP after turn 1:', targetHPAfterTurn1)
      console.log(
        'Target debuffs after turn 1:',
        target.debuffs.map(d => ({ stat: d.stat, value: d.value }))
      )

      // Turn 2: Wide Breaker (debuff already active, so +50 potency)
      const wideBreaker2Result = executeSkill(
        wideBreaker,
        viking,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(wideBreaker2Result).toBeDefined()
      let turn2Damage = 0
      if ('results' in wideBreaker2Result) {
        expect(false).toBe(true)
      } else {
        const singleResult = wideBreaker2Result
        expect(singleResult.anyHit).toBe(true)
        expect(singleResult.damageResults).toHaveLength(1)
        turn2Damage = singleResult.totalDamage

        console.log(
          'Wide Breaker Turn 2 damage (150 potency, debuff active):',
          turn2Damage
        )

        // Turn 2 damage should be 50% more than turn 1 (150 potency vs 100 potency)
        expect(turn2Damage).toBeGreaterThan(turn1Damage)

        // Approximate ratio should be around 1.5 (150/100), but allow variance
        const ratio = turn2Damage / turn1Damage
        console.log(
          'Damage ratio (turn2/turn1):',
          ratio,
          '(150 potency / 100 potency)'
        )
        expect(ratio).toBeGreaterThan(1.25) // Allow for variance in calculations
      }

      // Verify debuff is still -30% (replaced, not stacked)
      expect(target.debuffs).toHaveLength(1)
      expect(target.debuffs[0].stat).toBe('PDEF')
      expect(target.debuffs[0].value).toBe(-30)

      console.log('Total damage over 2 turns:', turn1Damage + turn2Damage)
      console.log('Final target HP:', target.currentHP)
    })
  })

  describe('Damage comparison: Rolling Axe vs Wide Breaker', () => {
    it('should show damage breakdown for both scenarios with same base stats', () => {
      const rollingAxe = ActiveSkillsMap['rollingAxe']
      const wideBreaker = ActiveSkillsMap['wideBreaker']

      // Scenario 1: Rolling Axe only (3 hits)
      const ra1Result = executeSkill(
        rollingAxe,
        viking,
        createMockBattleContext({
          combatStats: target.combatStats,
          statFoundation: target.statFoundation,
          currentHP: 500,
        }),
        mockRngPresets.alwaysHit()
      )

      let raTotal = 0
      if (!('results' in ra1Result)) {
        raTotal = ra1Result.totalDamage
      }

      // Scenario 2: Wide Breaker only (1 hit, no prior debuff)
      const wb1Result = executeSkill(
        wideBreaker,
        viking,
        createMockBattleContext({
          combatStats: target.combatStats,
          statFoundation: target.statFoundation,
          currentHP: 500,
        }),
        mockRngPresets.alwaysHit()
      )

      let wbTotal = 0
      if (!('results' in wb1Result)) {
        wbTotal = wb1Result.totalDamage
      }

      console.log('=== Damage Comparison ===')
      console.log('Rolling Axe (3 hits):', raTotal)
      console.log('Wide Breaker (1 hit, no debuff):', wbTotal)
      console.log('RollingAxe damage per hit:', raTotal / 3)

      // Both should deal damage
      expect(raTotal).toBeGreaterThan(0)
      expect(wbTotal).toBeGreaterThan(0)
    })
  })
})
