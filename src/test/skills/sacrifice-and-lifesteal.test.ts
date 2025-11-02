import { describe, it, expect } from 'vitest'

import {
  createMockBattleContext,
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
    const baseStats = createMockBattleContext().combatStats

    const user = createMockBattleContext({
      combatStats: { ...baseStats, HP: 100 },
      statFoundation: { ...createMockBattleContext().statFoundation, HP: 100 },
      currentHP: 100,
    })
    user.unit.id = 'user-1'

    const targets = [1, 2, 3].map(i => {
      const t = createMockBattleContext({ currentHP: 100 })
      t.unit.id = `target-1-${i}`
      return t
    })
    const skill = ActiveSkillsMap['darkFlame']

    const battlefield = exec(user, targets, skill)

    // user should have lost 30% of 100 HP = 30 -> 70 remaining
    // regardless of targeting 3 enemies
    expect(battlefield.units['user-1'].currentHP).toBe(70)

    // Test single target - create new attacker since each skill execution is separate
    const user2 = createMockBattleContext({
      combatStats: { ...baseStats, HP: 100 },
      statFoundation: { ...createMockBattleContext().statFoundation, HP: 100 },
      currentHP: 100,
    })
    user2.unit.id = 'user-2'
    const singleTarget = createMockBattleContext({ currentHP: 100 })
    singleTarget.unit.id = 'target-single'
    const bf2 = exec(user2, singleTarget, skill)
    expect(bf2.units['user-2'].currentHP).toBe(70) // 70% of max HP after sacrifice

    // Test row target - create new attacker
    const user3 = createMockBattleContext({
      combatStats: { ...baseStats, HP: 100 },
      statFoundation: { ...createMockBattleContext().statFoundation, HP: 100 },
      currentHP: 100,
    })
    user3.unit.id = 'user-3'
    const rowTargets = [1, 2].map(i => {
      const t = createMockBattleContext({ currentHP: 100 })
      t.unit.id = `target-row-${i}`
      return t
    })
    const bf3 = exec(user3, rowTargets, skill)
    expect(bf3.units['user-3'].currentHP).toBe(70) // 70% of max HP after sacrifice

    // Now test lethal edge: user with very low HP should not be killed by sacrifice
    const lowHpUser = createMockBattleContext({ currentHP: 2 })
    lowHpUser.unit.id = 'user-low'
    const lowTargets = [createMockBattleContext()]
    lowTargets[0].unit.id = 'target-2'
    const bf4 = exec(lowHpUser, lowTargets, skill)
    // 30% of 2 rounds to 1, user must be left at minimum 1 HP
    expect(bf4.units['user-low'].currentHP).toBeGreaterThanOrEqual(1)
  })

  it('sanguineAttack heals the user for 50% of damage dealt', () => {
    const user = createMockBattleContext({ currentHP: 20 })
    user.unit.id = 'user-3'
    const target = createMockBattleContext({
      currentHP: 100,
      combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
    })
    target.unit.id = 'target-3'
    const skill = ActiveSkillsMap['sanguineAttack']

    const battlefield = exec(user, target, skill)

    const finalUser = battlefield.units['user-3']
    const finalTarget = battlefield.units['target-3']

    const damageDealt = Math.max(0, 100 - finalTarget.currentHP)
    const expectedHeal = Math.round(damageDealt * 0.5)

    expect(finalUser.currentHP).toBe(
      Math.min(user.currentHP + expectedHeal, finalUser.combatStats.HP)
    )
  })

  it('sanguineAttack is increased by DrainEff buffs (adds to percent)', () => {
    const user = createMockBattleContext({
      currentHP: 20,
      buffs: [
        {
          name: 'DrainEffBuff',
          stat: 'DrainEff',
          value: 20,
          duration: 'Indefinite',
          scaling: 'flat',
          source: 'test',
          skillId: '',
        },
      ],
    })
    user.unit.id = 'user-4'

    const target = createMockBattleContext({
      currentHP: 100,
      combatStats: { ...createMockBattleContext().combatStats, HP: 100 },
    })
    target.unit.id = 'target-4'
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
