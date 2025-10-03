import { useState, useMemo } from 'react'
import type { Unit } from '@/types/team'
import { getAvailableSkills } from '@/utils/skill-availability'

export type SkillTypeFilter = 'all' | 'active' | 'passive'

interface UseSkillSelectionProps {
  unit: Unit
}

export function useSkillSelection({ unit }: UseSkillSelectionProps) {
  const [skillTypeFilter, setSkillTypeFilter] = useState<SkillTypeFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const availableSkills = useMemo(() => {
    return getAvailableSkills(unit)
  }, [unit])

  const activeSkills = useMemo(() => {
    return availableSkills.filter((skill) => skill.skill.type === 'active')
  }, [availableSkills])

  const passiveSkills = useMemo(() => {
    return availableSkills.filter((skill) => skill.skill.type === 'passive')
  }, [availableSkills])

  const filteredSkills = useMemo(() => {
    let filtered = availableSkills

    if (skillTypeFilter === 'active') {
      filtered = activeSkills
    } else if (skillTypeFilter === 'passive') {
      filtered = passiveSkills
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(
        (availableSkill) =>
          availableSkill.skill.name.toLowerCase().includes(searchLower) ||
          availableSkill.skill.description.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [
    availableSkills,
    activeSkills,
    passiveSkills,
    skillTypeFilter,
    searchTerm,
  ])

  return {
    availableSkills,
    filteredSkills,
    skillTypeFilter,
    setSkillTypeFilter,
    searchTerm,
    setSearchTerm,
    activeSkills,
    passiveSkills,
  }
}
