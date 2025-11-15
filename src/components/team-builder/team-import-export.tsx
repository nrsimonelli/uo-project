import { Copy, Upload, AlertCircle, CheckCircle, Clipboard } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { IsometricFormationBase } from '@/components/isometric-formation/isometric-formation-base'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useTeamImportExport } from '@/hooks/use-team-import-export'
import type { Team } from '@/types/team'

interface RepairAlertProps {
  repairs: string[]
}

function RepairAlert({ repairs }: RepairAlertProps) {
  if (repairs.length === 0) return null

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium mb-2">Team was automatically repaired</p>
        <div className="text-sm space-y-1 mt-2">
          <p className="font-medium">Repairs made:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {repairs.map((repair, idx) => (
              <li key={idx} className="text-xs">
                {repair}
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}

interface ValidationErrorsAlertProps {
  errors: Array<{ path: string; message: string }>
}

function ValidationErrorsAlert({ errors }: ValidationErrorsAlertProps) {
  if (errors.length === 0) return null

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium mb-2">Validation errors ({errors.length}):</p>
        <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
          {errors.slice(0, 10).map((error, idx) => (
            <div key={idx} className="text-xs">
              <span className="font-mono text-xs">{error.path}:</span>{' '}
              {error.message}
            </div>
          ))}
          {errors.length > 10 && (
            <p className="text-xs text-muted-foreground">
              ... and {errors.length - 10} more errors
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

function SuccessAlert({ teamName }: { teamName: string }) {
  return (
    <Alert>
      <AlertDescription className="inline-flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        <p>Team "{teamName}" is ready to import.</p>
      </AlertDescription>
    </Alert>
  )
}

function OverwriteWarning({ currentTeamName }: { currentTeamName: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription className="inline-flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p>
          Importing will overwrite "{currentTeamName}". All units in the current
          team will be replaced.
        </p>
      </AlertDescription>
    </Alert>
  )
}

interface TeamDetailsProps {
  team: Team
  exportDate: string
  version: string
}

function TeamDetails({ team, exportDate, version }: TeamDetailsProps) {
  const unitCount = team.formation.filter(u => u !== null).length

  return (
    <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
      <div className="space-y-2">
        <p className="text-sm font-medium">Team Details:</p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Name: {team.name}</p>
          <p>Units: {unitCount}/5</p>
          <p>Exported: {new Date(exportDate).toLocaleDateString()}</p>
          <p>Version: {version}</p>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <IsometricFormationBase
          formation={team.formation}
          orientation="left-facing"
          scale={0.5}
        />
      </div>
    </div>
  )
}

interface ImportInputStepProps {
  inputJson: string
  error?: string
  onInputChange: (value: string) => void
  onParse: () => void
  onCancel: () => void
}

function ImportInputStep({
  inputJson,
  error,
  onInputChange,
  onParse,
  onCancel,
}: ImportInputStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="import-json" className="text-sm font-medium">
          Team JSON Data
        </label>
        <Textarea
          id="import-json"
          value={inputJson}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onInputChange(e.target.value)
          }
          placeholder="Paste team JSON data here..."
          className="min-h-[300px] font-mono text-sm"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onParse} disabled={!inputJson.trim()}>
          <Upload className="h-4 w-4 mr-1" />
          Parse & Preview
        </Button>
      </div>
    </div>
  )
}

interface ImportPreviewStepProps {
  data: {
    version: string
    exportDate: string
    teamName: string
    team: Team
  }
  validation?: {
    isValid: boolean
    errors: Array<{ path: string; message: string }>
  }
  repairs?: string[]
  wasRepaired?: boolean
  currentTeamName: string
  hasUnits: boolean
  onBack: () => void
  onCancel: () => void
  onConfirm: () => void
}

function ImportPreviewStep({
  data,
  validation,
  repairs = [],
  wasRepaired = false,
  currentTeamName,
  hasUnits,
  onBack,
  onCancel,
  onConfirm,
}: ImportPreviewStepProps) {
  const showValidationErrors =
    validation &&
    !validation.isValid &&
    validation.errors.length > 0 &&
    !wasRepaired

  return (
    <div className="space-y-4">
      {wasRepaired ? (
        <RepairAlert repairs={repairs} />
      ) : (
        <SuccessAlert teamName={data.teamName} />
      )}

      {showValidationErrors && (
        <ValidationErrorsAlert errors={validation.errors} />
      )}

      {hasUnits && <OverwriteWarning currentTeamName={currentTeamName} />}

      <TeamDetails
        team={data.team}
        exportDate={data.exportDate}
        version={data.version}
      />

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>Import Team</Button>
      </div>
    </div>
  )
}

interface TeamImportExportProps {
  team: Team
  onImportTeam: (team: Team) => void
}

export function TeamImportExport({
  team,
  onImportTeam,
}: TeamImportExportProps) {
  const { exportTeam, importTeam } = useTeamImportExport()

  const [exportDialog, setExportDialog] = useState(false)
  const [exportedJson, setExportedJson] = useState('')

  const [importDialog, setImportDialog] = useState<{
    open: boolean
    step: 'input' | 'preview'
    inputJson: string
    data?: {
      version: string
      exportDate: string
      teamName: string
      team: Team
    }
    validation?: {
      isValid: boolean
      errors: Array<{ path: string; message: string }>
    }
    repairs?: string[]
    wasRepaired?: boolean
    error?: string
  }>({ open: false, step: 'input', inputJson: '' })

  const handleExport = () => {
    try {
      const { jsonString } = exportTeam(team)
      setExportedJson(jsonString)
      setExportDialog(true)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export team')
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedJson)
      setExportDialog(false)
      toast.success('Team exported to clipboard!', {
        description: `"${team.name}" is ready to share`,
      })
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleImportClick = () => {
    setImportDialog({
      open: true,
      step: 'input',
      inputJson: '',
      data: undefined,
      validation: undefined,
      repairs: undefined,
      wasRepaired: undefined,
      error: undefined,
    })
  }

  const handleImportJsonChange = (value: string) => {
    setImportDialog(prev => ({
      ...prev,
      inputJson: value,
      error: undefined,
    }))
  }

  const handleParseJson = async () => {
    if (!importDialog.inputJson.trim()) {
      setImportDialog(prev => ({
        ...prev,
        error: 'Please paste team JSON data',
      }))
      return
    }

    const result = importTeam(importDialog.inputJson, true)

    if (result.error) {
      setImportDialog(prev => ({
        ...prev,
        error: result.error,
        validation: result.validation,
        repairs: result.repairs,
      }))
      return
    }

    if (result.data) {
      setImportDialog(prev => ({
        ...prev,
        step: 'preview',
        data: result.data,
        validation: result.validation,
        repairs: result.repairs,
        wasRepaired: !!result.repaired,
        error: undefined,
      }))
    } else {
      // Validation failed and repair didn't produce valid data
      setImportDialog(prev => ({
        ...prev,
        error: result.error || 'Team data has validation errors',
        validation: result.validation,
        repairs: result.repairs,
      }))
    }
  }

  const handleConfirmImport = () => {
    if (importDialog.data?.team) {
      onImportTeam(importDialog.data.team)
      const wasRepaired = importDialog.wasRepaired
      setImportDialog({
        open: false,
        step: 'input',
        inputJson: '',
        data: undefined,
        validation: undefined,
        repairs: undefined,
        wasRepaired: undefined,
        error: undefined,
      })
      toast.success('Team imported successfully!', {
        description: wasRepaired
          ? `"${importDialog.data.team.name}" has been loaded (repaired)`
          : `"${importDialog.data.team.name}" has been loaded`,
      })
    }
  }

  const handleBackToInput = () => {
    setImportDialog(prev => ({
      ...prev,
      step: 'input',
      data: undefined,
      validation: undefined,
      repairs: undefined,
      wasRepaired: undefined,
      error: undefined,
    }))
  }

  const handleCancelImport = () => {
    setImportDialog({
      open: false,
      step: 'input',
      inputJson: '',
      data: undefined,
      validation: undefined,
      repairs: undefined,
      wasRepaired: undefined,
      error: undefined,
    })
  }

  const hasUnits = team.formation.some(unit => unit !== null)

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={!hasUnits}
          title={hasUnits ? 'Export this team' : 'Add units to export team'}
        >
          <Copy className="h-4 w-4 mr-1" />
          Export JSON
        </Button>

        <Button variant="outline" size="sm" onClick={handleImportClick}>
          <Clipboard className="h-4 w-4 mr-1" />
          Import JSON
        </Button>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onOpenChange={setExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Team</DialogTitle>
            <DialogDescription>
              Copy this JSON data to share your team build
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="export-json" className="text-sm font-medium">
                Team JSON Data
              </label>
              <Textarea
                id="export-json"
                value={exportedJson}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setExportDialog(false)}>
                Close
              </Button>
              <Button onClick={handleCopyToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copy & Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialog.open}
        onOpenChange={open => !open && handleCancelImport()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {importDialog.step === 'input' ? 'Import Team' : 'Confirm Import'}
            </DialogTitle>
            <DialogDescription>
              {importDialog.step === 'input'
                ? 'Paste the team JSON data below'
                : 'Review the team data before importing'}
            </DialogDescription>
          </DialogHeader>

          {importDialog.step === 'input' && (
            <ImportInputStep
              inputJson={importDialog.inputJson}
              error={importDialog.error}
              onInputChange={handleImportJsonChange}
              onParse={handleParseJson}
              onCancel={handleCancelImport}
            />
          )}

          {importDialog.step === 'preview' && importDialog.data && (
            <ImportPreviewStep
              data={importDialog.data}
              validation={importDialog.validation}
              repairs={importDialog.repairs}
              wasRepaired={importDialog.wasRepaired}
              currentTeamName={team.name}
              hasUnits={hasUnits}
              onBack={handleBackToInput}
              onCancel={handleCancelImport}
              onConfirm={handleConfirmImport}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
