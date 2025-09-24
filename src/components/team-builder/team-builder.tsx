import { useState } from 'react'
import { TeamSlot } from './team-slot'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { UnitSearchModal } from './unit-search-modal'
import { useCurrentTeam, useTeam } from '@/hooks/use-team'
import { Button } from '../ui/button'
import { Trash } from 'lucide-react'
import type { Position, Unit } from './team-context'
import { IsometricFormation } from './isometric-formation'

export const TeamBuilder = () => {
  const currentTeam = useCurrentTeam()
  const { removeUnit, swapUnits } = useTeam()

  // Selected unit id drives both tabs + grid
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)

  // Derived: ordered units by row/col
  const orderedTeamFormation = currentTeam.formation
    .filter((entry): entry is Unit => entry !== null)
    .sort((a, b) => {
      if (!a.position || !b.position) return 0
      return a.position.row - b.position.row || a.position.col - b.position.col
    })

  const handleSwap = (fromIdx: number, toIdx: number) => {
    const from: Position = { row: Math.floor(fromIdx / 3), col: fromIdx % 3 }
    const to: Position = { row: Math.floor(toIdx / 3), col: toIdx % 3 }
    swapUnits(from, to)

    // keep focus on the originally selected unit (if it still exists)
    const fromUnit = currentTeam.formation[fromIdx]
    if (fromUnit) {
      setSelectedUnitId(fromUnit.id)
    }
  }

  const shouldShowAddUnit = orderedTeamFormation.length < 5

  // Map slot index -> unit id string
  const getSlotValue = (unit: Unit) =>
    `slot-${unit.position?.row}-${unit.position?.col}`

  // For highlighting grid based on selected tab
  const selectedIdx = currentTeam.formation.findIndex(
    (u) => u && u.id === selectedUnitId
  )

  return (
    <div className='max-w-6xl mx-auto space-y-6 p-6'>
      {/* <pre>{JSON.stringify(currentTeam, null, 2)}</pre> */}
      <p>Team Builder</p>

      <div className='flex gap-4'>
        <IsometricFormation
          formation={currentTeam.formation}
          origin='left'
          selectedUnitId={selectedUnitId}
          onSelect={setSelectedUnitId}
          onSwap={handleSwap}
        />
        <IsometricFormation
          formation={currentTeam.formation}
          origin='right'
          selectedUnitId={selectedUnitId}
          onSelect={setSelectedUnitId}
          onSwap={handleSwap}
        />
      </div>

      <Tabs
        value={selectedUnitId ?? undefined}
        onValueChange={setSelectedUnitId}
      >
        <TabsList>
          {orderedTeamFormation.map((unit) => (
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

        {orderedTeamFormation.map((unit) => (
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
