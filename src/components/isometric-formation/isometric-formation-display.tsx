import type { Unit } from '../team-builder/team-context'
import { IsometricFormationBase } from './isometric-formation-base'

export const IsometricFormationDisplay = ({
  formation,
  orientation,
  onSelectTeam,
}: {
  formation: (Unit | null)[]
  orientation: 'right-facing' | 'left-facing'
  onSelectTeam: () => void
}) => {
  return (
    <div onClick={onSelectTeam} className='cursor-pointer'>
      <IsometricFormationBase
        formation={formation}
        orientation={orientation}
        scale={0.6}
      />
    </div>
  )
}
