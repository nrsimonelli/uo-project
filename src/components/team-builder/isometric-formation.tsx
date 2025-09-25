import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Unit } from './team-context'
import { SPRITES } from '@/data/units/sprites'

const TILE_WIDTH = 120 // adjust to taste
const TILE_HEIGHT = 60 // 2:1 ratio

// Grid slots: 2 rows x 3 columns
const formationGrid = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
]

export const IsometricFormation = ({
  onSwap,
  formation,
  origin,
  selectedUnitId,
  onSelect,
}: {
  onSwap: (fromIdx: number, toIdx: number) => void
  formation: (Unit | null)[]
  origin: 'left' | 'right'
  selectedUnitId: string | null
  onSelect: (id: string | null) => void
}) => {
  const [pendingIdx, setPendingIdx] = useState<number | null>(null)

  const handleClick = (idx: number) => {
    const unit = formation[idx]

    if (pendingIdx === null) {
      if (unit) onSelect(unit.id) // selecting a unit
      else onSelect(null) // empty slot
      setPendingIdx(idx)
    } else if (pendingIdx === idx) {
      setPendingIdx(null)
      onSelect(null)
    } else {
      onSwap(pendingIdx, idx)
      setPendingIdx(null)
    }
  }

  return (
    <div className='relative' style={{ width: 400, height: 300 }}>
      {formationGrid.map(({ x, y }, idx) => {
        const slot = formation[idx]
        const isHighlighted = slot && slot.id === selectedUnitId

        const xScreen =
          origin === 'right'
            ? (x - y) * (TILE_WIDTH / 2) + 150
            : (y - x) * (TILE_WIDTH / 2) + 150

        const yScreen = (x + y) * (TILE_HEIGHT / 2)

        const tileBg =
          origin === 'right'
            ? 'bg-gradient-to-br from-gray-300 to-gray-400'
            : 'bg-gradient-to-bl from-gray-300 to-gray-400'

        return (
          <div
            key={idx}
            className='absolute'
            style={{
              left: xScreen,
              top: yScreen,
              width: TILE_WIDTH,
              height: TILE_HEIGHT,
            }}
            onClick={() => handleClick(idx)}
          >
            {/* Tile */}
            <div
              className={cn(
                'absolute w-full h-full border transition-colors',
                tileBg
              )}
              style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            />

            {/* Unit */}
            {slot && (
              <div
                className='absolute left-1/2 transform -translate-x-1/2'
                style={{ bottom: TILE_HEIGHT * 0.3 }}
              >
                <img
                  src={SPRITES[slot.class]}
                  alt={slot.class}
                  className={cn(
                    'h-16 w-16 object-contain drop-shadow-lg',
                    origin === 'left' && 'scale-x-[-1]',
                    isHighlighted && 'ring-4 ring-yellow-400 rounded-full'
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
