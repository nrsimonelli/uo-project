import { useState } from 'react'
import { TeamSlot } from './team-slot'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { UnitSearchModal } from './unit-search-modal'
import { useCurrentTeam, useTeam } from '@/hooks/use-team'
import { Button } from '../ui/button'
import { Trash } from 'lucide-react'
import { Cols, Rows, type Position } from './team-context'

import { IsometricFormationBuilder } from '../isometric-formation/isometric-formation-builder'
import { IsometricFormationDisplay } from '../isometric-formation/isometric-formation-display'
import { generateRandomId } from '@/core/utils/utils'
import { AddTeamModal } from './add-team-modal'

export const TeamBuilder = () => {
  const currentTeam = useCurrentTeam()
  const {
    teams,
    currentTeamId,
    setCurrentTeam,
    addTeam,
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
    const rowFrom = Math.floor(fromIdx / Cols.length) as (typeof Rows)[number]
    const colFrom = (fromIdx % Cols.length) as (typeof Cols)[number]
    const from: Position = { row: rowFrom, col: colFrom }

    const rowTo = Math.floor(toIdx / Cols.length) as (typeof Rows)[number]
    const colTo = (toIdx % Cols.length) as (typeof Cols)[number]
    const to: Position = { row: rowTo, col: colTo }

    swapUnits(from, to)
  }

  const handleNewTeam = (name: string) => {
    // TODO: allow more details beyond name later...
    const teamKey = generateRandomId()
    addTeam({
      id: teamKey,
      name,
      formation: Array(6).fill(null),
    })
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

  return (
    <div className='max-w-6xl mx-auto space-y-6 p-6'>
      <p className='text-xl'>Team Builder</p>
      {/* <pre>{JSON.stringify(currentTeam, null, 2)}</pre> */}
      <div className='flex flex-row justify-between'>
        <div className='flex flex-col space-y-3'>
          <p>{currentTeam.name}</p>
          <IsometricFormationBuilder
            formation={currentTeam.formation}
            orientation={'right-facing'}
            onSwap={handleSwap}
          />
        </div>
        <div className='flex flex-col space-y-3'>
          <p>Your Teams</p>
          {Object.entries(teams).map(([key, team]) => (
            <IsometricFormationDisplay
              key={`${key}-${team.id}`}
              formation={team.formation}
              orientation={'left-facing'}
              onSelectTeam={() => {
                handleSelectTeam(key)
              }}
            />
          ))}
          <AddTeamModal handleNewTeam={handleNewTeam} />
        </div>
      </div>

      <Tabs value={selectedUnitId} onValueChange={setSelectedUnitId}>
        <TabsList>
          {filteredTeamFormation.map((unit) => (
            <TabsTrigger key={unit.id} value={unit.id}>
              {unit.name ?? unit.class}
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
                className='absolute top-2 right-2 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20'
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
