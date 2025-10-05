import { SPRITES } from '@/data/sprites'
import { cn } from '@/lib/utils'
import type { Unit } from '@/types/team'

const TILE_WIDTH = 120
const TILE_HEIGHT = 60
const formationGrid = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
]

export function IsometricFormationBase({
  formation,
  orientation,
  onTileClick,
  selectedIdx,
  scale = 1,
}: {
  formation: (Unit | null)[]
  orientation: 'right-facing' | 'left-facing'
  onTileClick?: (idx: number) => void
  selectedIdx?: number | null
  scale?: number
}) {
  const SCALED_WIDTH = TILE_WIDTH * scale
  const SCALED_HEIGHT = TILE_HEIGHT * scale

  const containerWidth = SCALED_WIDTH * 2.5
  const containerHeight = SCALED_HEIGHT * 2.5

  return (
    <div
      className="relative"
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {formationGrid.map(({ x, y }, idx) => {
        const slot = formation[idx]
        const isSelected = selectedIdx === idx

        const xScreen =
          orientation === 'left-facing'
            ? (x - y) * (SCALED_WIDTH / 2) + SCALED_WIDTH / 2
            : (y - x) * (SCALED_WIDTH / 2) + SCALED_WIDTH

        const yScreen = (x + y) * (SCALED_HEIGHT / 2)

        return (
          <div
            key={idx}
            className="absolute"
            style={{
              left: xScreen,
              top: yScreen,
              width: SCALED_WIDTH,
              height: SCALED_HEIGHT,
            }}
            onClick={() => {
              onTileClick?.(idx)
            }}
          >
            <div
              className={cn(
                'absolute w-full h-full transition-colors duration-200',
                'bg-primary',
                isSelected &&
                  'bg-[radial-gradient(circle,rgba(250,204,21,0.8)_0%,transparent_70%)]'
              )}
              style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            />
            {slot && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2"
                style={{ bottom: SCALED_HEIGHT * 0.3 }}
              >
                <img
                  src={SPRITES[slot.classKey]}
                  alt={slot.classKey}
                  className={cn(
                    'object-contain drop-shadow-lg',
                    orientation === 'right-facing' && 'scale-x-[-1]',
                    `h-${Math.round(16 * scale)} w-${Math.round(16 * scale)}`
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
