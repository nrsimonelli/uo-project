import { useState, useEffect } from 'react'

import { SPRITES } from '@/data/sprites'
import type { AllClassType } from '@/types/base-stats'
import type { BattleEvent, Affliction } from '@/types/battle-engine'

interface UnitSquareProps {
  unit: {
    unitId: string
    name: string
    classKey: string
    currentHP: number
    maxHP: number
    position: {
      row: number
      col: number
    }
    afflictions?: Affliction[]
  } | null
}

function UnitSquare({ unit }: UnitSquareProps) {
  const [animatedHP, setAnimatedHP] = useState(0)

  const { classKey, currentHP, maxHP } = unit || {
    classKey: '',
    currentHP: 0,
    maxHP: 0,
  }
  const unitSprite = SPRITES[classKey as AllClassType]

  // Animate HP from maxHP down to currentHP
  useEffect(() => {
    const startValue = maxHP
    const endValue = currentHP
    const duration = 2000 // 2 second animation (same as progress bar)

    const timer = setTimeout(() => {
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease-in-out function for smooth animation (same as progress bar)
        const easeInOut =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress

        const currentValue = startValue + (endValue - startValue) * easeInOut
        setAnimatedHP(Math.round(currentValue))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, 300) // Same delay as progress bar (300ms)

    return () => clearTimeout(timer)
  }, [currentHP, maxHP])

  // Empty slot
  if (!unit) {
    return (
      <div className="w-12 h-12 border border-dashed border-muted-foreground/30 rounded" />
    )
  }

  // Helper function to get affliction icons
  const getAfflictionIcon = (type: string) => {
    const icons: Record<string, string> = {
      Burn: '🔥',
      Poison: '☠️',
      Stun: '😵',
      Freeze: '🧊',
      Blind: '👁️',
      'Guard Seal': '🛡️',
      'Passive Seal': '🚫',
      'Crit Seal': '⚡',
      Deathblow: '💀',
    }
    return icons[type] || '⚠️'
  }

  return (
    <div className="relative w-12 h-12 border border-border bg-card rounded p-1 flex flex-col items-center justify-center text-center">
      {/* Unit sprite */}
      {unitSprite && (
        <img
          src={unitSprite}
          width={16}
          height={16}
          alt={classKey}
          className="rounded-sm"
        />
      )}

      {/* Animated HP */}
      <div className="text-xs font-mono leading-none mt-0.5">
        {animatedHP}/{maxHP}
      </div>

      {/* Afflictions overlay */}
      {unit.afflictions && unit.afflictions.length > 0 && (
        <div className="absolute -top-1 -right-1 flex flex-wrap gap-0.5 max-w-8">
          {unit.afflictions.slice(0, 2).map((affliction, index) => (
            <div
              key={`${affliction.type}-${index}`}
              className="text-xs leading-none"
              title={`${affliction.type}${affliction.level ? ` (Level ${affliction.level})` : ''}`}
            >
              {getAfflictionIcon(affliction.type)}
            </div>
          ))}
          {unit.afflictions.length > 2 && (
            <div
              className="text-xs leading-none"
              title={`+${unit.afflictions.length - 2} more afflictions`}
            >
              +{unit.afflictions.length - 2}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface TeamFormationProps {
  teamName: string
  units: Array<{
    unitId: string
    name: string
    classKey: string
    currentHP: number
    maxHP: number
    position: {
      row: number
      col: number
    }
    afflictions?: Affliction[]
  }>
  teamColor: 'blue' | 'red'
  isAway?: boolean // For mirroring attacking team positions
}

/**
 * Display a team's formation using actual position data
 * Defending team: position (0,0) is top-left
 * Attacking team: mirrored so position (0,0) is top-right
 */
function TeamFormation({
  units,
  isAway = false,
}: Omit<TeamFormationProps, 'teamName' | 'teamColor'>) {
  // Create 2x3 grid: 2 rows, 3 columns
  // When rotated vertically: 2 "columns" of 3 spots each
  const gridPositions: Array<Array<(typeof units)[0] | null>> = [
    [null, null, null], // row 0 (front row)
    [null, null, null], // row 1 (back row)
  ]

  // Place units in their actual positions
  units.forEach(unit => {
    const { row, col } = unit.position
    if (row >= 0 && row < 2 && col >= 0 && col < 3) {
      if (isAway) {
        // Mirror attacking team: flip the row (0->1, 1->0) to mirror horizontally
        gridPositions[1 - row][col] = unit
      } else {
        gridPositions[row][col] = unit
      }
    }
  })

  return (
    <div className="flex justify-center">
      {/* Formation grid - 2 columns (representing rows), 3 positions each */}
      {/* Display vertically: front row (0) closest to middle */}
      <div className="grid grid-cols-2 gap-1">
        {/* Left column - row 0 positions (front row) */}
        <div className="space-y-1">
          <UnitSquare unit={gridPositions[0][0]} />
          <UnitSquare unit={gridPositions[0][1]} />
          <UnitSquare unit={gridPositions[0][2]} />
        </div>
        {/* Right column - row 1 positions (back row) */}
        <div className="space-y-1">
          <UnitSquare unit={gridPositions[1][0]} />
          <UnitSquare unit={gridPositions[1][1]} />
          <UnitSquare unit={gridPositions[1][2]} />
        </div>
      </div>
    </div>
  )
}

interface TugOfWarProgressProps {
  defendingTeam: Array<{
    currentHP: number
    maxHP: number
  }>
  attackingTeam: Array<{
    currentHP: number
    maxHP: number
  }>
}

function TugOfWarProgress({ defendingTeam, attackingTeam }: TugOfWarProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(50)
  const [animatedHomeHP, setAnimatedHomeHP] = useState(100)
  const [animatedAwayHP, setAnimatedAwayHP] = useState(100)

  // Calculate team HP percentages
  const defendingCurrentHP = defendingTeam.reduce((sum, u) => sum + u.currentHP, 0)
  const defendingMaxHP = defendingTeam.reduce((sum, u) => sum + u.maxHP, 0)
  const defendingHpPercentage = defendingMaxHP > 0 ? (defendingCurrentHP / defendingMaxHP) * 100 : 0

  const attackingCurrentHP = attackingTeam.reduce((sum, u) => sum + u.currentHP, 0)
  const attackingMaxHP = attackingTeam.reduce((sum, u) => sum + u.maxHP, 0)
  const attackingHpPercentage = attackingMaxHP > 0 ? (attackingCurrentHP / attackingMaxHP) * 100 : 0

  const totalHpPercentage = defendingHpPercentage + attackingHpPercentage
  const defendingShare =
    totalHpPercentage > 0 ? (defendingHpPercentage / totalHpPercentage) * 100 : 50

  // Animate progress bar and HP percentages to final results
  useEffect(() => {
    const progressStartValue = 50
    const progressEndValue = defendingShare
    const defendingHPStartValue = 100
    const defendingHPEndValue = defendingHpPercentage
    const attackingHPStartValue = 100
    const attackingHPEndValue = attackingHpPercentage
    const duration = 2000

    const timer = setTimeout(() => {
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeInOut =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress

        // Animate progress bar
        const currentProgressValue =
          progressStartValue +
          (progressEndValue - progressStartValue) * easeInOut
        setAnimatedProgress(currentProgressValue)

        // Animate HP percentages (counting down from 100%)
        const currentDefendingHP =
          defendingHPStartValue + (defendingHPEndValue - defendingHPStartValue) * easeInOut
        const currentAttackingHP =
          attackingHPStartValue + (attackingHPEndValue - attackingHPStartValue) * easeInOut
        setAnimatedHomeHP(currentDefendingHP)
        setAnimatedAwayHP(currentAttackingHP)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, 0) // delay ms before starting

    return () => clearTimeout(timer)
  }, [defendingShare, defendingHpPercentage, attackingHpPercentage])

  return (
    <div className="space-y-3">
      {/* HP percentages with labels - animated */}
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-sm font-medium text-defending-team">Defending</div>
          <div className="text-lg font-bold">{animatedHomeHP.toFixed(0)}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-attacking-team">Attacking</div>
          <div className="text-lg font-bold">{animatedAwayHP.toFixed(0)}%</div>
        </div>
      </div>

      {/* Custom animated progress bar without CSS transitions */}
      <div className="relative h-3 bg-attacking-team/20 w-full overflow-hidden rounded-full">
        <div
          className="h-full bg-defending-team rounded-full"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  )
}

interface BattleRosterDisplayProps {
  teamRosters: NonNullable<BattleEvent['teamRosters']>
}

export function BattleRosterDisplay({ teamRosters }: BattleRosterDisplayProps) {
  const { defendingTeam, attackingTeam } = teamRosters

  return (
    <div className="space-y-4">
      <TugOfWarProgress defendingTeam={defendingTeam} attackingTeam={attackingTeam} />

      <div className="grid grid-cols-2 gap-8">
        <TeamFormation units={defendingTeam} isAway={false} />
        <TeamFormation units={attackingTeam} isAway={true} />
      </div>
    </div>
  )
}
