/**
 * Enemy Presence Condition Testing with Real Skills and Battle Data
 *
 * This test suite validates enemy presence-based tactical conditions using actual skills
 * from the game data and realistic battle contexts. Tests both presence and absence
 * conditions against different combatant type compositions.
 */

import { describe, it, expect, beforeEach } from 'vitest'

import {
  createAllBattleContexts,
  createInitialBattlefieldState,
} from '@/core/battle/engine/battlefield-state'
import { evaluateSkillSlotTactics } from '@/core/battle/targeting/tactical-targeting'
import { rng } from '@/core/random'
import type { BattlefieldState, BattleContext } from '@/types/battle-engine'
import type { CombatantType } from '@/types/core'
import type { SkillSlot } from '@/types/skills'
import type { Team } from '@/types/team'

// ============================================================================
// TEST DATA SETUP
// ============================================================================

/**
 * Create a test team with varied combatant types for enemy presence testing
 */
const createMixedCombatantTeam = (teamName: string): Team => ({
  id: `${teamName.toLowerCase()}-team`,
  name: `${teamName} Team`,
  formation: [
    {
      id: `${teamName.toLowerCase()}-unit-1`,
      name: `${teamName} Infantry`,
      classKey: 'Soldier', // Infantry type
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 0 }, // Front row, left
    },
    {
      id: `${teamName.toLowerCase()}-unit-2`,
      name: `${teamName} Cavalry`,
      classKey: 'Knight', // Cavalry type
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 1 }, // Front row, center
    },
    {
      id: `${teamName.toLowerCase()}-unit-3`,
      name: `${teamName} Archer`,
      classKey: 'Hunter', // Archer type
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 0, col: 0 }, // Back row, left
    },
    {
      id: `${teamName.toLowerCase()}-unit-4`,
      name: `${teamName} Caster`,
      classKey: 'Wizard', // Caster type
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 0, col: 1 }, // Back row, center
    },
    null, // Empty slot
    null, // Empty slot
  ],
})

/**
 * Create a team with only Infantry units (no other types)
 */
const createInfantryOnlyTeam = (teamName: string): Team => ({
  id: `${teamName.toLowerCase()}-team`,
  name: `${teamName} Infantry Team`,
  formation: [
    {
      id: `${teamName.toLowerCase()}-unit-1`,
      name: `${teamName} Infantry 1`,
      classKey: 'Soldier', // Infantry type
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 0 },
    },
    {
      id: `${teamName.toLowerCase()}-unit-2`,
      name: `${teamName} Infantry 2`,
      classKey: 'Soldier', // Infantry type
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 1 },
    },
    null,
    null,
    null,
    null,
  ],
})

/**
 * Create a team with Flying combatant types (for testing Flying presence)
 */
const createFlyingTeam = (teamName: string): Team => ({
  id: `${teamName.toLowerCase()}-team`,
  name: `${teamName} Flying Team`,
  formation: [
    {
      id: `${teamName.toLowerCase()}-unit-1`,
      name: `${teamName} Wyvern Knight`,
      classKey: 'Wyvern Knight', // Flying type
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 0 },
    },
    {
      id: `${teamName.toLowerCase()}-unit-2`,
      name: `${teamName} Gryphon Knight`,
      classKey: 'Gryphon Knight', // Flying type
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 1 },
    },
    null,
    null,
    null,
    null,
  ],
})

/**
 * Create a skill slot with enemy presence-based tactical conditions
 */
const createEnemyPresenceTacticSkill = (
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
        category: 'Enemies Present',
        key: tactic1Condition,
      },
    },
    tactic2Condition
      ? {
          kind: 'conditional',
          condition: {
            category: 'Enemies Present',
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
 * Get combatant types for a battle context (for debugging)
 */
const getCombatantTypes = (unit: BattleContext): string[] => {
  return unit.combatantTypes || []
}

/**
 * Count enemies of specific combatant type
 */
const countEnemiesWithType = (
  enemies: BattleContext[],
  combatantType: string
): number => {
  return enemies.filter(enemy =>
    enemy.combatantTypes.includes(combatantType as CombatantType)
  ).length
}

// ============================================================================
// MAIN TEST SUITE
// ============================================================================

describe('Enemy Presence Condition Tactical Testing', () => {
  let battlefield: BattlefieldState
  let homeTeam: Team
  let awayTeam: Team

  // ============================================================================
  // MIXED COMBATANT TYPE TESTS
  // ============================================================================

  describe('Mixed Combatant Type Battlefield', () => {
    beforeEach(() => {
      // Create teams with varied combatant types
      homeTeam = createMixedCombatantTeam('Home')
      awayTeam = createMixedCombatantTeam('Away')

      // Set up battlefield with mixed types
      const allContexts = createAllBattleContexts(homeTeam, awayTeam)
      const turnOrder = Object.keys(allContexts)
      const testRng = rng('enemy-presence-test-seed')

      battlefield = createInitialBattlefieldState(
        allContexts,
        turnOrder,
        testRng
      )

      // Log enemy presence setup for debugging
      console.log('🎯 Enemy Presence Test Setup (Mixed Types):')
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      enemies.forEach(enemy => {
        console.log(
          `  ${enemy.unit.name}: Types [${getCombatantTypes(enemy).join(', ')}]`
        )
      })
    })

    it('should use skill when Infantry Enemies Present condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'heavySlash',
        'Infantry Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Verify Infantry enemies exist
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      const infantryCount = countEnemiesWithType(enemies, 'Infantry')
      expect(infantryCount).toBeGreaterThan(0)

      console.log(
        `✅ Heavy Slash used - Infantry enemies found: ${infantryCount}`
      )
    })

    it('should use skill when Cavalry Enemies Present condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'shadowbite',
        'Cavalry Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Verify Cavalry enemies exist
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      const cavalryCount = countEnemiesWithType(enemies, 'Cavalry')
      expect(cavalryCount).toBeGreaterThan(0)

      console.log(`✅ Shadowbite used - Cavalry enemies found: ${cavalryCount}`)
    })

    it('should use skill when Archer Enemies Present condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'bastardsCross',
        'Archer Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Verify Archer enemies exist
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      const archerCount = countEnemiesWithType(enemies, 'Archer')
      expect(archerCount).toBeGreaterThan(0)

      console.log(
        `✅ Bastard's Cross used - Archer enemies found: ${archerCount}`
      )
    })

    it('should use skill when Caster Enemies Present condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'sting',
        'Caster Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Verify Caster enemies exist
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      const casterCount = countEnemiesWithType(enemies, 'Caster')
      expect(casterCount).toBeGreaterThan(0)

      console.log(`✅ Sting used - Caster enemies found: ${casterCount}`)
    })

    it('should use skill when No Flying Enemies condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      // Our mixed team has Infantry, Cavalry, Archer, Caster but no Flying units
      const skillSlot = createEnemyPresenceTacticSkill(
        'heal',
        'No Flying Enemies'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Should pass since our mixed team doesn't include Flying units
      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Verify no Flying enemies exist
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      const flyingCount = countEnemiesWithType(enemies, 'Flying')
      expect(flyingCount).toBe(0)

      console.log(`✅ Heal used - No Flying enemies found`)
    })
  })

  // ============================================================================
  // INFANTRY ONLY TESTS
  // ============================================================================

  describe('Infantry Only Battlefield', () => {
    beforeEach(() => {
      // Create teams with only Infantry units
      homeTeam = createInfantryOnlyTeam('Home')
      awayTeam = createInfantryOnlyTeam('Away')

      const allContexts = createAllBattleContexts(homeTeam, awayTeam)
      const turnOrder = Object.keys(allContexts)
      const testRng = rng('infantry-only-test-seed')

      battlefield = createInitialBattlefieldState(
        allContexts,
        turnOrder,
        testRng
      )

      // Log enemy composition
      console.log('🎯 Enemy Presence Test Setup (Infantry Only):')
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      enemies.forEach(enemy => {
        console.log(
          `  ${enemy.unit.name}: Types [${getCombatantTypes(enemy).join(', ')}]`
        )
      })
    })

    it('should use skill when Infantry Enemies Present condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'heavySlash',
        'Infantry Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      console.log(`✅ Heavy Slash used - Infantry only battlefield`)
    })

    it('should use skill when No Cavalry Enemies condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'heal',
        'No Cavalry Enemies'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Verify no Cavalry enemies exist
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      const cavalryCount = countEnemiesWithType(enemies, 'Cavalry')
      expect(cavalryCount).toBe(0)

      console.log(`✅ Heal used - No Cavalry enemies confirmed`)
    })

    it('should use skill when No Flying Enemies condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'rowProtection',
        'No Flying Enemies'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      console.log(
        `✅ Row Protection used - No Flying enemies in Infantry-only battlefield`
      )
    })

    it('should skip skill when Cavalry Enemies Present condition fails', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'shadowbite',
        'Cavalry Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Shadowbite skipped - No Cavalry enemies in Infantry-only battlefield`
      )
    })

    it('should skip skill when Archer Enemies Present condition fails', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'bastardsCross',
        'Archer Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Bastard's Cross skipped - No Archer enemies in Infantry-only battlefield`
      )
    })
  })

  // ============================================================================
  // FLYING TYPES TESTS
  // ============================================================================

  describe('Flying Types Battlefield', () => {
    beforeEach(() => {
      // Create teams with Flying units
      homeTeam = createInfantryOnlyTeam('Home') // Home has Infantry only
      awayTeam = createFlyingTeam('Away') // Away has Flying units

      const allContexts = createAllBattleContexts(homeTeam, awayTeam)
      const turnOrder = Object.keys(allContexts)
      const testRng = rng('flying-test-seed')

      battlefield = createInitialBattlefieldState(
        allContexts,
        turnOrder,
        testRng
      )

      // Log enemy composition
      console.log('🎯 Enemy Presence Test Setup (Flying Types):')
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      enemies.forEach(enemy => {
        console.log(
          `  ${enemy.unit.name}: Types [${getCombatantTypes(enemy).join(', ')}]`
        )
      })
    })

    it('should use skill when Flying Enemies Present condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'shadowbite',
        'Flying Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Verify Flying enemies exist
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      const flyingCount = countEnemiesWithType(enemies, 'Flying')
      expect(flyingCount).toBeGreaterThan(0)

      console.log(`✅ Shadowbite used - Flying enemies found: ${flyingCount}`)
    })

    it('should use skill when No Infantry Enemies condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'heal',
        'No Infantry Enemies'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      // Verify no Infantry enemies exist
      const enemies = Object.values(battlefield.units).filter(
        unit => unit.team === 'away-team'
      )
      const infantryCount = countEnemiesWithType(enemies, 'Infantry')
      expect(infantryCount).toBe(0)

      console.log(`✅ Heal used - No Infantry enemies in Flying battlefield`)
    })

    it('should use skill when No Cavalry Enemies condition is met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'rowProtection',
        'No Cavalry Enemies'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      console.log(
        `✅ Row Protection used - No Cavalry enemies in Flying battlefield`
      )
    })

    it('should skip skill when Infantry Enemies Present condition fails', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'heavySlash',
        'Infantry Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(
        `❌ Heavy Slash skipped - No Infantry enemies in Flying battlefield`
      )
    })

    it('should skip skill when No Flying Enemies condition fails (Flying enemies present)', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'sting',
        'No Flying Enemies'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      expect(result.shouldUseSkill).toBe(false)
      expect(result.targets).toHaveLength(0)

      console.log(`❌ Sting skipped - Flying enemies are present`)
    })
  })

  // ============================================================================
  // COMBINED CONDITIONS TESTS
  // ============================================================================

  describe('Combined Enemy Presence Conditions', () => {
    beforeEach(() => {
      // Use mixed types for combined condition testing
      homeTeam = createMixedCombatantTeam('Home')
      awayTeam = createMixedCombatantTeam('Away')

      const allContexts = createAllBattleContexts(homeTeam, awayTeam)
      const turnOrder = Object.keys(allContexts)
      const testRng = rng('combined-test-seed')

      battlefield = createInitialBattlefieldState(
        allContexts,
        turnOrder,
        testRng
      )
    })

    it('should use skill when both Infantry and Cavalry Present conditions are met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'wildRush',
        'Infantry Enemies Present',
        'Cavalry Enemies Present'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Both Infantry and Cavalry should be present in mixed team
      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      console.log(
        `✅ Wild Rush used - Both Infantry and Cavalry enemies present`
      )
    })

    it('should use skill when Infantry Present and No Flying conditions are both met', () => {
      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'longThrust',
        'Infantry Enemies Present',
        'No Flying Enemies'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        battlefield
      )

      // Infantry should be present, Flying should be absent in our test setup
      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0)

      console.log(
        `✅ Long Thrust used - Infantry present and no Flying enemies`
      )
    })
  })

  // ============================================================================
  // EDGE CASES AND COMPREHENSIVE COVERAGE
  // ============================================================================

  describe('Enemy Presence Edge Cases', () => {
    beforeEach(() => {
      homeTeam = createMixedCombatantTeam('Home')
      awayTeam = createMixedCombatantTeam('Away')

      const allContexts = createAllBattleContexts(homeTeam, awayTeam)
      const turnOrder = Object.keys(allContexts)
      const testRng = rng('edge-cases-test-seed')

      battlefield = createInitialBattlefieldState(
        allContexts,
        turnOrder,
        testRng
      )
    })

    it('should validate all enemy presence condition keys work correctly', () => {
      // Test that our condition system recognizes enemy presence conditions
      const testConditions = [
        'Infantry Enemies Present',
        'Cavalry Enemies Present',
        'Archer Enemies Present',
        'Caster Enemies Present',
        'No Flying Enemies',
        'No Armored Enemies',
        'No Scout Enemies',
      ]

      const actingUnitId = Object.keys(battlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = battlefield.units[actingUnitId]

      testConditions.forEach(condition => {
        const skillSlot = createEnemyPresenceTacticSkill('heal', condition)

        const result = evaluateSkillSlotTactics(
          skillSlot,
          actingUnit,
          battlefield
        )

        // Result should be deterministic based on enemy composition
        // We're mainly testing that the condition is processed without errors
        expect(typeof result.shouldUseSkill).toBe('boolean')
        expect(Array.isArray(result.targets)).toBe(true)

        console.log(
          `🔍 Condition "${condition}" processed: ${result.shouldUseSkill ? 'PASS' : 'FAIL'}`
        )
      })
    })

    it('should handle battlefield with no enemies gracefully', () => {
      // Create battlefield with no away team
      const emptyAwayTeam = createFlyingTeam('Away')
      // Remove all units from away team
      emptyAwayTeam.formation = [null, null, null, null, null, null]

      const allContexts = createAllBattleContexts(homeTeam, emptyAwayTeam)
      const turnOrder = Object.keys(allContexts)
      const testRng = rng('no-enemies-test-seed')

      const noEnemiesBattlefield = createInitialBattlefieldState(
        allContexts,
        turnOrder,
        testRng
      )

      const actingUnitId = Object.keys(noEnemiesBattlefield.units).find(id =>
        id.startsWith('home-')
      )!
      const actingUnit = noEnemiesBattlefield.units[actingUnitId]

      const skillSlot = createEnemyPresenceTacticSkill(
        'heal',
        'No Infantry Enemies'
      )

      const result = evaluateSkillSlotTactics(
        skillSlot,
        actingUnit,
        noEnemiesBattlefield
      )

      // Should succeed since there are indeed no Infantry enemies
      expect(result.shouldUseSkill).toBe(true)

      console.log(`✅ Condition handled gracefully with no enemies present`)
    })
  })
})
