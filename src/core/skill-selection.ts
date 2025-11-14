import {
  getDefaultTargets,
  STANDBY_SKILL,
} from '@/core/battle/targeting/skill-targeting'
import { evaluateSkillSlotTactics } from '@/core/battle/targeting/tactical-targeting'
import { ActiveSkillsMap } from '@/generated/skills-active'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { ActiveSkill } from '@/types/skills'

interface SkillSelection {
  skill: ActiveSkill
  targets: BattleContext[] // All targets that should be affected by the skill
}

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

  // Check each skill slot in priority order
  for (const skillSlot of unit.unit.skillSlots) {
    // Only process valid active skill slots
    if (skillSlot.skillId && skillSlot.skillType === 'active') {
      // Get the skill data and verify it exists
      const skill = ActiveSkillsMap[
        skillSlot.skillId as keyof typeof ActiveSkillsMap
      ] as ActiveSkill

      if (skill && skill.ap <= unit.currentAP) {
        // Check tactical evaluation for valid targets
        const tacticalResult = evaluateSkillSlotTactics(
          skillSlot,
          unit,
          battlefield
        )

        // If this skill should be used and has valid targets, return it
        if (
          tacticalResult.shouldUseSkill &&
          tacticalResult.targets.length > 0
        ) {
          return { skill, targets: tacticalResult.targets }
        }
      } else if (!skill) {
        console.warn(`Active skill not found: ${skillSlot.skillId}`)
      }
    }
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
