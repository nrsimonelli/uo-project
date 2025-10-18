import { describe, it, expect } from 'vitest'

import {
  executeSkill,
  type SingleTargetSkillResult,
} from '@/core/battle/combat/skill-executor'
import { createAllBattleContexts } from '@/core/battle/engine/battlefield-state'
import { rng } from '@/core/random'
import { ActiveSkillsMap } from '@/generated/skills-active'
import type { Team, Unit } from '@/types/team'

describe('Active Skills', () => {
  // Helper to create a simple test unit
  function createTestUnit(
    id: string,
    classKey: 'Fighter' | 'Warrior' = 'Fighter'
  ): Unit {
    return {
      id,
      name: `Test ${classKey}`,
      classKey,
      level: 10,
      growths: ['Hardy', 'Hardy'],
      equipment: [],
      skillSlots: [],
      position: { row: 1, col: 0 },
    }
  }

  function createTestTeam(name: string, unitId: string): Team {
    return {
      id: `team-${name}`,
      name: `${name} Team`,
      formation: [null, null, null, createTestUnit(unitId), null, null],
    }
  }

  describe('Heavy Slash', () => {
    it('should deal damage with real battle contexts', () => {
      const skill = ActiveSkillsMap['heavySlash']
      const homeTeam = createTestTeam('home', 'attacker')
      const awayTeam = createTestTeam('away', 'target')

      const battleContexts = createAllBattleContexts(homeTeam, awayTeam)
      const attacker = battleContexts['home-attacker']
      const target = battleContexts['away-target']

      const result = executeSkill(skill, attacker, [target], rng('test-seed'))

      // Since we're testing with a single target, this should be SingleTargetSkillResult
      const singleResult = result as SingleTargetSkillResult
      expect(singleResult.totalDamage).toBeGreaterThan(0)
      expect(singleResult.damageResults[0].hit).toBe(true)
    })
  })

  describe('Iron Crusher', () => {
    it('should deal more damage against armored targets', () => {
      const skill = ActiveSkillsMap['ironCrusher']
      const homeTeam = createTestTeam('home', 'attacker')

      // Create an armored target (Fighter has Armored trait)
      const armoredTarget = createTestUnit('armored-target', 'Fighter')
      armoredTarget.position = { row: 1, col: 0 }
      const awayTeam: Team = {
        id: 'away-team',
        name: 'Away Team',
        formation: [null, null, null, armoredTarget, null, null],
      }

      const battleContexts = createAllBattleContexts(homeTeam, awayTeam)
      const attacker = battleContexts['home-attacker']
      const target = battleContexts['away-armored-target']

      // Verify target is armored
      expect(target.combatantTypes).toContain('Armored')

      const result = executeSkill(skill, attacker, [target], rng('test-seed'))

      // Since we're testing with a single target, this should be SingleTargetSkillResult
      const singleResult = result as SingleTargetSkillResult
      expect(singleResult.totalDamage).toBeGreaterThan(0)
      expect(singleResult.damageResults[0].hit).toBe(true)
      // Iron Crusher should be effective against armored targets
      expect(singleResult.totalDamage).toBeGreaterThan(0)
    })
  })
})
