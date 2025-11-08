import { describe, it, expect } from 'vitest'

import {
  createUnitWithStats,
  DEFAULT_STATS,
  createMockBattlefield,
} from '../utils/tactical-test-utils'

import { executeSkill } from '@/core/battle/combat/skill-executor'
import { rng } from '@/core/random'
import { ActiveSkillsMap } from '@/generated/skills-active'
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
      t.team = 'away-team'
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
    singleTarget.team = 'away-team'
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
      t.team = 'away-team'
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
    lowTargets[0].team = 'away-team'
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
    target.team = 'away-team'
    const skill = ActiveSkillsMap['sanguineAttack']

    const battlefield = exec(user, target, skill)

    const finalUser = battlefield.units['user-3']
    const finalTarget = battlefield.units['target']

    const damageDealt = Math.max(0, 100 - finalTarget.currentHP)
    const expectedHeal = Math.round(damageDealt * 0.5)

    expect(finalUser.currentHP).toBe(
      Math.min(user.currentHP + expectedHeal, finalUser.combatStats.HP)
    )
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
    target.team = 'away-team'
    const skill = ActiveSkillsMap['sanguineAttack']

    const battlefield = exec(user, target, skill)
    const finalUser = battlefield.units['user-4']
    const finalTarget = battlefield.units['target-4']

    const damageDealt = Math.max(0, 100 - finalTarget.currentHP)
    // expected effective lifesteal = 50 + 20 = 70%
    const expectedHeal = Math.round(damageDealt * 0.7)

    expect(finalUser.currentHP).toBe(
      Math.min(user.currentHP + expectedHeal, finalUser.combatStats.HP)
    )
  })
})
