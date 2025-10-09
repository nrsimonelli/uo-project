import { getEquipmentById } from '@/core/equipment-lookup'
import { generateRandomId } from '@/core/helpers'
import { CLASS_DATA } from '@/data/units/class-data'
import {
  ActiveSkillsMap,
  type ActiveSkillsId,
  type ActiveSkillsMap as ActiveSkillsMapType,
} from '@/generated/skills-active'
import {
  PassiveSkillsMap,
  type PassiveSkillsId,
  type PassiveSkillsMap as PassiveSkillsMapType,
} from '@/generated/skills-passive'
import type { AllClassType, BaseClassType } from '@/types/base-stats'
import type { SkillSlot } from '@/types/skills'
import type { Unit } from '@/types/team'

type ActiveSkill = ActiveSkillsMapType[ActiveSkillsId]
type PassiveSkill = PassiveSkillsMapType[PassiveSkillsId]

export interface AvailableSkill {
  skill: ActiveSkill | PassiveSkill
  source: 'class' | 'equipment'
  level?: number
}

const inheritanceCache: Record<string, AllClassType[]> = {}

function getInheritanceChain(className: AllClassType): AllClassType[] {
  if (inheritanceCache[className]) {
    return inheritanceCache[className]
  }

  const chain: AllClassType[] = []
  let currentClass: AllClassType | BaseClassType | null = className

  while (currentClass) {
    const typedClass = currentClass as AllClassType
    chain.push(typedClass)
    const classDefinition = CLASS_DATA[typedClass]
    currentClass = classDefinition?.baseClass || null
  }

  inheritanceCache[className] = chain
  return chain
}

export const getClassSkills = (unit: Unit) => {
  const availableSkills: AvailableSkill[] = []
  const inheritanceChain = getInheritanceChain(unit.classKey as AllClassType)

  inheritanceChain.forEach(className => {
    const classData = CLASS_DATA[className]
    if (classData?.skills) {
      classData.skills
        .filter(classSkill => unit.level >= classSkill.level)
        .forEach(classSkill => {
          let skill: ActiveSkill | PassiveSkill | undefined

          if (classSkill.skillType === 'active') {
            skill =
              ActiveSkillsMap[classSkill.skillId as keyof typeof ActiveSkillsMap]
          } else if (classSkill.skillType === 'passive') {
            skill =
              PassiveSkillsMap[
                classSkill.skillId as keyof typeof PassiveSkillsMap
              ]
          }

          if (skill) {
            availableSkills.push({
              skill,
              source: 'class',
              level: classSkill.level,
            })
          }
        })
    }
  })

  return availableSkills
}

export const getAvailableSkills = (unit: Unit) => {
  const classSkills = getClassSkills(unit)
  const equipmentSkills = getEquipmentSkills(unit)

  return [...classSkills, ...equipmentSkills]
}

export const getEquipmentSkills = (unit: Unit) => {
  const availableSkills: AvailableSkill[] = []

  // Filter equipment items that have skills and process them
  const equipmentWithSkills = unit.equipment
    .filter(equippedItem => equippedItem.itemId)
    .map(equippedItem => {
      const equipment = getEquipmentById(equippedItem.itemId!)
      return equipment?.skillId ? equipment : null
    })
    .filter((equipment): equipment is NonNullable<typeof equipment> => equipment !== null)

  equipmentWithSkills.forEach(equipment => {
    let skill: ActiveSkill | PassiveSkill | undefined
    
    // Safe to use ! because we filtered for skillId existence
    const skillId = equipment.skillId!

    if (skillId in ActiveSkillsMap) {
      skill = ActiveSkillsMap[skillId as keyof typeof ActiveSkillsMap]
    } else if (skillId in PassiveSkillsMap) {
      skill =
        PassiveSkillsMap[skillId as keyof typeof PassiveSkillsMap]
    }

    if (skill) {
      availableSkills.push({
        skill,
        source: 'equipment',
      })
    }
  })

  return availableSkills
}

export const insertSkill = (slots: SkillSlot[], newSkill: AvailableSkill) => {
  let insertIndex = 0

  if (newSkill.skill.type === 'active') {
    insertIndex = slots.findIndex(slot => slot.skillType === 'passive')
    if (insertIndex === -1) {
      insertIndex = slots.length
    }
  } else {
    insertIndex = slots.length
  }

  const skillSlotId = generateRandomId()

  const newSlot: SkillSlot = {
    id: skillSlotId,
    skillId: newSkill.skill.id,
    skillType: newSkill.skill.type,
    tactics: [null, null],
    order: insertIndex,
  }

  const newSlots = [...slots]
  newSlots.splice(insertIndex, 0, newSlot)

  return newSlots.map((slot, index) => ({
    ...slot,
    order: index,
  }))
}

export const reorderSkill = (
  slots: SkillSlot[],
  fromIndex: number,
  toIndex: number
) => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= slots.length ||
    toIndex >= slots.length
  ) {
    return slots
  }

  const movingSlot = slots[fromIndex]
  if (!movingSlot) {
    return slots
  }

  const passiveBoundary = slots.findIndex(slot => slot.skillType === 'passive')
  const hasPassiveSkills = passiveBoundary !== -1

  if (movingSlot.skillType === 'active') {
    if (hasPassiveSkills && toIndex >= passiveBoundary) {
      return slots
    }
  } else if (movingSlot.skillType === 'passive') {
    if (hasPassiveSkills && toIndex < passiveBoundary) {
      return slots
    }
  }

  const newSlots = [...slots]
  const [movedSlot] = newSlots.splice(fromIndex, 1)
  newSlots.splice(toIndex, 0, movedSlot)

  return newSlots.map((slot, index) => ({
    ...slot,
    order: index,
  }))
}

export const removeSkill = (slots: SkillSlot[], skillSlotId: string) => {
  const newSlots = slots.filter(slot => slot.id !== skillSlotId)

  return newSlots.map((slot, index) => ({
    ...slot,
    order: index,
  }))
}
