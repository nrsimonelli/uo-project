import { useState } from 'react'

import { IsometricFormationBase } from './isometric-formation-base'

import type { Unit } from '@/types/team'

export function IsometricFormationBuilder({
  formation,
  orientation,
  onSwap,
}: {
  formation: (Unit | null)[]
  orientation: 'right-facing' | 'left-facing'
  onSwap: (fromIdx: number, toIdx: number) => void
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const handleTileClick = (idx: number) => {
    if (selectedIdx === null) {
      setSelectedIdx(idx)
      return
    }

    if (selectedIdx !== idx) {
      onSwap(selectedIdx, idx)
    }

    setSelectedIdx(null)
  }

  return (
    <div className="relative">
      <IsometricFormationBase
        formation={formation}
        orientation={orientation}
        onTileClick={handleTileClick}
        selectedIdx={selectedIdx}
        scale={1}
      />
    </div>
  )
}
