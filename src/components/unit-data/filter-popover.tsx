import { Filter } from 'lucide-react'

import { FilterCheckboxGroup } from './filter-checkbox-group'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface FilterConfig {
  id: string
  title: string
  items: string[]
  selectedItems: string[]
  onToggle: (item: string) => void
  idPrefix: string
  transformItems?: (items: string[]) => string[]
}

interface FilterPopoverProps {
  filters: FilterConfig[]
  totalActiveFilters: number
}

export function FilterPopover({
  filters,
  totalActiveFilters,
}: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {totalActiveFilters > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
              {totalActiveFilters}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-2xl">
        <div className="space-y-4">
          <div className="text-sm font-medium">Filter Options</div>

          <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 auto-cols-min">
            {filters.map(filter => {
              const items = filter.transformItems
                ? filter.transformItems(filter.items)
                : filter.items

              return (
                <FilterCheckboxGroup
                  key={filter.id}
                  title={filter.title}
                  items={items}
                  selectedItems={filter.selectedItems}
                  onToggle={filter.onToggle}
                  idPrefix={filter.idPrefix}
                />
              )
            })}
          </div>

          {totalActiveFilters > 0 && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              {totalActiveFilters} filter{totalActiveFilters !== 1 ? 's' : ''}{' '}
              applied
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
