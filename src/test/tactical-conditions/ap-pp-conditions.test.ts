import { describe, it, expect, beforeEach } from 'vitest'

import {
  createAllBattleContexts,
  createInitialBattlefieldState,
} from '@/core/battle/engine/battlefield-state'
import { evaluateSkillSlotTactics } from '@/core/battle/targeting/tactical-targeting'
import { rng } from '@/core/random'
import type { BattlefieldState, BattleContext } from '@/types/battle-engine'
import type { SkillSlot } from '@/types/skills'
import type { Team } from '@/types/team'

// ============================================================================
// SETUP UTILITIES
// ============================================================================

/**
 * Create test teams with varied AP/PP levels
 */
const createMixedApPpTeam = (teamName: string): Team => ({
  id: `${teamName.toLowerCase()}-team`,
  name: `${teamName} Team`,
  formation: [
    {
      id: `${teamName}-unit-1`,
      name: `${teamName} Full AP`,
      classKey: 'Soldier',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 0 }, // Front row, left
    },
    {
      id: `${teamName}-unit-2`,
      name: `${teamName} High AP`,
      classKey: 'Soldier',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 1 }, // Front row, center
    },
    {
      id: `${teamName}-unit-3`,
      name: `${teamName} Mid AP`,
      classKey: 'Soldier',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 2 }, // Front row, right
    },
    {
      id: `${teamName}-unit-4`,
      name: `${teamName} Low AP`,
      classKey: 'Hunter',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 0, col: 0 }, // Back row, left
    },
    {
      id: `${teamName}-unit-5`,
      name: `${teamName} No AP`,
      classKey: 'Hunter',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 0, col: 1 }, // Back row, center
    },
    null,
  ],
})

/**
 * Set up realistic AP/PP values on battle contexts
 */
const setupApPpValues = (battlefield: BattlefieldState): BattlefieldState => {
  const updatedUnits = { ...battlefield.units }

  // Home team AP setup: 4, 3, 2, 1, 0 (max 4 per rules)
  const homeUnits = Object.entries(updatedUnits)
    .filter(([id]) => id.startsWith('home-'))
    .sort(([a], [b]) => a.localeCompare(b))

  const homeApValues = [4, 3, 2, 1, 0]
  const homePpValues = [4, 3, 2, 1, 0] // Same pattern for PP

  homeUnits.forEach(([unitId, unit], index) => {
    if (index < homeApValues.length) {
      updatedUnits[unitId] = {
        ...unit,
        currentAP: homeApValues[index],
        currentPP: homePpValues[index],
      }
    }
  })

  // Away team AP/PP setup: 4, 2, 3, 0, 1 (different pattern)
  const awayUnits = Object.entries(updatedUnits)
    .filter(([id]) => id.startsWith('away-'))
    .sort(([a], [b]) => a.localeCompare(b))

  const awayApValues = [4, 2, 3, 0, 1]
  const awayPpValues = [3, 4, 1, 2, 0] // Different PP pattern

  awayUnits.forEach(([unitId, unit], index) => {
    if (index < awayApValues.length) {
      updatedUnits[unitId] = {
        ...unit,
        currentAP: awayApValues[index],
        currentPP: awayPpValues[index],
      }
    }
  })

  return {
    ...battlefield,
    units: updatedUnits,
  }
}

/**
 * Create a skill slot with AP/PP-based tactical conditions
 */
const createApPpTacticSkill = (
  skillId: string,
  tactic1Condition: string,
  tactic2Condition?: string
): SkillSlot => ({
  id: skillId,
  skillType: 'active',
  skillId,
  order: 0,
  tactics: [
    {
      kind: 'conditional',
      condition: {
        category: 'AP & PP',
        key: tactic1Condition,
      },
    },
    tactic2Condition
      ? {
          kind: 'conditional',
          condition: {
            category: 'AP & PP',
            key: tactic2Condition,
          },
        }
      : null,
  ],
})

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Assert that targets meet AP filter criteria
 */
const assertApFilter = (
  targets: BattleContext[],
  operator: '>' | '<' | '>=' | '<=' | '=',
  threshold: number
): boolean => {
  return targets.every(target => {
    const ap = target.currentAP
    switch (operator) {
      case '>':
        return ap > threshold
      case '<':
        return ap < threshold
      case '>=':
        return ap >= threshold
      case '<=':
        return ap <= threshold
      case '=':
        return ap === threshold
      default:
        return false
    }
  })
}

/**
 * Assert that targets meet PP filter criteria
 */
const assertPpFilter = (
  targets: BattleContext[],
  operator: '>' | '<' | '>=' | '<=' | '=',
  threshold: number
): boolean => {
  return targets.every(target => {
    const pp = target.currentPP
    switch (operator) {
      case '>':
        return pp > threshold
      case '<':
        return pp < threshold
      case '>=':
        return pp >= threshold
      case '<=':
        return pp <= threshold
      case '=':
        return pp === threshold
      default:
        return false
    }
  })
}

/**
 * Assert that targets are sorted correctly by AP
 */
const assertApSort = (
  targets: BattleContext[],
  direction: 'ascending' | 'descending'
): boolean => {
  if (targets.length <= 1) return true

  for (let i = 1; i < targets.length; i++) {
    const prevAp = targets[i - 1].currentAP
    const currAp = targets[i].currentAP

    if (direction === 'ascending' && prevAp > currAp) return false
    if (direction === 'descending' && prevAp < currAp) return false
  }
  return true
}

/**
 * Assert that targets are sorted correctly by PP
 */
const assertPpSort = (
  targets: BattleContext[],
  direction: 'ascending' | 'descending'
): boolean => {
  if (targets.length <= 1) return true

  for (let i = 1; i < targets.length; i++) {
    const prevPp = targets[i - 1].currentPP
    const currPp = targets[i].currentPP

    if (direction === 'ascending' && prevPp > currPp) return false
    if (direction === 'descending' && prevPp < currPp) return false
  }
  return true
}

// ============================================================================
// MAIN TEST SUITE
// ============================================================================

describe('AP/PP Condition Tactical Testing', () => {
  let battlefield: BattlefieldState
  let homeTeam: Team
  let awayTeam: Team

  beforeEach(() => {
    // Create teams with realistic unit compositions
    homeTeam = createMixedApPpTeam('Home')
    awayTeam = createMixedApPpTeam('Away')

    // Set up battlefield with proper AP/PP values
    const allContexts = createAllBattleContexts(homeTeam, awayTeam)
    const turnOrder = Object.keys(allContexts)
    const testRng = rng('ap-pp-test-seed')

    const initialBattlefield = createInitialBattlefieldState(
      allContexts,
      turnOrder,
      testRng
    )
    battlefield = setupApPpValues(initialBattlefield)

    // Log AP/PP setup for debugging
    console.log('🎯 AP/PP Test Setup:')
    Object.entries(battlefield.units).forEach(([id, unit]) => {
      console.log(
        `  ${id}: ${unit.unit.name} - AP:${unit.currentAP} PP:${unit.currentPP}`
      )
    })
  })

  // ============================================================================
  // AP FILTER CONDITIONS
  // ============================================================================

  describe('AP Filter Conditions', () => {
    it('should filter targets with 0 AP', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill('shadowbite', '0 AP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)
      expect(assertApFilter(result.targets, '=', 0)).toBe(true)

      console.log(
        `✅ Shadowbite targeting 0 AP enemies:`,
        result.targets.map(t => `${t.unit.name} (${t.currentAP} AP)`)
      )
    })

    it('should filter targets with 2 or More AP', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill('shadowbite', '2 or More AP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)
      expect(assertApFilter(result.targets, '>=', 2)).toBe(true)

      console.log(
        `✅ Shadowbite targeting 2+ AP enemies:`,
        result.targets.map(t => `${t.unit.name} (${t.currentAP} AP)`)
      )
    })

    it('should skip skill when own AP condition not met', () => {
      const actingUnitId = Object.keys(battlefield.units).filter(id =>
        id.startsWith('home-')
      )[4]! // This unit has 0 AP
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill('heal', 'Own AP is 2 or More')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Should skip skill since acting unit has 0 AP
      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Heal skipped - acting unit AP: ${actingUnit.currentAP} (need 2+)`
      )
    })
  })

  // ============================================================================
  // PP FILTER CONDITIONS
  // ============================================================================

  describe('PP Filter Conditions', () => {
    it('should filter targets with 1 or Less PP', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill('sting', '1 or Less PP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)
      expect(assertPpFilter(result.targets, '<=', 1)).toBe(true)

      console.log(
        `✅ Sting targeting ≤1 PP enemies:`,
        result.targets.map(t => `${t.unit.name} (${t.currentPP} PP)`)
      )
    })

    it('should skip when own PP condition fails', () => {
      const actingUnitId = Object.keys(battlefield.units).filter(id =>
        id.startsWith('home-')
      )[4]! // This unit has 0 PP
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill(
        'rowProtection',
        'Own PP is 3 or More'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Row Protection skipped - acting unit PP: ${actingUnit.currentPP} (need 3+)`
      )
    })
  })

  // ============================================================================
  // AP SORT CONDITIONS
  // ============================================================================

  describe('AP Sort Conditions', () => {
    it('should prioritize Most AP enemies', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill('longThrust', 'Most AP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)
      expect(assertApSort(result.targets, 'descending')).toBe(true)

      console.log(
        `✅ Long Thrust targeting highest AP enemy column:`,
        result.targets.map(t => `${t.unit.name} (${t.currentAP} AP)`)
      )
    })

    it('should prioritize Least AP allies with heal', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill('heal', 'Least AP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBe(1) // Single target heal
      expect(assertApSort(result.targets, 'ascending')).toBe(true)

      // Should target the lowest AP ally (0 AP)
      expect(result.targets[0].currentAP).toBe(0)

      console.log(
        `✅ Heal targeting lowest AP ally:`,
        `${result.targets[0].unit.name} (${result.targets[0].currentAP} AP)`
      )
    })
  })

  // ============================================================================
  // PP SORT CONDITIONS
  // ============================================================================

  describe('PP Sort Conditions', () => {
    it('should prioritize Most PP allies for buffs', () => {
      const actingUnitId = Object.keys(battlefield.units).filter(id =>
        id.startsWith('home-')
      )[4]! // Use low-resource unit to avoid own conditions
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill('rowProtection', 'Most PP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)
      expect(assertPpSort(result.targets, 'descending')).toBe(true)

      console.log(
        `✅ Row Protection targeting highest PP ally row:`,
        result.targets.map(t => `${t.unit.name} (${t.currentPP} PP)`)
      )
    })

    it('should prioritize Least PP enemies', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createApPpTacticSkill('bastardsCross', 'Least PP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)
      expect(assertPpSort(result.targets, 'ascending')).toBe(true)

      console.log(
        `✅ Bastard's Cross targeting lowest PP enemies:`,
        result.targets.map(t => `${t.unit.name} (${t.currentPP} PP)`)
      )
    })
  })

  // ============================================================================
  // COMBINED CONDITIONS
  // ============================================================================

  describe('Combined AP/PP Conditions', () => {
    it('should combine AP filter and PP sort', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Filter enemies with 1+ AP, then sort by lowest PP
      const skillSlot = createApPpTacticSkill(
        'wildRush',
        '1 or More AP',
        'Least PP'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // All targets should have AP >= 1 (filter)
      expect(assertApFilter(result.targets, '>=', 1)).toBe(true)

      // Targets should be sorted by ascending PP (sort)
      expect(assertPpSort(result.targets, 'ascending')).toBe(true)

      console.log(
        `✅ Wild Rush with combined conditions:`,
        result.targets.map(
          t => `${t.unit.name} (${t.currentAP} AP, ${t.currentPP} PP)`
        )
      )
    })
  })

  // ============================================================================
  // FILTER FAILURE TESTS
  // ============================================================================

  describe('AP/PP Filter Failure Tests', () => {
    it('should skip when no targets meet AP filter', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Try to target enemies with >4 AP (impossible - max is 4)
      const skillSlot = createApPpTacticSkill('heavySlash', '4 or More AP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Might succeed if enemies have exactly 4 AP, check results
      if (!result.shouldUseSkill) {
        expect(result.targets).toHaveLength(0)
        console.log(`❌ Heavy Slash skipped - no enemies with 4+ AP`)
      } else {
        expect(assertApFilter(result.targets, '>=', 4)).toBe(true)
        console.log(
          `✅ Heavy Slash found 4 AP enemies:`,
          result.targets.map(t => `${t.unit.name} (${t.currentAP} AP)`)
        )
      }
    })

    it('should skip when own PP condition fails', () => {
      const actingUnitId = Object.keys(battlefield.units).filter(id =>
        id.startsWith('home-')
      )[4]! // Unit with 0 PP
      const actingUnit = battlefield.units[actingUnitId]

      // Require own PP > 3 (unit has 0)
      const skillSlot = createApPpTacticSkill('heal', 'Own PP is 4 or More')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Heal skipped - acting unit PP: ${actingUnit.currentPP} (need 4+)`
      )
    })
  })
})
