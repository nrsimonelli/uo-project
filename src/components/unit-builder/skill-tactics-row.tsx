import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'

import { CostSymbols } from '@/components/cost-symbols'
import { ConditionModal } from '@/components/tactical/condition-modal'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'
import { cn } from '@/lib/utils'
import type { DamageEffect, HealPotencyEffect } from '@/types/effects'
import type { SkillSlot } from '@/types/skills'
import type { TacticalCondition } from '@/types/tactics'
import type { Unit } from '@/types/team'
import { isSkillValidForUnit } from '@/utils/skill-availability'

interface SkillTacticsRowProps {
  skillSlot: SkillSlot
  unit: Unit
  removeSkillSlot: (arg: string) => void
  handleConditionSelect: (
    skillSlotId: string,
    tacticIndex: number,
    condition: TacticalCondition | null
  ) => void
}

export function SkillTacticsRow({
  skillSlot,
  unit,
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

  const isValid = isSkillValidForUnit(unit, skillSlot)

  const handleRemove = () => {
    removeSkillSlot(skillSlot.id)
  }

  const handleRemoveCondition = (idx: number) => {
    handleConditionSelect(skillSlot.id, idx, null)
  }

  const getSkillDetails = (skill: {
    skillCategories: readonly string[]
    effects: ReadonlyArray<{ kind?: string; [key: string]: unknown }>
  }) => {
    const categories = new Set(skill.skillCategories)

    if (categories.has('Sabotage')) return 'Hit Rate: True'

    const effect = skill.effects.find(
      e => e.kind === 'Damage' || e.kind === 'Heal'
    ) as DamageEffect | HealPotencyEffect | undefined

    if (!effect) return null

    const details = [
      'hitRate' in effect &&
        effect.hitRate !== undefined &&
        `Hit Rate: ${effect.hitRate === 'True' ? 'True' : `${effect.hitRate}%`}`,
      effect.potency?.physical !== undefined &&
        `Phys. Potency: ${effect.potency.physical}`,
      effect.potency?.magical !== undefined &&
        `Mag. Potency: ${effect.potency.magical}`,
      effect.hitCount !== undefined &&
        effect.hitCount > 1 &&
        `Hit Count: ${effect.hitCount}`,
    ].filter(Boolean) as string[]

    return details.length > 0 ? details.join(', ') : null
  }

  const skillDetails = skill ? getSkillDetails(skill) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'grid grid-cols-[auto_1fr_1fr_1fr] border-t hover:bg-muted/30 [&:hover_.remove-btn]:opacity-100 transition-colors',
        isDragging && 'opacity-75',
        !isValid && 'bg-destructive/10 dark:bg-destructive/20'
      )}
    >
      <div className="p-2 flex items-center justify-center min-h-[40px] border-r w-12 flex-shrink-0">
        <button
          {...attributes}
          {...listeners}
          className="p-1 transition-colors text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'text-sm cursor-help',
                    !isValid && 'text-destructive font-medium'
                  )}
                >
                  {skill.name}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1.5">
                  <p className="font-medium">{skill.name}</p>
                  {skillDetails && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {skillDetails}
                    </p>
                  )}
                  <p className="text-sm">{skill.description}</p>
                  {!isValid && (
                    <p className="text-sm text-destructive font-medium">
                      This skill is not valid for the unit's current level
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Empty</span>
        )}
        {skill && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="absolute transition-opacity -translate-y-1/2 opacity-0 remove-btn right-1 top-1/2 size-6 text-muted-foreground hover:text-destructive"
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
            className="absolute transition-opacity -translate-y-1/2 opacity-0 remove-btn right-1 top-1/2 size-6 text-muted-foreground hover:text-destructive"
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
            className="absolute transition-opacity -translate-y-1/2 opacity-0 remove-btn right-1 top-1/2 size-6 text-muted-foreground hover:text-destructive"
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
