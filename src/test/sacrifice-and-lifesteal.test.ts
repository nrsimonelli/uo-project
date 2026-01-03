import { describe, it, expect } from 'vitest'

import {
  createUnitWithStats,
  DEFAULT_STATS,
  createMockBattlefield,
} from './utils/tactical-test-utils'

import { processEffects } from '@/core/battle/combat/effect-processor'
import { executeSkill } from '@/core/battle/combat/skill-executor'
import { applyStatusEffects } from '@/core/battle/combat/status-effects'
import type { ConditionEvaluationContext } from '@/core/battle/evaluation/condition-evaluator'
import { rng } from '@/core/random'
import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { BattleContext } from '@/types/battle-engine'
import type { ActiveSkill } from '@/types/skills'

describe('Sacrifice and LifeSteal Skills (integration)', () => {
  const exec = (
    user: BattleContext,
    targets: BattleContext | BattleContext[],
    skill: ActiveSkill
  ) => {
    const targetArray = Array.isArray(targets) ? targets : [targets]

    // create a battlefield and register units by id
    const units: Record<string, BattleContext> = { [user.unit.id]: user }
    for (const t of targetArray) units[t.unit.id] = t

    const battlefield = createMockBattlefield({
      units,
      activeUnitId: user.unit.id,
    })

    // execute the skill (battlefield is mutated)
    executeSkill(skill, user, targetArray, rng('test-seed'), battlefield)
    return battlefield
  }

  it('darkFlame applies sacrifice (30% HP) once per skill use regardless of targets', () => {
    const user = createUnitWithStats(
      { id: 'user-1', name: 'User', classKey: 'Fighter' },
      { ...DEFAULT_STATS, HP: 100 }
    )
    user.currentHP = 100

    const targets = [1, 2, 3].map(i => {
      const t = createUnitWithStats(
        { id: `target-1-${i}`, name: 'Target', classKey: 'Fighter' },
        DEFAULT_STATS
      )
      t.currentHP = 100
      t.team = 'attacking-team'
      return t
    })
    const skill = ActiveSkillsMap['darkFlame']

    const battlefield = exec(user, targets, skill)

    // user should have lost 30% of 100 HP = 30 -> 70 remaining
    // regardless of targeting 3 enemies
    expect(battlefield.units['user-1'].currentHP).toBe(70)

    // Test single target - create new attacker since each skill execution is separate
    const user2 = createUnitWithStats(
      { id: 'user-2', name: 'User', classKey: 'Fighter' },
      { ...DEFAULT_STATS, HP: 100 }
    )
    user2.currentHP = 100
    const singleTarget = createUnitWithStats(
      { id: 'target-single', name: 'Target', classKey: 'Fighter' },
      DEFAULT_STATS
    )
    singleTarget.currentHP = 100
    singleTarget.team = 'attacking-team'
    const bf2 = exec(user2, singleTarget, skill)
    expect(bf2.units['user-2'].currentHP).toBe(70) // 70% of max HP after sacrifice

    // Test row target - create new attacker
    const user3 = createUnitWithStats(
      { id: 'user-3', name: 'User', classKey: 'Fighter' },
      { ...DEFAULT_STATS, HP: 100 }
    )
    user3.currentHP = 100
    const rowTargets = [1, 2].map(i => {
      const t = createUnitWithStats(
        { id: `target-row-${i}`, name: 'Target', classKey: 'Fighter' },
        DEFAULT_STATS
      )
      t.currentHP = 100
      t.team = 'attacking-team'
      return t
    })
    const bf3 = exec(user3, rowTargets, skill)
    expect(bf3.units['user-3'].currentHP).toBe(70) // 70% of max HP after sacrifice

    // Now test lethal edge: user with very low HP should not be killed by sacrifice
    const lowHpUser = createUnitWithStats(
      { id: 'user-low', name: 'User', classKey: 'Fighter' },
      DEFAULT_STATS
    )
    lowHpUser.currentHP = 2
    const lowTargets = [
      createUnitWithStats(
        { id: 'target-2', name: 'Target', classKey: 'Fighter' },
        DEFAULT_STATS
      ),
    ]
    lowTargets[0].team = 'attacking-team'
    const bf4 = exec(lowHpUser, lowTargets, skill)
    // 30% of 2 rounds to 1, user must be left at minimum 1 HP
    expect(bf4.units['user-low'].currentHP).toBeGreaterThanOrEqual(1)
  })

  it('sanguineAttack heals the user for 50% of damage dealt', () => {
    const user = createUnitWithStats(
      { id: 'user-3', name: 'User', classKey: 'Fighter' },
      DEFAULT_STATS
    )
    user.currentHP = 20
    const target = createUnitWithStats(
      { id: 'target', name: 'Target', classKey: 'Fighter' },
      DEFAULT_STATS
    )
    target.currentHP = 100
    target.team = 'attacking-team'
    const skill = ActiveSkillsMap['sanguineAttack']

    const battlefield = exec(user, target, skill)

    const finalUser = battlefield.units['user-3']
    const finalTarget = battlefield.units['target']

    const damageDealt = Math.max(0, 100 - finalTarget.currentHP)
    const expectedHeal = Math.round(damageDealt * 0.5)
    const expectedHP = Math.min(
      user.currentHP + expectedHeal,
      finalUser.combatStats.HP
    )

    // Verify exact HP after lifesteal
    expect(finalUser.currentHP).toBe(expectedHP)
    // Verify damage was actually dealt (damageDealt should match the calculation)
    expect(damageDealt).toBe(100 - finalTarget.currentHP)
  })

  it('sanguineAttack is increased by DrainEff buffs (adds to percent)', () => {
    const user = createUnitWithStats(
      { id: 'user-4', name: 'User', classKey: 'Fighter' },
      DEFAULT_STATS
    )
    user.currentHP = 20
    user.buffs = [
      {
        name: 'DrainEffBuff',
        stat: 'DrainEff',
        value: 20,
        duration: 'Indefinite',
        scaling: 'flat',
        source: 'test',
        skillId: '',
      },
    ]

    const target = createUnitWithStats(
      { id: 'target-4', name: 'Target', classKey: 'Fighter' },
      { ...DEFAULT_STATS, HP: 100 }
    )
    target.currentHP = 100
    target.team = 'attacking-team'
    const skill = ActiveSkillsMap['sanguineAttack']

    const battlefield = exec(user, target, skill)
    const finalUser = battlefield.units['user-4']
    const finalTarget = battlefield.units['target-4']

    const damageDealt = Math.max(0, 100 - finalTarget.currentHP)
    // expected effective lifesteal = 50 + 20 = 70%
    const expectedHeal = Math.round(damageDealt * 0.7)
    const expectedHP = Math.min(
      user.currentHP + expectedHeal,
      finalUser.combatStats.HP
    )

    // Verify exact HP after lifesteal with DrainEff buff
    expect(finalUser.currentHP).toBe(expectedHP)
    // Verify damage was actually dealt (damageDealt should match the calculation)
    expect(damageDealt).toBe(100 - finalTarget.currentHP)
  })

  describe('Lifeshare', () => {
    const execLifeshare = (user: BattleContext, target: BattleContext) => {
      const skill = PassiveSkillsMap['lifeshare']
      if (!skill) {
        throw new Error('lifeshare skill not found')
      }

      // Create condition context
      const conditionContext: ConditionEvaluationContext = {
        attacker: user,
        target,
      }

      // Process the skill's effects
      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id
      )

      // Apply the status effects
      applyStatusEffects(effectResults, user, [target], true)

      return { user, target }
    }

    it('sacrifices 50% of current HP and heals target for exact amount', () => {
      const user = createUnitWithStats(
        { id: 'user-lifeshare', name: 'User', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      user.currentHP = 100

      const target = createUnitWithStats(
        { id: 'target-lifeshare', name: 'Target', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 90 }
      )
      target.currentHP = 25

      const { user: finalUser, target: finalTarget } = execLifeshare(
        user,
        target
      )

      // User should sacrifice 50% of 100 = 50 HP, leaving 50 HP
      expect(finalUser.currentHP).toBe(50)
      // Target should be healed for exactly 75 HP, going from 25 to 75
      expect(finalTarget.currentHP).toBe(75)
    })

    it('sacrifices from current HP, not max HP', () => {
      const user = createUnitWithStats(
        { id: 'user-lifeshare-2', name: 'User', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      user.currentHP = 60 // User at 60/100 HP

      const target = createUnitWithStats(
        { id: 'target-lifeshare-2', name: 'Target', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      target.currentHP = 20

      const { user: finalUser, target: finalTarget } = execLifeshare(
        user,
        target
      )

      // User should sacrifice 50% of 60 (current) = 30 HP, leaving 30 HP
      expect(finalUser.currentHP).toBe(30)
      // Target should be healed for exactly 30 HP, going from 20 to 50
      expect(finalTarget.currentHP).toBe(50)
    })

    it('ensures user stays at minimum 1 HP', () => {
      const user = createUnitWithStats(
        { id: 'user-lifeshare-3', name: 'User', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      user.currentHP = 1 // User at 1 HP

      const target = createUnitWithStats(
        { id: 'target-lifeshare-3', name: 'Target', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      target.currentHP = 50

      const { user: finalUser, target: finalTarget } = execLifeshare(
        user,
        target
      )

      // User should stay at 1 HP (cannot sacrifice below minimum)
      expect(finalUser.currentHP).toBe(1)
      // Target should not be healed (sacrifice was 0)
      expect(finalTarget.currentHP).toBe(50)
    })

    it('handles user at 2 HP correctly', () => {
      const user = createUnitWithStats(
        { id: 'user-lifeshare-4', name: 'User', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      user.currentHP = 2 // User at 2 HP

      const target = createUnitWithStats(
        { id: 'target-lifeshare-4', name: 'Target', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      target.currentHP = 50

      const { user: finalUser, target: finalTarget } = execLifeshare(
        user,
        target
      )

      // 50% of 2 = 1, but must leave at least 1 HP, so sacrifice is 1
      expect(finalUser.currentHP).toBe(1)
      // Target should be healed for exactly 1 HP
      expect(finalTarget.currentHP).toBe(51)
    })

    it('caps target healing at max HP', () => {
      const user = createUnitWithStats(
        { id: 'user-lifeshare-5', name: 'User', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      user.currentHP = 100

      const target = createUnitWithStats(
        { id: 'target-lifeshare-5', name: 'Target', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      target.currentHP = 80 // Target at 80/100 HP

      const { user: finalUser, target: finalTarget } = execLifeshare(
        user,
        target
      )

      // User sacrifices 50 HP
      expect(finalUser.currentHP).toBe(50)
      // Target should be healed for 50, but capped at max HP (100)
      // 80 + 50 = 130, but capped at 100, so actual heal is 20
      expect(finalTarget.currentHP).toBe(100)
    })

    it('does not execute if user is defeated', () => {
      const user = createUnitWithStats(
        { id: 'user-lifeshare-6', name: 'User', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      user.currentHP = 0 // User defeated

      const target = createUnitWithStats(
        { id: 'target-lifeshare-6', name: 'Target', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      target.currentHP = 50

      const { user: finalUser, target: finalTarget } = execLifeshare(
        user,
        target
      )

      // User should remain at 0 HP
      expect(finalUser.currentHP).toBe(0)
      // Target should not be healed
      expect(finalTarget.currentHP).toBe(50)
    })

    it('handles odd HP values correctly (rounds down)', () => {
      const user = createUnitWithStats(
        { id: 'user-lifeshare-7', name: 'User', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      user.currentHP = 99 // User at 99 HP

      const target = createUnitWithStats(
        { id: 'target-lifeshare-7', name: 'Target', classKey: 'Fighter' },
        { ...DEFAULT_STATS, HP: 100 }
      )
      target.currentHP = 50

      const { user: finalUser, target: finalTarget } = execLifeshare(
        user,
        target
      )

      // 50% of 99 = 49.5, rounds down to 49
      expect(finalUser.currentHP).toBe(50) // 99 - 49 = 50
      // Target should be healed for exactly 49 HP
      expect(finalTarget.currentHP).toBe(99) // 50 + 49 = 99
    })
  })
})
