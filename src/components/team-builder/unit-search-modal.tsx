import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { PlusIcon, Search } from 'lucide-react'
import { useFilteredUnits } from '@/hooks/use-filtered-units'
import { ScrollArea } from '../ui/scroll-area'
import type { Team, Unit } from '@/types/team'
import { createUnit } from '@/core/create-unit'
import { useTeam } from '@/hooks/use-team'
import { generateRandomId } from '@/core/helpers'
import { useModalState } from '@/hooks/use-modal-state'
import { useTeamPositions } from '@/hooks/use-team-positions'
import { UnitItem } from './unit-item'

interface UnitSearchModalProps {
  team: Team
  onUnitAdded?: (unit: Unit) => void
}

export function UnitSearchModal({ team, onUnitAdded }: UnitSearchModalProps) {
  const { open, searchTerm, closeModal, updateSearchTerm, setOpen } =
    useModalState()
  const { getNextOpenPosition, isTeamFull } = useTeamPositions(team.formation)
  const filteredUnits = useFilteredUnits(searchTerm, team)
  const { addUnit } = useTeam()

  const handleUnitSelect = (unitName: string) => {
    if (isTeamFull) {
      console.warn('Team is full, cannot add unit')
      return
    }

    const position = getNextOpenPosition()
    if (!position) {
      console.warn('No available position found')
      return
    }

    const unitId = generateRandomId()
    const newUnit = createUnit(unitId, unitName, position)
    addUnit(newUnit, position)

    if (onUnitAdded) {
      onUnitAdded(newUnit)
    }

    closeModal()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AddUnitTrigger disabled={isTeamFull} />
      </DialogTrigger>
      <DialogContent
        aria-describedby='modal-description'
        className='sm:max-w-md max-h-[80vh] h-full w-full overflow-hidden flex flex-col items-start'
      >
        <DialogHeader>
          <DialogTitle>Select a unit</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 items-start flex-col flex flex-1 w-full h-full justify-start pb-4'>
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={updateSearchTerm}
          />

          <ScrollArea className='flex flex-col w-full overflow-y-auto'>
            <UnitList units={filteredUnits} onUnitSelect={handleUnitSelect} />

            {filteredUnits.length === 0 && (
              <EmptyState searchTerm={searchTerm} />
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface AddUnitTriggerProps {
  disabled: boolean
}

function AddUnitTrigger({ disabled }: AddUnitTriggerProps) {
  return (
    <Button variant='ghost' className='flex flex-1' disabled={disabled}>
      Add Unit <PlusIcon className='w-4 h-4' />
    </Button>
  )
}

interface SearchInputProps {
  searchTerm: string
  onSearchChange: (term: string) => void
}

function SearchInput({ searchTerm, onSearchChange }: SearchInputProps) {
  return (
    <div className='relative w-full'>
      <Search className='absolute top-1/2 left-2 -translate-y-1/2 w-4 h-4' />
      <Input
        className='pl-8'
        placeholder='Search...'
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}

interface UnitListProps {
  units: string[]
  onUnitSelect: (unitName: string) => void
}

function UnitList({ units, onUnitSelect }: UnitListProps) {
  return (
    <>
      {units.map((unitName) => (
        <UnitItem key={unitName} unitName={unitName} onSelect={onUnitSelect} />
      ))}
    </>
  )
}

interface EmptyStateProps {
  searchTerm: string
}

function EmptyState({ searchTerm }: EmptyStateProps) {
  return (
    <div className='text-center text-muted-foreground py-8'>
      No units found matching "{searchTerm}"
    </div>
  )
}
