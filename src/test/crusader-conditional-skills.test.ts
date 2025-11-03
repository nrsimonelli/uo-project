import { describe, it, expect } from 'vitest'

import { executeSkill } from '../core/battle/combat/skill-executor'

import { mockRngPresets } from './utils/mock-rng'
import { createMockBattleContext } from './utils/tactical-test-utils'

import { ActiveSkillsMap } from '@/generated/skills-active'

describe('Crusader Conditional Effects', () => {
  describe('Vertical Edge', () => {
    it('vs Flying: applies TrueStrike flag, +50 potency, and 50% defense ignore', () => {
      const crusader = createMockBattleContext({
        unit: {
          id: 'crusader-1',
          name: 'Crusader',
          classKey: 'Crusader',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatStats: {
          HP: 100,
          PATK: 20,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        statFoundation: {
          HP: 100,
          PATK: 20,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        combatantTypes: ['Infantry'],
      })

      const wyvernKnight = createMockBattleContext({
        unit: {
          id: 'wyvern-1',
          name: 'Wyvern Knight',
          classKey: 'Wyvern Knight',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatStats: {
          HP: 100,
          PATK: 10,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        statFoundation: {
          HP: 100,
          PATK: 10,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        combatantTypes: ['Flying'],
      })

      const result = executeSkill(
        ActiveSkillsMap['verticalEdge'],
        crusader,
        wyvernKnight,
        mockRngPresets.alwaysMiss() // Use alwaysMiss to verify TrueStrike overrides RNG
      )

      if ('results' in result) {
        expect(false).toBe(true)
        return
      }

      // Verify TrueStrike was applied - should guarantee hit even with alwaysMiss RNG
      expect(result.anyHit).toBe(true)
      expect(result.damageResults[0].hit).toBe(true)

      // Calculate expected damage with all conditional effects:
      // Crusader PATK: 20, Wyvern Knight PDEF: 10
      // Base (no bonuses): (20 - 10) * 100 / 100 = 10
      // With 50% def ignore: (20 - 10*0.5) * 100 / 100 = (20 - 5) * 1 = 15
      // With +50 potency: (20 - 5) * 150 / 100 = 15 * 1.5 = 22.5 = 23 (rounded)
      // Expected damage: 23

      expect(result.totalDamage).toBe(23)
    })

    it('vs Infantry: no conditional bonuses applied', () => {
      const crusader = createMockBattleContext({
        unit: {
          id: 'crusader-1',
          name: 'Crusader',
          classKey: 'Crusader',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatStats: {
          HP: 100,
          PATK: 20,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        statFoundation: {
          HP: 100,
          PATK: 20,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        combatantTypes: ['Infantry'],
      })

      const soldier = createMockBattleContext({
        unit: {
          id: 'soldier-1',
          name: 'Soldier',
          classKey: 'Soldier',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatStats: {
          HP: 100,
          PATK: 10,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        statFoundation: {
          HP: 100,
          PATK: 10,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        combatantTypes: ['Infantry'],
      })

      const result = executeSkill(
        ActiveSkillsMap['verticalEdge'],
        crusader,
        soldier,
        mockRngPresets.alwaysHit()
      )

      if ('results' in result) {
        expect(false).toBe(true)
        return
      }

      // Should hit
      expect(result.anyHit).toBe(true)
      expect(result.damageResults[0].hit).toBe(true)

      // Baseline damage: (20 - 10) * 100 / 100 = 10
      // No potency boost, no defense ignore
      expect(result.totalDamage).toBe(10)
    })
  })

  describe('Iron Crusher', () => {
    it('vs Armored: applies Unguardable flag, +50 potency, and 50% defense ignore', () => {
      const crusader = createMockBattleContext({
        unit: {
          id: 'crusader-1',
          name: 'Crusader',
          classKey: 'Crusader',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatStats: {
          HP: 100,
          PATK: 20,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        statFoundation: {
          HP: 100,
          PATK: 20,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        combatantTypes: ['Infantry'],
      })

      const vanguard = createMockBattleContext({
        unit: {
          id: 'vanguard-1',
          name: 'Vanguard',
          classKey: 'Vanguard',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatStats: {
          HP: 100,
          PATK: 10,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 100,
          INIT: 70,
          GuardEff: 50,
          DmgReductionPercent: 0,
        },
        statFoundation: {
          HP: 100,
          PATK: 10,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 100,
          INIT: 70,
          GuardEff: 50,
          DmgReductionPercent: 0,
        },
        combatantTypes: ['Armored'],
      })

      const result = executeSkill(
        ActiveSkillsMap['ironCrusher'],
        crusader,
        vanguard,
        mockRngPresets.alwaysHit()
      )

      if ('results' in result) {
        expect(false).toBe(true)
        return
      }

      // Verify Unguardable flag was applied - target cannot guard
      expect(result.anyHit).toBe(true)
      expect(result.damageResults[0].hit).toBe(true)
      expect(result.damageResults[0].wasGuarded).toBe(false)

      // Calculate expected damage with all conditional effects:
      // Crusader PATK: 20, Vanguard PDEF: 10
      // Base (no bonuses): (20 - 10) * 100 / 100 = 10
      // With 50% def ignore: (20 - 10*0.5) * 100 / 100 = (20 - 5) * 1 = 15
      // With +50 potency: (20 - 5) * 150 / 100 = 15 * 1.5 = 22.5 = 23 (rounded)
      // Expected damage: 23

      expect(result.totalDamage).toBe(23)
    })

    it('vs Infantry: no conditional bonuses applied, can guard', () => {
      const crusader = createMockBattleContext({
        unit: {
          id: 'crusader-1',
          name: 'Crusader',
          classKey: 'Crusader',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatStats: {
          HP: 100,
          PATK: 20,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        statFoundation: {
          HP: 100,
          PATK: 20,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 0,
          INIT: 70,
          GuardEff: 0,
          DmgReductionPercent: 0,
        },
        combatantTypes: ['Infantry'],
      })

      const soldier = createMockBattleContext({
        unit: {
          id: 'soldier-1',
          name: 'Soldier',
          classKey: 'Soldier',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        combatStats: {
          HP: 100,
          PATK: 10,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 100,
          INIT: 70,
          GuardEff: 50,
          DmgReductionPercent: 0,
        },
        statFoundation: {
          HP: 100,
          PATK: 10,
          PDEF: 10,
          MATK: 10,
          MDEF: 10,
          ACC: 80,
          EVA: 60,
          CRT: 0,
          GRD: 100,
          INIT: 70,
          GuardEff: 50,
          DmgReductionPercent: 0,
        },
        combatantTypes: ['Infantry'],
      })

      const result = executeSkill(
        ActiveSkillsMap['ironCrusher'],
        crusader,
        soldier,
        mockRngPresets.alwaysHit()
      )

      if ('results' in result) {
        expect(false).toBe(true)
        return
      }

      // Should hit
      expect(result.anyHit).toBe(true)
      expect(result.damageResults[0].hit).toBe(true)

      // Baseline damage: (20 - 10) * 100 / 100 = 10
      // No potency boost, no defense ignore
      expect(result.totalDamage).toBe(10)
    })
  })
})
