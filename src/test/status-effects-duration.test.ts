import { describe, it, expect } from 'vitest'

import { createMockBattleContext } from './utils/test-factories'

import type { EffectProcessingResult } from '@/core/battle/combat/effect-processor'
import {
  applyStatusEffects,
  removeExpiredBuffs,
  removeExpiredDebuffs,
} from '@/core/battle/combat/status-effects'

describe('Status Effect Duration Handling', () => {
  it('should remove next-attack buffs when unit attacks', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
    })

    // Manually set stat foundation for predictable behavior
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

    // Apply buff with next-attack duration
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
          value: 20,
          scaling: 'flat' as const,
          target: 'User' as const,
          skillId: 'test-next-attack-buff',
          stacks: false,
          duration: 'NextAction',
        },
      ],
      debuffsToApply: [],
      resourceStealToApply: [],
    }

    // Apply the buff
    applyStatusEffects(effectResults, attacker, [target])

    // Verify buff is applied
    expect(attacker.buffs).toHaveLength(1)
    expect(attacker.buffs[0].duration).toBe('next-attack')

    // Simulate attack - remove expired effects
    removeExpiredBuffs(attacker, 'attack')

    // Verify buff is removed
    expect(attacker.buffs).toHaveLength(0)
  })

  it('should remove next-debuff buffs when unit receives debuff', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
    })

    // Manually set stat foundation
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

    // Apply defensive buff that expires when receiving debuff
    let effectResults: EffectProcessingResult = {
      potencyModifiers: { physical: 0, magical: 0 },
      defenseIgnoreFraction: 0,
      grantedFlags: [],
      healPercent: 0,
      healPotency: { physical: 0, magical: 0 },
      apGain: 0,
      ppGain: 0,
      buffsToApply: [
        {
          stat: 'PDEF',
          value: 15,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-next-debuff-buff',
          stacks: false,
          // Note: 'NextAction' is not exactly 'next-debuff', but let's manually test
        },
      ],
      debuffsToApply: [],
      resourceStealToApply: [],
    }

    applyStatusEffects(effectResults, attacker, [target])

    // Manually set duration to next-debuff for testing
    target.buffs[0].duration = 'next-debuff'

    // Verify buff is applied
    expect(target.buffs).toHaveLength(1)
    expect(target.buffs[0].duration).toBe('next-debuff')

    // Now apply a debuff - this should trigger buff removal
    effectResults = {
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
          value: 10,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-debuff',
          stacks: false,
        },
      ],
      resourceStealToApply: [],
    }

    // Apply debuff - this should remove the next-debuff buff
    applyStatusEffects(effectResults, attacker, [target])

    // Verify next-debuff buff is removed and debuff is applied
    expect(target.buffs).toHaveLength(0) // Buff should be removed
    expect(target.debuffs).toHaveLength(1) // Debuff should be applied
  })

  it('should keep indefinite effects until explicitly removed', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
    })

    // Manually set stat foundation
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

    // Apply indefinite buff
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
          value: 25,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-indefinite-buff',
          stacks: false,
          // No duration specified = indefinite
        },
      ],
      debuffsToApply: [
        {
          stat: 'PDEF',
          value: 5,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'test-indefinite-debuff',
          stacks: false,
          // No duration specified = indefinite
        },
      ],
      resourceStealToApply: [],
    }

    applyStatusEffects(effectResults, attacker, [target])

    // Verify effects are applied
    expect(target.buffs).toHaveLength(1)
    expect(target.debuffs).toHaveLength(1)
    expect(target.buffs[0].duration).toBe('indefinite')
    expect(target.debuffs[0].duration).toBe('indefinite')

    // Simulate multiple attacks and debuff applications
    removeExpiredBuffs(target, 'attack')
    removeExpiredDebuffs(target, 'attack')
    removeExpiredBuffs(target, 'debuff')

    // Indefinite effects should remain
    expect(target.buffs).toHaveLength(1)
    expect(target.debuffs).toHaveLength(1)
  })

  it('should remove next-attack debuffs when unit attacks', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
    })

    // Manually set stat foundation
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

    // Apply debuff with next-attack duration to the attacker
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
          stat: 'PATK',
          value: 10,
          scaling: 'flat' as const,
          target: 'User' as const, // Apply to attacker
          skillId: 'test-next-attack-debuff',
          stacks: false,
          duration: 'NextAction',
        },
      ],
      resourceStealToApply: [],
    }

    applyStatusEffects(effectResults, attacker, [target])

    // Verify debuff is applied
    expect(attacker.debuffs).toHaveLength(1)
    expect(attacker.debuffs[0].duration).toBe('next-attack')

    // Simulate attack - remove expired effects
    removeExpiredDebuffs(attacker, 'attack')

    // Verify debuff is removed
    expect(attacker.debuffs).toHaveLength(0)
  })

  it('should properly recalculate stats after removing expired effects', () => {
    const attacker = createMockBattleContext({
      unit: { id: 'attacker-1' },
      team: 'home-team',
    })
    const target = createMockBattleContext({
      unit: { id: 'target-1' },
      team: 'away-team',
    })

    // Set up stat foundation
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

    // Apply multiple effects: permanent buff and next-attack buff
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
          value: 20,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'permanent-buff',
          stacks: true,
          // indefinite duration
        },
        {
          stat: 'PATK',
          value: 15,
          scaling: 'flat' as const,
          target: 'Target' as const,
          skillId: 'temporary-buff',
          stacks: true,
          duration: 'NextAction', // next-attack
        },
      ],
      debuffsToApply: [],
      resourceStealToApply: [],
    }

    applyStatusEffects(effectResults, attacker, [target])

    // Verify both buffs are applied and stats calculated correctly
    expect(target.buffs).toHaveLength(2)
    expect(target.combatStats.PATK).toBe(50 + 20 + 15) // 85

    // Remove next-attack buffs
    removeExpiredBuffs(target, 'attack')

    // Verify only the permanent buff remains and stats recalculated
    expect(target.buffs).toHaveLength(1)
    expect(target.buffs[0].skillId).toBe('permanent-buff')
    expect(target.combatStats.PATK).toBe(50 + 20) // 70
  })
})
