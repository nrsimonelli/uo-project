import { STANDBY_SKILL } from './skill-targeting'

import { ActiveSkillsMap } from '@/generated/skills-active'
import type { BattleContext } from '@/types/battle-engine'
import type { ActiveSkill } from '@/types/skills'

/**
 * Find the first affordable active skill from a unit's skill slots
 * Skills are checked in slot order priority
 */
export const selectActiveSkill = (unit: BattleContext): ActiveSkill => {
  // Skip if unit has no AP (should not happen due to actionable checks)
  if (unit.currentAP <= 0) {
    console.warn(`Unit ${unit.unit.name} has no AP but was asked to select skill`)
    return STANDBY_SKILL
  }

  // Check if unit has any skill slots
  if (!unit.unit.skillSlots || unit.unit.skillSlots.length === 0) {
    console.log(`💭 ${unit.unit.name} has no skill slots - using Standby`)
    return STANDBY_SKILL
  }

  // Go through skill slots and find the first affordable active skill
  for (const skillSlot of unit.unit.skillSlots) {
    // Check if this is a valid active skill slot
    if (!skillSlot.skillId || skillSlot.skillType !== 'active') {
      // Skip invalid or non-active slots
      continue
    }

    // Get the skill data
    const skill = ActiveSkillsMap[skillSlot.skillId as keyof typeof ActiveSkillsMap]
    if (!skill) {
      console.warn(`Active skill not found: ${skillSlot.skillId}`)
      continue
    }

    // Check if unit can afford this skill
    if (skill.ap <= unit.currentAP) {
      console.log(`✅ ${unit.unit.name} selected skill: ${skill.name} (${skill.ap} AP)`)
      return skill
    } else {
      console.log(`⚠️ ${unit.unit.name} cannot afford ${skill.name} (${skill.ap} AP, has ${unit.currentAP} AP)`)
    }
  }

  // No affordable skills found - use Standby
  // Note: Only use Standby if unit has at least 1 AP (per requirements)
  if (unit.currentAP > 0) {
    console.log(`📥 ${unit.unit.name} using Standby - no affordable skills`)
    return STANDBY_SKILL
  }

  // This should not happen if actionable checks are working correctly
  console.error(`❌ ${unit.unit.name} has 0 AP and was asked to select skill - this should not happen`)
  return STANDBY_SKILL
}