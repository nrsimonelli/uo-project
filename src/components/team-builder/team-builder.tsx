import { useState } from 'react'
import { TeamSlot } from './team-slot'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { UnitSearchModal } from './unit-search-modal'
import { useCurrentTeam, useTeam } from '@/hooks/use-team'
import { Button } from '../ui/button'
import { Trash } from 'lucide-react'
import { COLS, type Position, type Col, type Row } from '@/types/team'
import { ScrollArea } from '../ui/scroll-area'
import { IsometricFormationBuilder } from '../isometric-formation/isometric-formation-builder'
import { IsometricFormationDisplay } from '../isometric-formation/isometric-formation-display'
import { EditableTeamName } from './editable-team-name'

export const TeamBuilder = () => {
  const currentTeam = useCurrentTeam()
  const {
    teams,
    currentTeamId,
    setCurrentTeam,
    updateTeamName,
    removeUnit,
    swapUnits,
  } = useTeam()

  const firstUnit = currentTeam.formation.find((unit) => unit !== null)

  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
    () => firstUnit?.id
  )

  const filteredTeamFormation = currentTeam.formation.filter(
    (unit) => unit !== null
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
    const nextUnitId = filteredTeamFormation.filter(
      (unit) => unit.id !== unitId
    )[0]?.id
    removeUnit(unitId)
    setSelectedUnitId(nextUnitId)
  }

  const handleSelectTeam = (key: string) => {
    const nextUnitId = teams[key]?.formation.find((unit) => unit !== null)?.id
    setCurrentTeam(key)
    setSelectedUnitId(nextUnitId)
  }

  const shouldShowAddUnit = filteredTeamFormation.length < 5

  // Get teams in order (team-1 through team-6)
  const orderedTeams = Object.entries(teams).sort(([a], [b]) => {
    const numA = parseInt(a.split('-')[1])
    const numB = parseInt(b.split('-')[1])
    return numA - numB
  })

  return (
    <div className='w-full space-y-6 p-6'>
      <p className='text-xl'>Team Builder</p>
      <div className='flex flex-row justify-between gap-8'>
        <div className='flex flex-col space-y-4 flex-1'>
          <EditableTeamName 
            teamName={currentTeam.name} 
            onSave={handleUpdateTeamName}
          />
          <IsometricFormationBuilder
            formation={currentTeam.formation}
            orientation={'right-facing'}
            onSwap={handleSwap}
          />
        </div>
        <div className='flex flex-col space-y-3 w-64'>
          <p className='text-lg font-semibold text-center'>Your Teams</p>
          <ScrollArea className='h-[400px] pr-2'>
            <div className='space-y-4 pt-2'>
              {orderedTeams.map(([key, team]) => {
                const isEmpty = team.formation.every(unit => unit === null)
                const isSelected = key === currentTeamId
                
                return (
                  <div
                    key={`${key}-${team.id}`}
                    className={`relative cursor-pointer transition-all duration-200 rounded-lg p-2 mx-auto max-w-fit ${
                      isEmpty ? 'opacity-60' : 'opacity-100'
                    } ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25' 
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                    onClick={() => handleSelectTeam(key)}
                  >
                    <div className='flex justify-center'>
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
        <TabsList className='w-full flex-wrap h-auto'>
          {filteredTeamFormation.map((unit) => (
            <TabsTrigger key={unit.id} value={unit.id}>
              {unit.class}
            </TabsTrigger>
          ))}
          {shouldShowAddUnit && (
            <UnitSearchModal
              team={currentTeam}
              onUnitAdded={(unit) => setSelectedUnitId(unit.id)}
            />
          )}
        </TabsList>

        {filteredTeamFormation.map((unit) => (
          <TabsContent key={unit.id} value={unit.id}>
            <TeamSlot unit={unit}>
              <Button
                onClick={() => handleRemoveUnit(unit.id)}
                variant='destructive'
                className='absolute top-2 right-2 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10'
              >
                <Trash className='w-4 h-4' />
              </Button>
            </TeamSlot>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
