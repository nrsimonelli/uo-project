import { useCallback, useMemo } from 'react'
import type { Unit } from '@/types/team'
import type { AvailableSkill } from '@/utils/skill-availability'
import {
  insertSkill,
  reorderSkill,
  removeSkill,
} from '@/utils/skill-availability'

interface UseSkillSlotManagerProps {
  unit: Unit
  onUpdateUnit: (updates: Partial<Unit>) => void
}

/**
 * Custom hook for managing skill slots on a unit
 * Handles skill insertion, reordering, and removal while maintaining ordering constraints
 */
export function useSkillSlotManager({
  unit,
  onUpdateUnit,
}: UseSkillSlotManagerProps) {
  const maxSkills = 10
  const skillSlots = useMemo(() => unit.skillSlots || [], [unit.skillSlots])
  const canAddMoreSkills = skillSlots.length < maxSkills

  const addSkill = useCallback(
    (skill: AvailableSkill) => {
      if (!canAddMoreSkills) {
        console.warn('Cannot add more skills: maximum limit reached')
        return
      }

      const newSkillSlots = insertSkill(skillSlots, skill)
      onUpdateUnit({ skillSlots: newSkillSlots })
    },
    [skillSlots, canAddMoreSkills, onUpdateUnit]
  )

  const removeSkillSlot = useCallback(
    (skillSlotId: string) => {
      const newSkillSlots = removeSkill(skillSlots, skillSlotId)
      onUpdateUnit({ skillSlots: newSkillSlots })
    },
    [skillSlots, onUpdateUnit]
  )

  const reorderSkillSlot = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newSkillSlots = reorderSkill(skillSlots, fromIndex, toIndex)

      // Only update if the reorder was successful (array changed)
      if (newSkillSlots !== skillSlots) {
        onUpdateUnit({ skillSlots: newSkillSlots })
      }
    },
    [skillSlots, onUpdateUnit]
  )

  return {
    skillSlots,
    addSkill,
    removeSkillSlot,
    reorderSkillSlot,
    canAddMoreSkills,
    maxSkills,
  }
}
