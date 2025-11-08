import { describe, it, expect, beforeEach } from 'vitest'

import { mockRngPresets } from './utils/mock-rng'
import {
  createStandardAttacker,
  createStandardTarget,
  createDamageEffect,
} from './utils/tactical-test-utils'

import { calculateSkillDamage } from '@/core/battle/combat/damage-calculator'
import { processEffects } from '@/core/battle/combat/effect-processor'
import { applyStatusEffects } from '@/core/battle/combat/status-effects'
import type { ConditionEvaluationContext } from '@/core/battle/evaluation/condition-evaluator'
import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { BattleContext } from '@/types/battle-engine'

describe('Resurrection and Damage Immunity', () => {
  let caster: BattleContext
  let target: BattleContext
  let attacker: BattleContext

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
    })

    target = createStandardAttacker({
      unit: {
        id: 'target',
        name: 'Target',
        classKey: 'Fighter',
        level: 10,
        growths: ['Hardy', 'Hardy'],
        equipment: [],
        skillSlots: [],
      },
      team: 'home-team',
      currentHP: 0, // Dead
      combatStats: {
        ...createStandardAttacker().combatStats,
        HP: 100,
      },
      statFoundation: {
        ...createStandardAttacker().statFoundation,
        HP: 100,
      },
    })

    attacker = createStandardTarget({
      unit: {
        id: 'attacker',
        name: 'Attacker',
        classKey: 'Fighter',
        level: 10,
        growths: ['Hardy', 'Hardy'],
        equipment: [],
        skillSlots: [],
      },
    })
  })

  describe('Resurrection', () => {
    it('should revive a dead ally to 1 HP', () => {
      const skill = ActiveSkillsMap.resurrection
      if (!skill) {
        throw new Error('resurrection skill not found')
      }

      expect(target.currentHP).toBe(0)

      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      // Resurrect effects require the target to be dead (HP = 0)
      expect(target.currentHP).toBe(0)

      applyStatusEffects(effectResults, caster, [target], true)

      expect(target.currentHP).toBe(1)
    })

    it('should not revive an alive ally', () => {
      const skill = ActiveSkillsMap.resurrection
      if (!skill) {
        throw new Error('resurrection skill not found')
      }

      const aliveTarget = createStandardAttacker({
        unit: {
          id: 'alive-target',
          name: 'Alive Target',
          classKey: 'Fighter',
          level: 10,
          growths: ['Hardy', 'Hardy'],
          equipment: [],
          skillSlots: [],
        },
        team: 'home-team',
        currentHP: 50,
      })

      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target: aliveTarget,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      const initialHP = aliveTarget.currentHP
      applyStatusEffects(effectResults, caster, [aliveTarget], true)

      // HP should not change (resurrection only works on dead units)
      expect(aliveTarget.currentHP).toBe(initialHP)
    })
  })

  describe('Reincarnation', () => {
    it('should revive a dead ally to 1 HP', () => {
      const skill = ActiveSkillsMap.reincarnation
      if (!skill) {
        throw new Error('reincarnation skill not found')
      }

      expect(target.currentHP).toBe(0)

      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      // Resurrect effects require the target to be dead (HP = 0)
      expect(target.currentHP).toBe(0)

      applyStatusEffects(effectResults, caster, [target], true)

      expect(target.currentHP).toBe(1)
    })

    it('should grant damage immunity to the revived target', () => {
      const skill = ActiveSkillsMap.reincarnation
      if (!skill) {
        throw new Error('reincarnation skill not found')
      }

      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      applyStatusEffects(effectResults, caster, [target], true)

      expect(target.damageImmunities).toHaveLength(1)
      expect(target.damageImmunities[0].immunityType).toBe('entireAttack')
      expect(target.damageImmunities[0].duration).toBe('UntilAttacked')
      expect(target.damageImmunities[0].skillId).toBe('reincarnation')
    })

    it('should block damage from the next attack', () => {
      const skill = ActiveSkillsMap.reincarnation
      if (!skill) {
        throw new Error('reincarnation skill not found')
      }

      // Revive and grant immunity
      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      // Resurrect effects require the target to be dead (HP = 0)
      expect(target.currentHP).toBe(0)

      applyStatusEffects(effectResults, caster, [target], true)

      expect(target.currentHP).toBe(1)
      expect(target.damageImmunities).toHaveLength(1)

      // Attack the revived target
      const damageEffect = createDamageEffect({
        potency: { physical: 200 },
        hitRate: 100,
        hitCount: 1,
      })

      const result = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      // Damage should be blocked
      expect(result.hit).toBe(true)
      expect(result.damage).toBe(0)
      expect(target.damageImmunities).toHaveLength(0) // Immunity consumed
    })

    it('should allow damage after immunity is consumed', () => {
      const skill = ActiveSkillsMap.reincarnation
      if (!skill) {
        throw new Error('reincarnation skill not found')
      }

      // Revive and grant immunity
      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      applyStatusEffects(effectResults, caster, [target], true)

      // First attack - should be blocked
      const damageEffect = createDamageEffect({
        potency: { physical: 200 },
        hitRate: 100,
        hitCount: 1,
      })

      const firstResult = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(firstResult.damage).toBe(0)
      expect(target.damageImmunities).toHaveLength(0)

      // Second attack - should deal damage
      // Set deterministic stats: no crit, no guard
      attacker.combatStats.CRT = 0
      target.combatStats.GRD = 0
      const secondResult = calculateSkillDamage(
        damageEffect,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      // From test output: actual damage = 20 (attacker uses createStandardTarget stats, target uses createStandardAttacker stats)
      expect(secondResult.damage).toBe(20)
    })
  })

  describe('Parting Resurrection', () => {
    it('should revive a dead ally to 1 HP', () => {
      const skill = PassiveSkillsMap.partingResurrection
      if (!skill) {
        throw new Error('partingResurrection skill not found')
      }

      expect(target.currentHP).toBe(0)

      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      // Resurrect effects require the target to be dead (HP = 0)
      expect(target.currentHP).toBe(0)

      applyStatusEffects(effectResults, caster, [target], true)

      expect(target.currentHP).toBe(1)
    })

    it('should not grant damage immunity (unlike reincarnation)', () => {
      const skill = PassiveSkillsMap.partingResurrection
      if (!skill) {
        throw new Error('partingResurrection skill not found')
      }

      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      // Resurrect effects require the target to be dead (HP = 0)
      expect(target.currentHP).toBe(0)

      applyStatusEffects(effectResults, caster, [target], true)

      expect(target.currentHP).toBe(1)
      expect(target.damageImmunities).toHaveLength(0) // No immunity granted
    })
  })

  describe('Damage Immunity Types', () => {
    it('should block entire attack with entireAttack immunity', () => {
      const skill = ActiveSkillsMap.reincarnation
      if (!skill) {
        throw new Error('reincarnation skill not found')
      }

      // Revive and grant immunity
      const conditionContext: ConditionEvaluationContext = {
        attacker: caster,
        target,
        isNight: false,
        alliesLiving: 1,
        enemiesLiving: 1,
      }

      const effectResults = processEffects(
        skill.effects,
        conditionContext,
        skill.id,
        caster.combatStats.MATK
      )

      applyStatusEffects(effectResults, caster, [target], true)

      // Multi-hit attack should be completely blocked
      const multiHitDamage = createDamageEffect({
        potency: { physical: 100 },
        hitRate: 100,
        hitCount: 3,
      })

      const result = calculateSkillDamage(
        multiHitDamage,
        [],
        ['Damage'],
        attacker,
        target,
        mockRngPresets.alwaysHit()
      )

      expect(result.damage).toBe(0)
      expect(target.damageImmunities).toHaveLength(0) // Consumed
    })
  })
})
