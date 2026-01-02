import { memo, useMemo } from 'react'

import { TableCell, TableRow } from '../ui/table'
import { UnitIcon } from '../unit-icon'

import { EquipmentBadges } from './equipment-badges'
import { StatCell } from './stat-cell'

import type { ClassTableRow } from '@/utils/class-data-processor'

// Memoized table row component - only re-renders when row data changes
export interface TableRowDataProps {
  row: ClassTableRow
  filteredStatKeys: string[]
  isNighttime: boolean
}

export const TableRowData = memo(
  function TableRowData({
    row,
    filteredStatKeys,
    isNighttime,
  }: TableRowDataProps) {
    // Memoize stat cells to avoid recreating array on every render
    const statCells = useMemo(
      () =>
        filteredStatKeys.map(statKey => {
          const baseValue = row[statKey as keyof ClassTableRow] as
            | number
            | string
            | null
          const isBestralStat = row.race === 'Bestral' && statKey !== 'HP'

          return (
            <StatCell
              key={`${row.id}-${statKey}`}
              baseValue={baseValue}
              statKey={statKey}
              isBestralStat={isBestralStat}
              isNighttime={isNighttime}
              rowId={row.id}
            />
          )
        }),
      [row, filteredStatKeys, isNighttime]
    )

    return (
      <TableRow>
        <TableCell className="font-medium">{row.id}</TableCell>
        <TableCell>
          <EquipmentBadges equipment={row.equipment} />
        </TableCell>
        <TableCell>
          <UnitIcon classKey={row.id} />
        </TableCell>
        {statCells}
      </TableRow>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if:
    // 1. Row data changed (by reference - should be stable from useMemo)
    // 2. isNighttime changed AND row is Bestral (affects display)
    // 3. filteredStatKeys changed (should be stable)
    if (prevProps.row !== nextProps.row) return false
    if (prevProps.filteredStatKeys !== nextProps.filteredStatKeys) return false

    // If isNighttime changed, only re-render if this is a Bestral unit
    if (prevProps.isNighttime !== nextProps.isNighttime) {
      return nextProps.row.race !== 'Bestral'
    }

    return true // Skip re-render
  }
)
