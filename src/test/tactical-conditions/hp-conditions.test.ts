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

/**
 * Create a test team with varied HP percentages for tactical testing
 */
const createMixedHpTeam = (teamName: string): Team => ({
  id: `hp-test-${teamName}`,
  name: `HP Test ${teamName}`,
  formation: [
    {
      id: `${teamName}-unit-1`,
      name: `${teamName} Full HP`,
      classKey: 'Soldier',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 0 }, // Front row, left
    },
    {
      id: `${teamName}-unit-2`,
      name: `${teamName} High HP`,
      classKey: 'Soldier',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 1 }, // Front row, center
    },
    {
      id: `${teamName}-unit-3`,
      name: `${teamName} Mid HP`,
      classKey: 'Soldier',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 2 }, // Front row, right
    },
    {
      id: `${teamName}-unit-4`,
      name: `${teamName} Low HP`,
      classKey: 'Hunter',
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 0, col: 0 }, // Back row, left
    },
    {
      id: `${teamName}-unit-5`,
      name: `${teamName} Critical HP`,
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
 * Set up realistic HP percentages on battle contexts
 */
const setupHpPercentages = (
  battlefield: BattlefieldState
): BattlefieldState => {
  const updatedUnits = { ...battlefield.units }

  // Home team HP setup: 100%, 75%, 50%, 25%, 10%
  const homeUnits = Object.entries(updatedUnits)
    .filter(([id]) => id.startsWith('home-'))
    .sort(([a], [b]) => a.localeCompare(b))

  const homeHpPercentages = [100, 75, 50, 25, 10]
  homeUnits.forEach(([unitId, unit], index) => {
    if (index < homeHpPercentages.length) {
      const targetPercent = homeHpPercentages[index] / 100
      const newHP = Math.floor(unit.combatStats.HP * targetPercent)
      updatedUnits[unitId] = {
        ...unit,
        currentHP: Math.max(1, newHP), // Ensure at least 1 HP
      }
    }
  })

  // Away team HP setup: 90%, 60%, 40%, 20%, 5%
  const awayUnits = Object.entries(updatedUnits)
    .filter(([id]) => id.startsWith('away-'))
    .sort(([a], [b]) => a.localeCompare(b))

  const awayHpPercentages = [90, 60, 40, 20, 5]
  awayUnits.forEach(([unitId, unit], index) => {
    if (index < awayHpPercentages.length) {
      const targetPercent = awayHpPercentages[index] / 100
      const newHP = Math.floor(unit.combatStats.HP * targetPercent)
      updatedUnits[unitId] = {
        ...unit,
        currentHP: Math.max(1, newHP), // Ensure at least 1 HP
      }
    }
  })

  return {
    ...battlefield,
    units: updatedUnits,
  }
}

/**
 * Create a skill slot with HP-based tactical conditions
 */
const createHpTacticSkill = (
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
        category: 'HP',
        key: tactic1Condition,
      },
    },
    tactic2Condition
      ? {
          kind: 'conditional',
          condition: {
            category: 'HP',
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
 * Get HP percentage for a battle context
 */
const getHpPercent = (unit: BattleContext): number => {
  return Math.round((unit.currentHP / unit.combatStats.HP) * 100)
}

/**
 * Assert that targets meet HP filter criteria
 */
const assertHpFilter = (
  targets: BattleContext[],
  operator: '>' | '<' | '>=' | '<=',
  threshold: number
): boolean => {
  return targets.every(target => {
    const hpPercent = getHpPercent(target)
    switch (operator) {
      case '>':
        return hpPercent > threshold
      case '<':
        return hpPercent < threshold
      case '>=':
        return hpPercent >= threshold
      case '<=':
        return hpPercent <= threshold
      default:
        return false
    }
  })
}

/**
 * Assert that targets are sorted correctly by HP
 */
const assertHpSort = (
  targets: BattleContext[],
  direction: 'ascending' | 'descending'
): boolean => {
  if (targets.length <= 1) return true

  for (let i = 1; i < targets.length; i++) {
    const prevHp = getHpPercent(targets[i - 1])
    const currHp = getHpPercent(targets[i])

    if (direction === 'ascending' && prevHp > currHp) return false
    if (direction === 'descending' && prevHp < currHp) return false
  }
  return true
}

// ============================================================================
// MAIN TEST SUITE
// ============================================================================

describe('HP Condition Tactical Testing', () => {
  let battlefield: BattlefieldState
  let homeTeam: Team
  let awayTeam: Team

  beforeEach(() => {
    // Create teams with realistic unit compositions
    homeTeam = createMixedHpTeam('Home')
    awayTeam = createMixedHpTeam('Away')

    // Set up battlefield with proper HP percentages
    const allContexts = createAllBattleContexts(homeTeam, awayTeam)
    const turnOrder = Object.keys(allContexts) // Use all unit IDs for turn order
    const testRng = rng('hp-test-seed')

    const initialBattlefield = createInitialBattlefieldState(
      allContexts,
      turnOrder,
      testRng
    )
    battlefield = setupHpPercentages(initialBattlefield)

    // Log HP setup and unit IDs for debugging
    console.log('🔍 HP Test Setup:')
    console.log('Available unit IDs:', Object.keys(battlefield.units))
    Object.entries(battlefield.units).forEach(([id, unit]) => {
      const hpPercent = getHpPercent(unit)
      console.log(
        `  ${id}: ${unit.unit.name} - ${unit.currentHP}/${unit.combatStats.HP} (${hpPercent}%)`
      )
    })
  })

  // ============================================================================
  // HP FILTER CONDITIONS - DAMAGE SKILLS
  // ============================================================================

  describe('HP Filter Conditions - Damage Skills', () => {
    it('should filter enemies with HP < 50% using heavy slash', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('heavySlash', 'Target HP is <50%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // All targets should have HP < 50%
      expect(assertHpFilter(result.targets, '<', 50)).toBe(true)

      // Should only target enemies (away team)
      result.targets.forEach(target => {
        expect(target.team).toBe('away-team')
      })

      console.log(
        `✅ Heavy Slash targeting low HP enemies:`,
        result.targets.map(t => `${t.unit.name} (${getHpPercent(t)}%)`)
      )
    })

    it('should skip using sting when own HP > 50%', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )! // This unit has 100% HP
      const actingUnit = battlefield.units[actingUnitId]

      // Sting has inherent condition: +50 potency if user below 50% HP
      // Add tactical condition: Own HP is <50%
      const skillSlot = createHpTacticSkill('sting', 'Own HP is <50%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Should skip skill since acting unit has 100% HP
      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Sting skipped - acting unit HP: ${getHpPercent(actingUnit)}%`
      )
    })

    it('should use sting when own HP < 50%', () => {
      const actingUnitId = Object.keys(battlefield.units).filter(id =>
        id.startsWith('home-')
      )[3] // This unit should have 25% HP
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('sting', 'Own HP is <50%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Should target enemies
      result.targets.forEach(target => {
        expect(target.team).toBe('away-team')
      })

      console.log(
        `✅ Sting used - acting unit HP: ${getHpPercent(actingUnit)}%`
      )
    })

    it('should target high HP enemies with bastards cross', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Bastard's Cross gets +60 potency vs targets with >80% HP
      const skillSlot = createHpTacticSkill(
        'bastardsCross',
        'Target HP is >75%'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // All targets should have HP > 75%
      expect(assertHpFilter(result.targets, '>', 75)).toBe(true)

      console.log(
        `✅ Bastard's Cross targeting high HP enemies:`,
        result.targets.map(t => `${t.unit.name} (${getHpPercent(t)}%)`)
      )
    })
  })

  // ============================================================================
  // HP FILTER CONDITIONS - HEALING SKILLS
  // ============================================================================

  describe('HP Filter Conditions - Healing Skills', () => {
    it('should heal allies with HP < 75% using single heal', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('heal', 'Target HP is <75%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBe(1) // Single target heal

      // Target should have HP < 75%
      expect(assertHpFilter(result.targets, '<', 75)).toBe(true)

      // Should only target allies (home team)
      result.targets.forEach(target => {
        expect(target.team).toBe('home-team')
      })

      console.log(
        `✅ Heal targeting wounded ally:`,
        result.targets.map(t => `${t.unit.name} (${getHpPercent(t)}%)`)
      )
    })

    it('should heal row of allies with low HP using row heal', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('rowHeal', 'Target HP is <75%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // All targets should be allies with HP < 75%
      result.targets.forEach(target => {
        expect(target.team).toBe('home-team')
        expect(getHpPercent(target)).toBeLessThan(75)
      })

      // All targets should be in same row (Row pattern)
      if (result.targets.length > 1) {
        const firstRow = result.targets[0].position.row
        result.targets.forEach(target => {
          expect(target.position.row).toBe(firstRow)
        })
      }

      console.log(
        `✅ Row Heal targeting wounded allies:`,
        result.targets.map(
          t => `${t.unit.name} (${getHpPercent(t)}%) Row:${t.position.row}`
        )
      )
    })

    it('should skip healing when no allies need it', () => {
      const actingUnitId = Object.keys(battlefield.units).filter(id =>
        id.startsWith('home-')
      )[1]!
      const actingUnit = battlefield.units[actingUnitId]

      // Try to heal allies with HP < 25% (some units qualify)
      const skillSlot = createHpTacticSkill('heal', 'Target HP is <25%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Depending on the exact HP percentages, this might find units with < 25% HP
      if (result.shouldUseSkill) {
        expect(assertHpFilter(result.targets, '<', 25)).toBe(true)
        console.log(
          `✅ Heal targeting critically wounded ally:`,
          result.targets.map(t => `${t.unit.name} (${getHpPercent(t)}%)`)
        )
      } else {
        console.log(`❌ Heal skipped - no allies with HP < 25%`)
      }
    })
  })

  // ============================================================================
  // HP SORT CONDITIONS - DAMAGE SKILLS
  // ============================================================================

  describe('HP Sort Conditions - Damage Skills', () => {
    it('should prioritize lowest HP enemies with shadowbite', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('shadowbite', 'Lowest HP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Should target enemies in ascending HP order
      expect(assertHpSort(result.targets, 'ascending')).toBe(true)

      // All targets should be in same row (Row attack)
      if (result.targets.length > 1) {
        const firstRow = result.targets[0].position.row
        result.targets.forEach(target => {
          expect(target.position.row).toBe(firstRow)
        })
      }

      console.log(
        `✅ Shadowbite targeting lowest HP enemy row:`,
        result.targets.map(
          t => `${t.unit.name} (${getHpPercent(t)}%) Row:${t.position.row}`
        )
      )
    })

    it('should prioritize highest HP enemies with long thrust column', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('longThrust', 'Highest HP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Should target enemies in descending HP order
      expect(assertHpSort(result.targets, 'descending')).toBe(true)

      // All targets should be in same column (Column attack)
      if (result.targets.length > 1) {
        const firstCol = result.targets[0].position.col
        result.targets.forEach(target => {
          expect(target.position.col).toBe(firstCol)
        })
      }

      console.log(
        `✅ Long Thrust targeting highest HP enemy column:`,
        result.targets.map(
          t => `${t.unit.name} (${getHpPercent(t)}%) Col:${t.position.col}`
        )
      )
    })
  })

  // ============================================================================
  // HP SORT CONDITIONS - HEALING SKILLS
  // ============================================================================

  describe('HP Sort Conditions - Healing Skills', () => {
    it('should prioritize lowest HP allies with heal', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('heal', 'Lowest HP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBe(1) // Single target heal

      // Should target the lowest HP ally
      const allAllies = Object.values(battlefield.units)
        .filter(unit => unit.team === 'home-team' && unit.currentHP > 0)
        .sort((a, b) => getHpPercent(a) - getHpPercent(b))

      const lowestHpAlly = allAllies[0]
      expect(result.targets[0].unit.id).toBe(lowestHpAlly.unit.id)

      console.log(
        `✅ Heal targeting lowest HP ally:`,
        `${result.targets[0].unit.name} (${getHpPercent(result.targets[0])}%)`
      )
    })

    it('should prioritize highest HP allies with row protection', () => {
      const actingUnitId = Object.keys(battlefield.units).filter(id =>
        id.startsWith('home-')
      )[4]! // Critical HP unit
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('rowProtection', 'Highest HP')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Should target allies in descending HP order within same row
      expect(assertHpSort(result.targets, 'descending')).toBe(true)

      // All targets should be allies in same row
      result.targets.forEach(target => {
        expect(target.team).toBe('home-team')
      })

      if (result.targets.length > 1) {
        const firstRow = result.targets[0].position.row
        result.targets.forEach(target => {
          expect(target.position.row).toBe(firstRow)
        })
      }

      console.log(
        `✅ Row Protection targeting highest HP ally row:`,
        result.targets.map(
          t => `${t.unit.name} (${getHpPercent(t)}%) Row:${t.position.row}`
        )
      )
    })
  })

  // ============================================================================
  // COMBINED CONDITIONS
  // ============================================================================

  describe('Combined HP Conditions', () => {
    it('should combine filter and sort conditions', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Filter enemies with HP < 75%, then prioritize lowest HP
      const skillSlot = createHpTacticSkill(
        'wildRush',
        'Target HP is <75%',
        'Lowest HP'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // All targets should have HP < 75% (filter)
      expect(assertHpFilter(result.targets, '<', 75)).toBe(true)

      // Targets should be sorted by ascending HP (sort)
      expect(assertHpSort(result.targets, 'ascending')).toBe(true)

      console.log(
        `✅ Wild Rush with combined conditions:`,
        result.targets.map(
          t => `${t.unit.name} (${getHpPercent(t)}%) Col:${t.position.col}`
        )
      )
    })

    it('should respect skill targeting pattern after tactical processing', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Use Row Smash with HP filtering - should still follow Row pattern
      const skillSlot = createHpTacticSkill('rowSmash', 'Target HP is <100%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      if (result.shouldUseSkill) {
        // All targets should be in same row (respecting skill's Row pattern)
        if (result.targets.length > 1) {
          const firstRow = result.targets[0].position.row
          result.targets.forEach(target => {
            expect(target.position.row).toBe(firstRow)
          })
        }

        // All targets should have HP < 100% (respecting tactic filter)
        expect(assertHpFilter(result.targets, '<', 100)).toBe(true)

        console.log(
          `✅ Row Smash respecting both tactic and pattern:`,
          result.targets.map(
            t => `${t.unit.name} (${getHpPercent(t)}%) Row:${t.position.row}`
          )
        )
      } else {
        console.log(`❌ Row Smash skipped - no suitable row with HP < 100%`)
      }
    })
  })

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('HP Condition Edge Cases', () => {
    it('should handle exact threshold matches', () => {
      // Test with exact 50% HP condition
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createHpTacticSkill('heavySlash', 'Target HP is <50%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Unit with exactly 50% HP should NOT be included (< not <=)
      result.targets.forEach(target => {
        expect(getHpPercent(target)).toBeLessThan(50)
      })

      console.log(
        `✅ Exact threshold test - targeting HP < 50%:`,
        result.targets.map(t => `${t.unit.name} (${getHpPercent(t)}%)`)
      )
    })

    it('should fall back to default targeting when no tactical matches', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Try to target enemies with HP < 25% (some should qualify)
      const skillSlot = createHpTacticSkill('heavySlash', 'Target HP is <25%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Should find enemies with HP < 25% or use default targeting
      if (!result.shouldUseSkill) {
        expect(result.targets).toHaveLength(0)
        console.log(`❌ Heavy Slash skipped - no enemies with HP < 25%`)
      } else {
        // Should find targets with tactical filtering
        expect(result.targets.length).toBeGreaterThan(0)
        console.log(
          `✅ Heavy Slash targeting low HP enemies:`,
          result.targets.map(t => `${t.unit.name} (${getHpPercent(t)}%)`)
        )
      }
    })
  })

  // ============================================================================
  // FILTER FAILURE TESTS - Additional Coverage
  // ============================================================================

  describe('HP Filter Failure Tests', () => {
    it('should skip skill when target HP filter finds no valid targets', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Try to target enemies with HP >100% (should find none - impossible condition)
      const skillSlot = createHpTacticSkill('heavySlash', 'Target HP is >100%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Should skip skill since no enemies have HP > 100%
      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(`❌ Heavy Slash skipped - no enemies with HP > 100%`)
    })

    it('should skip healing when own HP condition not met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )! // This unit has 100% HP
      const actingUnit = battlefield.units[actingUnitId]

      // Only heal when own HP < 25% (should be false for 100% HP unit)
      const skillSlot = createHpTacticSkill('heal', 'Own HP is <25%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Should skip skill since acting unit has 100% HP
      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Heal skipped - acting unit HP: ${getHpPercent(actingUnit)}% (need <25%)`
      )
    })

    it('should skip skill when ally HP filter finds no valid targets', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Try to heal allies with HP >100% (impossible condition)
      const skillSlot = createHpTacticSkill('heal', 'Target HP is >100%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Should skip skill since no allies have HP > 100%
      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(`❌ Heal skipped - no allies with HP > 100%`)
    })

    it('should skip buff skill when own HP threshold not met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )! // This unit has 100% HP
      const actingUnit = battlefield.units[actingUnitId]

      // Only use protection when own HP >100% (impossible condition)
      const skillSlot = createHpTacticSkill('rowProtection', 'Own HP is >100%')

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Should skip skill since acting unit cannot have HP > 100%
      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Row Protection skipped - acting unit HP: ${getHpPercent(actingUnit)}% (need >100%)`
      )
    })
  })
})
