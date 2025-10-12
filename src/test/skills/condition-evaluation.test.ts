import { describe, it, expect } from 'vitest'

import { createMockContext } from '../utils/test-factories'

import { evaluateCondition } from '@/core/condition-evaluator'
import type { Condition } from '@/types/conditions'

describe('Condition Evaluation', () => {
  describe('HP conditions', () => {
    it('should evaluate HP percentage correctly', () => {
      const condition: Condition = {
        kind: 'Stat',
        target: 'Enemy',
        stat: 'HP',
        comparator: 'GreaterThan',
        value: 50,
        percent: true
      }
      
      const context = createMockContext()
      const result = evaluateCondition(condition, context)
      
      // Target has 100/100 HP = 100% > 50%
      expect(result).toBe(true)
    })
  })

  describe('Combatant type conditions', () => {
    it('should evaluate combatant types', () => {
      const condition: Condition = {
        kind: 'CombatantType',
        target: 'Enemy',
        combatantType: 'Infantry',
        comparator: 'EqualTo'
      }
      
      const context = createMockContext()
      const result = evaluateCondition(condition, context)
      
      expect(result).toBe(true)
    })
  })
})