import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'

export const validateSkillReference = (skillId: string) => {
  const activeSkillExists = ActiveSkills.some(skill => skill.id === skillId)
  const passiveSkillExists = PassiveSkills.some(skill => skill.id === skillId)
  return activeSkillExists || passiveSkillExists
}
