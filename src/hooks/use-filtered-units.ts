import { useMemo } from 'react'
import type { Team } from '@/types/team'
import { filterUnits } from '@/core/unit-filter'

export function useFilteredUnits(searchTerm: string, team: Team) {
  return useMemo(() => filterUnits(team, searchTerm), [team, searchTerm])
}
