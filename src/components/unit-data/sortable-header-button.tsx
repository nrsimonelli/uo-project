import { ArrowDown, ArrowUp } from 'lucide-react'

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
  currentSortField,
  sortDirection,
  onSort,
}: SortableHeaderButtonProps<T>) {
  const isActive = field === currentSortField

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="w-full hover:bg-transparent first:px-0 justify-start relative"
    >
      <span className="text-left">{children}</span>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-3 h-3 pointer-events-none">
        {isActive &&
          (sortDirection === 'asc' ? (
            <ArrowUp className="size-3 text-foreground" />
          ) : (
            <ArrowDown className="size-3 text-foreground" />
          ))}
      </span>
    </Button>
  )
}
