import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  TACTIC_CATEGORIES,
  TACTIC_CATEGORY_MAP,
} from '@/data/tactics/tactic-conditions'
import { useModalState } from '@/hooks/use-modal-state'
import { cn } from '@/lib/utils'
import type { TacticalCondition } from '@/types/tactical-evaluation'

interface ConditionModalProps {
  onSelectCondition: (condition: TacticalCondition | null) => void
  currentCondition: TacticalCondition | null
}

type TacticCategoryKey =
  (typeof TACTIC_CATEGORIES)[keyof typeof TACTIC_CATEGORIES]

export const ConditionModal = ({
  onSelectCondition,
  currentCondition,
}: ConditionModalProps) => {
  const { open, closeModal, setOpen } = useModalState()

  const [selectedCategory, setSelectedCategory] = useState<TacticCategoryKey>(
    currentCondition?.category || TACTIC_CATEGORIES.FORMATION_SITUATION
  )

  const categories = Object.values(TACTIC_CATEGORIES)
  const keysForCategory = TACTIC_CATEGORY_MAP[selectedCategory]

  const handleConditionSelect = (key: string) => {
    const condition: TacticalCondition = {
      category: selectedCategory,
      key,
    }
    onSelectCondition(condition)
    closeModal()
  }

  const isEmpty = currentCondition === null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className={'w-full p-2 justify-start text-left h-full'}
        >
          <div className="w-full">
            <div
              className={cn(
                'text-sm truncate font-light',
                isEmpty && 'text-muted-foreground font-medium'
              )}
            >
              {currentCondition?.key ?? '-'}
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby="modal-description"
        className="sm:max-w-xl max-h-[80vh] h-full w-full overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Select a tactic</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 items-start flex-col flex flex-1 w-full h-full justify-start pb-4">
          <div className="flex flex-1 overflow-hidden w-full">
            <CategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />

            <div className="flex-1 p-4 flex flex-col">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Conditions
              </h3>
              <ScrollArea className="flex flex-col w-full overflow-y-auto">
                <ConditionList
                  conditions={keysForCategory}
                  currentCondition={currentCondition}
                  selectedCategory={selectedCategory}
                  onConditionSelect={handleConditionSelect}
                />
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CategoryListProps {
  categories: TacticCategoryKey[]
  selectedCategory: TacticCategoryKey
  onCategorySelect: (category: TacticCategoryKey) => void
}

function CategoryList({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryListProps) {
  return (
    <div className="w-64 border-r border-border p-4 flex-shrink-0 flex flex-col">
      <h3 className="text-sm font-medium text-foreground mb-3">Categories</h3>
      <ScrollArea className="flex flex-col w-full overflow-y-auto">
        <div className="space-y-1">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              onClick={() => onCategorySelect(category)}
              className="w-full justify-start text-sm h-auto p-2"
            >
              {category}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

interface ConditionListProps {
  conditions: readonly string[]
  currentCondition?: TacticalCondition | null
  selectedCategory: TacticCategoryKey
  onConditionSelect: (key: string) => void
}

function ConditionList({
  conditions,
  currentCondition,
  selectedCategory,
  onConditionSelect,
}: ConditionListProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {conditions.map(key => (
        <Button
          key={key}
          variant={
            currentCondition?.key === key &&
            currentCondition?.category === selectedCategory
              ? 'default'
              : 'ghost'
          }
          onClick={() => onConditionSelect(key)}
          className="justify-start text-left h-auto p-3 whitespace-normal"
        >
          {key}
        </Button>
      ))}
    </div>
  )
}
