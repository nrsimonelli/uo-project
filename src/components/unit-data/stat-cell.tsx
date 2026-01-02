import { memo, useMemo } from 'react'

import { TableCell } from '../ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

import { cn } from '@/lib/utils'

export interface StatCellProps {
  baseValue: number | string | null
  statKey: string
  isBestralStat: boolean
  isNighttime: boolean
  rowId: string
}

// Helper function to calculate display value (used in comparison)
function calculateDisplayValue(
  baseValue: number | string | null,
  isAcc: boolean,
  isBestralStat: boolean,
  isNighttime: boolean
): number | string | null {
  if (baseValue === null || baseValue === undefined) return baseValue
  if (isNighttime && isBestralStat) {
    return isAcc
      ? Math.round((Number(baseValue) - 100) * 1.2) + 100
      : Math.round(Number(baseValue) * 1.2)
  }
  return baseValue
}

export const StatCell = memo(
  function StatCell({
    baseValue,
    statKey,
    isBestralStat,
    isNighttime,
    rowId,
  }: StatCellProps) {
    const isAcc = statKey === 'ACC'

    // Memoize display value calculation
    const displayValue = useMemo(
      () => calculateDisplayValue(baseValue, isAcc, isBestralStat, isNighttime),
      [baseValue, isAcc, isBestralStat, isNighttime]
    )

    const tooltipContent = useMemo(() => {
      if (!isNighttime) return null
      return `+${Math.round(
        (isAcc ? Number(baseValue) - 100 : Number(baseValue)) * (1 / 5)
      )}`
    }, [baseValue, isAcc, isNighttime])

    const cellClassName = useMemo(
      () =>
        cn('text-foreground', isBestralStat && isNighttime && 'text-primary'),
      [isBestralStat, isNighttime]
    )

    // Only render tooltip for Bestral stats when nighttime is active
    // This avoids creating expensive Tooltip components for non-Bestral units
    const shouldShowTooltip = isNighttime && isBestralStat

    return (
      <TableCell key={`${rowId}-${statKey}`} className={cellClassName}>
        {shouldShowTooltip ? (
          <Tooltip>
            <TooltipTrigger>{displayValue}</TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
          </Tooltip>
        ) : (
          displayValue
        )}
      </TableCell>
    )
  },
  (prevProps, nextProps) => {
    // Fast path: if baseValue and isBestralStat haven't changed
    if (
      prevProps.baseValue === nextProps.baseValue &&
      prevProps.isBestralStat === nextProps.isBestralStat &&
      prevProps.isNighttime === nextProps.isNighttime
    ) {
      return true // Skip re-render - nothing changed
    }

    // For non-Bestral stats, isNighttime change doesn't affect display
    if (
      !prevProps.isBestralStat &&
      !nextProps.isBestralStat &&
      prevProps.baseValue === nextProps.baseValue
    ) {
      return true // Skip re-render
    }

    // For Bestral stats, only re-render if isNighttime changed or baseValue changed
    if (prevProps.isBestralStat && nextProps.isBestralStat) {
      if (
        prevProps.baseValue === nextProps.baseValue &&
        prevProps.isNighttime === nextProps.isNighttime
      ) {
        return true // Skip re-render
      }
    }

    return false // Re-render needed
  }
)
