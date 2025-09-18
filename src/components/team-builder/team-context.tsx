import { useState, type ReactNode } from 'react'
import type { AllClassType, GrowthType } from '@/types/base-stats'
import { TeamContext } from '@/hooks/use-team'

export type FormationSlots = Array<Unit | null>

export interface Team {
  id: string
  name: string
  formation: FormationSlots
}
export interface Position {
  row: 0 | 1 // 2 rows
  col: 0 | 1 | 2 // 3 cols
}

export type GrowthTuple = [GrowthType, GrowthType]

export interface Unit {
  id: string // unique per instance (e.g. "unit-123")
  name: string // display name
  class: AllClassType // references a class definition in ALL_CLASSES
  level: number
  growths: GrowthTuple
  equipment: string[] // ids of equipped items
  activeSkills: string[] // skill ids
  passiveSkills: string[] // skill ids

  // Used for team building/editor convenience
  position?: Position
}

export interface TeamContextValue {
  teams: Record<string, Team>
  currentTeamId: string
  setCurrentTeam: (id: string) => void
  addTeam: (team: Team) => void
  removeTeam: (id: string) => void

  addUnit: (unit: Unit, position: Position) => void
  updateUnit: (id: string, updates: Partial<Unit>) => void
  removeUnit: (id: string) => void
  moveUnit: (id: string, newPosition: Position) => void
}

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<Record<string, Team>>({
    default: {
      id: 'default',
      name: 'Default Team',
      formation: Array(6).fill(null),
    },
  })

  const [currentTeamId, setCurrentTeamId] = useState('default')

  const getIndex = ({ row, col }: Position) => row * 3 + col

  const modifyTeam = (teamId: string, updater: (team: Team) => Team) => {
    setTeams((prev) => {
      const team = prev[teamId]
      if (!team) return prev
      return { ...prev, [teamId]: updater(team) }
    })
  }

  const addTeam = (team: Team) => {
    setTeams((prev) => ({ ...prev, [team.id]: team }))
  }

  const removeTeam = (id: string) => {
    setTeams((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev
      return rest
    })
  }

  const addUnit = (unit: Unit, position: Position) =>
    modifyTeam(currentTeamId, (team) => {
      const idx = getIndex(position)
      if (team.formation[idx]) throw new Error('Position occupied')
      const formation = [...team.formation]
      formation[idx] = { ...unit, position }
      return { ...team, formation }
    })

  const updateUnit = (id: string, updates: Partial<Unit>) =>
    modifyTeam(currentTeamId, (team) => {
      const formation = team.formation.map((u) =>
        u && u.id === id ? { ...u, ...updates } : u
      )
      return { ...team, formation }
    })

  const removeUnit = (id: string) =>
    modifyTeam(currentTeamId, (team) => {
      const formation = team.formation.map((u) => (u?.id === id ? null : u))
      return { ...team, formation }
    })

  const moveUnit = (id: string, newPosition: Position) =>
    modifyTeam(currentTeamId, (team) => {
      const idx = getIndex(newPosition)
      if (team.formation[idx]) throw new Error('New position occupied')

      const unit = team.formation.find((u) => u?.id === id) ?? null
      if (!unit) return team

      const formation = team.formation.map((u) => (u?.id === id ? null : u))
      formation[idx] = { ...unit, position: newPosition }
      return { ...team, formation }
    })

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeamId,
        setCurrentTeam: setCurrentTeamId,
        addTeam,
        removeTeam,
        addUnit,
        updateUnit,
        removeUnit,
        moveUnit,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}
