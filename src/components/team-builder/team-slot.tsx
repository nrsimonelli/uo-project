import { Trash } from 'lucide-react'
import { Button } from '../ui/button'
import { UnitBuilder } from '../unit-builder/unit-builder'
import type { Unit } from './team-context'

interface TeamSlotProps {
  unit: Unit | null
  onRemove: () => void
  children: React.ReactNode
}
export const TeamSlot = ({ unit, onRemove, children }: TeamSlotProps) => {
  if (!unit) {
    return children
  }

  return (
    <div className='relative group'>
      <Button
        onClick={onRemove}
        variant={'destructive'}
        className='absolute top-2 right-2 rounded-lg flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity z-20'
      >
        <Trash className='w-4 h-4' />
      </Button>

      <UnitBuilder unit={unit} />
    </div>
  )
}
