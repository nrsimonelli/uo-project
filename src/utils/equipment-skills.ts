import type { EquipmentSkillId } from '@/types/equipment'

export const getSkillDisplayName = (
  skillId: EquipmentSkillId | null
): string => {
  if (!skillId) return ''

  // For now, just return the ID as the display name
  // Later, this could look up the actual skill name from the skills data
  return skillId
}
