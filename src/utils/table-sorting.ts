import type { ClassTableRow } from './class-data-processor'

export type SortField = keyof ClassTableRow | 'equipment'
export type SortDirection = 'asc' | 'desc'

// Stat fields that can be night-boosted (all stats except HP)
const BOOSTABLE_STAT_FIELDS: (keyof ClassTableRow)[] = [
  'PATK',
  'PDEF',
  'MATK',
  'MDEF',
  'GRD',
  'CRT',
  'EVA',
  'ACC',
  'INIT',
]

function getSortValue(
  row: ClassTableRow,
  fieldKey: keyof ClassTableRow,
  isNighttime: boolean
) {
  const baseValue = row[fieldKey]

  // Apply night boost for Bestral units when sorting by a boostable stat field
  if (
    isNighttime &&
    row.race === 'Bestral' &&
    BOOSTABLE_STAT_FIELDS.includes(fieldKey)
  ) {
    if (baseValue === null || baseValue === undefined) {
      return baseValue
    }

    if (typeof baseValue === 'number') {
      // ACC has special handling: subtract 100, multiply by 1.2, add 100 back
      if (fieldKey === 'ACC') {
        return Math.round((baseValue - 100) * 1.2) + 100
      }
      // Other stats: multiply by 1.2
      return Math.round(baseValue * 1.2)
    }
  }

  return baseValue
}

export function sortTableData(
  data: ClassTableRow[],
  sortField: SortField,
  sortDirection: SortDirection,
  isNighttime: boolean = false
): ClassTableRow[] {
  return [...data].sort((a, b) => {
    // Handle special sorting cases
    if (sortField === 'equipment') {
      // Sort by first equipment item alphabetically
      const aVal = a.equipment.length > 0 ? [...a.equipment].sort()[0] : ''
      const bVal = b.equipment.length > 0 ? [...b.equipment].sort()[0] : ''
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    // Standard field access for all other columns
    const fieldKey = sortField as keyof ClassTableRow
    const aVal = getSortValue(a, fieldKey, isNighttime)
    const bVal = getSortValue(b, fieldKey, isNighttime)

    // Handle null/undefined values
    if (aVal === null || aVal === undefined)
      return sortDirection === 'asc' ? 1 : -1
    if (bVal === null || bVal === undefined)
      return sortDirection === 'asc' ? -1 : 1

    // String comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const result = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? result : -result
    }

    // Number comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      const result = aVal - bVal
      return sortDirection === 'asc' ? result : -result
    }

    return 0
  })
}
