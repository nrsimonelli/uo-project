// Example usage of the class skill system

import { 
  getSkillsForClass, 
  getSkillsLearnedAtLevel, 
  getAvailableSkillsAtLevel,
  getClassesWithSkill 
} from '../data/class-skills'

// Example: Get all skills for Dark Marquess (Axe)
const darkMarquessSkills = getSkillsForClass('darkMarquessAxe')
console.log('Dark Marquess Skills:', darkMarquessSkills)
// Output: [
//   { skillId: 'carnage', level: 1, skillType: 'active' },
//   { skillId: 'deathSpin', level: 1, skillType: 'active' },
//   { skillId: 'viciousTorment', level: 30, skillType: 'active' },
//   { skillId: 'sanguinePursuit', level: 1, skillType: 'passive' },
//   { skillId: 'eyeOfTheWarriorPrincess', level: 5, skillType: 'passive' },
//   { skillId: 'painbringer', level: 20, skillType: 'passive' }
// ]

// Example: What skills does a level 5 Dark Marquess learn?
const level5Skills = getSkillsLearnedAtLevel('darkMarquessAxe', 5)
console.log('Skills learned at level 5:', level5Skills)
// Output: [{ skillId: 'eyeOfTheWarriorPrincess', level: 5, skillType: 'passive' }]

// Example: What skills are available to a level 20 Dark Marquess?
const availableSkills = getAvailableSkillsAtLevel('darkMarquessAxe', 20)
console.log('Skills available at level 20:', availableSkills)
// Output: All skills except 'viciousTorment' (requires level 30)

// Example: Which classes can learn the 'carnage' skill?
const classesWithCarnage = getClassesWithSkill('carnage')
console.log('Classes that learn Carnage:', classesWithCarnage)
// Output: [{ classId: 'darkMarquessAxe', level: 1 }]

// Example: Character progression system
interface Character {
  id: string
  name: string
  classId: string
  level: number
  learnedSkills: string[]
}

function levelUpCharacter(character: Character, newLevel: number): string[] {
  const newSkills: string[] = []
  
  // Check each level from current+1 to new level
  for (let level = character.level + 1; level <= newLevel; level++) {
    const skillsAtLevel = getSkillsLearnedAtLevel(character.classId, level)
    
    skillsAtLevel.forEach(skill => {
      if (!character.learnedSkills.includes(skill.skillId)) {
        character.learnedSkills.push(skill.skillId)
        newSkills.push(skill.skillId)
      }
    })
  }
  
  character.level = newLevel
  return newSkills
}

// Example usage
const myCharacter: Character = {
  id: 'char1',
  name: 'Alain',
  classId: 'darkMarquessAxe',
  level: 1,
  learnedSkills: ['carnage', 'deathSpin', 'sanguinePursuit'] // Level 1 skills
}

// Level up to 20
const newSkills = levelUpCharacter(myCharacter, 20)
console.log('New skills learned:', newSkills)
// Output: ['eyeOfTheWarriorPrincess', 'painbringer']

// Example: Skill validation for battle
function canUseSkill(character: Character, skillId: string): boolean {
  return character.learnedSkills.includes(skillId)
}

// Example: Get skill details for UI
function getCharacterSkillDetails(character: Character) {
  const classSkills = getSkillsForClass(character.classId)
  
  return classSkills.map(skill => ({
    ...skill,
    isLearned: character.learnedSkills.includes(skill.skillId),
    canLearn: skill.level <= character.level,
    levelsUntilUnlock: Math.max(0, skill.level - character.level)
  }))
}

export {
  levelUpCharacter,
  canUseSkill,
  getCharacterSkillDetails
}