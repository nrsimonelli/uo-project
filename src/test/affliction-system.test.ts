import { describe, it, expect, beforeEach } from 'vitest'

import {
  applyAffliction,
  removeAffliction,
  hasAffliction,
  getAfflictionLevel,
  processAfflictionsAtTurnStart,
  canUseActiveSkills,
  canUsePassiveSkills,
  canGuard,
  canEvade,
  canCrit,
  checkAndConsumeBlind,
  processAfflictionsOnDamage,
  clearAllAfflictions,
  getAfflictionSummary,
} from '@/core/battle/combat/affliction-manager'
import { calculateSkillDamage } from '@/core/battle/combat/damage-calculator'
import { rng } from '@/core/random'
import type { BattleContext } from '@/types/battle-engine'
import type { DamageEffect } from '@/types/effects'

// Mock unit creation helper
const createMockUnit = (name: string, hp = 100): BattleContext => ({
  unit: {
    id: `unit-${name}`,
    name,
    classKey: 'Fighter',
    level: 10,
    growths: ['Hardy', 'Hardy'],
    equipment: [],
    skillSlots: [],
  },
  currentHP: hp,
  currentAP: 4,
  currentPP: 4,
  team: 'home-team',
  combatantTypes: ['Infantry'],
  position: { row: 0, col: 0 },
  afflictions: [],
  buffs: [],
  debuffs: [],
  conferrals: [],
  statFoundation: {
    HP: hp,
    PATK: 50,
    PDEF: 30,
    MATK: 40,
    MDEF: 25,
    ACC: 70,
    EVA: 60,
    CRT: 15,
    GRD: 20,
    INIT: 50,
    GuardEff: 0,
  },
  combatStats: {
    HP: hp,
    PATK: 50,
    PDEF: 30,
    MATK: 40,
    MDEF: 25,
    ACC: 70,
    EVA: 60,
    CRT: 15,
    GRD: 20,
    INIT: 50,
    GuardEff: 0,
  },
  flags: [],
  lastPassiveResponse: 0,
  isPassiveResponsive: true,
  immunities: [],
  hasActedThisRound: false,
})

describe('Affliction System', () => {
  let unit: BattleContext
  let attacker: BattleContext
  let target: BattleContext

  beforeEach(() => {
    unit = createMockUnit('TestUnit', 100)
    attacker = createMockUnit('Attacker', 100)
    target = createMockUnit('Target', 100)
  })

  describe('Basic Affliction Management', () => {
    it('should apply and detect afflictions', () => {
      expect(hasAffliction(unit, 'Poison')).toBe(false)

      const applied = applyAffliction(unit, 'Poison', 'attacker-id')
      expect(applied).toBe(true)
      expect(hasAffliction(unit, 'Poison')).toBe(true)
      expect(unit.afflictions).toHaveLength(1)
      expect(unit.afflictions[0].type).toBe('Poison')
      expect(unit.afflictions[0].source).toBe('attacker-id')
    })

    it('should remove afflictions', () => {
      applyAffliction(unit, 'Stun', 'source')
      expect(hasAffliction(unit, 'Stun')).toBe(true)

      const removed = removeAffliction(unit, 'Stun')
      expect(removed).toBe(true)
      expect(hasAffliction(unit, 'Stun')).toBe(false)
      expect(unit.afflictions).toHaveLength(0)
    })

    it('should handle multiple afflictions', () => {
      applyAffliction(unit, 'Poison', 'source')
      applyAffliction(unit, 'Blind', 'source')
      applyAffliction(unit, 'GuardSeal', 'source')

      expect(unit.afflictions).toHaveLength(3)
      expect(hasAffliction(unit, 'Poison')).toBe(true)
      expect(hasAffliction(unit, 'Blind')).toBe(true)
      expect(hasAffliction(unit, 'GuardSeal')).toBe(true)
    })
  })

  describe('Burn Stacking', () => {
    it('should stack Burn afflictions', () => {
      applyAffliction(unit, 'Burn', 'source1', 2)
      expect(getAfflictionLevel(unit, 'Burn')).toBe(2)

      applyAffliction(unit, 'Burn', 'source2', 1)
      expect(getAfflictionLevel(unit, 'Burn')).toBe(3)
      expect(unit.afflictions).toHaveLength(1) // Still only one burn entry
    })

    it('should calculate correct burn damage', () => {
      applyAffliction(unit, 'Burn', 'source', 3)
      unit.currentHP = 80

      const result = processAfflictionsAtTurnStart(unit)
      expect(result.canAct).toBe(true) // Unit survives burn
      expect(unit.currentHP).toBe(20) // 80 - (3 * 20) = 20
      expect(result.events).toHaveLength(1)
      expect(result.events[0].type).toBe('burn-damage')
      expect(result.events[0].damage).toBe(60)
    })

    it('should defeat unit with lethal burn damage', () => {
      applyAffliction(unit, 'Burn', 'source', 2)
      unit.currentHP = 30

      const result = processAfflictionsAtTurnStart(unit)
      expect(result.canAct).toBe(false) // Unit defeated
      expect(unit.currentHP).toBe(0) // 30 - (2 * 20) = -10 → 0
      expect(result.events).toHaveLength(1)
      expect(result.events[0].type).toBe('burn-damage')
    })
  })

  describe('Poison Damage', () => {
    it('should apply correct poison damage', () => {
      unit.combatStats.HP = 100
      unit.currentHP = 80
      applyAffliction(unit, 'Poison', 'source')

      const result = processAfflictionsAtTurnStart(unit)
      expect(result.canAct).toBe(true)
      expect(unit.currentHP).toBe(50) // 80 - (100 * 0.3) = 50
      expect(result.events).toHaveLength(1)
      expect(result.events[0].type).toBe('poison-damage')
    })

    it('should defeat unit with lethal poison', () => {
      unit.combatStats.HP = 100
      unit.currentHP = 20
      applyAffliction(unit, 'Poison', 'source')

      const result = processAfflictionsAtTurnStart(unit)
      expect(result.canAct).toBe(false) // Unit defeated by poison
      expect(unit.currentHP).toBe(0)
      expect(result.events).toHaveLength(1)
      expect(result.events[0].type).toBe('poison-damage')
    })
  })

  describe('Stun Mechanics', () => {
    it('should consume turn clearing stun', () => {
      applyAffliction(unit, 'Stun', 'source')
      expect(hasAffliction(unit, 'Stun')).toBe(true)

      const result = processAfflictionsAtTurnStart(unit)
      expect(result.canAct).toBe(false) // Turn consumed
      expect(hasAffliction(unit, 'Stun')).toBe(false) // Stun removed
      expect(result.events).toHaveLength(1)
      expect(result.events[0].type).toBe('stun-clear')
    })

    it('should prevent passive skills while stunned', () => {
      expect(canUsePassiveSkills(unit)).toBe(true)

      applyAffliction(unit, 'Stun', 'source')
      expect(canUsePassiveSkills(unit)).toBe(false)
    })

    it('should prevent guarding while stunned', () => {
      expect(canGuard(unit)).toBe(true)

      applyAffliction(unit, 'Stun', 'source')
      expect(canGuard(unit)).toBe(false)
    })
  })

  describe('Freeze Mechanics', () => {
    it('should prevent all actions while frozen', () => {
      expect(canUseActiveSkills(unit)).toBe(true)
      expect(canUsePassiveSkills(unit)).toBe(true)
      expect(canGuard(unit)).toBe(true)
      expect(canEvade(unit)).toBe(true)

      applyAffliction(unit, 'Freeze', 'source')

      expect(canUseActiveSkills(unit)).toBe(false)
      expect(canUsePassiveSkills(unit)).toBe(false)
      expect(canGuard(unit)).toBe(false)
      expect(canEvade(unit)).toBe(false)
    })

    it('should remove freeze when taking damage', () => {
      applyAffliction(unit, 'Freeze', 'source')
      expect(hasAffliction(unit, 'Freeze')).toBe(true)

      processAfflictionsOnDamage(unit)
      expect(hasAffliction(unit, 'Freeze')).toBe(false)
    })
  })

  describe('Seal Afflictions', () => {
    it('should prevent passive skills with Passive Seal', () => {
      expect(canUsePassiveSkills(unit)).toBe(true)

      applyAffliction(unit, 'PassiveSeal', 'source')
      expect(canUsePassiveSkills(unit)).toBe(false)
      expect(canUseActiveSkills(unit)).toBe(true) // Active skills unaffected
    })

    it('should prevent guarding with Guard Seal', () => {
      expect(canGuard(unit)).toBe(true)

      applyAffliction(unit, 'GuardSeal', 'source')
      expect(canGuard(unit)).toBe(false)
    })

    it('should prevent crits with Crit Seal', () => {
      expect(canCrit(unit)).toBe(true)

      applyAffliction(unit, 'CritSeal', 'source')
      expect(canCrit(unit)).toBe(false)
    })
  })

  describe('Blind Mechanics', () => {
    it('should cause miss and auto-remove', () => {
      applyAffliction(unit, 'Blind', 'source')
      expect(hasAffliction(unit, 'Blind')).toBe(true)

      const missed = checkAndConsumeBlind(unit)
      expect(missed).toBe(true)
      expect(hasAffliction(unit, 'Blind')).toBe(false) // Auto-removed
    })

    it('should not interfere when not blinded', () => {
      expect(hasAffliction(unit, 'Blind')).toBe(false)

      const missed = checkAndConsumeBlind(unit)
      expect(missed).toBe(false)
    })
  })

  describe('Deathblow', () => {
    it('should instantly set HP to 0', () => {
      unit.currentHP = 75
      expect(unit.currentHP).toBe(75)

      const applied = applyAffliction(unit, 'Deathblow', 'source')
      expect(applied).toBe(true)
      expect(unit.currentHP).toBe(0)
      expect(hasAffliction(unit, 'Deathblow')).toBe(false) // Not added to afflictions array
    })
  })

  describe('Immunity System', () => {
    it('should respect specific affliction immunity', () => {
      unit.immunities = ['Poison']

      const applied = applyAffliction(unit, 'Poison', 'source')
      expect(applied).toBe(false)
      expect(hasAffliction(unit, 'Poison')).toBe(false)
    })

    it('should respect general affliction immunity', () => {
      unit.immunities = ['Affliction']

      const poisonApplied = applyAffliction(unit, 'Poison', 'source')
      const stunApplied = applyAffliction(unit, 'Stun', 'source')

      expect(poisonApplied).toBe(false)
      expect(stunApplied).toBe(false)
      expect(unit.afflictions).toHaveLength(0)
    })

    it('should respect debuff immunity (covers afflictions)', () => {
      unit.immunities = ['Debuff']

      const applied = applyAffliction(unit, 'Burn', 'source')
      expect(applied).toBe(false)
      expect(hasAffliction(unit, 'Burn')).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('should clear all afflictions', () => {
      applyAffliction(unit, 'Poison', 'source')
      applyAffliction(unit, 'Burn', 'source', 2)
      applyAffliction(unit, 'Stun', 'source')
      expect(unit.afflictions).toHaveLength(3)

      clearAllAfflictions(unit)
      expect(unit.afflictions).toHaveLength(0)
    })

    it('should provide affliction summary', () => {
      applyAffliction(unit, 'Poison', 'source')
      applyAffliction(unit, 'Burn', 'source', 3)
      applyAffliction(unit, 'Blind', 'source')

      const summary = getAfflictionSummary(unit)
      expect(summary).toContain('Poison')
      expect(summary).toContain('Burn (Level 3)')
      expect(summary).toContain('Blind')
      expect(summary).toHaveLength(3)
    })
  })

  describe('Integration with Damage System', () => {
    it('should integrate with damage calculation - Blind override', () => {
      const testRng = rng('test-seed')
      attacker.afflictions = [{ type: 'Blind', name: 'Blind', source: 'test' }]

      const damageEffect: DamageEffect = {
        kind: 'Damage',
        potency: { physical: 100 },
        hitRate: 100, // Should always hit normally
        hitCount: 1,
      }

      const result = calculateSkillDamage(
        damageEffect,
        ['TrueStrike'],
        [],
        attacker,
        target,
        testRng
      )

      expect(result.hit).toBe(false) // Blind causes miss
      expect(result.damage).toBe(0)
      expect(result.hitChance).toBe(0) // Blind sets hit chance to 0
      expect(hasAffliction(attacker, 'Blind')).toBe(false) // Blind consumed
    })

    it('should integrate with damage calculation - Crit Seal override', () => {
      const testRng = rng('test-seed')
      attacker.afflictions = [
        { type: 'CritSeal', name: 'Crit Seal', source: 'test' },
      ]

      const damageEffect: DamageEffect = {
        kind: 'Damage',
        potency: { physical: 100 },
        hitRate: 100,
        hitCount: 1,
      }

      const result = calculateSkillDamage(
        damageEffect,
        ['TrueCritical'],
        [],
        attacker,
        target,
        testRng
      )

      expect(result.hit).toBe(true) // Attack still hits
      expect(result.wasCritical).toBe(false) // Crit Seal prevents crit
      expect(result.damage).toBeGreaterThan(0)
    })
  })
})
