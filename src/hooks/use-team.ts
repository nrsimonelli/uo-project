import { createContext, useContext } from 'react'
import type { Team, Position, Unit } from '@/types/team'
import type { TeamContextValue } from '@/components/team-builder/team-context'

export const TeamContext = createContext<TeamContextValue | undefined>(
  undefined
)

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}

export function useCurrentTeam(): Team {
  const { teams, currentTeamId } = useTeam()
  const team = teams[currentTeamId]
  if (!team) throw new Error(`No team found with id "${currentTeamId}"`)
  return team
}

export function useUnitById(unitId: string): Unit | null {
  const team = useCurrentTeam()
  return team.formation.find((u) => u?.id === unitId) ?? null
}

export function useUnitAt(position: Position): Unit | null {
  const team = useCurrentTeam()
  const idx = position.row * 3 + position.col
  return team.formation[idx]
}

export function useIsSlotOccupied(position: Position): boolean {
  return useUnitAt(position) !== null
}
