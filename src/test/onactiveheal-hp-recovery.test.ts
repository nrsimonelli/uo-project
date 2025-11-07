import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  createUnitWithStats,
  DEFAULT_STATS,
  createMockBattlefield,
} from './utils/tactical-test-utils'

import { executeSkill } from '@/core/battle/combat/skill-executor'
import { applyOnActiveHealPercent } from '@/core/battle/engine/results'
import { getStateIdForContext } from '@/core/battle/engine/utils/state-ids'
import { STANDBY_SKILL } from '@/core/battle/targeting/skill-targeting'
import { rng } from '@/core/random'
import type { BattleContext } from '@/types/battle-engine'
import type { Equipment } from '@/types/equipment'

// Mock equipment lookup
const mockEquipmentMap = new Map<string, Equipment>()

vi.mock('@/core/equipment-lookup', () => ({
  getEquipmentById: (id: string) => {
    return mockEquipmentMap.get(id) || null
  },
}))

describe('OnActiveHealPercent with HPRecovery Buffs/Debuffs', () => {
  // Helper to create a unit with OnActiveHealPercent equipment
  const createUnitWithOnActiveHeal = (
    onActiveHealPercent: number,
    maxHP: number = 100,
    overrides: Partial<BattleContext> = {}
  ): BattleContext => {
    const equipmentId = `test-equipment-${onActiveHealPercent}`
    const equipmentItem = {
      slot: 'Accessory' as const,
      itemId: equipmentId,
    }

    // Register mock equipment
    mockEquipmentMap.set(equipmentId, {
      id: equipmentId,
      name: `Test Equipment ${equipmentId}`,
      type: 'Accessory',
      stats: {
        OnActiveHealPercent: onActiveHealPercent,
      },
      skillId: null,
      nullifications: [],
      classRestrictions: [],
    })

    const unit = createUnitWithStats(
      {
        id: `test-unit-${onActiveHealPercent}`,
        name: 'Test Unit',
        level: 1,
        classKey: 'Fighter',
        growths: ['Hardy', 'Hardy'],
        equipment: [equipmentItem],
      },
      { ...DEFAULT_STATS, HP: maxHP }
    )
    unit.currentHP = 50 // Start at 50 HP to see healing
    return Object.assign(unit, overrides)
  }

  beforeEach(() => {
    // Clear mock equipment map before each test
    mockEquipmentMap.clear()
  })

  describe('Baseline OnActiveHealPercent (20%)', () => {
    it('should heal 20 HP after action with OnActiveHealPercent 20 and maxHP 100', () => {
      const unit = createUnitWithOnActiveHeal(20, 100)
      unit.currentHP = 50
      const initialHP = unit.currentHP

      const battlefield = createMockBattlefield({
        units: {
          [getStateIdForContext(unit)]: unit,
        },
        activeUnitId: unit.unit.id,
      })

      // Apply OnActiveHealPercent healing BEFORE skill execution
      const unitId = getStateIdForContext(unit)
      const stateWithHealing = applyOnActiveHealPercent(battlefield, unitId)

      // Get the healed unit
      const healedUnit = stateWithHealing.units[unitId] || unit

      // Execute standby (healing already applied)
      executeSkill(
        STANDBY_SKILL,
        healedUnit,
        [],
        rng('test-seed'),
        stateWithHealing
      )

      // Should heal 20 HP: (100 maxHP * 20%) = 20
      expect(stateWithHealing.units[unitId].currentHP).toBe(initialHP + 20)
    })
  })

  describe('OnActiveHealPercent with Honed Healing buff (+100% HPRecovery)', () => {
    it('should heal 40 HP with OnActiveHealPercent 20, maxHP 100, and Honed Healing buff', () => {
      const unit = createUnitWithOnActiveHeal(20, 100, {
        buffs: [
          {
            name: 'Honed Healing',
            stat: 'HPRecovery',
            value: 100,
            duration: 'Indefinite',
            scaling: 'percent',
            source: 'honedHealing',
            skillId: 'honedHealing',
          },
        ],
      })
      unit.currentHP = 50
      const initialHP = unit.currentHP

      const battlefield = createMockBattlefield({
        units: {
          [getStateIdForContext(unit)]: unit,
        },
        activeUnitId: unit.unit.id,
      })

      // Apply OnActiveHealPercent healing BEFORE skill execution
      const unitId = getStateIdForContext(unit)
      const stateWithHealing = applyOnActiveHealPercent(battlefield, unitId)

      // Get the healed unit
      const healedUnit = stateWithHealing.units[unitId] || unit

      // Execute standby (healing already applied)
      executeSkill(
        STANDBY_SKILL,
        healedUnit,
        [],
        rng('test-seed'),
        stateWithHealing
      )

      // Should heal 40 HP: base 20 * (1 + 100/100) = 20 * 2 = 40
      expect(stateWithHealing.units[unitId].currentHP).toBe(initialHP + 40)
    })
  })

  describe('OnActiveHealPercent with Venom Thrust debuff (-50% HPRecovery)', () => {
    it('should heal 10 HP with OnActiveHealPercent 20, maxHP 100, and Venom Thrust debuff', () => {
      const unit = createUnitWithOnActiveHeal(20, 100, {
        debuffs: [
          {
            name: 'Venom Thrust',
            stat: 'HPRecovery',
            value: -50,
            duration: 'Indefinite',
            scaling: 'percent',
            source: 'venomThrust',
            skillId: 'venomThrust',
          },
        ],
      })
      unit.currentHP = 50
      const initialHP = unit.currentHP

      const battlefield = createMockBattlefield({
        units: {
          [getStateIdForContext(unit)]: unit,
        },
        activeUnitId: unit.unit.id,
      })

      // Apply OnActiveHealPercent healing BEFORE skill execution
      const unitId = getStateIdForContext(unit)
      const stateWithHealing = applyOnActiveHealPercent(battlefield, unitId)

      // Get the healed unit
      const healedUnit = stateWithHealing.units[unitId] || unit

      // Execute standby (healing already applied)
      executeSkill(
        STANDBY_SKILL,
        healedUnit,
        [],
        rng('test-seed'),
        stateWithHealing
      )

      // Should heal 10 HP: base 20 * (1 + (-50)/100) = 20 * 0.5 = 10
      expect(stateWithHealing.units[unitId].currentHP).toBe(initialHP + 10)
    })
  })

  describe('OnActiveHealPercent with both Honed Healing and Venom Thrust (additive)', () => {
    it('should heal 30 HP with OnActiveHealPercent 20, maxHP 100, Honed Healing (+100%) and Venom Thrust (-50%)', () => {
      const unit = createUnitWithOnActiveHeal(20, 100, {
        buffs: [
          {
            name: 'Honed Healing',
            stat: 'HPRecovery',
            value: 100,
            duration: 'Indefinite',
            scaling: 'percent',
            source: 'honedHealing',
            skillId: 'honedHealing',
          },
        ],
        debuffs: [
          {
            name: 'Venom Thrust',
            stat: 'HPRecovery',
            value: -50,
            duration: 'Indefinite',
            scaling: 'percent',
            source: 'venomThrust',
            skillId: 'venomThrust',
          },
        ],
      })
      unit.currentHP = 50
      const initialHP = unit.currentHP

      const battlefield = createMockBattlefield({
        units: {
          [getStateIdForContext(unit)]: unit,
        },
        activeUnitId: unit.unit.id,
      })

      // Apply OnActiveHealPercent healing BEFORE skill execution
      const unitId = getStateIdForContext(unit)
      const stateWithHealing = applyOnActiveHealPercent(battlefield, unitId)

      // Get the healed unit
      const healedUnit = stateWithHealing.units[unitId] || unit

      // Execute standby (healing already applied)
      executeSkill(
        STANDBY_SKILL,
        healedUnit,
        [],
        rng('test-seed'),
        stateWithHealing
      )

      // Should heal 30 HP: base 20 * (1 + (100 - 50)/100) = 20 * (1 + 50/100) = 20 * 1.5 = 30
      expect(stateWithHealing.units[unitId].currentHP).toBe(initialHP + 30)
    })
  })

  describe('Edge cases', () => {
    it('should not exceed maxHP when healing', () => {
      const unit = createUnitWithOnActiveHeal(20, 100)
      unit.currentHP = 95 // Close to max

      const battlefield = createMockBattlefield({
        units: {
          [getStateIdForContext(unit)]: unit,
        },
        activeUnitId: unit.unit.id,
      })

      // Apply OnActiveHealPercent healing BEFORE skill execution
      const unitId = getStateIdForContext(unit)
      const stateWithHealing = applyOnActiveHealPercent(battlefield, unitId)

      // Get the healed unit
      const healedUnit = stateWithHealing.units[unitId] || unit

      // Execute standby (healing already applied)
      executeSkill(
        STANDBY_SKILL,
        healedUnit,
        [],
        rng('test-seed'),
        stateWithHealing
      )

      // Should cap at maxHP (100), not go to 115
      expect(stateWithHealing.units[unitId].currentHP).toBe(100)
    })

    it('should return state unchanged if OnActiveHealPercent is 0', () => {
      const unit = createUnitWithStats(
        {
          id: 'test-unit-no-heal',
          name: 'Test Unit',
          level: 1,
          classKey: 'Fighter',
          growths: ['Hardy', 'Hardy'],
          equipment: [], // No equipment
        },
        DEFAULT_STATS
      )
      unit.currentHP = 50

      const battlefield = createMockBattlefield({
        units: {
          [getStateIdForContext(unit)]: unit,
        },
        activeUnitId: unit.unit.id,
      })

      const unitId = getStateIdForContext(unit)
      const finalState = applyOnActiveHealPercent(battlefield, unitId)

      // Should remain at 50 HP
      expect(finalState.units[unitId].currentHP).toBe(50)
    })

    it('should preserve overheal and not change HP if unit is already overhealed', () => {
      const unit = createUnitWithOnActiveHeal(20, 100)
      unit.currentHP = 120 // Already overhealed (above maxHP of 100)

      const battlefield = createMockBattlefield({
        units: {
          [getStateIdForContext(unit)]: unit,
        },
        activeUnitId: unit.unit.id,
      })

      // Apply OnActiveHealPercent healing BEFORE skill execution
      const unitId = getStateIdForContext(unit)
      const stateWithHealing = applyOnActiveHealPercent(battlefield, unitId)

      // Get the healed unit
      const healedUnit = stateWithHealing.units[unitId] || unit

      // Execute standby (healing already applied)
      executeSkill(
        STANDBY_SKILL,
        healedUnit,
        [],
        rng('test-seed'),
        stateWithHealing
      )

      // Should preserve overheal: HP remains unchanged at 120 (no increase)
      expect(stateWithHealing.units[unitId].currentHP).toBe(120)
    })

    it('should not increase overheal above current overheal amount', () => {
      const unit = createUnitWithOnActiveHeal(20, 100)
      unit.currentHP = 105 // Slightly overhealed

      const battlefield = createMockBattlefield({
        units: {
          [getStateIdForContext(unit)]: unit,
        },
        activeUnitId: unit.unit.id,
      })

      // Apply OnActiveHealPercent healing BEFORE skill execution
      const unitId = getStateIdForContext(unit)
      const stateWithHealing = applyOnActiveHealPercent(battlefield, unitId)

      // Get the healed unit
      const healedUnit = stateWithHealing.units[unitId] || unit

      // Execute standby (healing already applied)
      executeSkill(
        STANDBY_SKILL,
        healedUnit,
        [],
        rng('test-seed'),
        stateWithHealing
      )

      // Should not increase overheal: HP remains at 105 (no increase)
      expect(stateWithHealing.units[unitId].currentHP).toBe(105)
    })
  })
})
