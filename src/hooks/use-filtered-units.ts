import { useMemo } from 'react'

import type { UnitTypeFilter } from '@/components/team-builder/unit-type-filter'
import { filterUnits } from '@/core/unit-filter'
import { ADVANCED_CLASSES, BASE_CLASSES } from '@/data/constants'
import type { Team } from '@/types/team'

export function useFilteredUnits(
  searchTerm: string,
  team: Team,
  unitTypeFilter: UnitTypeFilter = 'all'
) {
  return useMemo(() => {
    const allFilteredUnits = filterUnits(team, searchTerm)

    if (unitTypeFilter === 'all') {
      return allFilteredUnits
    }

    const advancedClassValues = Object.values(
      ADVANCED_CLASSES
    ) as readonly string[]
    const baseClassValues = Object.values(BASE_CLASSES) as readonly string[]

    if (unitTypeFilter === 'advanced') {
      return allFilteredUnits.filter(unitName =>
        advancedClassValues.includes(unitName)
      )
    }

    if (unitTypeFilter === 'base') {
      return allFilteredUnits.filter(unitName =>
        baseClassValues.includes(unitName)
      )
    }

    return allFilteredUnits
  }, [team, searchTerm, unitTypeFilter])
}
