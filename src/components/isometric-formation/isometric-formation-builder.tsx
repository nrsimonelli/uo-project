import { useState } from 'react'

import { IsometricFormationBase } from './isometric-formation-base'

import type { Unit } from '@/types/team'

export function IsometricFormationBuilder({
  formation,
  orientation,
  onSwap,
  onUnitSelect,
}: {
  formation: (Unit | null)[]
  orientation: 'right-facing' | 'left-facing'
  onSwap: (fromIdx: number, toIdx: number) => void
  onUnitSelect?: (unitId: string) => void
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const handleTileClick = (idx: number) => {
    const unit = formation[idx]
    
    if (selectedIdx === null) {
      // First click - select for swapping and also select in tab if there's a unit
      setSelectedIdx(idx)
      if (unit && onUnitSelect) {
        onUnitSelect(unit.id)
      }
      return
    }

    if (selectedIdx !== idx) {
      // Second click on different tile - perform swap (don't change tab selection)
      onSwap(selectedIdx, idx)
    } else {
      // Click on same tile - just select the unit in tab if there's a unit
      if (unit && onUnitSelect) {
        onUnitSelect(unit.id)
      }
    }

    setSelectedIdx(null)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the container itself (not on a tile)
    if (e.target === e.currentTarget) {
      setSelectedIdx(null)
    }
  }

  return (
    <div className="relative" onClick={handleContainerClick}>
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
