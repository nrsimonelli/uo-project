import { mockRng } from './mock-rng'

import type { ConditionEvaluationContext } from '@/core/battle/evaluation/condition-evaluator'
import type { TacticalContext } from '@/core/battle/evaluation/tactical-evaluators'
import type { GrowthTuple } from '@/types/base-stats'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { CombatantType } from '@/types/core'
import type { Unit } from '@/types/team'

/**
 * Simple mock battle context
 */
export function createMockBattleContext(
  overrides?: Partial<Omit<BattleContext, 'unit' | 'combatStats'>> & {
    unit?: Partial<Unit>
    combatStats?: Partial<BattleContext['combatStats']>
  }
): BattleContext {
  const defaultUnit = {
    id: 'test-unit',
    name: 'Test Unit',
    classKey: 'Soldier' as const,
    level: 1,
    growths: ['All-Rounder', 'All-Rounder'] as GrowthTuple,
    equipment: [],
    skillSlots: [],
  }

  const defaultCombatStats = {
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
  }

  const {
    unit: unitOverrides,
    combatStats: combatStatsOverrides,
    ...otherOverrides
  } = overrides || {}

  return {
    unit: {
      ...defaultUnit,
      ...unitOverrides,
    },
    combatStats: {
      ...defaultCombatStats,
      ...combatStatsOverrides,
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
    conferrals: [],
    statFoundation: {
      HP: 0,
      PATK: 0,
      PDEF: 0,
      MATK: 0,
      MDEF: 0,
      ACC: 0,
      EVA: 0,
      CRT: 0,
      GRD: 0,
      INIT: 0,
      GuardEff: 0,
    },
    flags: [],
    lastPassiveResponse: 0,
    isPassiveResponsive: true,
    immunities: [],
    hasActedThisRound: false,
    ...otherOverrides,
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

/**
 * Simple mock tactical context with battlefield
 */
export function createMockTacticalContext(
  overrides?: Partial<Omit<TacticalContext, 'battlefield'>> & {
    battlefield?: Partial<BattlefieldState>
  }
): TacticalContext {
  const defaultBattlefield: BattlefieldState = {
    units: {},
    activeUnitId: 'test-unit',
    formations: {
      allies: [
        [null, null],
        [null, null],
      ],
      enemies: [
        [null, null],
        [null, null],
      ],
    },
    activeSkillQueue: [],
    passiveSkillQueue: [],
    battlePhase: 'active',
    isNight: false,
    turnCount: 1,
    actionHistory: [],
    rng: mockRng(0.5),
    currentRound: 1,
    actionCounter: 0,
    passiveResponseTracking: {},
    inactivityCounter: 0,
    lastActionRound: 0,
    lastActiveSkillRound: 0,
    consecutiveStandbyRounds: 0,
  }

  const defaultActingUnit = createMockBattleContext({
    unit: { name: 'Acting Unit' },
  })

  const { battlefield: battlefieldOverrides, ...otherOverrides } =
    overrides || {}

  return {
    actingUnit: defaultActingUnit,
    battlefield: {
      ...defaultBattlefield,
      ...battlefieldOverrides,
    },
    skill: {
      id: 'heavySlash',
      type: 'active',
      skillCategories: ['Damage'],
      name: 'Test Skill',
      description: 'Test skill',
      ap: 1,
      targeting: { pattern: 'Single', group: 'Enemy' },
      effects: [],
    },
    allAllies: [defaultActingUnit],
    allEnemies: [
      createMockBattleContext({
        team: 'away-team',
        unit: { name: 'Enemy Unit' },
      }),
    ],
    ...otherOverrides,
  }
}
