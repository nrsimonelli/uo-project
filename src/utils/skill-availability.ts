import type { Unit } from '@/types/team'
import type { SkillSlot } from '@/types/skills'
import { CLASS_DATA } from '@/data/class-data'
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
import { getEquipmentById } from '@/core/equipment-lookup'

type ActiveSkill = ActiveSkillsMapType[ActiveSkillsId]
type PassiveSkill = PassiveSkillsMapType[PassiveSkillsId]

export interface AvailableSkill {
  skill: ActiveSkill | PassiveSkill
  source: 'class' | 'equipment'
  level?: number // For class skills
}

export function getClassSkills(unit: Unit) {
  const classData = CLASS_DATA[unit.class]

  if (!classData.skills) {
    return []
  }

  const availableSkills: AvailableSkill[] = []

  for (const classSkill of classData.skills) {
    if (unit.level >= classSkill.level) {
      let skill: ActiveSkill | PassiveSkill | undefined

      if (classSkill.skillType === 'active') {
        skill =
          ActiveSkillsMap[classSkill.skillId as keyof typeof ActiveSkillsMap]
      } else if (classSkill.skillType === 'passive') {
        skill =
          PassiveSkillsMap[classSkill.skillId as keyof typeof PassiveSkillsMap]
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

  return availableSkills
}

export function getAvailableSkills(unit: Unit) {
  const classSkills = getClassSkills(unit)
  const equipmentSkills = getEquipmentSkills(unit)

  return [...classSkills, ...equipmentSkills]
}

export function getEquipmentSkills(unit: Unit) {
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

export function insertSkill(slots: SkillSlot[], newSkill: AvailableSkill) {
  let insertIndex = 0

  if (newSkill.skill.type === 'active') {
    insertIndex = slots.findIndex((slot) => slot.skillType === 'passive')
    if (insertIndex === -1) {
      insertIndex = slots.length
    }
  } else {
    insertIndex = slots.length
  }

  const newSlot: SkillSlot = {
    id: crypto.randomUUID(),
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

export function reorderSkill(
  slots: SkillSlot[],
  fromIndex: number,
  toIndex: number
) {
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

  // Find the boundary between active and passive skills
  const passiveBoundary = slots.findIndex(
    (slot) => slot.skillType === 'passive'
  )
  const hasPassiveSkills = passiveBoundary !== -1

  // Validate the move doesn't violate type boundaries
  if (movingSlot.skillType === 'active') {
    // Active skills cannot be moved below passive skills
    if (hasPassiveSkills && toIndex >= passiveBoundary) {
      return slots
    }
  } else if (movingSlot.skillType === 'passive') {
    // Passive skills cannot be moved above active skills
    if (hasPassiveSkills && toIndex < passiveBoundary) {
      return slots
    }
  }

  // Perform the reorder
  const newSlots = [...slots]
  const [movedSlot] = newSlots.splice(fromIndex, 1)
  newSlots.splice(toIndex, 0, movedSlot)

  // Update order values
  return newSlots.map((slot, index) => ({
    ...slot,
    order: index,
  }))
}

/**
 * Remove a skill slot from the array
 */
export function removeSkill(slots: SkillSlot[], skillSlotId: string) {
  const newSlots = slots.filter((slot) => slot.id !== skillSlotId)

  // Update order values
  return newSlots.map((slot, index) => ({
    ...slot,
    order: index,
  }))
}
