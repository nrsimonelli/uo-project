import { useState } from 'react'

import { Separator } from '../ui/separator'

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
  type TacticCategoryKey,
} from '@/data/tactics/tactic-conditions'
import { useModalState } from '@/hooks/use-modal-state'
import { cn } from '@/lib/utils'
import type { TacticalCondition } from '@/types/tactical-evaluation'

interface ConditionModalProps {
  onSelectCondition: (condition: TacticalCondition | null) => void
  currentCondition: TacticalCondition | null
}

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
          <div className="flex flex-1 overflow-hidden w-full">
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
            <div className="flex-1 p-3 flex flex-col">
              <p className="font-medium text-foreground mb-3">Conditions</p>
              <ScrollArea className="flex flex-col w-full overflow-y-auto">
                <div className="space-y-1 pr-2">
                  {keysForCategory.map(key => (
                    <Button
                      key={key}
                      variant={
                        currentCondition?.key === key &&
                        currentCondition?.category === selectedCategory
                          ? 'default'
                          : 'ghost'
                      }
                      onClick={() => handleConditionSelect(key)}
                      className="w-full justify-start text-sm h-auto p-2"
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
