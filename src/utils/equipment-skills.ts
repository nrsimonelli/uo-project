import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { EquipmentSkillId } from '@/types/equipment'

export const getSkillDisplayName = (skillId: EquipmentSkillId | null) => {
  if (!skillId) return ''

  if (skillId in PassiveSkillsMap) {
    return PassiveSkillsMap[skillId as keyof PassiveSkillsMap].name
  }

  if (skillId in ActiveSkillsMap) {
    return ActiveSkillsMap[skillId as keyof ActiveSkillsMap].name
  }

  return skillId
}
