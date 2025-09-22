import { useId, useState } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Search } from 'lucide-react'
import { useFilteredUnits } from '@/hooks/use-filtered-units'
import { ScrollArea } from '../ui/scroll-area'
import type { Position, Team } from './team-context'
import { createUnit } from '@/core/utils/create-unit'
import { useTeam } from '@/hooks/use-team'

export const UnitSearchModal = ({
  team,
  slotNumber,
}: {
  team: Team
  slotNumber: number
}) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const filteredUnits = useFilteredUnits(searchTerm, team)
  const unitId = useId()
  const { addUnit } = useTeam()

  const onClick = (unitName: string) => {
    const position = {
      row: Math.floor(slotNumber / 3),
      col: slotNumber % 3,
    } as Position
    const newUnit = createUnit(unitId, unitName, position)
    console.log(newUnit)
    addUnit(newUnit, position)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='default'>Add unit</Button>
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

          <ScrollArea className='flex flex-col overflow-y-auto'>
            {filteredUnits.map((unitName) => (
              <Button
                key={unitName}
                variant={'ghost'}
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
