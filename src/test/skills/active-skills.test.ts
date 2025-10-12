import { describe, it, expect } from 'vitest'

import { mockRngPresets } from '../utils/mock-rng'
import { testSkillDamage } from '../utils/skill-test-helpers'
import { createMockContext } from '../utils/test-factories'

import { ActiveSkillsMap } from '@/generated/skills-active'

describe('Active Skills', () => {
  describe('Heavy Slash', () => {
    it('should deal damage', () => {
      const skill = ActiveSkillsMap['heavySlash']
      const context = createMockContext()
      
      const result = testSkillDamage(skill, context, mockRngPresets.alwaysHit())
      
      expect(result.hit).toBe(true)
      expect(result.damage).toBeGreaterThan(0)
    })
  })

  describe('Iron Crusher', () => {
    it('should deal damage', () => {
      const skill = ActiveSkillsMap['ironCrusher']
      const context = createMockContext()
      
      const result = testSkillDamage(skill, context, mockRngPresets.alwaysHit())
      
      expect(result.hit).toBe(true)
      expect(result.damage).toBeGreaterThan(0)
    })
  })
})