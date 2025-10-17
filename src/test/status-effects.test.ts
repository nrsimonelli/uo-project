import { describe, it, expect } from 'vitest'

import { createMockBattleContext } from './utils/test-factories'

import type { EffectProcessingResult } from '@/core/battle/combat/effect-processor'
import {
  applyStatusEffects,
  hasBuffs,
  hasDebuffs,
  calculateStatModifier,
} from '@/core/battle/combat/status-effects'

describe('Status Effects', () => {
  it('should apply buffs correctly', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
    })

    const effectResults: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [
        {
          stat: 'PATK',
          value: 10,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-skill-1',
          stacks: false,
        },
      ],
      debuffsToApply: [],
      resourceStealToApply: [],
      debuffAmplificationsToApply: [],
      conferralsToApply: [],
    }

    // Verify target has no buffs initially
    expect(hasBuffs(target)).toBe(false)

    // Apply effects
    applyStatusEffects(effectResults, attacker, [target])

    // Verify buff was applied
    expect(hasBuffs(target)).toBe(true)
    expect(target.buffs).toHaveLength(1)
    expect(target.buffs[0]).toMatchObject({
      stat: 'PATK',
      value: 10,
      scaling: 'flat',
      skillId: 'test-skill-1',
      source: attacker.unit.id,
    })

    // Verify stat modifier calculation
    const modifier = calculateStatModifier(target, 'PATK')
    expect(modifier.flatModifier).toBe(10)
    expect(modifier.percentModifier).toBe(0)
  })

  it('should apply debuffs correctly', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
    })

    const effectResults: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [],
      debuffsToApply: [
        {
          stat: 'PDEF',
          value: 5,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-skill-2',
          stacks: false,
        },
      ],
      resourceStealToApply: [],
      debuffAmplificationsToApply: [],
      conferralsToApply: [],
    }

    // Apply effects
    applyStatusEffects(effectResults, attacker, [target])

    // Verify debuff was applied
    expect(hasDebuffs(target)).toBe(true)
    expect(target.debuffs).toHaveLength(1)
    expect(target.debuffs[0]).toMatchObject({
      stat: 'PDEF',
      value: 5,
      scaling: 'flat',
      skillId: 'test-skill-2',
    })

    // Verify stat modifier calculation (debuffs subtract)
    const modifier = calculateStatModifier(target, 'PDEF')
    expect(modifier.flatModifier).toBe(-5)
    expect(modifier.percentModifier).toBe(0)
  })

  it('should handle stacking logic correctly', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
    })

    // Apply first buff (no stacking)
    const firstEffect: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [
        {
          stat: 'PATK',
          value: 10,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-skill-3',
          stacks: false,
        },
      ],
      debuffsToApply: [],
      resourceStealToApply: [],
      debuffAmplificationsToApply: [],
      conferralsToApply: [],
    }

    applyStatusEffects(firstEffect, attacker, [target])
    expect(target.buffs).toHaveLength(1)
    expect(target.buffs[0].value).toBe(10)

    // Apply second buff with same skillId (should replace, not stack)
    const secondEffect: EffectProcessingResult = {
      ...firstEffect,
      buffsToApply: [
        {
          stat: 'PATK',
          value: 15,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-skill-3',
          stacks: false,
        },
      ],
    }

    applyStatusEffects(secondEffect, attacker, [target])
    expect(target.buffs).toHaveLength(1) // Still only one buff
    expect(target.buffs[0].value).toBe(15) // Value was replaced

    // Apply buff with stacks: true
    const stackingEffect: EffectProcessingResult = {
      ...firstEffect,
      buffsToApply: [
        {
          stat: 'PATK',
          value: 20,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-skill-3',
          stacks: true,
        },
      ],
    }

    applyStatusEffects(stackingEffect, attacker, [target])
    expect(target.buffs).toHaveLength(2) // Now we have two buffs

    // Total modifier should be 15 + 20 = 35
    const modifier = calculateStatModifier(target, 'PATK')
    expect(modifier.flatModifier).toBe(35)
  })

  it('should recalculate combat stats when buffs/debuffs change', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
      combatStats: {
        HP: 100,
        PATK: 50,
        PDEF: 40,
        MATK: 30,
        MDEF: 35,
        ACC: 85,
        EVA: 10,
        CRT: 15,
        GRD: 20,
        INIT: 100,
        GuardEff: 0,
      },
    })

    // Manually set stat foundation to match our expected test values
    // (bypassing the real base stat calculation for cleaner testing)
    target.statFoundation = {
      HP: 100,
      PATK: 50,
      PDEF: 40,
      MATK: 30,
      MDEF: 35,
      ACC: 85,
      EVA: 10,
      CRT: 15,
      GRD: 20,
      INIT: 100,
      GuardEff: 0,
    }
    attacker.statFoundation = {
      HP: 100,
      PATK: 50,
      PDEF: 40,
      MATK: 30,
      MDEF: 35,
      ACC: 85,
      EVA: 10,
      CRT: 15,
      GRD: 20,
      INIT: 100,
      GuardEff: 0,
    }

    // Original PATK should be 50

    const effectResults: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [
        {
          stat: 'PATK',
          value: 20, // +20 flat
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-skill',
          stacks: false,
        },
      ],
      debuffsToApply: [
        {
          stat: 'PATK',
          value: 30, // -30%
          scaling: 'percent' as const,
          target: 'Target' as const,
          skillId: 'test-skill-2',
          stacks: false,
        },
      ],
      resourceStealToApply: [],
      debuffAmplificationsToApply: [],
      conferralsToApply: [],
    }

    // Apply effects - this should trigger stat recalculation
    applyStatusEffects(effectResults, attacker, [target])

    // Expected calculation: (50 base + 20 flat) * (1 - 0.30) = 70 * 0.7 = 49
    expect(target.combatStats.PATK).toBe(49)
  })

  it('should handle additive percentage scaling correctly', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
      combatStats: {
        HP: 100,
        PATK: 100,
        PDEF: 40,
        MATK: 30,
        MDEF: 35,
        ACC: 85,
        EVA: 10,
        CRT: 15,
        GRD: 20,
        INIT: 100,
        GuardEff: 0,
      },
    })

    // Manually set stat foundation to match our expected test values
    target.statFoundation = {
      HP: 100,
      PATK: 100,
      PDEF: 40,
      MATK: 30,
      MDEF: 35,
      ACC: 85,
      EVA: 10,
      CRT: 15,
      GRD: 20,
      INIT: 100,
      GuardEff: 0,
    }
    attacker.statFoundation = {
      HP: 100,
      PATK: 100,
      PDEF: 40,
      MATK: 30,
      MDEF: 35,
      ACC: 85,
      EVA: 10,
      CRT: 15,
      GRD: 20,
      INIT: 100,
      GuardEff: 0,
    }

    // Apply multiple percentage modifiers: +15%, +30%, -20%
    const effects = [
      { value: 15, scaling: 'percent' as const, skillId: 'buff-1' },
      { value: 30, scaling: 'percent' as const, skillId: 'buff-2' },
      { value: 20, scaling: 'percent' as const, skillId: 'debuff-1' },
    ]

    // Apply buffs
    effects.slice(0, 2).forEach(effect => {
      const effectResults: EffectProcessingResult = {
        potencyModifiers: { physical: 0, magical: 0 },
        defenseIgnoreFraction: 0,
        grantedFlags: [],
        healPercent: 0,
        healPotency: { physical: 0, magical: 0 },
        apGain: 0,
        ppGain: 0,
        buffsToApply: [
          {
            stat: 'PATK',
            value: effect.value,
            scaling: effect.scaling,
            target: 'Target' as const,
            skillId: effect.skillId,
            stacks: true, // Allow stacking
          },
        ],
        debuffsToApply: [],
        resourceStealToApply: [],
        debuffAmplificationsToApply: [],
        conferralsToApply: [],
      }
      applyStatusEffects(effectResults, attacker, [target])
    })

    // Apply debuff
    const debuffResults: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [],
      debuffsToApply: [
        {
          stat: 'PATK',
          value: 20,
          scaling: 'percent' as const,
          target: 'Target' as const,
          skillId: 'debuff-1',
          stacks: false,
        },
      ],
      resourceStealToApply: [],
      debuffAmplificationsToApply: [],
      conferralsToApply: [],
    }
    applyStatusEffects(debuffResults, attacker, [target])

    // Expected: 100 * (1 + 0.15 + 0.30 - 0.20) = 100 * 1.25 = 125
    expect(target.combatStats.PATK).toBe(125)
  })

  it('should enforce stat minimums correctly', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
      combatStats: {
        HP: 10,
        PATK: 10,
        PDEF: 10,
        MATK: 10,
        MDEF: 10,
        ACC: 10,
        EVA: 10,
        CRT: 10,
        GRD: 10,
        INIT: 10,
        GuardEff: 0,
      },
    })

    // Manually set stat foundation to match our expected test values
    target.statFoundation = {
      HP: 10,
      PATK: 10,
      PDEF: 10,
      MATK: 10,
      MDEF: 10,
      ACC: 10,
      EVA: 10,
      CRT: 10,
      GRD: 10,
      INIT: 10,
      GuardEff: 0,
    }
    attacker.statFoundation = {
      HP: 10,
      PATK: 10,
      PDEF: 10,
      MATK: 10,
      MDEF: 10,
      ACC: 10,
      EVA: 10,
      CRT: 10,
      GRD: 10,
      INIT: 10,
      GuardEff: 0,
    }

    // Apply massive debuff that should reduce stats to minimums
    const effectResults: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [],
      debuffsToApply: [
        {
          stat: 'HP',
          value: 200, // -200%
          scaling: 'percent' as const,
          target: 'Target' as const,
          skillId: 'massive-debuff',
          stacks: false,
        },
        {
          stat: 'PATK',
          value: 200, // -200%
          scaling: 'percent' as const,
          target: 'Target' as const,
          skillId: 'massive-debuff-2',
          stacks: false,
        },
      ],
      resourceStealToApply: [],
      debuffAmplificationsToApply: [],
      conferralsToApply: [],
    }

    applyStatusEffects(effectResults, attacker, [target])

    // HP should be clamped to minimum 1, PATK can go to 0
    expect(target.combatStats.HP).toBe(1)
    expect(target.combatStats.PATK).toBe(0)
  })

  it('should amplify debuffs when DebuffAmplification is applied', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
      combatStats: {
        HP: 100,
        PATK: 100,
        PDEF: 100,
        MATK: 100,
        MDEF: 100,
        ACC: 100,
        EVA: 100,
        CRT: 100,
        GRD: 100,
        INIT: 100,
        GuardEff: 0,
      },
    })
    target.statFoundation = {
      HP: 100,
      PATK: 100,
      PDEF: 100,
      MATK: 100,
      MDEF: 100,
      ACC: 100,
      EVA: 100,
      CRT: 100,
      GRD: 100,
      INIT: 100,
      GuardEff: 0,
    }

    // Apply debuff amplification first
    const amplificationResults: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [],
      debuffsToApply: [],
      resourceStealToApply: [],
      debuffAmplificationsToApply: [
        {
          multiplier: 1.5,
          target: 'Target' as const,
          skillId: 'compoundingCurse',
        },
      ],
      conferralsToApply: [],
    }
    applyStatusEffects(amplificationResults, attacker, [target])

    // Apply both percentage and flat debuffs (-20% PATK, -10 INIT)
    const debuffResults: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [],
      resourceStealToApply: [],
      debuffAmplificationsToApply: [],
      conferralsToApply: [],
      debuffsToApply: [
        {
          stat: 'PATK',
          value: 20,
          scaling: 'percent' as const,
          target: 'Target' as const,
          skillId: 'offensiveCurse',
          stacks: false,
        },
        {
          stat: 'INIT',
          value: 10,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'passiveCurse',
          stacks: false,
        },
      ],
    }
    applyStatusEffects(debuffResults, attacker, [target])

    // Expected: 100 * (1 - 0.20 * 1.5) = 100 * (1 - 0.30) = 70 for PATK
    // Expected: 100 - (10 * 1.5) = 100 - 15 = 85 for INIT
    expect(target.combatStats.PATK).toBe(70)
    expect(target.combatStats.INIT).toBe(85)
  })
})
