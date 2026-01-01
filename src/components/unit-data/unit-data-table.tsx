import { Search, X } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

import { EquipmentBadges } from './equipment-badges'
import { FilterPopover } from './filter-popover'
import { NightBoostToggle } from './night-boost-toggle'
import { SettingsPopover } from './settings-popover'
import { SortableHeaderButton } from './sortable-header-button'

import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UnitIcon } from '@/components/unit-icon'
import { useUnitDataTable, type SortField } from '@/hooks/use-unit-data-table'
import { cn } from '@/lib/utils'
import type { ClassTableRow } from '@/utils/class-data-processor'

export function UnitDataTable() {
  const {
    // State
    searchTerm,
    selectedEquipment,
    selectedRaces,
    selectedTraits,
    selectedMovement,
    selectedClassTypes,
    sortField,
    sortDirection,
    selectedLevel,
    growthA,
    growthB,
    isNighttime,

    // Computed values
    filteredStatKeys,
    sortedData,
    equipmentSlots,
    races,
    traits,
    movementTypes,
    totalActiveFilters,

    // Setters
    setSearchTerm,
    setSelectedLevel,
    setGrowthType,
    setIsNighttime,

    // Handlers
    handleSort,
    toggleEquipmentFilter,
    toggleRaceFilter,
    toggleTraitFilter,
    toggleMovementFilter,
    toggleClassTypeFilter,
    clearFilters,
  } = useUnitDataTable()

  return (
    <div className="space-y-6">
      {/* Single Row: All Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: Search, Filter, and Settings Controls */}
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search classes..."
            className="relative flex-1 max-w-sm"
          />

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <FilterPopover
              equipmentSlots={equipmentSlots}
              races={races}
              traits={traits}
              movementTypes={movementTypes}
              selectedEquipment={selectedEquipment}
              selectedRaces={selectedRaces}
              selectedTraits={selectedTraits}
              selectedMovement={selectedMovement}
              selectedClassTypes={selectedClassTypes}
              onToggleEquipment={toggleEquipmentFilter}
              onToggleRace={toggleRaceFilter}
              onToggleTrait={toggleTraitFilter}
              onToggleMovement={toggleMovementFilter}
              onToggleClassType={toggleClassTypeFilter}
              totalActiveFilters={totalActiveFilters}
            />

            {totalActiveFilters > 0 && (
              <Button variant="secondary" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {/* Settings Popover */}
        </div>

        {/* Right side: Nighttime Toggle */}
        <div className="flex items-center justify-end gap-4">
          <SettingsPopover
            selectedLevel={selectedLevel}
            growthA={growthA}
            growthB={growthB}
            onLevelChange={setSelectedLevel}
            onGrowthTypeChange={setGrowthType}
          />
          <NightBoostToggle
            isNighttime={isNighttime}
            onToggle={setIsNighttime}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeaderButton
                  field="id"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Unit Name
                </SortableHeaderButton>
              </TableHead>
              <TableHead>
                <SortableHeaderButton
                  field="equipment"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Equipment
                </SortableHeaderButton>
              </TableHead>
              <TableHead>
                <SortableHeaderButton
                  field="movementType"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Traits
                </SortableHeaderButton>
              </TableHead>
              {filteredStatKeys.map(key => (
                <TableHead key={key}>
                  <SortableHeaderButton
                    field={key as SortField}
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {key}
                  </SortableHeaderButton>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3 + filteredStatKeys.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <Search className="w-8 h-8" />
                    <div className="text-sm font-medium">No results found</div>
                    <div className="text-xs">
                      {totalActiveFilters > 0 || searchTerm
                        ? 'Try adjusting your search or filters'
                        : 'No classes match your current settings'}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>
                    <EquipmentBadges equipment={row.equipment} />
                  </TableCell>
                  <TableCell>
                    <UnitIcon classKey={row.id} />
                  </TableCell>
                  {filteredStatKeys.map(statKey => {
                    const value = row[statKey as keyof ClassTableRow]
                    const isAcc = statKey === 'ACC'
                    const isBestralStat =
                      row.race === 'Bestral' && statKey !== 'HP'

                    return (
                      <TableCell
                        key={`${row.id}-${statKey}`}
                        className={cn(
                          'text-foreground',
                          isBestralStat && isNighttime && 'text-primary'
                        )}
                      >
                        {isNighttime ? (
                          <Tooltip>
                            <TooltipTrigger>{value}</TooltipTrigger>
                            <TooltipContent>
                              {`+${Math.round((isAcc ? Number(value) - 100 : Number(value)) * (1 / 6))}`}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          value
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
