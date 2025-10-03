import { useMemo } from 'react'

import { filterUnits } from '@/core/unit-filter'
import type { Team } from '@/types/team'

export function useFilteredUnits(searchTerm: string, team: Team) {
  return useMemo(() => filterUnits(team, searchTerm), [team, searchTerm])
}
