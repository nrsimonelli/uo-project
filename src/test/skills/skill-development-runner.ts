import { mockRngPresets } from '../utils/mock-rng'
import { testSkillDamage } from '../utils/skill-test-helpers'
import { createMockContext } from '../utils/test-factories'

import { ActiveSkillsMap } from '@/generated/skills-active'

/**
 * Simple skill testing runner
 */
export function testAllSkills() {
  const skills = Object.values(ActiveSkillsMap)
  const results = []

  console.log(`Testing ${skills.length} skills...`)

  for (const skill of skills) {
    try {
      const context = createMockContext()
      const result = testSkillDamage(skill, context, mockRngPresets.alwaysHit())

      results.push({
        skill: skill.name,
        success: true,
        damage: result.damage,
        hit: result.hit,
      })

      console.log(`✓ ${skill.name}: ${result.damage} damage`)
    } catch (error) {
      results.push({
        skill: skill.name,
        success: false,
        error: error,
      })

      console.log(`✗ ${skill.name}: ${error}`)
    }
  }

  const successful = results.filter(r => r.success).length
  console.log(`\nResults: ${successful}/${skills.length} skills working`)

  return results
}
