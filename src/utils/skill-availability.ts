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

  for (const className of inheritanceChain) {
    const classData = CLASS_DATA[className]
    if (!classData?.skills) continue

    for (const classSkill of classData.skills) {
      if (unit.level >= classSkill.level) {
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
      }
    }
  }

  return availableSkills
}

export const getAvailableSkills = (unit: Unit) => {
  const classSkills = getClassSkills(unit)
  const equipmentSkills = getEquipmentSkills(unit)

  return [...classSkills, ...equipmentSkills]
}

export const getEquipmentSkills = (unit: Unit) => {
  const availableSkills: AvailableSkill[] = []

  for (const equippedItem of unit.equipment) {
    if (!equippedItem.itemId) {
      continue
    }

    const equipment = getEquipmentById(equippedItem.itemId)
    if (!equipment || !equipment.skillId) {
      continue
    }

    let skill: ActiveSkill | PassiveSkill | undefined

    if (equipment.skillId in ActiveSkillsMap) {
      skill = ActiveSkillsMap[equipment.skillId as keyof typeof ActiveSkillsMap]
    } else if (equipment.skillId in PassiveSkillsMap) {
      skill =
        PassiveSkillsMap[equipment.skillId as keyof typeof PassiveSkillsMap]
    }

    if (skill) {
      availableSkills.push({
        skill,
        source: 'equipment',
      })
    }
  }

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
