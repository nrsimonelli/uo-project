import type { ConditionEvaluationContext } from '@/core/condition-evaluator'
import type { BattleContext } from '@/types/battle-engine'
import type { CombatantType } from '@/types/core'

/**
 * Simple mock battle context
 */
export function createMockBattleContext(
  overrides?: Partial<BattleContext>
): BattleContext {
  return {
    unit: {
      id: 'test-unit',
      name: 'Test Unit',
      classKey: 'Soldier',
      level: 1,
      growths: ['All-Rounder', 'All-Rounder'],
      equipment: [],
      skillSlots: [],
      position: { row: 0, col: 0 },
    },
    combatStats: {
      HP: 100,
      PATK: 50,
      MATK: 30,
      PDEF: 40,
      MDEF: 35,
      ACC: 85,
      EVA: 10,
      CRT: 15,
      GRD: 20,
      INIT: 100,
      GuardEff: 0,
    },
    currentHP: 100,
    currentAP: 2,
    currentPP: 2,
    team: 'home-team',
    combatantTypes: ['Infantry'] as CombatantType[],
    position: { row: 0, col: 0 },
    afflictions: [],
    buffs: [],
    debuffs: [],
    flags: [],
    lastPassiveResponse: 0,
    isPassiveResponsive: true,
    immunities: [],
    hasActedThisRound: false,
    ...overrides,
  }
}

/**
 * Simple mock condition context
 */
export function createMockContext(): ConditionEvaluationContext {
  return {
    attacker: createMockBattleContext({
      team: 'home-team',
      combatStats: {
        HP: 100,
        PATK: 60,
        MATK: 40,
        PDEF: 30,
        MDEF: 25,
        ACC: 85,
        EVA: 10,
        CRT: 15,
        GRD: 20,
        INIT: 100,
        GuardEff: 0,
      },
    }),
    target: createMockBattleContext({
      team: 'away-team',
      combatStats: {
        HP: 100,
        PATK: 30,
        MATK: 20,
        PDEF: 40,
        MDEF: 35,
        ACC: 75,
        EVA: 15,
        CRT: 10,
        GRD: 25,
        INIT: 90,
        GuardEff: 0,
      },
    }),
  }
}
