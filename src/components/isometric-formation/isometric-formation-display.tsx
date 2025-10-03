import type { Unit } from '@/types/team'
import { IsometricFormationBase } from './isometric-formation-base'

export function IsometricFormationDisplay({
  formation,
  orientation,
  onSelectTeam,
}: {
  formation: (Unit | null)[]
  orientation: 'right-facing' | 'left-facing'
  onSelectTeam: () => void
}) {
  return (
    <div className='cursor-pointer' onClick={onSelectTeam}>
      <IsometricFormationBase
        formation={formation}
        orientation={orientation}
        scale={0.6}
      />
    </div>
  )
}
