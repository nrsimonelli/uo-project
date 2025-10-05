import { useCallback } from 'react'

import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'
import type { Team } from '@/types/team'

interface TeamExportData {
  version: string
  exportDate: string
  teamName: string
  team: Team
}

const validateSkillReference = (skillId: string): boolean => {
  const activeSkillExists = ActiveSkills.some(skill => skill.id === skillId)
  const passiveSkillExists = PassiveSkills.some(skill => skill.id === skillId)
  return activeSkillExists || passiveSkillExists
}

// Simplified validation - just check structure and clean data
const validateImportData = (data: unknown): TeamExportData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format')
  }

  const obj = data as Record<string, unknown>

  // Handle both current and legacy formats
  const team = (obj.team as Team) || {
    id: 'imported',
    name: (obj.teamName as string) || 'Imported Team',
    formation: (obj.formation as Team['formation']) || Array(6).fill(null),
  }

  if (!team.formation || !Array.isArray(team.formation)) {
    throw new Error('Invalid formation data')
  }

  // Ensure exactly 6 formation slots
  const formation = [...team.formation]
  while (formation.length < 6) formation.push(null)
  if (formation.length > 6) formation.splice(6)

  const unitCount = formation.filter(unit => unit !== null).length
  if (unitCount > 5) {
    console.warn(
      `Team has ${unitCount} units, but maximum is 5. Some units may need to be removed.`
    )
  }

  // Clean up invalid skill references
  const cleanedFormation = formation.map(unit => {
    if (!unit) return null

    return {
      ...unit,
      skillSlots:
        unit.skillSlots?.map(slot => {
          if (slot.skillId && !validateSkillReference(slot.skillId)) {
            console.warn(
              `Invalid skill reference: ${slot.skillId}. Removing from slot.`
            )
            return {
              ...slot,
              skillId: null,
              skillType: null,
              tactics: [null, null] as [null, null],
            }
          }
          return slot
        }) || [],
    }
  })

  return {
    version: (obj.version as string) || '1.0',
    exportDate: (obj.exportDate as string) || new Date().toISOString(),
    teamName: (obj.teamName as string) || team.name,
    team: {
      ...team,
      formation: cleanedFormation,
    },
  }
}

export const useTeamImportExport = () => {
  const exportTeam = useCallback((team: Team) => {
    const exportData: TeamExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      teamName: team.name,
      team: {
        ...team,
        formation: team.formation.map(unit => {
          if (!unit) return null

          return {
            ...unit,
            skillSlots: unit.skillSlots
              ? unit.skillSlots.map(slot => ({
                  ...slot,
                  tactics: [...slot.tactics] as [
                    (typeof slot.tactics)[0],
                    (typeof slot.tactics)[1],
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

  const importTeam = useCallback((jsonString: string): TeamExportData => {
    try {
      const rawData = JSON.parse(jsonString)
      return validateImportData(rawData)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please check your input.')
      }
      throw new Error(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }, [])

  return {
    exportTeam,
    importTeam,
  }
}
