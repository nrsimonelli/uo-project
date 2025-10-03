import { useCallback } from 'react'
import type { Team, Unit } from '@/types/team'
import type { SkillSlot } from '@/types/skills'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'

interface TeamExportData {
  version: string
  exportDate: string
  teamName: string
  team: Team
}

// Skill validation helpers
const validateSkillReference = (skillId: string): boolean => {
  const activeSkillExists = ActiveSkills.some((skill) => skill.id === skillId)
  const passiveSkillExists = PassiveSkills.some((skill) => skill.id === skillId)
  return activeSkillExists || passiveSkillExists
}

const validateSkillSlot = (slot: SkillSlot): SkillSlot | null => {
  if (!slot.skillId) {
    return slot
  }

  if (!validateSkillReference(slot.skillId)) {
    console.warn(
      `Invalid skill reference: ${slot.skillId}. Removing from slot.`
    )
    return {
      ...slot,
      skillId: null,
      skillType: null,
      tactics: [null, null], // Clear tactics when skill is invalid
    }
  }

  return slot
}

const validateAndCleanUnit = (unit: Unit): Unit => {
  if (!unit.skillSlots) {
    return { ...unit, skillSlots: [] }
  }

  const validatedSkillSlots = unit.skillSlots
    .map(validateSkillSlot)
    .filter((slot): slot is SkillSlot => slot !== null)

  return {
    ...unit,
    skillSlots: validatedSkillSlots,
  }
}

// Schema migration functions for future compatibility
const migrateTeamData = (data: unknown): TeamExportData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format')
  }

  const dataObj = data as Record<string, unknown>
  let team: Team

  if (!dataObj.version) {
    if (dataObj.team || dataObj.formation) {
      const legacyTeam = dataObj.team as Team | undefined
      team = legacyTeam || {
        id: 'imported',
        name: (dataObj.teamName as string) || 'Imported Team',
        formation:
          (dataObj.formation as (Unit | null)[]) || Array(6).fill(null),
      }
    } else {
      throw new Error('No valid team data found')
    }
  } else {
    const teamData = dataObj.team as Team | undefined
    team = {
      id: teamData?.id || 'imported',
      name: teamData?.name || (dataObj.teamName as string) || 'Imported Team',
      formation: teamData?.formation || Array(6).fill(null),
      // Preserve any additional fields for future compatibility
      ...teamData,
    }
  }

  const cleanedFormation = team.formation.map((unit: Unit | null) => {
    if (!unit) return null
    return validateAndCleanUnit(unit)
  })

  return {
    version: (dataObj.version as string) || '1.0',
    exportDate: (dataObj.exportDate as string) || new Date().toISOString(),
    teamName: (dataObj.teamName as string) || team.name || 'Imported Team',
    team: {
      ...team,
      formation: cleanedFormation,
    },
  }
}

export function useTeamImportExport() {
  const exportTeam = useCallback((team: Team) => {
    const exportData: TeamExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      teamName: team.name,
      team: {
        ...team,
        formation: team.formation.map((unit) => {
          if (!unit) return null

          return {
            ...unit,
            skillSlots: unit.skillSlots
              ? unit.skillSlots.map((slot) => ({
                  ...slot,
                  tactics: [...slot.tactics] as [
                    (typeof slot.tactics)[0],
                    (typeof slot.tactics)[1]
                  ],
                }))
              : [],
          }
        }),
      },
    }

    const jsonString = JSON.stringify(exportData, null, 2)

    return { jsonString, exportData }
  }, [])

  const importTeam = useCallback(
    (jsonString: string): Promise<TeamExportData> => {
      return new Promise((resolve, reject) => {
        try {
          const rawData = JSON.parse(jsonString)
          const migratedData = migrateTeamData(rawData)

          if (!migratedData.team) {
            throw new Error('No team data found in import')
          }

          if (!Array.isArray(migratedData.team.formation)) {
            throw new Error('Invalid formation data')
          }

          const formation = [...migratedData.team.formation]
          while (formation.length < 6) formation.push(null)
          if (formation.length > 6) formation.splice(6)

          const validatedFormation = formation.map((unit: Unit | null) => {
            if (!unit) return null

            try {
              return validateAndCleanUnit(unit)
            } catch (error) {
              console.warn(`Error validating unit ${unit.id}:`, error)
              return { ...unit, skillSlots: [] }
            }
          })

          migratedData.team.formation = validatedFormation

          resolve(migratedData)
        } catch (error) {
          if (error instanceof SyntaxError) {
            reject(new Error('Invalid JSON format. Please check your input.'))
          } else {
            reject(
              new Error(
                `Import failed: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`
              )
            )
          }
        }
      })
    },
    []
  )

  return {
    exportTeam,
    importTeam,
  }
}
