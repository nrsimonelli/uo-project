import { describe, it, expect } from 'vitest'

import { createMockBattleContext } from './utils/tactical-test-utils'

import { hasBuffs, hasDebuffs } from '@/core/battle/combat/status-effects'

/**
 * Simple status effects tests
 * Focuses on basic buff/debuff detection without complex stat recalculation
 */

describe('Status Effects Basic', () => {
  it('should detect units with buffs', () => {
    const unit = createMockBattleContext({
      buffs: [
        {
          name: 'test-buff',
          stat: 'PATK',
          value: 10,
          duration: 'Indefinite',
          scaling: 'flat',
          source: 'test-skill',
          skillId: '',
        },
      ],
    })

    expect(hasBuffs(unit)).toBe(true)
    expect(unit.buffs).toHaveLength(1)
    expect(unit.buffs[0].stat).toBe('PATK')
  })

  it('should detect units with debuffs', () => {
    const unit = createMockBattleContext({
      debuffs: [
        {
          name: 'test-debuff',
          stat: 'PATK',
          value: -5,
          duration: 'Indefinite',
          scaling: 'flat',
          source: 'test-skill',
          skillId: '',
        },
      ],
    })

    expect(hasDebuffs(unit)).toBe(true)
    expect(unit.debuffs).toHaveLength(1)
    expect(unit.debuffs[0].stat).toBe('PATK')
  })

  it('should handle units with no status effects', () => {
    const unit = createMockBattleContext()

    expect(hasBuffs(unit)).toBe(false)
    expect(hasDebuffs(unit)).toBe(false)
    expect(unit.buffs).toHaveLength(0)
    expect(unit.debuffs).toHaveLength(0)
  })

  it('should handle units with multiple status effects', () => {
    const unit = createMockBattleContext({
      buffs: [
        {
          name: 'Buff 1',
          stat: 'PATK',
          value: 10,
          duration: 'Indefinite',
          scaling: 'flat',
          source: 'skill1',
          skillId: '',
        },
        {
          name: 'Buff 2',
          stat: 'PDEF',
          value: 5,
          duration: 'Indefinite',
          scaling: 'flat',
          source: 'skill2',
          skillId: '',
        },
      ],
      debuffs: [
        {
          name: 'Debuff 1',
          stat: 'ACC',
          value: -10,
          duration: 'Indefinite',
          scaling: 'flat',
          source: 'skill3',
          skillId: '',
        },
      ],
    })

    expect(hasBuffs(unit)).toBe(true)
    expect(hasDebuffs(unit)).toBe(true)
    expect(unit.buffs).toHaveLength(2)
    expect(unit.debuffs).toHaveLength(1)
  })
})
