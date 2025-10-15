import { useMemo, useState } from 'react'

import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  TACTIC_CATEGORIES,
  TACTIC_CATEGORY_MAP,
  type TacticCategoryKey,
} from '@/data/tactics/tactic-conditions'
import { useModalState } from '@/hooks/use-modal-state'
import { cn } from '@/lib/utils'
import type { TacticalCondition } from '@/types/tactics'

interface ConditionModalProps {
  onSelectCondition: (condition: TacticalCondition | null) => void
  currentCondition: TacticalCondition | null
}

export const ConditionModal = ({
  onSelectCondition,
  currentCondition,
}: ConditionModalProps) => {
  const { open, setOpen } = useModalState()
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedCategory, setSelectedCategory] = useState<TacticCategoryKey>(
    currentCondition?.category || TACTIC_CATEGORIES.FORMATION_SITUATION
  )

  const categories = Object.values(TACTIC_CATEGORIES)
  const keysForCategory = TACTIC_CATEGORY_MAP[selectedCategory]

  // Create searchable conditions with category info
  const allConditions = useMemo(() => {
    return Object.entries(TACTIC_CATEGORY_MAP).flatMap(([category, keys]) =>
      keys.map(key => ({
        key,
        category: category as TacticCategoryKey,
      }))
    )
  }, [])

  // Filter conditions based on search term
  const filteredConditions = useMemo(() => {
    if (!searchTerm.trim()) {
      return keysForCategory.map(key => ({
        key,
        category: selectedCategory,
      }))
    }

    const searchLower = searchTerm.toLowerCase().trim()
    return allConditions.filter(condition =>
      condition.key.toLowerCase().includes(searchLower)
    )
  }, [searchTerm, keysForCategory, selectedCategory, allConditions])

  const isSearching = searchTerm.trim().length > 0

  const handleConditionSelect = (key: string, category: TacticCategoryKey) => {
    const condition: TacticalCondition = {
      category,
      key,
    }
    onSelectCondition(condition)
    setOpen(false)
    // Clear search when closing
    setSearchTerm('')
  }

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen)
    // Clear search when modal is closed
    if (!isOpen) {
      setSearchTerm('')
    }
  }

  const isEmpty = currentCondition === null

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={'w-full p-2 justify-start text-left h-full'}
        >
          <div className="w-full">
            <div
              className={cn(
                'text-sm truncate font-normal',
                isEmpty && 'text-muted-foreground font-medium'
              )}
            >
              {currentCondition?.key ?? '-'}
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-xl max-h-[80vh] h-full w-full overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Select a tactic</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 items-start flex-col flex flex-1 w-full h-full justify-start pb-4">
          {/* Search Input */}
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search conditions..."
          />
          <div className="flex flex-1 overflow-hidden w-full">
            {/* Categories - hide when searching */}
            {!isSearching && (
              <>
                <div className="flex-1 p-3 flex flex-col">
                  <p className="font-medium text-foreground mb-3">Categories</p>
                  <ScrollArea className="flex flex-col w-full overflow-y-auto">
                    <div className="space-y-1 pr-2">
                      {categories.map(category => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category ? 'default' : 'ghost'
                          }
                          onClick={() => setSelectedCategory(category)}
                          className="w-full justify-start text-sm h-auto p-2"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <Separator orientation="vertical" />
              </>
            )}

            {/* Conditions - full width when searching */}
            <div
              className={cn(
                'flex-1 p-3 flex flex-col',
                isSearching && 'w-full'
              )}
            >
              <p className="font-medium text-foreground mb-3">
                {isSearching ? 'Search Results' : 'Conditions'}
              </p>
              <ScrollArea className="flex flex-col w-full overflow-y-auto">
                <div className="space-y-1 pr-2">
                  {filteredConditions.length === 0 && isSearching ? (
                    <div className="text-sm text-muted-foreground p-2">
                      No conditions found matching "{searchTerm}"
                    </div>
                  ) : (
                    filteredConditions.map(condition => (
                      <Button
                        key={`${condition.category}-${condition.key}`}
                        variant={
                          currentCondition?.key === condition.key &&
                          currentCondition?.category === condition.category
                            ? 'default'
                            : 'ghost'
                        }
                        onClick={() =>
                          handleConditionSelect(
                            condition.key,
                            condition.category
                          )
                        }
                        className="w-full justify-start text-sm h-auto p-2"
                      >
                        <div className="w-full text-left">
                          <div>{condition.key}</div>
                          {isSearching && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {condition.category}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
