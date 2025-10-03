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

// Use the generated skill types directly
type ActiveSkill = ActiveSkillsMapType[ActiveSkillsId]
type PassiveSkill = PassiveSkillsMapType[PassiveSkillsId]

// Define AvailableSkill interface here since we're using generated types
export interface AvailableSkill {
  skill: ActiveSkill | PassiveSkill
  source: 'class' | 'equipment'
  level?: number // For class skills
}

/**
 * Get available class skills for a unit based on their class and level
 */
export function getClassSkills(unit: Unit) {
  const classData = CLASS_DATA[unit.class]

  if (!classData.skills) {
    return []
  }

  const availableSkills: AvailableSkill[] = []

  for (const classSkill of classData.skills) {
    // Only include skills that the unit's level meets or exceeds
    if (unit.level >= classSkill.level) {
      let skill: ActiveSkill | PassiveSkill | undefined

      // Look up the skill in the appropriate skill map
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

/**
 * Get all available skills for a unit (combines class and equipment skills)
 */
export function getAvailableSkills(unit: Unit) {
  const classSkills = getClassSkills(unit)
  const equipmentSkills = getEquipmentSkills(unit)

  return [...classSkills, ...equipmentSkills]
}

/**
 * Get available equipment skills for a unit based on their equipped items
 */
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

    // Try to find the skill in active skills first
    if (equipment.skillId in ActiveSkillsMap) {
      skill = ActiveSkillsMap[equipment.skillId as keyof typeof ActiveSkillsMap]
    }
    // Then try passive skills
    else if (equipment.skillId in PassiveSkillsMap) {
      skill =
        PassiveSkillsMap[equipment.skillId as keyof typeof PassiveSkillsMap]
    }

    if (skill) {
      availableSkills.push({
        skill,
        source: 'equipment',
        // No level requirement for equipment skills
      })
    }
  }

  return availableSkills
}

/**
 * Insert a skill into the skill slots array maintaining active-above-passive ordering
 */
export function insertSkill(slots: SkillSlot[], newSkill: AvailableSkill) {
  // Find the insertion position based on skill type
  let insertIndex = 0

  if (newSkill.skill.type === 'active') {
    // Active skills go after the last active skill
    insertIndex = slots.findIndex((slot) => slot.skillType === 'passive')
    if (insertIndex === -1) {
      // No passive skills found, insert at the end
      insertIndex = slots.length
    }
  } else {
    // Passive skills go at the end
    insertIndex = slots.length
  }

  // Create new skill slot
  const newSlot: SkillSlot = {
    id: crypto.randomUUID(),
    skillId: newSkill.skill.id,
    skillType: newSkill.skill.type,
    tactics: [null, null],
    order: insertIndex,
  }

  // Create new array with the skill inserted
  const newSlots = [...slots]
  newSlots.splice(insertIndex, 0, newSlot)

  // Update order values for all slots
  return newSlots.map((slot, index) => ({
    ...slot,
    order: index,
  }))
}

/**
 * Reorder a skill slot while maintaining type boundary validation
 */
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
