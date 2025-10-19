import type { TacticalContext } from '@/core/battle/evaluation/tactical-evaluators'
import type {
  ConditionMetadata,
  ComparisonOperator,
} from '@/data/tactics/tactic-condition-meta'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { CombatantType } from '@/types/core'
import type { ActiveSkill } from '@/types/skills'

/**
 * Test utilities for tactical targeting - easily create mock objects and test individual tactics
 */

// ============================================================================
// MOCK FACTORIES
// ============================================================================

/**
 * Create a mock BattleContext for testing
 */
export const createMockBattleContext = (
  overrides: Partial<BattleContext> = {}
): BattleContext => {
  return {
    unit: {
      id: 'test-unit',
      name: 'Test Unit',
      level: 1,
      growths: ['Hardy', 'Hardy'],
      classKey: 'Fighter',
      equipment: [],
      skillSlots: [],
      ...overrides.unit,
    },
    team: 'home-team',
    position: { row: 0, col: 0 },
    currentHP: 100,
    currentAP: 2,
    currentPP: 1,
    statFoundation: {
      HP: 100,
      PATK: 50,
      PDEF: 30,
      MATK: 20,
      MDEF: 25,
      ACC: 80,
      EVA: 60,
      CRT: 10,
      GRD: 15,
      INIT: 70,
      GuardEff: 0,
    },
    combatStats: {
      HP: 100,
      PATK: 50,
      PDEF: 30,
      MATK: 20,
      MDEF: 25,
      ACC: 80,
      EVA: 60,
      CRT: 10,
      GRD: 15,
      INIT: 70,
      GuardEff: 0,
    },
    combatantTypes: ['Infantry'],
    buffs: [],
    debuffs: [],
    afflictions: [],
    conferrals: [],
    flags: [],
    lastPassiveResponse: 0,
    isPassiveResponsive: true,
    immunities: [],
    hasActedThisRound: false,
    ...overrides,
  }
}

/**
 * Create a mock BattlefieldState for testing
 */
export const createMockBattlefield = (
  overrides: Partial<BattlefieldState> = {}
): BattlefieldState => {
  return {
    units: {},
    activeUnitId: 'test-unit-id',
    formations: {
      allies: [
        [null, null, null],
        [null, null, null],
      ],
      enemies: [
        [null, null, null],
        [null, null, null],
      ],
    },
    activeSkillQueue: [],
    passiveSkillQueue: [],
    battlePhase: 'active',
    isNight: false,
    turnCount: 1,
    actionHistory: [],
    rng: { seed: ['test'], random: () => 0.5 },
    currentRound: 1,
    actionCounter: 0,
    currentActionId: 0,
    passiveResponseTracking: {},
    inactivityCounter: 0,
    lastActionRound: 0,
    lastActiveSkillRound: 0,
    consecutiveStandbyRounds: 0,
    ...overrides,
  }
}

/**
 * Create a mock ActiveSkill for testing
 */
export const createMockActiveSkill = (
  overrides: Partial<ActiveSkill> = {}
): ActiveSkill => {
  return {
    id: 'test-skill',
    type: 'active',
    name: 'Test Skill',
    description: 'A test skill',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    ap: 1,
    effects: [],
    skillCategories: ['Damage'],
    ...overrides,
  }
}

/**
 * Create a mock TacticalContext for testing
 */
export const createMockTacticalContext = (
  overrides: Partial<TacticalContext> = {}
): TacticalContext => {
  const actingUnit = overrides.actingUnit || createMockBattleContext()
  const battlefield = overrides.battlefield || createMockBattlefield()
  const skill = overrides.skill || createMockActiveSkill()

  return {
    actingUnit,
    battlefield,
    skill,
    allAllies: [actingUnit],
    allEnemies: [
      createMockBattleContext({
        unit: {
          id: 'enemy-1',
          name: 'Enemy 1',
          classKey: 'Fighter',
          level: 1,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        team: 'away-team',
        position: { row: 1, col: 1 },
      }),
    ],
    ...overrides,
  }
}

/**
 * Create mock metadata for testing specific tactic conditions
 */
export const createMockMetadata = (
  overrides: Partial<ConditionMetadata> = {}
): ConditionMetadata => {
  return {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'lt',
    threshold: 50,
    ...overrides,
  }
}

// ============================================================================
// SPECIALIZED FACTORIES FOR COMMON TEST SCENARIOS
// ============================================================================

/**
 * Create a low HP unit (useful for HP-based tactic testing)
 */
export const createLowHpUnit = (hpPercent: number = 25): BattleContext => {
  const maxHP = 100
  const currentHP = Math.floor(maxHP * (hpPercent / 100))

  return createMockBattleContext({
    currentHP,
    combatStats: { ...createMockBattleContext().combatStats, HP: maxHP },
    statFoundation: { ...createMockBattleContext().statFoundation, HP: maxHP },
  })
}

/**
 * Create a unit with specific AP/PP values
 */
export const createResourceUnit = (
  ap: number = 0,
  pp: number = 0
): BattleContext => {
  return createMockBattleContext({
    currentAP: ap,
    currentPP: pp,
  })
}

/**
 * Create a unit with specific combatant types
 */
export const createTypedUnit = (types: CombatantType[]): BattleContext => {
  return createMockBattleContext({
    combatantTypes: types,
  })
}

/**
 * Create a unit with specific status effects
 */
export const createStatusUnit = (
  buffs: Array<{
    name: string
    stat:
      | 'HP'
      | 'LV'
      | 'EXP'
      | 'PATK'
      | 'PDEF'
      | 'MATK'
      | 'MDEF'
      | 'ACC'
      | 'EVA'
      | 'CRT'
      | 'GRD'
      | 'INIT'
      | 'MOV'
    value: number
    duration:
      | 'Indefinite'
      | 'UntilNextAttack'
      | 'UntilAttacked'
      | 'UntilDebuffed'
      | 'UntilNextAction'
    scaling: 'flat' | 'percent'
    source: string
    skillId: string
  }> = [],
  debuffs: Array<{
    name: string
    stat:
      | 'HP'
      | 'LV'
      | 'EXP'
      | 'PATK'
      | 'PDEF'
      | 'MATK'
      | 'MDEF'
      | 'ACC'
      | 'EVA'
      | 'CRT'
      | 'GRD'
      | 'INIT'
      | 'MOV'
    value: number
    duration: 'Indefinite' | 'UntilNextAttack' | 'UntilNextAction'
    scaling: 'flat' | 'percent'
    source: string
    skillId: string
  }> = [],
  afflictions: Array<{
    type:
      | 'Stun'
      | 'Poison'
      | 'Burn'
      | 'Freeze'
      | 'Blind'
      | 'GuardSeal'
      | 'PassiveSeal'
      | 'CritSeal'
      | 'Deathblow'
    name: string
    source: string
  }> = []
): BattleContext => {
  return createMockBattleContext({
    buffs,
    debuffs,
    afflictions,
  })
}

/**
 * Create a unit at a specific position
 */
export const createPositionedUnit = (
  row: number,
  col: number
): BattleContext => {
  return createMockBattleContext({
    position: { row, col },
  })
}

/**
 * Create multiple units for testing sorting/filtering
 */
export const createUnitGroup = (
  configurations: Partial<BattleContext>[]
): BattleContext[] => {
  return configurations.map((config, index) =>
    createMockBattleContext({
      unit: {
        id: `unit-${index}`,
        name: `Unit ${index}`,
        classKey: 'Fighter',
        level: 1,
        growths: ['Hardy', 'Hardy'],
        equipment: [],
        skillSlots: [],
      },
      ...config,
    })
  )
}

// ============================================================================
// QUICK TEST HELPERS
// ============================================================================

/**
 * Quick test for HP percentage tactics
 */
export const testHpPercentTactic = (
  tacticType: 'filter' | 'sort',
  operator: ComparisonOperator,
  threshold: number,
  units: BattleContext[]
) => {
  return {
    metadata: createMockMetadata({
      type: tacticType,
      valueType: 'hp-percent',
      operator,
      threshold,
    }),
    units,
    context: createMockTacticalContext(),
  }
}

/**
 * Quick test for combatant type tactics
 */
export const testCombatantTypeTactic = (
  tacticType: 'filter' | 'sort',
  combatantType: CombatantType,
  units: BattleContext[]
) => {
  return {
    metadata: createMockMetadata({
      type: tacticType,
      valueType: 'combatant-type',
      combatantType,
    }),
    units,
    context: createMockTacticalContext(),
  }
}

/**
 * Quick test for status-based tactics
 */
export const testStatusTactic = (
  tacticType: 'filter' | 'sort',
  statusName: string,
  negated: boolean = false,
  units: BattleContext[]
) => {
  return {
    metadata: createMockMetadata({
      type: tacticType,
      valueType: 'status',
      statusName,
      negated,
    }),
    units,
    context: createMockTacticalContext(),
  }
}

/**
 * Quick test for resource (AP/PP) tactics
 */
export const testResourceTactic = (
  tacticType: 'filter' | 'sort',
  valueType: 'ap' | 'pp',
  operator: ComparisonOperator,
  threshold: number,
  units: BattleContext[]
) => {
  return {
    metadata: createMockMetadata({
      type: tacticType,
      valueType,
      operator,
      threshold,
    }),
    units,
    context: createMockTacticalContext(),
  }
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert that units are in HP order (for testing sort tactics)
 */
export const assertHpOrder = (
  units: BattleContext[],
  order: 'ascending' | 'descending' = 'ascending'
) => {
  for (let i = 1; i < units.length; i++) {
    const prevHp = (units[i - 1].currentHP / units[i - 1].combatStats.HP) * 100
    const currentHp = (units[i].currentHP / units[i].combatStats.HP) * 100

    if (order === 'ascending' && prevHp > currentHp) return false
    if (order === 'descending' && prevHp < currentHp) return false
  }
  return true
}

/**
 * Assert that all units meet a specific condition
 */
export const assertAllUnitsMatch = (
  units: BattleContext[],
  condition: (unit: BattleContext) => boolean
) => {
  return units.every(condition)
}

/**
 * Assert that units are sorted by a specific stat
 */
export const assertStatOrder = (
  units: BattleContext[],
  statName: string,
  order: 'ascending' | 'descending' = 'ascending'
) => {
  const getStatValue = (unit: BattleContext) => {
    if (statName === 'currentAP') return unit.currentAP
    if (statName === 'currentPP') return unit.currentPP
    return (unit.combatStats as Record<string, number>)[statName] || 0
  }

  for (let i = 1; i < units.length; i++) {
    const prevValue = getStatValue(units[i - 1])
    const currentValue = getStatValue(units[i])

    if (order === 'ascending' && prevValue > currentValue) return false
    if (order === 'descending' && prevValue < currentValue) return false
  }
  return true
}
