import { Copy, Upload, AlertCircle, CheckCircle, Clipboard } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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

    try {
      const importData = await importTeam(importDialog.inputJson)
      setImportDialog(prev => ({
        ...prev,
        step: 'preview',
        data: importData,
        error: undefined,
      }))
    } catch (error) {
      setImportDialog(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Import failed',
      }))
    }
  }

  const handleConfirmImport = () => {
    if (importDialog.data?.team) {
      onImportTeam(importDialog.data.team)
      setImportDialog({ open: false, step: 'input', inputJson: '' })
      toast.success('Team imported successfully!', {
        description: `"${importDialog.data.team.name}" has been loaded`,
      })
    }
  }

  const handleBackToInput = () => {
    setImportDialog(prev => ({
      ...prev,
      step: 'input',
      data: undefined,
      error: undefined,
    }))
  }

  const handleCancelImport = () => {
    setImportDialog({ open: false, step: 'input', inputJson: '' })
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

          {importDialog.step === 'input' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="import-json" className="text-sm font-medium">
                  Team JSON Data
                </label>
                <Textarea
                  id="import-json"
                  value={importDialog.inputJson}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleImportJsonChange(e.target.value)
                  }
                  placeholder="Paste team JSON data here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              {importDialog.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importDialog.error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancelImport}>
                  Cancel
                </Button>
                <Button
                  onClick={handleParseJson}
                  disabled={!importDialog.inputJson.trim()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Parse & Preview
                </Button>
              </div>
            </div>
          ) : importDialog.data ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Team "{importDialog.data.teamName}" is ready to import.
                </AlertDescription>
              </Alert>

              {hasUnits && (
                <Alert variant={'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Importing will overwrite "{team.name}". All units in the
                    current team will be replaced.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Team Details:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Name: {importDialog.data.team.name}</p>
                  <p>
                    Units:{' '}
                    {
                      importDialog.data.team.formation.filter(u => u !== null)
                        .length
                    }
                    /5
                  </p>
                  <p>
                    Exported:{' '}
                    {new Date(
                      importDialog.data.exportDate
                    ).toLocaleDateString()}
                  </p>
                  <p>Version: {importDialog.data.version}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleBackToInput}>
                  Back
                </Button>
                <Button variant="outline" onClick={handleCancelImport}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmImport}>Import Team</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
