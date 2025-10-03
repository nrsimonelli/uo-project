import { useCallback } from 'react'
import type { Team } from '@/types/team'

interface TeamExportData {
  version: string
  exportDate: string
  teamName: string
  team: Team
}

// Schema migration functions for future compatibility
const migrateTeamData = (data: any): TeamExportData => {
  // Handle different versions gracefully
  if (!data.version) {
    // Assume legacy format, try to migrate
    if (data.team || data.formation) {
      return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        teamName: data.teamName || data.team?.name || 'Imported Team',
        team: data.team || {
          id: 'imported',
          name: data.teamName || 'Imported Team',
          formation: data.formation || Array(6).fill(null),
        },
      }
    }
  }

  // Current version - return as is but ensure required fields
  return {
    version: data.version || '1.0',
    exportDate: data.exportDate || new Date().toISOString(),
    teamName: data.teamName || data.team?.name || 'Imported Team',
    team: {
      id: data.team?.id || 'imported',
      name: data.team?.name || data.teamName || 'Imported Team',
      formation: data.team?.formation || Array(6).fill(null),
      // Preserve any additional fields for future compatibility
      ...data.team,
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
        // Deep clone to avoid mutations and ensure clean export
        formation: team.formation.map((unit) => (unit ? { ...unit } : null)),
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

          // Basic validation - be lenient for future compatibility
          if (!migratedData.team) {
            throw new Error('No team data found in import')
          }

          if (!Array.isArray(migratedData.team.formation)) {
            throw new Error('Invalid formation data')
          }

          // Ensure formation has correct length, pad or truncate as needed
          const formation = [...migratedData.team.formation]
          while (formation.length < 6) formation.push(null)
          if (formation.length > 6) formation.splice(6)

          migratedData.team.formation = formation

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
