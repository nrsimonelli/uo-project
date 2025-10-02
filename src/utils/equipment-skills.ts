import type { ActiveSkillsId } from '@/generated/skills-active'
import type { PassiveSkillsId } from '@/generated/skills-passive'
import type { EquipmentSkillId } from '@/types/equipment'

// Helper function to check if a skill ID exists in the current skill definitions
export function isKnownSkill(
  skillId: EquipmentSkillId
): skillId is ActiveSkillsId | PassiveSkillsId {
  // This would need to be updated when skills are added, but for now we can use a simple check
  // You could import the actual skill arrays and check against them
  return typeof skillId === 'string' && skillId.length > 0
}

// Helper function to get missing skills from equipment (for debugging/tracking)
export function findMissingSkills(
  equipment: Array<{ skillId: EquipmentSkillId | null }>
): string[] {
  const allSkillIds = equipment
    .map((item) => item.skillId)
    .filter((skillId): skillId is string => skillId !== null)

  // Remove duplicates
  const uniqueSkillIds = allSkillIds.filter((id, index, arr) => arr.indexOf(id) === index)

  // For now, return all non-null skills as potentially missing
  // This could be refined when you have the complete skills list
  return uniqueSkillIds
}

// Helper function to safely display skill names
export const getSkillDisplayName = (skillId: EquipmentSkillId | null): string => {
  if (!skillId) return ''

  // For now, just return the ID as the display name
  // Later, this could look up the actual skill name from the skills data
  return skillId
}
