import { UnitBuilder } from '../unit-builder/unit-builder'
import type { Unit } from './team-context'

interface TeamSlotProps {
  unit: Unit
  children?: React.ReactNode
}
export const TeamSlot = ({ unit, children }: TeamSlotProps) => {
  return (
    <div className='relative group'>
      {children}
      <UnitBuilder unit={unit} />
    </div>
  )
}
