import type { ReactNode } from 'react'

import { SearchInput } from '@/components/search-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SearchModalProps {
  title: string
  trigger: ReactNode
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterComponent?: ReactNode
  children: ReactNode
  onOpenChange?: (open: boolean) => void
  open?: boolean
  emptyState?: ReactNode
  headerActions?: ReactNode
}

export function SearchModal({
  title,
  trigger,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterComponent,
  children,
  onOpenChange,
  open,
  emptyState,
  headerActions,
}: SearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {headerActions}
        </DialogHeader>
        <div className="flex flex-col gap-4 min-h-0">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
          {filterComponent}
          <ScrollArea className="h-[calc(80vh-250px)]">
            {children}
            {emptyState}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
