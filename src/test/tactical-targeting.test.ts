/**
 * Example tests demonstrating how to test individual tactics
 * This file shows how the new registry-based system makes testing much easier
 */

import { describe, it, expect } from 'vitest'

import {
  testFilterCondition,
  testSortCondition,
  testSkipCondition,
} from '@/core/tactical-targeting'
import {
  createMockBattleContext,
  createMockTacticalContext,
  createMockMetadata,
  createLowHpUnit,
  createResourceUnit,
  createTypedUnit,
  createStatusUnit,
  createUnitGroup,
  testHpPercentTactic,
  testCombatantTypeTactic,
  testStatusTactic,
  testResourceTactic,
  assertHpOrder,
  assertAllUnitsMatch,
  assertStatOrder,
} from '@/test/utils/tactical-test-utils'

describe('Tactical Targeting - Individual Tactics', () => {
  // ============================================================================
  // HP PERCENTAGE TACTICS
  // ============================================================================

  describe('HP Percentage Tactics', () => {
    it('should filter units with HP < 50%', () => {
      // Create test units with different HP percentages
      const units = createUnitGroup([
        {
          currentHP: 75,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        }, // 75%
        {
          currentHP: 25,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        }, // 25%
        {
          currentHP: 60,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        }, // 60%
        {
          currentHP: 10,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        }, // 10%
      ])

      // Test the HP filter tactic
      const result = testFilterCondition(
        'hp-percent',
        units,
        createMockMetadata({
          type: 'filter',
          valueType: 'hp-percent',
          operator: 'lt',
          threshold: 50,
        }),
        createMockTacticalContext()
      )

      // Should only return units with HP < 50% (25% and 10%)
      expect(result).toHaveLength(2)
      expect(result[0].currentHP).toBe(25)
      expect(result[1].currentHP).toBe(10)
    })

    it('should sort units by lowest HP first', () => {
      const units = createUnitGroup([
        {
          currentHP: 75,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        },
        {
          currentHP: 25,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        },
        {
          currentHP: 60,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        },
      ])

      const result = testSortCondition(
        'hp-percent',
        units,
        createMockMetadata({
          type: 'sort',
          valueType: 'hp-percent',
          statName: 'Lowest HP',
        }),
        createMockTacticalContext()
      )

      // Should be sorted in ascending order (lowest HP first)
      expect(assertHpOrder(result, 'ascending')).toBe(true)
      expect(result[0].currentHP).toBe(25)
      expect(result[1].currentHP).toBe(60)
      expect(result[2].currentHP).toBe(75)
    })

    it('should sort units by highest HP first', () => {
      const units = createUnitGroup([
        {
          currentHP: 25,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        },
        {
          currentHP: 75,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        },
        {
          currentHP: 60,
          combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        },
      ])

      const result = testSortCondition(
        'hp-percent',
        units,
        createMockMetadata({
          type: 'sort',
          valueType: 'hp-percent',
          statName: 'Highest HP',
        }),
        createMockTacticalContext()
      )

      // Should be sorted in descending order (highest HP first)
      expect(assertHpOrder(result, 'descending')).toBe(true)
      expect(result[0].currentHP).toBe(75)
      expect(result[1].currentHP).toBe(60)
      expect(result[2].currentHP).toBe(25)
    })
  })

  // ============================================================================
  // COMBATANT TYPE TACTICS
  // ============================================================================

  describe('Combatant Type Tactics', () => {
    it('should filter only Infantry units', () => {
      const units = createUnitGroup([
        { combatantTypes: ['Infantry'] },
        { combatantTypes: ['Cavalry'] },
        { combatantTypes: ['Infantry', 'Armored'] },
        { combatantTypes: ['Flying'] },
      ])

      const result = testFilterCondition(
        'combatant-type',
        units,
        createMockMetadata({
          type: 'filter',
          valueType: 'combatant-type',
          combatantType: 'Infantry',
        }),
        createMockTacticalContext()
      )

      // Should only return units with Infantry type
      expect(result).toHaveLength(2)
      expect(
        assertAllUnitsMatch(result, unit =>
          unit.combatantTypes.includes('Infantry')
        )
      ).toBe(true)
    })

    it('should prioritize Infantry units in sorting', () => {
      const units = createUnitGroup([
        {
          combatantTypes: ['Cavalry'],
          unit: {
            id: 'cavalry-1',
            name: 'Cavalry',
            classKey: 'Soldier',
            level: 1,
            growths: ['Hardy', 'Hardy'],
            equipment: [],
            skillSlots: [],
          },
        },
        {
          combatantTypes: ['Infantry'],
          unit: {
            id: 'infantry-1',
            name: 'Infantry',
            classKey: 'Soldier',
            level: 1,
            growths: ['Hardy', 'Hardy'],
            equipment: [],
            skillSlots: [],
          },
        },
        {
          combatantTypes: ['Flying'],
          unit: {
            id: 'flying-1',
            name: 'Flying',
            classKey: 'Soldier',
            level: 1,
            growths: ['Hardy', 'Hardy'],
            equipment: [],
            skillSlots: [],
          },
        },
        {
          combatantTypes: ['Infantry'],
          unit: {
            id: 'infantry-2',
            name: 'Infantry 2',
            classKey: 'Soldier',
            level: 1,
            growths: ['Hardy', 'Hardy'],
            equipment: [],
            skillSlots: [],
          },
        },
      ])

      const result = testSortCondition(
        'combatant-type',
        units,
        createMockMetadata({
          type: 'sort',
          valueType: 'combatant-type',
          combatantType: 'Infantry',
        }),
        createMockTacticalContext()
      )

      // Infantry units should come first
      expect(result[0].combatantTypes).toContain('Infantry')
      expect(result[1].combatantTypes).toContain('Infantry')
      expect(result[2].combatantTypes).not.toContain('Infantry')
      expect(result[3].combatantTypes).not.toContain('Infantry')
    })
  })

  // ============================================================================
  // STATUS TACTICS
  // ============================================================================

  describe('Status Tactics', () => {
    it('should filter only buffed units', () => {
      const units = createUnitGroup([
        {
          buffs: [
            {
              name: 'Strength Up',
              stat: 'PATK',
              value: 10,
              duration: 'indefinite',
              scaling: 'flat',
              source: 'test',
            },
          ],
        },
        { buffs: [] },
        {
          buffs: [
            {
              name: 'Defense Up',
              stat: 'PDEF',
              value: 10,
              duration: 'indefinite',
              scaling: 'flat',
              source: 'test',
            },
          ],
        },
        {
          debuffs: [
            {
              name: 'Weakness',
              stat: 'PATK',
              value: -5,
              duration: 'indefinite',
              scaling: 'flat',
              source: 'test',
            },
          ],
        },
      ])

      const result = testFilterCondition(
        'status',
        units,
        createMockMetadata({
          type: 'filter',
          valueType: 'status',
          statusName: 'Buff',
        }),
        createMockTacticalContext()
      )

      // Should only return units with buffs
      expect(result).toHaveLength(2)
      expect(assertAllUnitsMatch(result, unit => unit.buffs.length > 0)).toBe(
        true
      )
    })

    it('should filter units that are NOT debuffed', () => {
      const units = createUnitGroup([
        {
          debuffs: [
            {
              name: 'Weakness',
              stat: 'PATK',
              value: -5,
              duration: 'indefinite',
              scaling: 'flat',
              source: 'test',
            },
          ],
        },
        { debuffs: [] },
        { afflictions: [{ type: 'Poison', name: 'Poison', source: 'test' }] },
        { debuffs: [], afflictions: [] },
      ])

      const result = testFilterCondition(
        'status',
        units,
        createMockMetadata({
          type: 'filter',
          valueType: 'status',
          statusName: 'Debuff',
          negated: true,
        }),
        createMockTacticalContext()
      )

      // Should only return units without debuffs or afflictions
      expect(result).toHaveLength(2)
      expect(result[0].debuffs).toHaveLength(0)
      expect(result[0].afflictions).toHaveLength(0)
      expect(result[1].debuffs).toHaveLength(0)
      expect(result[1].afflictions).toHaveLength(0)
    })
  })

  // ============================================================================
  // RESOURCE (AP/PP) TACTICS
  // ============================================================================

  describe('Resource Tactics', () => {
    it('should filter units with 2 or more AP', () => {
      const units = createUnitGroup([
        { currentAP: 0 },
        { currentAP: 2 },
        { currentAP: 1 },
        { currentAP: 4 },
      ])

      const result = testFilterCondition(
        'ap',
        units,
        createMockMetadata({
          type: 'filter',
          valueType: 'ap',
          operator: 'gte',
          threshold: 2,
        }),
        createMockTacticalContext()
      )

      // Should only return units with 2+ AP
      expect(result).toHaveLength(2)
      expect(assertAllUnitsMatch(result, unit => unit.currentAP >= 2)).toBe(
        true
      )
    })

    it('should sort units by most AP first', () => {
      const units = createUnitGroup([
        { currentAP: 1 },
        { currentAP: 4 },
        { currentAP: 2 },
        { currentAP: 0 },
      ])

      const result = testSortCondition(
        'ap',
        units,
        createMockMetadata({
          type: 'sort',
          valueType: 'ap',
          statName: 'Most AP',
        }),
        createMockTacticalContext()
      )

      // Should be sorted by AP descending
      expect(assertStatOrder(result, 'currentAP', 'descending')).toBe(true)
      expect(result[0].currentAP).toBe(4)
      expect(result[1].currentAP).toBe(2)
      expect(result[2].currentAP).toBe(1)
      expect(result[3].currentAP).toBe(0)
    })
  })

  // ============================================================================
  // SKIP CONDITION TACTICS
  // ============================================================================

  describe('Skip Condition Tactics', () => {
    it('should skip skill when own HP is above threshold', () => {
      const context = createMockTacticalContext({
        actingUnit: createLowHpUnit(75), // 75% HP
      })

      // Test "Own HP is <50%" condition - should skip since unit has 75% HP
      const shouldSkip = testSkipCondition(
        'own-hp-percent',
        createMockMetadata({
          type: 'filter',
          valueType: 'own-hp-percent',
          operator: 'lt',
          threshold: 50,
        }),
        context
      )

      expect(shouldSkip).toBe(true)
    })

    it('should not skip skill when own HP is below threshold', () => {
      const context = createMockTacticalContext({
        actingUnit: createLowHpUnit(25), // 25% HP
      })

      // Test "Own HP is <50%" condition - should not skip since unit has 25% HP
      const shouldSkip = testSkipCondition(
        'own-hp-percent',
        createMockMetadata({
          type: 'filter',
          valueType: 'own-hp-percent',
          operator: 'lt',
          threshold: 50,
        }),
        context
      )

      expect(shouldSkip).toBe(false)
    })

    it('should skip skill when own AP is insufficient', () => {
      const context = createMockTacticalContext({
        actingUnit: createResourceUnit(1, 0), // 1 AP, 0 PP
      })

      // Test "Own AP is 2 or More" condition - should skip since unit has only 1 AP
      const shouldSkip = testSkipCondition(
        'own-ap',
        createMockMetadata({
          type: 'filter',
          valueType: 'own-ap',
          operator: 'gte',
          threshold: 2,
        }),
        context
      )

      expect(shouldSkip).toBe(true)
    })
  })

  // ============================================================================
  // FORMATION TACTICS
  // ============================================================================

  describe('Formation Tactics', () => {
    it('should filter only front row units', () => {
      const units = createUnitGroup([
        { position: { row: 0, col: 0 } }, // Back row
        { position: { row: 1, col: 0 } }, // Front row
        { position: { row: 0, col: 1 } }, // Back row
        { position: { row: 1, col: 2 } }, // Front row
      ])

      const result = testFilterCondition(
        'formation',
        units,
        createMockMetadata({
          type: 'filter',
          valueType: 'formation',
          formationType: 'front-row',
        }),
        createMockTacticalContext()
      )

      // Should only return front row units (row === 1)
      expect(result).toHaveLength(2)
      expect(assertAllUnitsMatch(result, unit => unit.position.row === 1)).toBe(
        true
      )
    })

    it('should prioritize front row units in sorting', () => {
      const units = createUnitGroup([
        { position: { row: 0, col: 0 } }, // Back row
        { position: { row: 1, col: 0 } }, // Front row
        { position: { row: 0, col: 1 } }, // Back row
        { position: { row: 1, col: 2 } }, // Front row
      ])

      const result = testSortCondition(
        'formation',
        units,
        createMockMetadata({
          type: 'sort',
          valueType: 'formation',
          formationType: 'front-row',
        }),
        createMockTacticalContext()
      )

      // Front row units should come first
      expect(result[0].position.row).toBe(1)
      expect(result[1].position.row).toBe(1)
      expect(result[2].position.row).toBe(0)
      expect(result[3].position.row).toBe(0)
    })
  })

  // ============================================================================
  // QUICK TEST HELPER EXAMPLES
  // ============================================================================

  describe('Quick Test Helpers', () => {
    it('should use HP percent quick test helper', () => {
      const units = [
        createLowHpUnit(25),
        createLowHpUnit(75),
        createLowHpUnit(10),
      ]

      const { metadata, context } = testHpPercentTactic(
        'filter',
        'lt',
        50,
        units
      )

      const result = testFilterCondition('hp-percent', units, metadata, context)

      expect(result).toHaveLength(2) // 25% and 10% units
    })

    it('should use combatant type quick test helper', () => {
      const units = [
        createTypedUnit(['Infantry']),
        createTypedUnit(['Cavalry']),
        createTypedUnit(['Infantry', 'Armored']),
      ]

      const { metadata, context } = testCombatantTypeTactic(
        'filter',
        'Infantry',
        units
      )

      const result = testFilterCondition(
        'combatant-type',
        units,
        metadata,
        context
      )

      expect(result).toHaveLength(2) // Both Infantry units
    })

    it('should use status quick test helper', () => {
      const units = [
        createStatusUnit([
          {
            name: 'Buff',
            stat: 'PATK',
            value: 10,
            duration: 'indefinite',
            scaling: 'flat',
            source: 'test',
          },
        ]),
        createStatusUnit(),
        createStatusUnit([
          {
            name: 'Another Buff',
            stat: 'PDEF',
            value: 5,
            duration: 'indefinite',
            scaling: 'flat',
            source: 'test',
          },
        ]),
      ]

      const { metadata, context } = testStatusTactic(
        'filter',
        'Buff',
        false,
        units
      )

      const result = testFilterCondition('status', units, metadata, context)

      expect(result).toHaveLength(2) // Both buffed units
    })

    it('should use resource quick test helper', () => {
      const units = [
        createResourceUnit(0, 1),
        createResourceUnit(2, 1),
        createResourceUnit(4, 2),
        createResourceUnit(1, 0),
      ]

      const { metadata, context } = testResourceTactic(
        'filter',
        'ap',
        'gte',
        2,
        units
      )

      const result = testFilterCondition('ap', units, metadata, context)

      expect(result).toHaveLength(2) // Units with 2+ AP
    })
  })
})

describe('Tactical Targeting - Integration Tests', () => {
  it('should demonstrate testing a complex tactic combination', () => {
    // This shows how you could test more complex scenarios
    // combining multiple tactic evaluations

    const lowHpInfantry = createUnitGroup([
      {
        currentHP: 25,
        combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        combatantTypes: ['Infantry'],
      },
      {
        currentHP: 75,
        combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        combatantTypes: ['Cavalry'],
      },
      {
        currentHP: 30,
        combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
        combatantTypes: ['Infantry'],
      },
    ])

    const context = createMockTacticalContext()

    // First apply Infantry filter
    const infantryFiltered = testFilterCondition(
      'combatant-type',
      lowHpInfantry,
      createMockMetadata({
        type: 'filter',
        valueType: 'combatant-type',
        combatantType: 'Infantry',
      }),
      context
    )

    // Then apply HP sort to the filtered results
    const sorted = testSortCondition(
      'hp-percent',
      infantryFiltered,
      createMockMetadata({
        type: 'sort',
        valueType: 'hp-percent',
        statName: 'Lowest HP',
      }),
      context
    )

    // Should have 2 Infantry units, sorted by lowest HP first
    expect(sorted).toHaveLength(2)
    expect(sorted[0].currentHP).toBe(25) // Lowest HP Infantry
    expect(sorted[1].currentHP).toBe(30) // Higher HP Infantry
    expect(
      assertAllUnitsMatch(sorted, unit =>
        unit.combatantTypes.includes('Infantry')
      )
    ).toBe(true)
  })
})
