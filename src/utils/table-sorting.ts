import type { ClassTableRow } from './class-data-processor'

export type SortField = keyof ClassTableRow | 'equipment'
export type SortDirection = 'asc' | 'desc'

export function sortTableData(
  data: ClassTableRow[],
  sortField: SortField,
  sortDirection: SortDirection
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
    const aVal = a[fieldKey]
    const bVal = b[fieldKey]

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
