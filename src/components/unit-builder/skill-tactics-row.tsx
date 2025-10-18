import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'

import { CostSymbols } from '@/components/cost-symbols'
import { ConditionModal } from '@/components/tactical/condition-modal'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'
import { cn } from '@/lib/utils'
import type { SkillSlot } from '@/types/skills'
import type { TacticalCondition } from '@/types/tactics'

interface SkillTacticsRowProps {
  skillSlot: SkillSlot
  removeSkillSlot: (arg: string) => void
  handleConditionSelect: (
    skillSlotId: string,
    tacticIndex: number,
    condition: TacticalCondition | null
  ) => void
}

export function SkillTacticsRow({
  skillSlot,
  removeSkillSlot,
  handleConditionSelect,
}: SkillTacticsRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skillSlot.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const skill = skillSlot.skillId
    ? [...ActiveSkills, ...PassiveSkills].find(s => s.id === skillSlot.skillId)
    : null

  const handleRemove = () => {
    removeSkillSlot(skillSlot.id)
  }

  const handleRemoveCondition = (idx: number) => {
    handleConditionSelect(skillSlot.id, idx, null)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'grid grid-cols-[auto_1fr_1fr_1fr] border-t hover:bg-muted/30 [&:hover_.remove-btn]:opacity-100 transition-colors',
        isDragging && 'opacity-75'
      )}
    >
      <div className="p-2 flex items-center justify-center min-h-[40px] border-r w-12 flex-shrink-0">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
          type="button"
        >
          <GripVertical className="size-4" />
        </button>
      </div>
      <div className="p-2 flex items-center gap-2 min-h-[40px] relative">
        {skill ? (
          <>
            <CostSymbols
              cost={skill.type === 'active' ? skill.ap : skill.pp}
              type={skill.type}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm cursor-help">{skill.name}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">{skill.name}</p>
                    <p className="text-sm">{skill.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Empty</span>
        )}
        {skill && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="remove-btn absolute right-1 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-destructive opacity-0 transition-opacity"
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
      <div className="p-2 border-l min-h-[40px] relative">
        <ConditionModal
          onSelectCondition={condition => {
            handleConditionSelect(skillSlot.id, 0, condition)
          }}
          currentCondition={skillSlot.tactics[0] || null}
        />
        {skillSlot.tactics[0] && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveCondition(0)}
            className="remove-btn absolute right-1 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-destructive opacity-0 transition-opacity"
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
      <div className="p-2 border-l min-h-[40px] relative">
        <ConditionModal
          onSelectCondition={condition => {
            handleConditionSelect(skillSlot.id, 1, condition)
          }}
          currentCondition={skillSlot.tactics[1] || null}
        />
        {skillSlot.tactics[1] && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveCondition(1)}
            className="remove-btn absolute right-1 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-destructive opacity-0 transition-opacity"
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
