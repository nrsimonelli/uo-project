import { useState, useEffect, type ReactNode } from 'react'

import { TeamErrorProvider } from './team-error-context'

import { getEquipmentById } from '@/core/equipment-lookup'
import { generateRandomId } from '@/core/helpers'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { TeamContext } from '@/hooks/use-team'
import { COLS, type Position, type Team, type Unit } from '@/types/team'
import {
  getClassSkills,
  getEquipmentSkills,
  insertSkill,
} from '@/utils/skill-availability'
import { createDefaultTeams, getDefaultTeamId } from '@/utils/team-repair'
import { validateTeamData } from '@/utils/team-validation'

export interface TeamContextValue {
  teams: Record<string, Team>
  currentTeamId: string
  setCurrentTeam: (id: string) => void
  updateTeamName: (id: string, name: string) => void
  importTeam: (team: Team) => void

  addUnit: (unit: Unit, position: Position) => void
  updateUnit: (id: string, updates: Partial<Unit>) => void
  updateMultipleUnits: (
    updates: Array<{ id: string; updates: Partial<Unit> }>
  ) => void
  removeUnit: (id: string) => void
  moveUnit: (id: string, newPosition: Position) => void
  swapUnits: (from: Position, to: Position) => void
}

// Initialize 10 default teams
const getDefaultTeams = (): Record<string, Team> => createDefaultTeams()

interface TeamProviderInnerProps {
  children: ReactNode
  teams: Record<string, Team>
  setTeams: (
    teams:
      | Record<string, Team>
      | ((prev: Record<string, Team>) => Record<string, Team>)
  ) => void
}

function TeamProviderInner({
  children,
  teams,
  setTeams,
}: TeamProviderInnerProps) {
  const [currentTeamId, setCurrentTeamId] = useState(() => {
    // Try to get current team ID from localStorage, fallback to default
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('active-team-id')
        if (stored && teams[stored]) {
          return stored
        }
      } catch {
        // Ignore errors
      }
    }
    return getDefaultTeamId(teams)
  })

  // Ensure currentTeamId exists in teams, fallback if not
  useEffect(() => {
    if (!teams[currentTeamId]) {
      const firstTeamId = Object.keys(teams)[0] || getDefaultTeamId(teams)
      setCurrentTeamId(firstTeamId)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('active-team-id', firstTeamId)
      }
    }
  }, [teams, currentTeamId])

  const ensureSkillSlots = (unit: Unit): Unit => {
    if (!unit.skillSlots) {
      return { ...unit, skillSlots: [] }
    }
    return unit
  }

  const getIndex = ({ row, col }: Position) => row * COLS.length + col

  const modifyTeam = (teamId: string, updater: (team: Team) => Team) => {
    setTeams(prev => {
      const team = prev[teamId]
      if (!team) return prev
      return { ...prev, [teamId]: updater(team) }
    })
  }

  const updateTeamName = (id: string, name: string) => {
    setTeams(prev => {
      const team = prev[id]
      if (!team) return prev
      return { ...prev, [id]: { ...team, name } }
    })
  }

  const importTeam = (importedTeam: Team) => {
    setTeams(prev => {
      // Replace the current team with the imported team
      const team = {
        ...importedTeam,
        id: currentTeamId,
        formation: importedTeam.formation.map(unit =>
          unit ? ensureSkillSlots(unit) : null
        ),
      }
      return { ...prev, [currentTeamId]: team }
    })
  }

  const addUnit = (unit: Unit, position: Position) => {
    modifyTeam(currentTeamId, team => {
      const idx = getIndex(position)
      if (team.formation[idx]) throw new Error('Position occupied')
      const formation = [...team.formation]

      // Get all class skills for this unit and populate skillSlots
      const initialSkillSlots = unit.skillSlots || []
      const classSkills = getClassSkills(unit)

      // If skillSlots is empty, populate with one of each class skill
      const skillSlots =
        initialSkillSlots.length === 0 && classSkills.length > 0
          ? classSkills.reduce((slots, classSkill) => {
              return insertSkill(slots, classSkill)
            }, initialSkillSlots)
          : initialSkillSlots

      const unitWithSkills = {
        ...unit,
        position,
        skillSlots,
      }

      formation[idx] = unitWithSkills
      return { ...team, formation }
    })
  }

  const updateUnit = (unitId: string, updates: Partial<Unit>) => {
    modifyTeam(currentTeamId, team => {
      const formation = team.formation.map(unit => {
        if (!unit || unit.id !== unitId) return unit

        const unitWithSkills = ensureSkillSlots(unit)

        // Check if level is being updated and if it increased
        let updatedUnit = { ...unitWithSkills, ...updates }

        // Track skill slots to update
        let updatedSkillSlots = [...updatedUnit.skillSlots]
        const maxSkills = 10
        const currentSkillIds = updatedSkillSlots
          .map(skillSlot => skillSlot.skillId)
          .filter(
            (skillId): skillId is NonNullable<typeof skillId> =>
              skillId !== null
          )

        // Check if level increased - add new class skills
        if (updates.level !== undefined && updates.level > unit.level) {
          const availableClassSkills = getClassSkills(updatedUnit)

          // Find skills that are now available but not in skillSlots yet
          const newSkillsToAdd = availableClassSkills.filter(
            availableSkill =>
              !currentSkillIds.includes(availableSkill.skill.id) &&
              updatedSkillSlots.length < maxSkills
          )

          // Add new class skills
          if (newSkillsToAdd.length > 0) {
            newSkillsToAdd.forEach(newClassSkill => {
              if (updatedSkillSlots.length < maxSkills) {
                updatedSkillSlots = insertSkill(
                  updatedSkillSlots,
                  newClassSkill
                )
                if (!currentSkillIds.includes(newClassSkill.skill.id)) {
                  currentSkillIds.push(newClassSkill.skill.id)
                }
              }
            })
          }
        }

        // Check if equipment changed - add new equipment skills
        // Note: Equipment removal is handled automatically by isSkillValidForUnit
        // which will invalidate skills from removed equipment (highlighting them in red)
        if (updates.equipment !== undefined) {
          const oldEquipmentIds = unit.equipment
            .map(equippedItem => equippedItem.itemId)
            .filter(
              (equipmentId): equipmentId is NonNullable<typeof equipmentId> =>
                equipmentId !== null
            )
          const newEquipmentIds = updatedUnit.equipment
            .map(equippedItem => equippedItem.itemId)
            .filter(
              (equipmentId): equipmentId is NonNullable<typeof equipmentId> =>
                equipmentId !== null
            )

          // Find equipment that was added
          const addedEquipmentIds = newEquipmentIds.filter(
            equipmentId => !oldEquipmentIds.includes(equipmentId)
          )

          // For each newly added equipment, check if it provides a skill
          addedEquipmentIds.forEach(equipmentId => {
            const equipment = getEquipmentById(equipmentId)
            if (equipment?.skillId) {
              const equipmentSkillId = equipment.skillId
              // Check if skill is already in slots (using string comparison)
              const alreadyHasSkill = currentSkillIds.some(
                skillIdInSlot =>
                  String(skillIdInSlot) === String(equipmentSkillId)
              )

              if (!alreadyHasSkill) {
                // Find the skill in the available skills
                const equipmentSkills = getEquipmentSkills(updatedUnit)
                const newEquipmentSkill = equipmentSkills.find(
                  equipmentSkill => equipmentSkill.skill.id === equipmentSkillId
                )

                if (newEquipmentSkill && updatedSkillSlots.length < maxSkills) {
                  updatedSkillSlots = insertSkill(
                    updatedSkillSlots,
                    newEquipmentSkill
                  )
                  if (!currentSkillIds.includes(newEquipmentSkill.skill.id)) {
                    currentSkillIds.push(newEquipmentSkill.skill.id)
                  }
                }
              }
            }
          })

          // When equipment changes (add or remove), we need to ensure React re-renders
          // by creating a new unit object reference. This allows isSkillValidForUnit
          // to re-evaluate skills and highlight invalid ones (from removed equipment)
        }

        // Always create a new unit object to ensure React detects the change
        // This is important for equipment changes to trigger re-renders
        // The new reference will cause SkillTacticsRow to re-render and re-validate skills
        updatedUnit = { ...updatedUnit, skillSlots: updatedSkillSlots }

        return updatedUnit
      })
      return { ...team, formation }
    })
  }

  const updateMultipleUnits = (
    updates: Array<{ id: string; updates: Partial<Unit> }>
  ) => {
    modifyTeam(currentTeamId, team => {
      const formation = team.formation.map(u => {
        if (!u) return u
        const unitUpdate = updates.find(update => update.id === u.id)
        if (!unitUpdate) return u

        const unitWithSkills = ensureSkillSlots(u)
        return { ...unitWithSkills, ...unitUpdate.updates }
      })
      return { ...team, formation }
    })
  }

  const removeUnit = (id: string) => {
    modifyTeam(currentTeamId, team => {
      const formation = team.formation.map(u => (u?.id === id ? null : u))
      return { ...team, formation }
    })
  }

  const moveUnit = (id: string, newPosition: Position) => {
    modifyTeam(currentTeamId, team => {
      const idx = getIndex(newPosition)
      if (team.formation[idx]) throw new Error('New position occupied')

      const unit = team.formation.find(u => u?.id === id) ?? null
      if (!unit) return team

      const formation = team.formation.map(u => (u?.id === id ? null : u))
      formation[idx] = { ...unit, position: newPosition }
      return { ...team, formation }
    })
  }

  const swapUnits = (from: Position, to: Position) => {
    modifyTeam(currentTeamId, team => {
      const fromIdx = getIndex(from)
      const toIdx = getIndex(to)

      const formation = [...team.formation]
      const fromUnit = formation[fromIdx]
      const toUnit = formation[toIdx]

      if (!fromUnit && !toUnit) return team

      formation[fromIdx] = toUnit ? { ...toUnit, position: from } : null
      formation[toIdx] = fromUnit ? { ...fromUnit, position: to } : null

      return { ...team, formation }
    })
  }

  const handleSetCurrentTeam = (id: string) => {
    setCurrentTeamId(id)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('active-team-id', id)
    }
  }

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeamId,
        setCurrentTeam: handleSetCurrentTeam,
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

export function TeamProvider({ children }: { children: ReactNode }) {
  const defaultTeams = getDefaultTeams()
  const [teams, setTeamsState, validationError] = useLocalStorage<
    Record<string, Team>
  >('team-data', defaultTeams, validateTeamData)

  const handleReset = () => {
    setTeamsState(defaultTeams)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('team-data')
      const firstTeamId = Object.keys(defaultTeams)[0] || generateRandomId()
      window.localStorage.setItem('active-team-id', firstTeamId)
    }
  }

  const handleRepair = (repairedTeams: Record<string, Team>) => {
    setTeamsState(repairedTeams)
  }

  // Wrapper to ensure setTeams always updates localStorage
  const setTeamsWithStorage = (
    value:
      | Record<string, Team>
      | ((prev: Record<string, Team>) => Record<string, Team>)
  ) => {
    const updated = typeof value === 'function' ? value(teams) : value
    setTeamsState(updated)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('team-data', JSON.stringify(updated))
    }
  }

  return (
    <TeamErrorProvider
      validationError={validationError}
      onReset={handleReset}
      onRepair={handleRepair}
    >
      <TeamProviderInner teams={teams} setTeams={setTeamsWithStorage}>
        {children}
      </TeamProviderInner>
    </TeamErrorProvider>
  )
}
