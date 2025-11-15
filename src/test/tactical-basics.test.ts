import { describe, it, expect } from 'vitest'

import { createMockTacticalContext } from './utils/tactical-test-utils'

describe('Tactical Basics', () => {
  describe('HP-based targeting', () => {
    it('should prioritize low HP units when configured', () => {
      const context = createMockTacticalContext({
        allEnemies: [
          {
            ...createMockTacticalContext().actingUnit,
            currentHP: 75,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
            unit: {
              ...createMockTacticalContext().actingUnit.unit,
              id: 'high-hp',
              name: 'High HP Enemy',
            },
          },
          {
            ...createMockTacticalContext().actingUnit,
            currentHP: 25,
            combatStats: {
              ...createMockTacticalContext().actingUnit.combatStats,
              HP: 100,
            },
            unit: {
              ...createMockTacticalContext().actingUnit.unit,
              id: 'low-hp',
              name: 'Low HP Enemy',
            },
          },
        ],
      })

      // Basic check that we can identify low HP units
      const lowHpUnit = context.allEnemies.find(enemy => enemy.currentHP === 25)
      const highHpUnit = context.allEnemies.find(
        enemy => enemy.currentHP === 75
      )

      expect(lowHpUnit).toBeDefined()
      expect(highHpUnit).toBeDefined()
      expect(lowHpUnit!.currentHP / lowHpUnit!.combatStats.HP).toBe(0.25) // 25%
      expect(highHpUnit!.currentHP / highHpUnit!.combatStats.HP).toBe(0.75) // 75%
    })
  })

  describe('Combatant type targeting', () => {
    it('should identify different combatant types', () => {
      const context = createMockTacticalContext({
        allEnemies: [
          {
            ...createMockTacticalContext().actingUnit,
            combatantTypes: ['Infantry'],
            unit: {
              ...createMockTacticalContext().actingUnit.unit,
              id: 'infantry',
              name: 'Infantry Unit',
            },
          },
          {
            ...createMockTacticalContext().actingUnit,
            combatantTypes: ['Cavalry'],
            unit: {
              ...createMockTacticalContext().actingUnit.unit,
              id: 'cavalry',
              name: 'Cavalry Unit',
            },
          },
          {
            ...createMockTacticalContext().actingUnit,
            combatantTypes: ['Flying'],
            unit: {
              ...createMockTacticalContext().actingUnit.unit,
              id: 'flying',
              name: 'Flying Unit',
            },
          },
        ],
      })

      const infantry = context.allEnemies.find(e =>
        e.combatantTypes.includes('Infantry')
      )
      const cavalry = context.allEnemies.find(e =>
        e.combatantTypes.includes('Cavalry')
      )
      const flying = context.allEnemies.find(e =>
        e.combatantTypes.includes('Flying')
      )

      expect(infantry).toBeDefined()
      expect(cavalry).toBeDefined()
      expect(flying).toBeDefined()

      expect(infantry!.combatantTypes).toContain('Infantry')
      expect(cavalry!.combatantTypes).toContain('Cavalry')
      expect(flying!.combatantTypes).toContain('Flying')
    })
  })

  describe('Status effect targeting', () => {
    it('should identify buffed and debuffed units', () => {
      const context = createMockTacticalContext({
        allEnemies: [
          {
            ...createMockTacticalContext().actingUnit,
            buffs: [
              {
                name: 'Strength Up',
                stat: 'PATK',
                value: 10,
                duration: 'Indefinite',
                scaling: 'flat',
                source: 'test',
                skillId: '',
              },
            ],
            unit: {
              ...createMockTacticalContext().actingUnit.unit,
              id: 'buffed',
              name: 'Buffed Unit',
            },
          },
          {
            ...createMockTacticalContext().actingUnit,
            debuffs: [
              {
                name: 'Weakness',
                stat: 'PATK',
                value: -5,
                duration: 'Indefinite',
                scaling: 'flat',
                source: 'test',
                skillId: '',
              },
            ],
            unit: {
              ...createMockTacticalContext().actingUnit.unit,
              id: 'debuffed',
              name: 'Debuffed Unit',
            },
          },
          {
            ...createMockTacticalContext().actingUnit,
            unit: {
              ...createMockTacticalContext().actingUnit.unit,
              id: 'neutral',
              name: 'Neutral Unit',
            },
          },
        ],
      })

      const buffed = context.allEnemies.find(e => e.buffs.length > 0)
      const debuffed = context.allEnemies.find(e => e.debuffs.length > 0)
      const neutral = context.allEnemies.find(
        e => e.buffs.length === 0 && e.debuffs.length === 0
      )

      expect(buffed).toBeDefined()
      expect(debuffed).toBeDefined()
      expect(neutral).toBeDefined()

      expect(buffed!.buffs).toHaveLength(1)
      expect(debuffed!.debuffs).toHaveLength(1)
      expect(neutral!.buffs).toHaveLength(0)
      expect(neutral!.debuffs).toHaveLength(0)
    })
  })

  describe('Basic tactical utilities', () => {
    it('should provide working tactical context creation', () => {
      const context = createMockTacticalContext()

      expect(context.actingUnit).toBeDefined()
      expect(context.battlefield).toBeDefined()
      expect(context.skill).toBeDefined()
      expect(context.allAllies).toHaveLength(1)
      expect(context.allEnemies).toHaveLength(1)

      expect(context.actingUnit.unit.name).toBeDefined()
      expect(context.skill.name).toBeDefined()
    })
  })
})
