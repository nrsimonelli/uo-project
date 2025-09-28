// Class skill learning system
export interface ClassSkillEntry {
  skillId: string
  level: number
  skillType: 'active' | 'passive'
}

export interface ClassSkills {
  classId: string
  className: string
  weaponType?: string
  skills: ClassSkillEntry[]
}

// Example: Dark Marquess (Axe) class skills
export const CLASS_SKILLS: ClassSkills[] = [
  {
    classId: 'darkMarquessAxe',
    className: 'Dark Marquess',
    weaponType: 'Axe',
    skills: [
      { skillId: 'carnage', level: 1, skillType: 'active' },
      { skillId: 'deathSpin', level: 1, skillType: 'active' },
      { skillId: 'viciousTorment', level: 30, skillType: 'active' },
      { skillId: 'sanguinePursuit', level: 1, skillType: 'passive' },
      { skillId: 'eyeOfTheWarriorPrincess', level: 5, skillType: 'passive' },
      { skillId: 'painbringer', level: 20, skillType: 'passive' },
    ],
  },
  // Add more classes here...
]

// Helper functions
export function getSkillsForClass(classId: string): ClassSkillEntry[] {
  const classData = CLASS_SKILLS.find((c) => c.classId === classId)
  return classData?.skills || []
}

export function getSkillsLearnedAtLevel(
  classId: string,
  level: number
): ClassSkillEntry[] {
  const classSkills = getSkillsForClass(classId)
  return classSkills.filter((skill) => skill.level === level)
}

export function getAvailableSkillsAtLevel(
  classId: string,
  level: number
): ClassSkillEntry[] {
  const classSkills = getSkillsForClass(classId)
  return classSkills.filter((skill) => skill.level <= level)
}

export function getClassesWithSkill(
  skillId: string
): { classId: string; level: number }[] {
  const result: { classId: string; level: number }[] = []

  CLASS_SKILLS.forEach((classData) => {
    const skill = classData.skills.find((s) => s.skillId === skillId)
    if (skill) {
      result.push({ classId: classData.classId, level: skill.level })
    }
  })

  return result
}
