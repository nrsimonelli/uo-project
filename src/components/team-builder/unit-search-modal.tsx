import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { UnitItem } from './unit-item'
import {
  UnitTypeFilterComponent,
  type UnitTypeFilter,
} from './unit-type-filter'

import { SearchModal } from '@/components/search-modal'
import { Button } from '@/components/ui/button'
import { createUnit } from '@/core/create-unit'
import { generateRandomId } from '@/core/helpers'
import { useFilteredUnits } from '@/hooks/use-filtered-units'
import { useModalState } from '@/hooks/use-modal-state'
import { useTeam } from '@/hooks/use-team'
import { useTeamPositions } from '@/hooks/use-team-positions'
import type { Team, Unit } from '@/types/team'

interface UnitSearchModalProps {
  team: Team
  onUnitAdded?: (unit: Unit) => void
}

export function UnitSearchModal({ team, onUnitAdded }: UnitSearchModalProps) {
  const { open, searchTerm, closeModal, updateSearchTerm, setOpen } =
    useModalState()
  const [unitTypeFilter, setUnitTypeFilter] = useState<UnitTypeFilter>('all')
  const { getNextOpenPosition, isTeamFull } = useTeamPositions(team.formation)
  const filteredUnits = useFilteredUnits(searchTerm, team, unitTypeFilter)
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

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      updateSearchTerm('')
      setUnitTypeFilter('all')
    }
  }

  const isTeamEmpty = !team.formation.some(unit => unit !== null)

  return (
    <SearchModal
      title="Select a unit"
      trigger={
        <Button
          variant={isTeamEmpty ? 'default' : 'ghost'}
          className="flex flex-1"
        >
          <PlusIcon className="w-4 h-4" />
          Add Unit
        </Button>
      }
      searchValue={searchTerm}
      onSearchChange={updateSearchTerm}
      searchPlaceholder="Search..."
      filterComponent={
        <UnitTypeFilterComponent
          value={unitTypeFilter}
          onValueChange={setUnitTypeFilter}
        />
      }
      open={open}
      onOpenChange={handleModalClose}
      emptyState={
        filteredUnits.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : null
      }
    >
      <UnitList units={filteredUnits} onUnitSelect={handleUnitSelect} />
    </SearchModal>
  )
}

interface UnitListProps {
  units: string[]
  onUnitSelect: (unitName: string) => void
}

function UnitList({ units, onUnitSelect }: UnitListProps) {
  return (
    <div className="space-y-2">
      {units.map(unitName => (
        <UnitItem key={unitName} unitName={unitName} onSelect={onUnitSelect} />
      ))}
    </div>
  )
}

interface EmptyStateProps {
  searchTerm: string
}

function EmptyState({ searchTerm }: EmptyStateProps) {
  return (
    <div className="text-center text-muted-foreground py-8">
      No units found matching "{searchTerm}"
    </div>
  )
}
