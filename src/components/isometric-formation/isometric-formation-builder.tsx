import { useState } from 'react'
import type { Unit } from '../team-builder/team-context'
import { IsometricFormationBase } from './isometric-formation-base'

export const IsometricFormationBuilder = ({
  formation,
  orientation,
  onSwap,
}: {
  formation: (Unit | null)[]
  orientation: 'right-facing' | 'left-facing'
  onSwap: (fromIdx: number, toIdx: number) => void
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const handleTileClick = (idx: number) => {
    if (selectedIdx === null) setSelectedIdx(idx)
    else if (selectedIdx === idx) setSelectedIdx(null)
    else {
      onSwap(selectedIdx, idx)
      setSelectedIdx(null)
    }
  }

  return (
    <div
      className='relative'
      onClick={() => setSelectedIdx(null)} // clicking outside
    >
      <IsometricFormationBase
        formation={formation}
        orientation={orientation}
        onTileClick={(idx) => {
          handleTileClick(idx)
        }}
        selectedIdx={selectedIdx}
        scale={1}
      />
    </div>
  )
}
