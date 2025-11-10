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
      dews: {
        HP: 0,
        PATK: 0,
        PDEF: 0,
        MATK: 0,
        MDEF: 0,
        ACC: 0,
        EVA: 0,
        CRT: 0,
        GRD: 0,
        INIT: 0,
      },
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
    // Units should be created with currentHP equal to max HP
    expect(homeUnit.currentHP).toBe(homeUnit.combatStats.HP)
    expect(homeUnit.combatStats.HP).toBeGreaterThan(0) // Sanity check that HP is calculated
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

    // Set deterministic stats for exact damage calculation
    attacker.combatStats.CRT = 0
    target.combatStats.GRD = 0
    const result = executeSkill(skill, attacker, [target], rng('test-seed'))

    // Since we're testing with a single target, this should be SingleTargetSkillResult
    const singleResult = result as SingleTargetSkillResult
    expect(singleResult.damageResults).toHaveLength(1)
    expect(singleResult.damageResults[0].hit).toBe(true)
    // heavySlash has 150% physical potency
    // Verify damage breakdown is consistent
    const damageResult = singleResult.damageResults[0]
    // baseDamage is now raw (attack - defense) which can be negative, so check afterPotency instead
    expect(damageResult.breakdown.afterPotency).toBeGreaterThan(0)
    // Verify final damage matches the breakdown
    expect(singleResult.totalDamage).toBe(damageResult.damage)
    // Verify damage is calculated correctly through all steps
    expect(damageResult.breakdown.afterDmgReduction).toBe(
      singleResult.totalDamage
    )
    // Verify all breakdown steps are present and consistent
    // baseDamage is raw (attack - defense), afterPotency is after potency
    // For heavySlash with 150% potency, afterPotency should be 1.5x baseDamage (if baseDamage is positive)
    if (damageResult.breakdown.rawBaseDamage > 0) {
      expect(damageResult.breakdown.afterPotency).toBeGreaterThanOrEqual(
        damageResult.breakdown.rawBaseDamage
      )
    }
    expect(damageResult.breakdown.afterCrit).toBeGreaterThanOrEqual(
      damageResult.breakdown.rawBaseDamage
    )
    expect(damageResult.breakdown.afterGuard).toBeGreaterThanOrEqual(
      damageResult.breakdown.afterCrit
    )
    expect(damageResult.breakdown.afterEffectiveness).toBeGreaterThanOrEqual(
      damageResult.breakdown.afterGuard
    )
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
    // Units should start at full HP
    expect(fighterContext.currentHP).toBe(fighterContext.combatStats.HP)
    expect(warriorContext.currentHP).toBe(warriorContext.combatStats.HP)
    // Fighter and Warrior should have different HP values (Fighter: 90 base, Warrior: 100 base at level 10)
    expect(fighterContext.combatStats.HP).toBeGreaterThan(0)
    expect(warriorContext.combatStats.HP).toBeGreaterThan(0)
    expect(fighterContext.combatStats.HP).not.toBe(
      warriorContext.combatStats.HP
    ) // Different classes = different stats
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
    expect(fighterContext.combatantTypes).toContain('Armored') // Fighter has Armored trait
    expect(warriorContext.combatantTypes).toBeDefined()
    // Warrior should have at least one combatant type (Infantry movement type)
    expect(warriorContext.combatantTypes.length).toBeGreaterThanOrEqual(1)
    // Verify they have the expected movement type
    expect(warriorContext.combatantTypes).toContain('Infantry')
  })
})
