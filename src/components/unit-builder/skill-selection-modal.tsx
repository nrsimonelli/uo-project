import { Plus } from 'lucide-react'

import { SkillList } from './skill-list'
import { SkillTypeFilterComponent } from './skill-type-filter'

import { SearchModal } from '@/components/search-modal'
import { Button } from '@/components/ui/button'
import { useModalState } from '@/hooks/use-modal-state'
import { useSkillSelection } from '@/hooks/use-skill-selection'
import type { Unit } from '@/types/team'
import type { AvailableSkill } from '@/utils/skill-availability'

interface SkillSelectionModalProps {
  unit: Unit
  onSkillSelect: (skill: AvailableSkill) => void
}

export function SkillSelectionModal({
  unit,
  onSkillSelect,
}: SkillSelectionModalProps) {
  const { open, setOpen } = useModalState()

  const {
    filteredSkills,
    skillTypeFilter,
    setSkillTypeFilter,
    searchTerm,
    setSearchTerm,
  } = useSkillSelection({ unit })

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleSkillSelect = (skill: AvailableSkill) => {
    onSkillSelect(skill)
    setOpen(false)
    // Clear search and filter when closing
    setSearchTerm('')
    setSkillTypeFilter('all')
  }

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen)
    // Clear search and filter when modal is closed
    if (!isOpen) {
      setSearchTerm('')
      setSkillTypeFilter('all')
    }
  }

  return (
    <SearchModal
      title="Select Skill"
      trigger={
        <Button variant="default" size="sm" className="justify-start">
          <Plus className="size-4" />
          Add Skill
        </Button>
      }
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search skills..."
      filterComponent={
        <SkillTypeFilterComponent
          value={skillTypeFilter}
          onValueChange={setSkillTypeFilter}
        />
      }
      open={open}
      onOpenChange={handleModalClose}
    >
      <SkillList skills={filteredSkills} onSkillSelect={handleSkillSelect} />
    </SearchModal>
  )
}
