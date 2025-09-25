import { useState } from 'react'
import { TeamSlot } from './team-slot'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { UnitSearchModal } from './unit-search-modal'
import { useCurrentTeam, useTeam } from '@/hooks/use-team'
import { Button } from '../ui/button'
import { Trash } from 'lucide-react'
import { Cols, Rows, type Position } from './team-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { generateRandomId } from '@/core/utils/utils'
import { IsometricFormationBuilder } from '../isometric-formation/isometric-formation-builder'
import { IsometricFormationDisplay } from '../isometric-formation/isometric-formation-display'

export const TeamBuilder = () => {
  const { teams, currentTeamId, setCurrentTeam, addTeam } = useTeam()
  const currentTeam = useCurrentTeam()
  const { removeUnit, swapUnits } = useTeam()

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)

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

    const fromUnit = currentTeam.formation[fromIdx]
    if (fromUnit) {
      setSelectedUnitId(fromUnit.id)
    }
  }

  const shouldShowAddUnit = filteredTeamFormation.length < 5

  return (
    <div className='max-w-6xl mx-auto space-y-6 p-6'>
      {/* <pre>{JSON.stringify(currentTeam, null, 2)}</pre> */}
      <p>Team Builder</p>
      <div className='flex  gap-4'>
        <IsometricFormationBuilder
          formation={currentTeam.formation}
          orientation={'right-facing'}
          onSwap={handleSwap}
        />
        <div className='flex flex-col gap-4'>
          {Object.entries(teams).map(([id, team]) => (
            <IsometricFormationDisplay
              key={team.id}
              formation={team.formation}
              orientation={'left-facing'}
              onSelectTeam={() => setCurrentTeam(id)}
            />
          ))}
        </div>
      </div>

      <div>Select team</div>
      <div>
        <Select value={currentTeamId} onValueChange={setCurrentTeam}>
          <SelectTrigger className='h-8 w-full'>
            <SelectValue id={currentTeamId} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(teams).map(([id, team]) => (
              <SelectItem key={id} value={id}>
                {team.name}
              </SelectItem>
            ))}
            <Button
              onClick={() =>
                addTeam({
                  id: generateRandomId(),
                  name: 'New team',
                  formation: [],
                })
              }
            >
              Create new team
            </Button>
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={selectedUnitId ?? undefined}
        onValueChange={setSelectedUnitId}
      >
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
                onClick={() => removeUnit(unit.id)}
                variant='destructive'
                className='absolute top-2 right-2 rounded-lg flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity z-20'
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
