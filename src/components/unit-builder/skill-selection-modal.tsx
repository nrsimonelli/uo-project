import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useModalState } from '@/hooks/use-modal-state'
import { useSkillSelection } from '@/hooks/use-skill-selection'
import type { Unit } from '@/types/team'
import type { AvailableSkill } from '@/utils/skill-availability'
import { SkillTypeFilterComponent } from './skill-type-filter'
import { SkillList } from './skill-list'

interface SkillSelectionModalProps {
  unit: Unit
  open: boolean
  onOpenChange: (open: boolean) => void
  onSkillSelect: (skill: AvailableSkill) => void
}

export function SkillSelectionModal({
  unit,
  open,
  onOpenChange,
  onSkillSelect,
}: SkillSelectionModalProps) {
  const { searchTerm, updateSearchTerm } = useModalState()

  const { filteredSkills, skillTypeFilter, setSkillTypeFilter, setSearchTerm } =
    useSkillSelection({ unit })

  const handleSearchChange = (value: string) => {
    updateSearchTerm(value)
    setSearchTerm(value)
  }

  const handleSkillSelect = (skill: AvailableSkill) => {
    onSkillSelect(skill)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Select Skill</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4 flex-1 min-h-0'>
          {/* Search Input */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search skills...'
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='pl-10'
            />
          </div>

          {/* Type Filter */}
          <SkillTypeFilterComponent
            value={skillTypeFilter}
            onValueChange={setSkillTypeFilter}
          />

          {/* Skills List */}
          <div className='flex-1 min-h-0'>
            <SkillList
              skills={filteredSkills}
              onSkillSelect={handleSkillSelect}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
