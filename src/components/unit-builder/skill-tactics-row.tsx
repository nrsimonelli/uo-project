import { X } from 'lucide-react'

import { ConditionModal } from '../tactical/condition-modal'

import { CostSymbols } from '@/components/cost-symbols'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'
import type { SkillSlot } from '@/types/skills'
import type { TacticalCondition } from '@/types/tactical-evaluation'

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
    <div className="grid grid-cols-3 border-t hover:bg-muted/30 [&:hover_.remove-btn]:opacity-100">
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
          currentCondition={skillSlot.tactics[0]?.condition || null}
        />
        {skillSlot.tactics[0]?.condition && (
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
          currentCondition={skillSlot.tactics[1]?.condition || null}
        />
        {skillSlot.tactics[1]?.condition && (
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
