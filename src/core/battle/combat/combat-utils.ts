import { ActiveSkillsMap } from '@/generated/skills-active'
import { PassiveSkillsMap } from '@/generated/skills-passive'

export const logCombat = (message: string, data?: unknown): void => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV !== 'production'
  ) {
    if (data !== undefined) {
      console.log(message, data)
    } else {
      console.log(message)
    }
  }
}

export const getSkillName = (skillId: string): string => {
  const activeSkill = ActiveSkillsMap[skillId as keyof typeof ActiveSkillsMap]
  if (activeSkill) return activeSkill.name

  const passiveSkill =
    PassiveSkillsMap[skillId as keyof typeof PassiveSkillsMap]
  if (passiveSkill) return passiveSkill.name

  return skillId // Fallback to skillId if skill not found
}
