import { useCallback } from 'react'

import type { Team } from '@/types/team'
import { repairSingleTeam } from '@/utils/team-repair'
import {
  validateSingleTeam,
  type ValidationResult,
} from '@/utils/team-validation'

interface TeamExportData {
  version: string
  exportDate: string
  teamName: string
  team: Team
}

export interface ImportResult {
  data?: TeamExportData
  validation?: ValidationResult
  repaired?: Team
  repairs?: string[]
  error?: string
}

// Comprehensive validation with repair option
const validateImportData = (
  data: unknown,
  attemptRepair: boolean = true
): ImportResult => {
  if (!data || typeof data !== 'object') {
    return {
      error: 'Invalid data format',
    }
  }

  const obj = data as Record<string, unknown>

  // Handle both current and legacy formats
  const rawTeam = (obj.team as Team) || {
    id: 'imported',
    name: (obj.teamName as string) || 'Imported Team',
    formation: (obj.formation as Team['formation']) || Array(6).fill(null),
  }

  if (!rawTeam.formation || !Array.isArray(rawTeam.formation)) {
    return {
      error: 'Invalid formation data',
    }
  }

  // Ensure exactly 6 formation slots
  const formation = [...rawTeam.formation]
  while (formation.length < 6) formation.push(null)
  if (formation.length > 6) formation.splice(6)

  const team = {
    ...rawTeam,
    formation,
  }

  // Validate the team using comprehensive validation
  const validation = validateSingleTeam(team)

  // If validation passes, return the validated team
  if (validation.isValid && validation.data) {
    return {
      data: {
        version: (obj.version as string) || '1.0',
        exportDate: (obj.exportDate as string) || new Date().toISOString(),
        teamName: (obj.teamName as string) || validation.data.name,
        team: validation.data,
      },
      validation,
    }
  }

  // If validation fails, attempt repair if requested
  if (attemptRepair) {
    const repairResult = repairSingleTeam(team)
    if (repairResult.repaired) {
      // Validate the repaired team
      const repairedValidation = validateSingleTeam(repairResult.repaired)
      if (repairedValidation.isValid && repairedValidation.data) {
        return {
          data: {
            version: (obj.version as string) || '1.0',
            exportDate: (obj.exportDate as string) || new Date().toISOString(),
            teamName: (obj.teamName as string) || repairedValidation.data.name,
            team: repairedValidation.data,
          },
          validation: repairedValidation,
          repaired: repairedValidation.data,
          repairs: repairResult.repairs,
        }
      }
    }

    // Repair failed or repaired team still invalid
    return {
      validation,
      repaired: repairResult.repaired || undefined,
      repairs: repairResult.repairs,
      error: 'Team data has validation errors and could not be fully repaired',
    }
  }

  // No repair attempted, return validation errors
  return {
    validation,
    error: 'Team data has validation errors',
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

  const importTeam = useCallback(
    (jsonString: string, attemptRepair: boolean = true): ImportResult => {
      try {
        const rawData = JSON.parse(jsonString)
        return validateImportData(rawData, attemptRepair)
      } catch (error) {
        if (error instanceof SyntaxError) {
          return {
            error: 'Invalid JSON format. Please check your input.',
          }
        }
        return {
          error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
    []
  )

  return {
    exportTeam,
    importTeam,
  }
}
