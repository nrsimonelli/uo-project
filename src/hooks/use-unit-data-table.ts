import { useState, useMemo } from 'react'

import { COMBAT_STATS } from '@/hooks/use-chart-data'
import type { GrowthTuple } from '@/types/base-stats'
import type { EquipmentSlotType } from '@/types/equipment'
import {
  processClassData,
  getUniqueEquipmentSlots,
  getUniqueRaces,
  getUniqueTraits,
  getUniqueMovementTypes,
  type ClassTableRow,
} from '@/utils/class-data-processor'

export type SortField = keyof ClassTableRow | 'equipment'
export type SortDirection = 'asc' | 'desc'

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

  const allData = useMemo(
    () =>
      processClassData(
        selectedLevel,
        growthA,
        growthB,
        isNighttime,
        selectedClassTypes
      ),
    [selectedLevel, growthA, growthB, isNighttime, selectedClassTypes]
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

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      // Handle special sorting cases
      if (sortField === 'equipment') {
        // Sort by first equipment item alphabetically
        const aVal = a.equipment.length > 0 ? [...a.equipment].sort()[0] : ''
        const bVal = b.equipment.length > 0 ? [...b.equipment].sort()[0] : ''
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      // Standard field access for all other columns
      const fieldKey = sortField as keyof ClassTableRow
      const aVal = a[fieldKey]
      const bVal = b[fieldKey]

      // Handle null/undefined values
      if (aVal === null || aVal === undefined)
        return sortDirection === 'asc' ? 1 : -1
      if (bVal === null || bVal === undefined)
        return sortDirection === 'asc' ? -1 : 1

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const result = aVal.localeCompare(bVal)
        return sortDirection === 'asc' ? result : -result
      }

      // Number comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const result = aVal - bVal
        return sortDirection === 'asc' ? result : -result
      }

      return 0
    })
  }, [filteredData, sortField, sortDirection])

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

  const toggleEquipmentFilter = (slot: string) => {
    setSelectedEquipment(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    )
  }

  const toggleRaceFilter = (race: string) => {
    setSelectedRaces(prev =>
      prev.includes(race) ? prev.filter(r => r !== race) : [...prev, race]
    )
  }

  const toggleTraitFilter = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    )
  }

  const toggleMovementFilter = (movement: string) => {
    setSelectedMovement(prev =>
      prev.includes(movement)
        ? prev.filter(m => m !== movement)
        : [...prev, movement]
    )
  }

  const toggleClassTypeFilter = (classType: string) => {
    setSelectedClassTypes(prev =>
      prev.includes(classType)
        ? prev.filter(t => t !== classType)
        : [...prev, classType]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedEquipment([])
    setSelectedRaces([])
    setSelectedTraits([])
    setSelectedMovement([])
    setSelectedClassTypes([])
  }

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
