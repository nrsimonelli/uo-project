import type { SkillSlot } from '@/types/skills'
import type { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'

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
  const { removeSkillSlot, reorderSkillSlot, skillSlots } = skillSlotManager

  const skill = skillSlot.skillId
    ? [...ActiveSkills, ...PassiveSkills].find(
        (s) => s.id === skillSlot.skillId
      )
    : null

  const canMoveUp = index > 0
  const canMoveDown = index < skillSlots.length - 1

  const handleMoveUp = () => {
    if (canMoveUp) {
      reorderSkillSlot(index, index - 1)
    }
  }

  const handleMoveDown = () => {
    if (canMoveDown) {
      reorderSkillSlot(index, index + 1)
    }
  }

  const handleRemove = () => {
    removeSkillSlot(skillSlot.id)
  }

  return (
    <div className='grid grid-cols-3 gap-2 items-center'>
      {/* Skill Column */}
      <div className='flex items-center gap-2 p-2 border rounded-md bg-background'>
        {skillSlot.skillId ? (
          skill ? (
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-sm truncate'>
                  {skill.name}
                </span>
                <Badge
                  variant={skill.type === 'active' ? 'default' : 'secondary'}
                  className='text-xs'
                >
                  {skill.type === 'active'
                    ? `${skill?.ap ?? 'Unknown'} AP`
                    : `${skill?.pp ?? 'Unknown'} PP`}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground truncate'>
                {skill.description}
              </p>
            </div>
          ) : (
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-sm text-warning'>
                  Skill data coming soon
                </span>
                <Badge variant='outline' className='text-xs'>
                  {skillSlot.skillId}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                Skill ID: {skillSlot.skillId} - Data not yet available
              </p>
            </div>
          )
        ) : (
          <div className='flex-1 text-sm text-muted-foreground'>Empty Slot</div>
        )}

        {/* Row Controls */}
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='size-6'
            onClick={handleMoveUp}
            disabled={!canMoveUp}
          >
            <ArrowUp className='size-3' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='size-6'
            onClick={handleMoveDown}
            disabled={!canMoveDown}
          >
            <ArrowDown className='size-3' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='size-6'
            onClick={handleRemove}
          >
            <X className='size-3' />
          </Button>
          <GripVertical className='size-4 text-muted-foreground cursor-grab' />
        </div>
      </div>

      {/* Tactics Column 1 - Placeholder */}
      <div className='p-2 border rounded-md bg-muted/30 text-center'>
        <span className='text-sm text-muted-foreground'>Tactics 1</span>
        <div className='text-xs text-muted-foreground mt-1'>(Coming Soon)</div>
      </div>

      {/* Tactics Column 2 - Placeholder */}
      <div className='p-2 border rounded-md bg-muted/30 text-center'>
        <span className='text-sm text-muted-foreground'>Tactics 2</span>
        <div className='text-xs text-muted-foreground mt-1'>(Coming Soon)</div>
      </div>
    </div>
  )
}
