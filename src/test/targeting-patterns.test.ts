import { describe, it, expect } from 'vitest'

import {
  createMockTacticalContext,
  createUnitGroup,
} from './utils/tactical-test-utils'
import { createMockMetadata } from './utils/tactical-test-utils'

import { getDefaultTargets } from '@/core/battle/targeting/skill-targeting'
import {
  evaluateSkillSlotTactics,
  testFilterCondition,
  testSortCondition,
} from '@/core/battle/targeting/tactical-targeting'
import type { SkillSlot } from '@/types/skills'
import type { TacticalCondition } from '@/types/tactics'

describe('Targeting Patterns: Conditions vs Default', () => {
  describe('Conditional Tactics vs Default Targeting', () => {
    it('should use tactical targeting when conditions are met', () => {
      const context = createMockTacticalContext({
        allEnemies: createUnitGroup([
          {
            currentHP: 75,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
          }, // 75%
          {
            currentHP: 25,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
          }, // 25%
        ]),
      })

      const lowHpTargets = testFilterCondition(
        'hp-percent',
        context.allEnemies,
        createMockMetadata({
          type: 'filter',
          valueType: 'hp-percent',
          operator: 'lt',
          threshold: 50,
        }),
        context
      )

      expect(lowHpTargets).toHaveLength(1)
      expect(lowHpTargets[0].currentHP).toBe(25)
    })

    it('should skip skill when tactical filtering leaves no valid targets', () => {
      const context = createMockTacticalContext({
        allEnemies: createUnitGroup([
          { currentHP: 75 }, // No low HP targets
          { currentHP: 80 },
        ]),
      })

      // Tactical filtering with strict condition returns empty
      const lowHpTargets = testFilterCondition(
        'hp-percent',
        context.allEnemies,
        createMockMetadata({
          type: 'filter',
          valueType: 'hp-percent',
          operator: 'lt',
          threshold: 50,
        }),
        context
      )

      expect(lowHpTargets).toHaveLength(0) // No targets pass tactical filter

      // Default targeting with empty tactical results would return empty (skill should be skipped)
      const defaultTargets = getDefaultTargets(
        context.skill,
        context.actingUnit,
        context.battlefield,
        lowHpTargets
      )
      expect(defaultTargets).toHaveLength(0) // No pre-filtered targets = no final targets
    })
  })

  describe('Sort Tactics with Ties', () => {
    it('should handle true ties in HP sorting', () => {
      const context = createMockTacticalContext({
        allEnemies: createUnitGroup([
          {
            currentHP: 50,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
          }, // 50%
          {
            currentHP: 50,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
          }, // 50% - tie
          {
            currentHP: 75,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
          }, // 75%
        ]),
      })

      const sortedTargets = testSortCondition(
        'hp-percent',
        context.allEnemies,
        createMockMetadata({
          type: 'sort',
          valueType: 'hp-percent',
          conditionKey: 'LowestHP',
        }),
        context
      )

      // First two should be tied at 50%
      expect(sortedTargets[0].currentHP).toBe(50)
      expect(sortedTargets[1].currentHP).toBe(50)
      expect(sortedTargets[2].currentHP).toBe(75)
    })

    it('should prioritize formation tactics over ties', () => {
      const context = createMockTacticalContext({
        allEnemies: createUnitGroup([
          { position: { row: 0, col: 0 } }, // Back row
          { position: { row: 1, col: 0 } }, // Front row
        ]),
      })

      const sortedTargets = testSortCondition(
        'formation',
        context.allEnemies,
        createMockMetadata({
          type: 'sort',
          valueType: 'formation',
          formationType: 'front-row',
        }),
        context
      )

      expect(sortedTargets[0].position.row).toBe(1) // Front row first
      expect(sortedTargets[1].position.row).toBe(0) // Back row second
    })
  })

  describe('Skill Slot Integration', () => {
    it('should skip skill when tactic conditions fail', () => {
      const context = createMockTacticalContext({
        actingUnit: {
          ...createMockTacticalContext().actingUnit,
          currentHP: 80, // High HP
          combatStats: {
            ...createMockTacticalContext().actingUnit.combatStats,
            HP: 100,
          },
        },
      })

      const tactic: TacticalCondition = {
        key: 'Own HP is <50%',
        category: 'HP',
      }

      const skillSlot: SkillSlot = {
        skillId: 'heavySlash',
        skillType: 'active',
        tactics: [tactic, null],
        order: 1,
        id: 'test-slot',
      }

      const result = evaluateSkillSlotTactics(
        skillSlot,
        context.actingUnit,
        context.battlefield
      )

      expect(result.shouldUseSkill).toBe(false) // Should skip due to HP condition
      expect(result.targets).toHaveLength(0)
    })

    it('should use default targeting when no tactics specified', () => {
      const baseContext = createMockTacticalContext()
      const context = createMockTacticalContext({
        battlefield: {
          ...baseContext.battlefield,
          units: {
            'home-test-unit': baseContext.actingUnit,
            'away-enemy-1': baseContext.allEnemies[0],
          },
        },
      })

      const skillSlot: SkillSlot = {
        skillId: 'heavySlash',
        skillType: 'active',
        tactics: [null, null], // No tactics
        order: 1,
        id: 'test-slot',
      }

      const result = evaluateSkillSlotTactics(
        skillSlot,
        context.actingUnit,
        context.battlefield
      )

      expect(result.shouldUseSkill).toBe(true)
      expect(result.targets.length).toBeGreaterThan(0) // Uses default targeting
    })
  })

  describe('Multi-Tactic Interaction', () => {
    it('should apply tactics in sequence', () => {
      const context = createMockTacticalContext({
        allEnemies: createUnitGroup([
          {
            currentHP: 25,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
            combatantTypes: ['Infantry'],
          }, // 25% HP Infantry
          {
            currentHP: 30,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
            combatantTypes: ['Cavalry'],
          }, // 30% HP Cavalry
          {
            currentHP: 80,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
            combatantTypes: ['Infantry'],
          }, // 80% HP Infantry
        ]),
      })

      // First filter by low HP
      const lowHpTargets = testFilterCondition(
        'hp-percent',
        context.allEnemies,
        createMockMetadata({
          type: 'filter',
          valueType: 'hp-percent',
          operator: 'lt',
          threshold: 50,
        }),
        context
      )

      expect(lowHpTargets).toHaveLength(2) // Two low HP units

      // Then filter by Infantry type
      const infantryTargets = testFilterCondition(
        'combatant-type',
        lowHpTargets,
        createMockMetadata({
          type: 'filter',
          valueType: 'combatant-type',
          combatantType: 'Infantry',
        }),
        context
      )

      expect(infantryTargets).toHaveLength(1) // Only the 25% HP Infantry unit
      expect(infantryTargets[0].currentHP).toBe(25)
      expect(infantryTargets[0].combatantTypes).toContain('Infantry')
    })
  })
})
