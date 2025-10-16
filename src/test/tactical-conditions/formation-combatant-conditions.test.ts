import { describe, it, expect } from 'vitest'

import {
  FILTER_EVALUATORS,
  SORT_EVALUATORS,
} from '@/core/battle/evaluation/tactical-evaluators'
import { COMPLETE_TACTIC_METADATA } from '@/data/tactics/tactic-condition-meta'
import {
  createMockBattleContext,
  createMockTacticalContext,
} from '@/test/utils/test-factories'

describe('Formation and Combatant Type Tactical Conditions', () => {
  // Test Formation Conditions
  describe('Formation Filter Conditions', () => {
    it('should filter Front Row targets correctly', () => {
      const frontRowUnit = createMockBattleContext({
        unit: { name: 'Front Unit' },
        team: 'home-team',
        position: { row: 1, col: 0 },
      })
      const backRowUnit = createMockBattleContext({
        unit: { name: 'Back Unit' },
        team: 'home-team',
        position: { row: 0, col: 0 },
      })

      const targets = [frontRowUnit, backRowUnit]
      const metadata = COMPLETE_TACTIC_METADATA['Front Row']
      const context = createMockTacticalContext({
        actingUnit: frontRowUnit,
        allAllies: [frontRowUnit, backRowUnit],
        allEnemies: [],
      })

      const filtered = FILTER_EVALUATORS.formation(targets, metadata, context)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].unit.name).toBe('Front Unit')
      expect(filtered[0].position.row).toBe(1)
    })

    it('should filter Back Row targets correctly', () => {
      const frontRowUnit = createMockBattleContext({
        unit: { name: 'Front Unit' },
        team: 'home-team',
        position: { row: 1, col: 0 },
      })
      const backRowUnit = createMockBattleContext({
        unit: { name: 'Back Unit' },
        team: 'home-team',
        position: { row: 0, col: 0 },
      })

      const targets = [frontRowUnit, backRowUnit]
      const metadata = COMPLETE_TACTIC_METADATA['Back Row']
      const context = createMockTacticalContext({
        actingUnit: frontRowUnit,
        allAllies: [frontRowUnit, backRowUnit],
        allEnemies: [],
      })

      const filtered = FILTER_EVALUATORS.formation(targets, metadata, context)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].unit.name).toBe('Back Unit')
      expect(filtered[0].position.row).toBe(0)
    })

    it('should filter Full Column targets correctly', () => {
      // Create a 2x3 formation with column 0 and 1 having full columns
      const col0Row0 = createMockBattleContext({
        unit: { name: 'Col0Row0' },
        team: 'away-team',
        position: { row: 0, col: 0 },
      })
      const col0Row1 = createMockBattleContext({
        unit: { name: 'Col0Row1' },
        team: 'away-team',
        position: { row: 1, col: 0 },
      })
      const col1Row0 = createMockBattleContext({
        unit: { name: 'Col1Row0' },
        team: 'away-team',
        position: { row: 0, col: 1 },
      })
      const col2Row0 = createMockBattleContext({
        unit: { name: 'Col2Row0' },
        team: 'away-team',
        position: { row: 0, col: 2 },
      })

      const targets = [col0Row0, col0Row1, col1Row0, col2Row0]
      const metadata = COMPLETE_TACTIC_METADATA['Full Column']
      const context = createMockTacticalContext({
        actingUnit: col0Row0,
        allAllies: [],
        allEnemies: targets,
      })

      const filtered = FILTER_EVALUATORS.formation(targets, metadata, context)

      // Should only include units from columns that have 2+ units (full columns)
      expect(filtered).toHaveLength(2)
      expect(filtered.map(u => u.unit.name)).toEqual(['Col0Row0', 'Col0Row1'])
    })

    it('should filter Row with 2+ Combatants correctly', () => {
      const row0Unit1 = createMockBattleContext({
        unit: { name: 'Row0Unit1' },
        team: 'away-team',
        position: { row: 0, col: 0 },
      })
      const row0Unit2 = createMockBattleContext({
        unit: { name: 'Row0Unit2' },
        team: 'away-team',
        position: { row: 0, col: 1 },
      })
      const row1Unit1 = createMockBattleContext({
        unit: { name: 'Row1Unit1' },
        team: 'away-team',
        position: { row: 1, col: 0 },
      })

      const targets = [row0Unit1, row0Unit2, row1Unit1]
      const metadata = COMPLETE_TACTIC_METADATA['Row with 2+ Combatants']
      const context = createMockTacticalContext({
        actingUnit: row0Unit1,
        allAllies: [],
        allEnemies: targets,
      })

      const filtered = FILTER_EVALUATORS.formation(targets, metadata, context)

      expect(filtered).toHaveLength(2)
      expect(filtered.map(u => u.unit.name)).toEqual(['Row0Unit1', 'Row0Unit2'])
    })
  })

  describe('Formation Sort Conditions', () => {
    it('should sort Prioritize Front Row correctly', () => {
      const frontRowUnit = createMockBattleContext({
        unit: { name: 'Front Unit' },
        team: 'away-team',
        position: { row: 1, col: 0 },
      })
      const backRowUnit = createMockBattleContext({
        unit: { name: 'Back Unit' },
        team: 'away-team',
        position: { row: 0, col: 0 },
      })

      const targets = [backRowUnit, frontRowUnit] // Back row first initially
      const metadata = COMPLETE_TACTIC_METADATA['Prioritize Front Row']
      const context = createMockTacticalContext({
        actingUnit: frontRowUnit,
        allAllies: [],
        allEnemies: targets,
      })

      const sorted = SORT_EVALUATORS.formation(targets, metadata, context)

      expect(sorted[0].unit.name).toBe('Front Unit')
      expect(sorted[0].position.row).toBe(1)
      expect(sorted[1].unit.name).toBe('Back Unit')
      expect(sorted[1].position.row).toBe(0)
    })

    it('should sort Row with Most Combatants correctly', () => {
      // Row 0: 3 units, Row 1: 1 unit
      const row0Unit1 = createMockBattleContext({
        unit: { name: 'Row0Unit1' },
        team: 'away-team',
        position: { row: 0, col: 0 },
      })
      const row0Unit2 = createMockBattleContext({
        unit: { name: 'Row0Unit2' },
        team: 'away-team',
        position: { row: 0, col: 1 },
      })
      const row0Unit3 = createMockBattleContext({
        unit: { name: 'Row0Unit3' },
        team: 'away-team',
        position: { row: 0, col: 2 },
      })
      const row1Unit1 = createMockBattleContext({
        unit: { name: 'Row1Unit1' },
        team: 'away-team',
        position: { row: 1, col: 0 },
      })

      const targets = [row1Unit1, row0Unit1, row0Unit2, row0Unit3]
      const metadata = COMPLETE_TACTIC_METADATA['Row with Most Combatants']
      const context = createMockTacticalContext({
        actingUnit: row0Unit1,
        allAllies: [],
        allEnemies: targets,
      })

      const filtered = FILTER_EVALUATORS.formation(targets, metadata, context)

      // Should only include row 0 units (the row with most combatants)
      expect(filtered).toHaveLength(3)
      expect(filtered.map(u => u.unit.name)).toEqual([
        'Row0Unit1',
        'Row0Unit2',
        'Row0Unit3',
      ])
    })
  })

  // Test Combatant Type Conditions
  describe('Combatant Type Filter Conditions', () => {
    it('should filter Infantry units correctly', () => {
      const infantryUnit = createMockBattleContext({
        unit: { name: 'Infantry Unit' },
        team: 'away-team',
        combatantTypes: ['Infantry'],
      })
      const cavalryUnit = createMockBattleContext({
        unit: { name: 'Cavalry Unit' },
        team: 'away-team',
        combatantTypes: ['Cavalry'],
      })
      const mixedUnit = createMockBattleContext({
        unit: { name: 'Mixed Unit' },
        team: 'away-team',
        combatantTypes: ['Infantry', 'Archer'],
      })

      const targets = [infantryUnit, cavalryUnit, mixedUnit]
      const metadata = COMPLETE_TACTIC_METADATA['Infantry']
      const context = createMockTacticalContext({
        actingUnit: infantryUnit,
        allAllies: [],
        allEnemies: targets,
      })

      const filtered = FILTER_EVALUATORS['combatant-type'](
        targets,
        metadata,
        context
      )

      expect(filtered).toHaveLength(2)
      expect(filtered.map(u => u.unit.name)).toEqual([
        'Infantry Unit',
        'Mixed Unit',
      ])
    })

    it('should filter Flying units correctly', () => {
      const flyingUnit = createMockBattleContext({
        unit: { name: 'Flying Unit' },
        team: 'away-team',
        combatantTypes: ['Flying'],
      })
      const groundUnit = createMockBattleContext({
        unit: { name: 'Ground Unit' },
        team: 'away-team',
        combatantTypes: ['Infantry'],
      })

      const targets = [flyingUnit, groundUnit]
      const metadata = COMPLETE_TACTIC_METADATA['Flying']
      const context = createMockTacticalContext({
        actingUnit: flyingUnit,
        allAllies: [],
        allEnemies: targets,
      })

      const filtered = FILTER_EVALUATORS['combatant-type'](
        targets,
        metadata,
        context
      )

      expect(filtered).toHaveLength(1)
      expect(filtered[0].unit.name).toBe('Flying Unit')
    })
  })

  describe('Combatant Type Sort Conditions', () => {
    it('should sort Prioritize Infantry correctly', () => {
      const infantryUnit = createMockBattleContext({
        unit: { name: 'Infantry Unit' },
        team: 'away-team',
        combatantTypes: ['Infantry'],
      })
      const cavalryUnit = createMockBattleContext({
        unit: { name: 'Cavalry Unit' },
        team: 'away-team',
        combatantTypes: ['Cavalry'],
      })
      const mixedUnit = createMockBattleContext({
        unit: { name: 'Mixed Unit' },
        team: 'away-team',
        combatantTypes: ['Infantry', 'Archer'],
      })

      const targets = [cavalryUnit, mixedUnit, infantryUnit] // Non-infantry first
      const metadata = COMPLETE_TACTIC_METADATA['Prioritize Infantry']
      const context = createMockTacticalContext({
        actingUnit: infantryUnit,
        allAllies: [],
        allEnemies: targets,
      })

      const sorted = SORT_EVALUATORS['combatant-type'](
        targets,
        metadata,
        context
      )

      // Infantry units should come first
      expect(sorted[0].unit.name).toBe('Mixed Unit') // Has Infantry
      expect(sorted[1].unit.name).toBe('Infantry Unit') // Has Infantry
      expect(sorted[2].unit.name).toBe('Cavalry Unit') // No Infantry
    })

    it('should sort Prioritize Flying correctly', () => {
      const flyingUnit = createMockBattleContext({
        unit: { name: 'Flying Unit' },
        team: 'away-team',
        combatantTypes: ['Flying'],
      })
      const groundUnit1 = createMockBattleContext({
        unit: { name: 'Ground Unit 1' },
        team: 'away-team',
        combatantTypes: ['Infantry'],
      })
      const groundUnit2 = createMockBattleContext({
        unit: { name: 'Ground Unit 2' },
        team: 'away-team',
        combatantTypes: ['Cavalry'],
      })

      const targets = [groundUnit1, groundUnit2, flyingUnit] // Ground units first
      const metadata = COMPLETE_TACTIC_METADATA['Prioritize Flying']
      const context = createMockTacticalContext({
        actingUnit: flyingUnit,
        allAllies: [],
        allEnemies: targets,
      })

      const sorted = SORT_EVALUATORS['combatant-type'](
        targets,
        metadata,
        context
      )

      // Flying unit should come first
      expect(sorted[0].unit.name).toBe('Flying Unit')
      expect(sorted[1].unit.name).toBe('Ground Unit 1')
      expect(sorted[2].unit.name).toBe('Ground Unit 2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty target arrays gracefully', () => {
      const targets: [] = []
      const formationMetadata = COMPLETE_TACTIC_METADATA['Front Row']
      const combatantMetadata = COMPLETE_TACTIC_METADATA['Infantry']
      const context = createMockTacticalContext({
        actingUnit: createMockBattleContext({
          unit: { name: 'Actor' },
          team: 'home-team',
        }),
        allAllies: [],
        allEnemies: [],
      })

      const formationFiltered = FILTER_EVALUATORS.formation(
        targets,
        formationMetadata,
        context
      )
      const combatantFiltered = FILTER_EVALUATORS['combatant-type'](
        targets,
        combatantMetadata,
        context
      )

      expect(formationFiltered).toHaveLength(0)
      expect(combatantFiltered).toHaveLength(0)
    })

    it('should handle mixed combatant types correctly', () => {
      const mixedUnit = createMockBattleContext({
        unit: { name: 'Mixed Unit' },
        team: 'away-team',
        combatantTypes: ['Infantry', 'Flying', 'Caster'],
      })

      const targets = [mixedUnit]

      // Test multiple type filters
      const infantryMeta = COMPLETE_TACTIC_METADATA['Infantry']
      const flyingMeta = COMPLETE_TACTIC_METADATA['Flying']
      const cavalryMeta = COMPLETE_TACTIC_METADATA['Cavalry']

      const context = createMockTacticalContext({
        actingUnit: mixedUnit,
        allAllies: [],
        allEnemies: targets,
      })

      const infantryFiltered = FILTER_EVALUATORS['combatant-type'](
        targets,
        infantryMeta,
        context
      )
      const flyingFiltered = FILTER_EVALUATORS['combatant-type'](
        targets,
        flyingMeta,
        context
      )
      const cavalryFiltered = FILTER_EVALUATORS['combatant-type'](
        targets,
        cavalryMeta,
        context
      )

      expect(infantryFiltered).toHaveLength(1) // Has Infantry
      expect(flyingFiltered).toHaveLength(1) // Has Flying
      expect(cavalryFiltered).toHaveLength(0) // No Cavalry
    })

    it('should handle complex formation scenarios', () => {
      // Create a complex battlefield with uneven distribution
      const units = [
        createMockBattleContext({
          unit: { name: 'Unit A' },
          team: 'away-team',
          position: { row: 0, col: 0 },
        }),
        createMockBattleContext({
          unit: { name: 'Unit B' },
          team: 'away-team',
          position: { row: 0, col: 1 },
        }),
        createMockBattleContext({
          unit: { name: 'Unit C' },
          team: 'away-team',
          position: { row: 0, col: 2 },
        }),
        createMockBattleContext({
          unit: { name: 'Unit D' },
          team: 'away-team',
          position: { row: 1, col: 0 },
        }),
      ]

      const context = createMockTacticalContext({
        actingUnit: units[0],
        allAllies: [],
        allEnemies: units,
      })

      // Test "Row with Most Combatants"
      const mostMeta = COMPLETE_TACTIC_METADATA['Row with Most Combatants']
      const mostFiltered = FILTER_EVALUATORS.formation(units, mostMeta, context)
      expect(mostFiltered).toHaveLength(3) // Row 0 units only

      // Test "Row with Least Combatants"
      const leastMeta = COMPLETE_TACTIC_METADATA['Row with Least Combatants']
      const leastFiltered = FILTER_EVALUATORS.formation(
        units,
        leastMeta,
        context
      )
      expect(leastFiltered).toHaveLength(1) // Row 1 unit only
      expect(leastFiltered[0].unit.name).toBe('Unit D')
    })
  })
})
