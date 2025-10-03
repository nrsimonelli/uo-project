import { createContext, useContext } from 'react'

import type { TeamContextValue } from '@/components/team-builder/team-context'
import type { Position } from '@/types/team'

export const TeamContext = createContext<TeamContextValue | undefined>(
  undefined
)

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}

export function useCurrentTeam() {
  const { teams, currentTeamId } = useTeam()
  const team = teams[currentTeamId]
  if (!team) throw new Error(`No team found with id "${currentTeamId}"`)
  return team
}

export function useUnitById(unitId: string) {
  const team = useCurrentTeam()
  return team.formation.find(u => u?.id === unitId) ?? null
}

export function useUnitAt(position: Position) {
  const team = useCurrentTeam()
  const idx = position.row * 3 + position.col
  return team.formation[idx]
}

export function useIsSlotOccupied(position: Position) {
  return useUnitAt(position) !== null
}
