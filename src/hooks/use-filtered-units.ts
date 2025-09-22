import { useMemo } from 'react'
import type { Team } from '@/components/team-builder/team-context'
import { filterUnits } from '@/core/utils/unit-filter'

export const useFilteredUnits = (searchTerm: string, team: Team) => {
  return useMemo(() => filterUnits(team, searchTerm), [team, searchTerm])
}
