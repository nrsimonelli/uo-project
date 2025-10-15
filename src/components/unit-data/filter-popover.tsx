import { Filter } from 'lucide-react'

import { FilterCheckboxGroup } from './filter-checkbox-group'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface FilterPopoverProps {
  equipmentSlots: string[]
  races: string[]
  traits: string[]
  movementTypes: string[]
  selectedEquipment: string[]
  selectedRaces: string[]
  selectedTraits: string[]
  selectedMovement: string[]
  selectedClassTypes: string[]
  onToggleEquipment: (slot: string) => void
  onToggleRace: (race: string) => void
  onToggleTrait: (trait: string) => void
  onToggleMovement: (movement: string) => void
  onToggleClassType: (classType: string) => void
  totalActiveFilters: number
}

export function FilterPopover({
  equipmentSlots,
  races,
  traits,
  movementTypes,
  selectedEquipment,
  selectedRaces,
  selectedTraits,
  selectedMovement,
  selectedClassTypes,
  onToggleEquipment,
  onToggleRace,
  onToggleTrait,
  onToggleMovement,
  onToggleClassType,
  totalActiveFilters,
}: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {totalActiveFilters > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
              {totalActiveFilters}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-2xl">
        <div className="space-y-4">
          <div className="text-sm font-medium">Filter Options</div>

          <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 auto-cols-min">
            <FilterCheckboxGroup
              title="Equipment"
              items={equipmentSlots.filter(slot => slot !== 'Accessory')}
              selectedItems={selectedEquipment}
              onToggle={onToggleEquipment}
              idPrefix="equipment"
            />

            <FilterCheckboxGroup
              title="Races"
              items={races}
              selectedItems={selectedRaces}
              onToggle={onToggleRace}
              idPrefix="race"
            />

            <FilterCheckboxGroup
              title="Traits"
              items={traits}
              selectedItems={selectedTraits}
              onToggle={onToggleTrait}
              idPrefix="trait"
            />

            <FilterCheckboxGroup
              title="Movement"
              items={movementTypes}
              selectedItems={selectedMovement}
              onToggle={onToggleMovement}
              idPrefix="movement"
            />

            <FilterCheckboxGroup
              title="Class Type"
              items={['Base', 'Advanced']}
              selectedItems={selectedClassTypes}
              onToggle={onToggleClassType}
              idPrefix="classtype"
            />
          </div>

          {totalActiveFilters > 0 && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              {totalActiveFilters} filter{totalActiveFilters !== 1 ? 's' : ''}{' '}
              applied
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
