import { Button } from '@/components/ui/button'

interface SortableHeaderButtonProps<T = string> {
  children: React.ReactNode
  field: T
  currentSortField: T
  sortDirection: 'asc' | 'desc'
  onSort: (field: T) => void
}

export function SortableHeaderButton<T = string>({
  children,
  field,
  onSort,
}: SortableHeaderButtonProps<T>) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="w-full hover:bg-transparent first:px-0 justify-start"
    >
      {children}
    </Button>
  )
}
