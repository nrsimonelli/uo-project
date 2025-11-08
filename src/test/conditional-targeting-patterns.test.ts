import { describe, it, expect, beforeEach } from 'vitest'

import {
  createStandardAttacker,
  createStandardTarget,
  createMockBattlefield,
} from './utils/tactical-test-utils'

import { getDefaultTargets } from '@/core/battle/targeting/skill-targeting'
import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'

/**
 * Tests for conditional targeting patterns
 * Tests skills that change their targeting pattern based on conditions
 */

describe('Conditional Targeting Patterns', () => {
  let caster: BattleContext
  let battlefield: BattlefieldState

  beforeEach(() => {
    caster = createStandardAttacker({
      unit: {
        id: 'caster',
        name: 'Caster',
        classKey: 'Fighter',
        level: 10,
        growths: ['Hardy', 'Hardy'],
        equipment: [],
        skillSlots: [],
      },
      position: { row: 1, col: 1 },
    })

    battlefield = createMockBattlefield({
      units: {
        caster: caster,
      },
      isNight: false,
    })
  })

  describe('rowResistance - Day/Night Conditional Pattern', () => {
    it('should target Row pattern at night', () => {
      const skill = ActiveSkillsMap.rowResistance
      if (!skill) {
        throw new Error('rowResistance skill not found')
      }

      // Create allies in different rows
      const ally1 = createStandardAttacker({
        unit: {
          id: 'ally-1',
          name: 'Ally 1',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 0, col: 0 }, // Different row (back row)
        team: 'home-team',
      })

      const ally2 = createStandardAttacker({
        unit: {
          id: 'ally-2',
          name: 'Ally 2',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 0, col: 1 }, // Different row
        team: 'home-team',
      })

      const ally3 = createStandardAttacker({
        unit: {
          id: 'ally-3',
          name: 'Ally 3',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 1, col: 2 }, // Same row as caster
        team: 'home-team',
      })

      battlefield.units = {
        caster: caster,
        'ally-1': ally1,
        'ally-2': ally2,
        'ally-3': ally3,
      }

      // At night: should only target row (caster's row = row 1)
      battlefield.isNight = true
      const targetsNight = getDefaultTargets(skill, caster, battlefield)

      expect(targetsNight.length).toBe(2) // caster + ally-3 (both in row 1)
      expect(targetsNight.map(t => t.unit.id)).toContain('caster')
      expect(targetsNight.map(t => t.unit.id)).toContain('ally-3')
      expect(targetsNight.map(t => t.unit.id)).not.toContain('ally-2')
    })

    it('should target All pattern during day', () => {
      const skill = ActiveSkillsMap.rowResistance
      if (!skill) {
        throw new Error('rowResistance skill not found')
      }

      // Create allies in different rows
      const ally1 = createStandardAttacker({
        unit: {
          id: 'ally-1',
          name: 'Ally 1',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 0, col: 0 }, // Different row
        team: 'home-team',
      })

      const ally2 = createStandardAttacker({
        unit: {
          id: 'ally-2',
          name: 'Ally 2',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 0, col: 1 },
        team: 'home-team',
      })

      const ally3 = createStandardAttacker({
        unit: {
          id: 'ally-3',
          name: 'Ally 3',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 1, col: 2 },
        team: 'home-team',
      })

      battlefield.units = {
        caster: caster,
        'ally-1': ally1,
        'ally-2': ally2,
        'ally-3': ally3,
      }

      // During day: should target all allies
      battlefield.isNight = false
      const targetsDay = getDefaultTargets(skill, caster, battlefield)

      expect(targetsDay.length).toBe(4) // caster + all 3 allies (including caster)
      expect(targetsDay.map(t => t.unit.id)).toContain('caster')
      expect(targetsDay.map(t => t.unit.id)).toContain('ally-1')
      expect(targetsDay.map(t => t.unit.id)).toContain('ally-2')
      expect(targetsDay.map(t => t.unit.id)).toContain('ally-3')
    })
  })

  describe('fireBurst - Target Affliction Conditional Pattern', () => {
    it('should target Single pattern when target is not burned', () => {
      const skill = PassiveSkillsMap.fireBurst
      if (!skill) {
        throw new Error('fireBurst skill not found')
      }

      // Create enemies
      const enemy1 = createStandardTarget({
        unit: {
          id: 'enemy-1',
          name: 'Enemy 1',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 1, col: 0 },
        afflictions: [], // Not burned
      })

      const enemy2 = createStandardTarget({
        unit: {
          id: 'enemy-2',
          name: 'Enemy 2',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 1, col: 1 },
        afflictions: [], // Not burned
      })

      battlefield.units = {
        caster: caster,
        'enemy-1': enemy1,
        'enemy-2': enemy2,
      }

      const targets = getDefaultTargets(skill, caster, battlefield)

      // Should only target one enemy (Single pattern)
      expect(targets.length).toBe(1)
    })

    it('should target All pattern when selected target is burned', () => {
      const skill = PassiveSkillsMap.fireBurst
      if (!skill) {
        throw new Error('fireBurst skill not found')
      }

      // Create enemies - first one is burned and closest (distance 1)
      const enemy1 = createStandardTarget({
        unit: {
          id: 'enemy-1',
          name: 'Enemy 1',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 1, col: 0 }, // Distance 1 from caster at (1,1) - closest
        afflictions: [
          {
            type: 'Burn',
            name: 'Burn',
            source: 'test',
          },
        ],
      })

      const enemy2 = createStandardTarget({
        unit: {
          id: 'enemy-2',
          name: 'Enemy 2',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 1, col: 3 }, // Distance 2 from caster at (1,1) - further
        afflictions: [], // Not burned
      })

      const enemy3 = createStandardTarget({
        unit: {
          id: 'enemy-3',
          name: 'Enemy 3',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 0, col: 2 }, // Distance 2 from caster at (1,1) - further
        afflictions: [], // Not burned
      })

      battlefield.units = {
        caster: caster,
        'enemy-1': enemy1,
        'enemy-2': enemy2,
        'enemy-3': enemy3,
      }

      const targets = getDefaultTargets(skill, caster, battlefield)

      // Should target all enemies because enemy1 (selected target) is burned
      expect(targets.length).toBe(3)
      expect(targets.map(t => t.unit.id)).toContain('enemy-1')
      expect(targets.map(t => t.unit.id)).toContain('enemy-2')
      expect(targets.map(t => t.unit.id)).toContain('enemy-3')
    })

    it('should target Single pattern when selected target is not burned (even if others are)', () => {
      const skill = PassiveSkillsMap.fireBurst
      if (!skill) {
        throw new Error('fireBurst skill not found')
      }

      // Create enemies - enemy2 is burned, but enemy1 (closest) is not
      const enemy1 = createStandardTarget({
        unit: {
          id: 'enemy-1',
          name: 'Enemy 1',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 1, col: 0 }, // Distance 1 from caster at (1,1)
        afflictions: [], // Not burned
      })

      const enemy2 = createStandardTarget({
        unit: {
          id: 'enemy-2',
          name: 'Enemy 2',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        position: { row: 1, col: 3 }, // Distance 2 from caster at (1,1) - further away
        afflictions: [
          {
            type: 'Burn',
            name: 'Burn',
            source: 'test',
          },
        ],
      })

      battlefield.units = {
        caster: caster,
        'enemy-1': enemy1,
        'enemy-2': enemy2,
      }

      const targets = getDefaultTargets(skill, caster, battlefield)

      // Should only target enemy1 (Single pattern) because it's the selected target and not burned
      expect(targets.length).toBe(1)
      expect(targets[0].unit.id).toBe('enemy-1')
    })
  })
})
