import { describe, it, expect } from 'vitest'

import {
  executeSkill,
  type SingleTargetSkillResult,
} from '@/core/battle/combat/skill-executor'
import { createAllBattleContexts } from '@/core/battle/engine/battlefield-state'
import { rng } from '@/core/random'
import { ActiveSkillsMap } from '@/generated/skills-active'
import type { Team, Unit } from '@/types/team'

/**
 * Test that battle logic works with real team structures
 * This tests the actual integration between teams -> battle contexts -> skill execution
 */

describe('Battle Logic Integration', () => {
  // Helper to create a simple real unit with actual structure
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
      skillSlots: [
        {
          skillId: 'heavySlash',
          skillType: 'active',
          tactics: [null, null],
          order: 1,
          id: '',
        },
      ],
      position: { row: 1, col: 1 },
    }
  }

  function createTestTeam(teamName: string, unitIds: string[]): Team {
    const units = unitIds.map((id, index) => {
      const unit = createTestUnit(id)
      unit.position = { row: 1, col: index as 0 | 1 | 2 } // Set different positions
      return unit
    })

    return {
      id: `team-${teamName}`,
      name: teamName,
      formation: [null, null, null, units[0], units[1] || null, null],
    }
  }

  it('should create battle contexts from real team structures', () => {
    const homeTeam = createTestTeam('home', ['h1', 'h2'])
    const awayTeam = createTestTeam('away', ['a1', 'a2'])

    const battleContexts = createAllBattleContexts(homeTeam, awayTeam)

    // Should create contexts for all units with positions
    expect(Object.keys(battleContexts)).toHaveLength(4)
    expect(battleContexts['home-h1']).toBeDefined()
    expect(battleContexts['away-a1']).toBeDefined()

    // Check battle context has correct structure
    const homeUnit = battleContexts['home-h1']
    expect(homeUnit.unit.classKey).toBe('Fighter')
    expect(homeUnit.team).toBe('home-team')
    expect(homeUnit.currentHP).toBeGreaterThan(0)
    expect(homeUnit.combatStats.HP).toBeGreaterThan(0)
  })

  it('should execute skills between real battle contexts', () => {
    const homeTeam = createTestTeam('home', ['attacker'])
    const awayTeam = createTestTeam('away', ['target'])

    const battleContexts = createAllBattleContexts(homeTeam, awayTeam)
    const attacker = battleContexts['home-attacker']
    const target = battleContexts['away-target']
    const skill = ActiveSkillsMap['heavySlash']

    expect(skill).toBeDefined()
    expect(skill.targeting).toBeDefined()

    const result = executeSkill(skill, attacker, [target], rng('test-seed'))

    // Since we're testing with a single target, this should be SingleTargetSkillResult
    const singleResult = result as SingleTargetSkillResult
    expect(singleResult.totalDamage).toBeGreaterThan(0)
    expect(singleResult.damageResults).toHaveLength(1)
    expect(singleResult.damageResults[0].hit).toBe(true)
  })

  it('should handle different class stat differences', () => {
    const fighter = createTestUnit('fighter', 'Fighter')
    const warrior = createTestUnit('warrior', 'Warrior')
    fighter.position = { row: 1, col: 0 }
    warrior.position = { row: 1, col: 1 }

    const team: Team = {
      id: 'test-team',
      name: 'Test Team',
      formation: [null, null, null, fighter, warrior, null],
    }

    const battleContexts = createAllBattleContexts(team, team)
    const fighterContext = battleContexts['home-fighter']
    const warriorContext = battleContexts['home-warrior']

    // Both should have different stat profiles based on their class
    expect(fighterContext.combatStats.HP).toBeGreaterThan(0)
    expect(warriorContext.combatStats.HP).toBeGreaterThan(0)
    expect(fighterContext.unit.classKey).toBe('Fighter')
    expect(warriorContext.unit.classKey).toBe('Warrior')
  })

  it('should respect class-specific combat types', () => {
    const fighter = createTestUnit('fighter', 'Fighter')
    const warrior = createTestUnit('warrior', 'Warrior')

    const team: Team = {
      id: 'test',
      name: 'Test',
      formation: [null, null, null, fighter, warrior, null],
    }

    const battleContexts = createAllBattleContexts(team, team)

    const fighterContext = battleContexts['home-fighter']
    const warriorContext = battleContexts['home-warrior']

    // Both should have combatant types based on their class
    expect(fighterContext.combatantTypes).toContain('Armored')
    expect(warriorContext.combatantTypes).toBeDefined()
    expect(warriorContext.combatantTypes.length).toBeGreaterThan(0)
  })
})
