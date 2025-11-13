import { AlertTriangle, RotateCcw, Wrench } from 'lucide-react'
import { toast } from 'sonner'

import { useTeamError } from './team-error-context'

import { PageLayout } from '@/components/page-layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function TeamDataError() {
  const {
    validationError,
    repairLog,
    isRepairing,
    resetToDefault,
    attemptRepair,
  } = useTeamError()

  if (!validationError || validationError.isValid) {
    return null
  }

  // Get corrupted data from localStorage for repair attempt
  const getCorruptedData = (): unknown => {
    if (typeof window === 'undefined') return null
    try {
      const item = window.localStorage.getItem('team-data')
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  const handleRepair = () => {
    const corruptedData = getCorruptedData()
    const { success, repairCount } = attemptRepair(corruptedData)

    if (success) {
      toast.success('Team data repaired successfully', {
        description:
          repairCount > 0
            ? `${repairCount} issue${repairCount !== 1 ? 's' : ''} fixed. Your teams have been restored.`
            : 'Your teams have been restored.',
      })
    } else {
      toast.error('Repair failed', {
        description:
          'Unable to repair team data. Please try resetting to default teams.',
      })
    }
  }

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all team data? This will delete all your teams and cannot be undone.'
      )
    ) {
      resetToDefault()
      toast.success('Teams reset to default', {
        description:
          'All team data has been cleared and reset to default teams.',
      })
    }
  }

  return (
    <PageLayout>
      <Alert variant="destructive" className="m-4 max-w-4xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Team Data Error Detected</h3>
            <p className="text-sm mb-4">
              The team data stored in your browser appears to be corrupted or
              invalid. Please choose an option below to fix the issue.
            </p>
          </div>

          {validationError.errors.length > 0 && (
            <div className="bg-destructive/10 rounded-md p-3 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium mb-2">Error Details:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {validationError.errors.slice(0, 10).map((error, index) => (
                  <li key={index}>
                    <span className="font-mono text-xs">{error.path}:</span>{' '}
                    {error.message}
                  </li>
                ))}
                {validationError.errors.length > 10 && (
                  <li className="text-muted-foreground">
                    ... and {validationError.errors.length - 10} more errors
                  </li>
                )}
              </ul>
            </div>
          )}

          {repairLog.length > 0 && (
            <div className="bg-blue-500/10 rounded-md p-3 max-h-32 overflow-y-auto">
              <p className="text-xs font-medium mb-2">Repair Log:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {repairLog.map((log, index) => (
                  <li key={index}>{log}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReset}
              disabled={isRepairing}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default Teams
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRepair}
              disabled={isRepairing}
            >
              <Wrench className="h-4 w-4 mr-2" />
              {isRepairing ? 'Repairing...' : 'Try to Repair'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>Reset to Default:</strong> Clears all team data and starts
            fresh with default teams.
            <br />
            <strong>Try to Repair:</strong> Attempts to automatically fix common
            data issues.
          </p>
        </AlertDescription>
      </Alert>
    </PageLayout>
  )
}
