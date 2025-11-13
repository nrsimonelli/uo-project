import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

import type { Team } from '@/types/team'
import { repairTeamData } from '@/utils/team-repair'
import type { ValidationResult } from '@/utils/team-validation'

export interface TeamErrorContextValue {
  validationError: ValidationResult | null
  repairLog: string[]
  isRepairing: boolean
  resetToDefault: () => void
  attemptRepair: (corruptedData: unknown) => {
    success: boolean
    repairCount: number
  }
}

const TeamErrorContext = createContext<TeamErrorContextValue | undefined>(
  undefined
)

// eslint-disable-next-line react-refresh/only-export-components
export function useTeamError() {
  const context = useContext(TeamErrorContext)
  if (!context) {
    throw new Error('useTeamError must be used within TeamErrorProvider')
  }
  return context
}

interface TeamErrorProviderProps {
  children: ReactNode
  validationError: ValidationResult | null
  onReset: () => void
  onRepair: (repairedTeams: Record<string, Team>) => void
}

export function TeamErrorProvider({
  children,
  validationError,
  onReset,
  onRepair,
}: TeamErrorProviderProps) {
  const [repairLog, setRepairLog] = useState<string[]>([])
  const [isRepairing, setIsRepairing] = useState(false)

  const resetToDefault = useCallback(() => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('team-data')
    }

    // Reset error state
    setRepairLog([])

    // Call parent callback to reset teams
    onReset()
  }, [onReset])

  const attemptRepair = useCallback(
    (corruptedData: unknown): { success: boolean; repairCount: number } => {
      setIsRepairing(true)
      setRepairLog([])

      try {
        const repairResult = repairTeamData(corruptedData)

        if (!repairResult) {
          setRepairLog(['Repair failed: Unable to repair data'])
          setIsRepairing(false)
          return { success: false, repairCount: 0 }
        }

        // Store repair log
        const repairCount = repairResult.repairs.length
        setRepairLog(repairResult.repairs)

        // Save repaired data to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'team-data',
            JSON.stringify(repairResult.repaired)
          )
        }

        // Call parent callback to update teams
        onRepair(repairResult.repaired)

        setIsRepairing(false)
        return { success: true, repairCount }
      } catch (error) {
        setRepairLog([
          `Repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ])
        setIsRepairing(false)
        return { success: false, repairCount: 0 }
      }
    },
    [onRepair]
  )

  return (
    <TeamErrorContext.Provider
      value={{
        validationError,
        repairLog,
        isRepairing,
        resetToDefault,
        attemptRepair,
      }}
    >
      {children}
    </TeamErrorContext.Provider>
  )
}
