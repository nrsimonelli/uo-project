import { useState, type ReactNode } from 'react'
import { TeamContext } from '@/hooks/use-team'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { COLS, type Position, type Team, type Unit } from '@/types/team'

export interface TeamContextValue {
  teams: Record<string, Team>
  currentTeamId: string
  setCurrentTeam: (id: string) => void
  updateTeamName: (id: string, name: string) => void
  importTeam: (teamId: string, team: Team) => void

  addUnit: (unit: Unit, position: Position) => void
  updateUnit: (id: string, updates: Partial<Unit>) => void
  updateMultipleUnits: (
    updates: Array<{ id: string; updates: Partial<Unit> }>
  ) => void
  removeUnit: (id: string) => void
  moveUnit: (id: string, newPosition: Position) => void
  swapUnits: (from: Position, to: Position) => void
}

// Initialize 6 default teams
const createDefaultTeams = (): Record<string, Team> => {
  const teams: Record<string, Team> = {}
  for (let i = 1; i <= 6; i++) {
    teams[`team-${i}`] = {
      id: `team-${i}`,
      name: `Team ${i}`,
      formation: Array(6).fill(null),
    }
  }
  return teams
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useLocalStorage<Record<string, Team>>(
    'team-data',
    createDefaultTeams()
  )

  const [currentTeamId, setCurrentTeamId] = useState('team-1')

  const getIndex = ({ row, col }: Position) => row * COLS.length + col

  const modifyTeam = (teamId: string, updater: (team: Team) => Team) => {
    setTeams((prev) => {
      const team = prev[teamId]
      if (!team) return prev
      return { ...prev, [teamId]: updater(team) }
    })
  }

  const updateTeamName = (id: string, name: string) => {
    setTeams((prev) => {
      const team = prev[id]
      if (!team) return prev
      return { ...prev, [id]: { ...team, name } }
    })
  }

  const importTeam = (teamId: string, importedTeam: Team) => {
    setTeams((prev) => {
      // Keep the original team ID but use imported data
      const team = {
        ...importedTeam,
        id: teamId, // Preserve the slot ID (team-1, team-2, etc.)
      }
      return { ...prev, [teamId]: team }
    })
  }

  const addUnit = (unit: Unit, position: Position) => {
    modifyTeam(currentTeamId, (team) => {
      const idx = getIndex(position)
      if (team.formation[idx]) throw new Error('Position occupied')
      const formation = [...team.formation]
      formation[idx] = { ...unit, position }
      return { ...team, formation }
    })
  }

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    modifyTeam(currentTeamId, (team) => {
      const formation = team.formation.map((u) =>
        u && u.id === id ? { ...u, ...updates } : u
      )
      return { ...team, formation }
    })
  }

  const updateMultipleUnits = (
    updates: Array<{ id: string; updates: Partial<Unit> }>
  ) => {
    modifyTeam(currentTeamId, (team) => {
      const formation = team.formation.map((u) => {
        if (!u) return u
        const unitUpdate = updates.find((update) => update.id === u.id)
        return unitUpdate ? { ...u, ...unitUpdate.updates } : u
      })
      return { ...team, formation }
    })
  }

  const removeUnit = (id: string) => {
    modifyTeam(currentTeamId, (team) => {
      const formation = team.formation.map((u) => (u?.id === id ? null : u))
      return { ...team, formation }
    })
  }

  const moveUnit = (id: string, newPosition: Position) => {
    modifyTeam(currentTeamId, (team) => {
      const idx = getIndex(newPosition)
      if (team.formation[idx]) throw new Error('New position occupied')

      const unit = team.formation.find((u) => u?.id === id) ?? null
      if (!unit) return team

      const formation = team.formation.map((u) => (u?.id === id ? null : u))
      formation[idx] = { ...unit, position: newPosition }
      return { ...team, formation }
    })
  }

  const swapUnits = (from: Position, to: Position) => {
    modifyTeam(currentTeamId, (team) => {
      const fromIdx = getIndex(from)
      const toIdx = getIndex(to)

      const formation = [...team.formation]
      const fromUnit = formation[fromIdx]
      const toUnit = formation[toIdx]

      // both empty → no-op
      if (!fromUnit && !toUnit) return team

      // ✅ update positions consistently
      formation[fromIdx] = toUnit ? { ...toUnit, position: from } : null
      formation[toIdx] = fromUnit ? { ...fromUnit, position: to } : null

      return { ...team, formation }
    })
  }

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeamId,
        setCurrentTeam: setCurrentTeamId,
        updateTeamName,
        importTeam,
        addUnit,
        updateUnit,
        updateMultipleUnits,
        removeUnit,
        moveUnit,
        swapUnits,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}
