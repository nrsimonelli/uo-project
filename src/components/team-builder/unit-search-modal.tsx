import { useState } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { PlusIcon, Search } from 'lucide-react'
import { useFilteredUnits } from '@/hooks/use-filtered-units'
import { ScrollArea } from '../ui/scroll-area'
import type { Col, Position, Row, Team, Unit } from './team-context'
import { createUnit } from '@/core/create-unit'
import { useTeam } from '@/hooks/use-team'
import { generateRandomId } from '@/core/utils'

export const UnitSearchModal = ({
  team,
  onUnitAdded,
}: {
  team: Team
  onUnitAdded?: (unit: Unit) => void
}) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const filteredUnits = useFilteredUnits(searchTerm, team)
  const unitId = generateRandomId()
  const { addUnit } = useTeam()

  const getNextOpenPosition = (formation: (Unit | null)[]): Position | null => {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col
        if (!formation[index]) {
          return { row: row as Row, col: col as Col }
        }
      }
    }
    return null
  }

  const onClick = (unitName: string) => {
    const position = getNextOpenPosition(team.formation)
    if (!position) {
      console.warn('Team is full, cannot add unit')
      return
    }

    const newUnit = createUnit(unitId, unitName, position)
    addUnit(newUnit, position)

    if (onUnitAdded) {
      onUnitAdded(newUnit)
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' className='flex flex-1'>
          Add Unit <PlusIcon className='w-4 h-4' />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby='modal-description'
        className='sm:max-w-md max-h-[80vh] h-full w-full overflow-hidden flex flex-col items-start'
      >
        <DialogHeader>
          <DialogTitle>Select a unit</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 items-start flex-col flex flex-1 w-full h-full justify-start pb-4'>
          <div className='relative w-full'>
            <Search className='absolute top-1/2 left-2 -translate-y-1/2 w-4 h-4' />
            <Input
              className='pl-8'
              placeholder='Search...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className='flex flex-col w-full overflow-y-auto'>
            {filteredUnits.map((unitName) => (
              <Button
                key={unitName}
                variant='ghost'
                className='inline-flex justify-start w-full py-8'
                onClick={() => onClick(unitName)}
              >
                <img
                  src={`src/assets/sprites/${unitName}.png`}
                  height={32}
                  width={32}
                  alt={unitName}
                />
                <div>{unitName}</div>
              </Button>
            ))}
            {filteredUnits.length === 0 && (
              <div className='text-center text-muted-foreground'>
                No units found matching "{searchTerm}"
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
