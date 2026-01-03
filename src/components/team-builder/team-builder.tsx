import { Trash } from 'lucide-react'
import { useState } from 'react'

import { EditableTeamName } from './editable-team-name'
import { TeamImportExport } from './team-import-export'
import { TeamSlot } from './team-slot'
import { UnitSearchModal } from './unit-search-modal'

import { IsometricFormationBuilder } from '@/components/isometric-formation/isometric-formation-builder'
import { IsometricFormationDisplay } from '@/components/isometric-formation/isometric-formation-display'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentTeam, useTeam } from '@/hooks/use-team'
import { cn } from '@/lib/utils'
import {
  COLS,
  type Position,
  type Col,
  type Row,
  type Team,
} from '@/types/team'

const NO_UNIT_ID = 'empty-team-ui'

export function TeamBuilder() {
  const currentTeam = useCurrentTeam()
  const {
    teams,
    currentTeamId,
    setCurrentTeam,
    updateTeamName,
    importTeam,
    removeUnit,
    swapUnits,
  } = useTeam()

  const firstUnitId =
    currentTeam.formation.find(unit => unit !== null)?.id ?? NO_UNIT_ID

  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
    () => firstUnitId
  )

  const filteredTeamFormation = currentTeam.formation.filter(
    unit => unit !== null
  )

  const handleSwap = (fromIdx: number, toIdx: number) => {
    const rowFrom = Math.floor(fromIdx / COLS.length) as Row
    const colFrom = (fromIdx % COLS.length) as Col
    const from: Position = { row: rowFrom, col: colFrom }

    const rowTo = Math.floor(toIdx / COLS.length) as Row
    const colTo = (toIdx % COLS.length) as Col
    const to: Position = { row: rowTo, col: colTo }

    swapUnits(from, to)
  }

  const handleUpdateTeamName = (newName: string) => {
    updateTeamName(currentTeamId, newName)
  }

  const handleRemoveUnit = (unitId: string) => {
    const nextUnitId =
      filteredTeamFormation.filter(unit => unit.id !== unitId)[0]?.id ??
      NO_UNIT_ID
    removeUnit(unitId)
    setSelectedUnitId(nextUnitId)
  }

  const handleSelectTeam = (key: string) => {
    const nextUnitId =
      teams[key]?.formation.find(unit => unit !== null)?.id ?? NO_UNIT_ID
    setCurrentTeam(key)
    setSelectedUnitId(nextUnitId)
  }

  const handleImportTeam = (team: Team) => {
    importTeam(team)
    // The imported team now replaces the current team, so we stay on the same team
    const firstUnitId =
      team.formation.find(unit => unit !== null)?.id ?? NO_UNIT_ID
    setSelectedUnitId(firstUnitId)
  }

  const shouldShowAddUnit = filteredTeamFormation.length < 5

  // Will teams ever not be in order?
  const orderedTeams = Object.entries(teams).sort(([a], [b]) => {
    const numA = parseInt(a.split('-')[1])
    const numB = parseInt(b.split('-')[1])
    return numA - numB
  })

  return (
    <PageLayout>
      <div className="space-y-8">
        <PageHeader
          title="Team Builder"
          description="Create and manage your battle formations with powerful unit combinations."
        />

        <Card>
          <div className="px-4">
            <div className="flex flex-row justify-between gap-8">
              <div className="flex flex-col space-y-4 flex-1">
                <EditableTeamName
                  teamName={currentTeam.name}
                  onSave={handleUpdateTeamName}
                />

                <IsometricFormationBuilder
                  key={currentTeamId}
                  formation={currentTeam.formation}
                  orientation={'right-facing'}
                  onSwap={handleSwap}
                  onUnitSelect={setSelectedUnitId}
                />
              </div>
              <div className="flex flex-col space-y-3">
                <TeamImportExport
                  team={currentTeam}
                  onImportTeam={handleImportTeam}
                />
                <ScrollArea className="max-h-[300px] pr-1">
                  <div className="space-y-4 py-2 px-2 ">
                    {orderedTeams.map(([key, team]) => {
                      const isEmpty = team.formation.every(
                        unit => unit === null
                      )
                      const isSelected = key === currentTeamId

                      return (
                        <div
                          key={`${key}-${team.id}`}
                          className={cn(
                            'relative cursor-pointer transition-all duration-200 rounded-sm p-2 mx-auto max-w-fit',
                            isEmpty ? 'opacity-60' : 'opacity-100',
                            isSelected
                              ? 'ring-2 ring-primary shadow-lg shadow-primary/25'
                              : 'hover:ring-1 hover:ring-muted'
                          )}
                          onClick={() => handleSelectTeam(key)}
                        >
                          <div className="flex justify-center">
                            <IsometricFormationDisplay
                              formation={team.formation}
                              orientation={'left-facing'}
                              onSelectTeam={() => handleSelectTeam(key)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <Tabs value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <TabsList className="w-full">
                {filteredTeamFormation.map(unit => (
                  <TabsTrigger key={unit.id} value={unit.id}>
                    {unit.classKey}
                  </TabsTrigger>
                ))}
                {shouldShowAddUnit && (
                  <UnitSearchModal
                    team={currentTeam}
                    onUnitAdded={unit => setSelectedUnitId(unit.id)}
                  />
                )}
              </TabsList>

              {filteredTeamFormation.map(unit => (
                <TabsContent key={unit.id} value={unit.id}>
                  <TeamSlot unit={unit}>
                    <Button
                      onClick={() => handleRemoveUnit(unit.id)}
                      variant="destructive"
                      className="absolute top-2 right-2 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TeamSlot>
                </TabsContent>
              ))}
              <TabsContent value={NO_UNIT_ID}>
                <Card className="p-4 space-y-6">
                  <div className="flex flex-col space-y-2">
                    <p className="text-lg font-medium">No units yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first unit to start building your team.
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
