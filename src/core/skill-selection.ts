import { STANDBY_SKILL, getDefaultTargets } from './skill-targeting'
import { evaluateSkillSlotTactics } from './tactical-targeting'

import { ActiveSkillsMap } from '@/generated/skills-active'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { ActiveSkill } from '@/types/skills'

interface SkillSelection {
  skill: ActiveSkill
  targets: BattleContext[] // All targets that should be affected by the skill
}

/**
 * Find the first affordable active skill from a unit's skill slots and its valid targets
 * Skills are checked in slot order priority
 * Returns both the selected skill and all targets that should be affected based on the skill's targeting pattern
 */
export const selectActiveSkill = (
  unit: BattleContext,
  battlefield: BattlefieldState
): SkillSelection => {
  // Skip if unit has no AP (should not happen due to actionable checks)
  if (unit.currentAP <= 0) {
    console.warn(
      `Unit ${unit.unit.name} has no AP but was asked to select skill`
    )
    const standbyTargets = getDefaultTargets(STANDBY_SKILL, unit, battlefield)
    return { skill: STANDBY_SKILL, targets: standbyTargets }
  }

  // Check if unit has any skill slots
  if (!unit.unit.skillSlots || unit.unit.skillSlots.length === 0) {
    const standbyTargets = getDefaultTargets(STANDBY_SKILL, unit, battlefield)
    return { skill: STANDBY_SKILL, targets: standbyTargets }
  }

  // Go through skill slots and find the first usable active skill using tactical evaluation
  for (const skillSlot of unit.unit.skillSlots) {
    // Check if this is a valid active skill slot
    if (!skillSlot.skillId || skillSlot.skillType !== 'active') {
      // Skip invalid or non-active slots
      continue
    }

    // Get the skill data to check AP cost
    const skill = ActiveSkillsMap[
      skillSlot.skillId as keyof typeof ActiveSkillsMap
    ] as ActiveSkill
    if (!skill) {
      console.warn(`Active skill not found: ${skillSlot.skillId}`)
      continue
    }

    // Check if unit can afford this skill before tactical evaluation
    if (skill.ap > unit.currentAP) {
      continue // Skip unaffordable skills
    }

    // Use tactical evaluation to determine if skill should be used and get targets
    const tacticalResult = evaluateSkillSlotTactics(
      skillSlot,
      unit,
      battlefield
    )

    if (tacticalResult.shouldUseSkill && tacticalResult.targets.length > 0) {
      return { skill, targets: tacticalResult.targets }
    }
    // If tactics say don't use this skill or no valid targets, continue to next skill
  }

  // No affordable skills found - use Standby
  // Note: Only use Standby if unit has at least 1 AP (per requirements)
  if (unit.currentAP > 0) {
    const standbyTargets = getDefaultTargets(STANDBY_SKILL, unit, battlefield)
    return { skill: STANDBY_SKILL, targets: standbyTargets }
  }

  // This should not happen if actionable checks are working correctly
  console.error(
    `❌ ${unit.unit.name} has 0 AP and was asked to select skill - this should not happen`
  )
  const standbyTargets = getDefaultTargets(STANDBY_SKILL, unit, battlefield)
  return { skill: STANDBY_SKILL, targets: standbyTargets }
}
