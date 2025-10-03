import { UnitBuilder } from '../unit-builder/unit-builder'

import type { Unit } from '@/types/team'

interface TeamSlotProps {
  unit: Unit
  children?: React.ReactNode
}
export function TeamSlot({ unit, children }: TeamSlotProps) {
  return (
    <div className="relative group">
      {children}
      <UnitBuilder unit={unit} />
    </div>
  )
}
