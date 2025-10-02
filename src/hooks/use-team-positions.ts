import { useMemo } from 'react'
import type { Position, Unit, Row, Col } from '@/types/team'

export function useTeamPositions(formation: (Unit | null)[]) {
  const getNextOpenPosition = useMemo(() => {
    return (): Position | null => {
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const index = row * 3 + col
          if (!formation[index]) {
            return { row: row as Row, col: col as Col }
          }
        }
      }
      return null
    }
  }, [formation])

  const isTeamFull = useMemo(() => {
    return formation.every(slot => slot !== null)
  }, [formation])

  const availableSlots = useMemo(() => {
    return formation.filter(slot => slot === null).length
  }, [formation])

  return {
    getNextOpenPosition,
    isTeamFull,
    availableSlots,
  }
}