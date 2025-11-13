import { createContext, useContext } from 'react'

import type { TeamContextValue } from '@/components/team-builder/team-context'
import type { Position } from '@/types/team'

export const TeamContext = createContext<TeamContextValue | undefined>(
  undefined
)

export const useTeam = () => {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}

export const useCurrentTeam = () => {
  const { teams, currentTeamId } = useTeam()
  const team = teams[currentTeamId]

  // Fallback to first available team if currentTeamId doesn't exist
  if (!team) {
    const firstTeamId = Object.keys(teams)[0]
    if (firstTeamId) {
      console.warn(
        `Team "${currentTeamId}" not found, falling back to "${firstTeamId}"`
      )
      return teams[firstTeamId]
    }

    // If no teams exist, return a default team structure
    console.warn('No teams available, returning default team structure')
    return {
      id: 'default',
      name: 'Default Team',
      formation: Array(6).fill(null),
    }
  }

  return team
}

export const useUnitById = (unitId: string) => {
  const team = useCurrentTeam()
  return team.formation.find(u => u?.id === unitId) ?? null
}

export const useUnitAt = (position: Position) => {
  const team = useCurrentTeam()
  const idx = position.row * 3 + position.col
  return team.formation[idx]
}

export const useIsSlotOccupied = (position: Position) => {
  return useUnitAt(position) !== null
}
