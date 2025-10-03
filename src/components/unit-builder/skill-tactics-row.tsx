import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'
import type { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import { cn } from '@/lib/utils'
import type { SkillSlot } from '@/types/skills'

interface SkillTacticsRowProps {
  skillSlot: SkillSlot
  index: number
  skillSlotManager: ReturnType<typeof useSkillSlotManager>
}

export function SkillTacticsRow({
  skillSlot,
  index,
  skillSlotManager,
}: SkillTacticsRowProps) {
  const { removeSkillSlot } = skillSlotManager

  const skill = skillSlot.skillId
    ? [...ActiveSkills, ...PassiveSkills].find(s => s.id === skillSlot.skillId)
    : null

  const handleRemove = () => {
    removeSkillSlot(skillSlot.id)
  }

  const renderCostSymbols = (cost: number, isActive: boolean) => {
    return Array.from({ length: cost }, (_, i) => (
      <span
        key={i}
        className={cn(
          'inline-block w-2 h-2 rounded-full',
          isActive ? 'bg-red-500' : 'bg-blue-500'
        )}
      />
    ))
  }

  return (
    <div className="grid grid-cols-3 border-t hover:bg-muted/30">
      <div className="p-2 flex items-center gap-2 min-h-[40px]">
        {skill ? (
          <>
            <div className="flex items-center gap-1">
              {skill.type === 'active'
                ? renderCostSymbols(skill.ap || 0, true)
                : renderCostSymbols(skill.pp || 0, false)}
            </div>
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
            className="ml-auto size-6 text-muted-foreground hover:text-destructive"
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
      <div className="p-2 border-l min-h-[40px]"></div>
      <div className="p-2 border-l min-h-[40px]"></div>
    </div>
  )
}
