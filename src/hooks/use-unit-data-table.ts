import { useState, useMemo, useCallback } from 'react'

import type { FilterConfig } from '@/components/unit-data/filter-popover'
import { COMBAT_STATS } from '@/hooks/use-chart-data'
import type { GrowthTuple } from '@/types/base-stats'
import type { EquipmentSlotType } from '@/types/equipment'
import {
  processClassData,
  getUniqueEquipmentSlots,
  getUniqueRaces,
  getUniqueTraits,
  getUniqueMovementTypes,
} from '@/utils/class-data-processor'
import {
  sortTableData,
  type SortField,
  type SortDirection,
} from '@/utils/table-sorting'

export type { SortField, SortDirection }

export function useUnitDataTable() {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedRaces, setSelectedRaces] = useState<string[]>([])
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  const [selectedMovement, setSelectedMovement] = useState<string[]>([])
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([])

  // Sort state
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Settings state
  const [selectedLevel, setSelectedLevel] = useState(50)
  const [[growthA, growthB], setGrowthType] = useState<GrowthTuple>([
    'All-Rounder',
    'All-Rounder',
  ])
  const [isNighttime, setIsNighttime] = useState(false)

  // Computed values
  const filteredStatKeys = useMemo(() => {
    return COMBAT_STATS
  }, [])

  // Base data - only recalculates when level/growth/classTypes change
  // Nighttime multiplier is applied in the display layer for better performance
  const allData = useMemo(
    () =>
      processClassData(
        selectedLevel,
        growthA,
        growthB,
        false,
        selectedClassTypes
      ),
    [selectedLevel, growthA, growthB, selectedClassTypes]
  )

  const equipmentSlots = useMemo(() => getUniqueEquipmentSlots(), [])
  const races = useMemo(() => getUniqueRaces(), [])
  const traits = useMemo(() => getUniqueTraits(), [])
  const movementTypes = useMemo(() => getUniqueMovementTypes(), [])

  const filteredData = useMemo(() => {
    return allData.filter(row => {
      const matchesSearch = row.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesEquipment =
        selectedEquipment.length === 0 ||
        selectedEquipment.some(slot =>
          row.equipment.includes(slot as EquipmentSlotType)
        )

      const matchesRace =
        selectedRaces.length === 0 ||
        (row.race && selectedRaces.includes(row.race))

      const matchesTrait =
        selectedTraits.length === 0 ||
        (row.trait && selectedTraits.includes(row.trait))

      const matchesMovement =
        selectedMovement.length === 0 ||
        selectedMovement.includes(row.movementType)

      return (
        matchesSearch &&
        matchesEquipment &&
        matchesRace &&
        matchesTrait &&
        matchesMovement
      )
    })
  }, [
    allData,
    searchTerm,
    selectedEquipment,
    selectedRaces,
    selectedTraits,
    selectedMovement,
  ])

  const sortedData = useMemo(
    () => sortTableData(filteredData, sortField, sortDirection, isNighttime),
    [filteredData, sortField, sortDirection, isNighttime]
  )

  const totalActiveFilters =
    selectedEquipment.length +
    selectedRaces.length +
    selectedTraits.length +
    selectedMovement.length +
    selectedClassTypes.length

  // Handler functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const toggleEquipmentFilter = useCallback((slot: string) => {
    setSelectedEquipment(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    )
  }, [])

  const toggleRaceFilter = useCallback((race: string) => {
    setSelectedRaces(prev =>
      prev.includes(race) ? prev.filter(r => r !== race) : [...prev, race]
    )
  }, [])

  const toggleTraitFilter = useCallback((trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    )
  }, [])

  const toggleMovementFilter = useCallback((movement: string) => {
    setSelectedMovement(prev =>
      prev.includes(movement)
        ? prev.filter(m => m !== movement)
        : [...prev, movement]
    )
  }, [])

  const toggleClassTypeFilter = useCallback((classType: string) => {
    setSelectedClassTypes(prev =>
      prev.includes(classType)
        ? prev.filter(t => t !== classType)
        : [...prev, classType]
    )
  }, [])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedEquipment([])
    setSelectedRaces([])
    setSelectedTraits([])
    setSelectedMovement([])
    setSelectedClassTypes([])
  }

  // Filter configuration for FilterPopover (defined after toggle functions)
  const filterConfig = useMemo<FilterConfig[]>(
    () => [
      {
        id: 'equipment',
        title: 'Equipment',
        items: equipmentSlots,
        selectedItems: selectedEquipment,
        onToggle: toggleEquipmentFilter,
        idPrefix: 'equipment',
        transformItems: items => items.filter(slot => slot !== 'Accessory'),
      },
      {
        id: 'races',
        title: 'Races',
        items: races,
        selectedItems: selectedRaces,
        onToggle: toggleRaceFilter,
        idPrefix: 'race',
      },
      {
        id: 'traits',
        title: 'Traits',
        items: traits,
        selectedItems: selectedTraits,
        onToggle: toggleTraitFilter,
        idPrefix: 'trait',
      },
      {
        id: 'movement',
        title: 'Movement',
        items: movementTypes,
        selectedItems: selectedMovement,
        onToggle: toggleMovementFilter,
        idPrefix: 'movement',
      },
      {
        id: 'classType',
        title: 'Class Type',
        items: ['Base', 'Advanced'],
        selectedItems: selectedClassTypes,
        onToggle: toggleClassTypeFilter,
        idPrefix: 'classtype',
      },
    ],
    [
      equipmentSlots,
      selectedEquipment,
      toggleEquipmentFilter,
      races,
      selectedRaces,
      toggleRaceFilter,
      traits,
      selectedTraits,
      toggleTraitFilter,
      movementTypes,
      selectedMovement,
      toggleMovementFilter,
      selectedClassTypes,
      toggleClassTypeFilter,
    ]
  )

  return {
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
    allData,
    sortedData,
    equipmentSlots,
    races,
    traits,
    movementTypes,
    totalActiveFilters,
    filterConfig,

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
  }
}
