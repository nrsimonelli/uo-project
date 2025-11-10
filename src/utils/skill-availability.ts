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
        .filter(classSkillEntry => unit.level >= classSkillEntry.level)
        .forEach(classSkillEntry => {
          let foundClassSkill: ActiveSkill | PassiveSkill | undefined

          if (classSkillEntry.skillType === 'active') {
            foundClassSkill =
              ActiveSkillsMap[
                classSkillEntry.skillId as keyof typeof ActiveSkillsMap
              ]
          } else if (classSkillEntry.skillType === 'passive') {
            foundClassSkill =
              PassiveSkillsMap[
                classSkillEntry.skillId as keyof typeof PassiveSkillsMap
              ]
          }

          if (foundClassSkill) {
            availableSkills.push({
              skill: foundClassSkill,
              source: 'class',
              level: classSkillEntry.level,
            })
          }
        })
    }
  })

  return availableSkills.sort(
    (skillA, skillB) => (skillA.level ?? 0) - (skillB.level ?? 0)
  )
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
    .filter(
      (equipment): equipment is NonNullable<typeof equipment> =>
        equipment !== null
    )

  equipmentWithSkills.forEach(equipment => {
    // Safe to use ! because we filtered for skillId existence
    const equipmentSkillId = equipment.skillId!

    // Try to find the skill in the active skills map
    let foundSkill: ActiveSkill | PassiveSkill | undefined
    if (equipmentSkillId in ActiveSkillsMap) {
      foundSkill =
        ActiveSkillsMap[equipmentSkillId as keyof typeof ActiveSkillsMap]
    }
    // If not found, try passive skills map
    if (!foundSkill && equipmentSkillId in PassiveSkillsMap) {
      foundSkill =
        PassiveSkillsMap[equipmentSkillId as keyof typeof PassiveSkillsMap]
    }

    if (foundSkill) {
      availableSkills.push({
        skill: foundSkill,
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

  const newSlot: SkillSlot =
    newSkill.skill.type === 'active'
      ? {
          id: skillSlotId,
          skillId: newSkill.skill.id,
          skillType: 'active',
          tactics: [null, null],
          order: insertIndex,
        }
      : {
          id: skillSlotId,
          skillId: newSkill.skill.id,
          skillType: 'passive',
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

/**
 * Get the required level for a class skill
 * Returns undefined if the skill is not from class data
 */
export const getClassSkillRequiredLevel = (
  unit: Unit,
  skillId: string
): number | undefined => {
  const inheritanceChain = getInheritanceChain(unit.classKey as AllClassType)

  for (const className of inheritanceChain) {
    const classData = CLASS_DATA[className]
    if (classData?.skills) {
      const classSkillEntry = classData.skills.find(
        classSkillEntry => classSkillEntry.skillId === skillId
      )
      if (classSkillEntry) {
        return classSkillEntry.level
      }
    }
  }

  return undefined
}

/**
 * Check if a skill in a skillSlot is valid for the unit
 * Returns true if:
 * - The skill is currently available from equipment, OR
 * - The skill is from class and the unit's level meets the requirement
 * Returns false if:
 * - The skill was from equipment but equipment is no longer equipped
 * - The skill is from class but unit's level is too low
 */
export const isSkillValidForUnit = (unit: Unit, skillSlot: SkillSlot) => {
  if (!skillSlot.skillId) return true // Empty slot is valid

  // Check if skill is currently available from equipment
  const equipmentSkills = getEquipmentSkills(unit)
  const isEquipmentSkill = equipmentSkills.some(
    equipmentSkill => equipmentSkill.skill.id === skillSlot.skillId
  )
  if (isEquipmentSkill) return true

  // Check if it's a class skill and if the unit meets the level requirement
  const requiredLevel = getClassSkillRequiredLevel(unit, skillSlot.skillId)
  if (requiredLevel !== undefined) {
    // It's a class skill - check if level requirement is met
    return unit.level >= requiredLevel
  }

  // Skill not found in class data or equipment - it's invalid
  // (This handles cases where equipment was removed)
  return false
}
