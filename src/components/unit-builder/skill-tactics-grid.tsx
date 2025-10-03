import type { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import { Button } from '@/components/ui/button'
import { SkillTacticsRow } from './skill-tactics-row'
import { Plus } from 'lucide-react'

interface SkillTacticsGridProps {
  skillSlotManager: ReturnType<typeof useSkillSlotManager>
}

/**
 * Grid component that manages skill slot rendering and ordering
 * Renders up to 10 skill rows with proper active-above-passive ordering
 */
export function SkillTacticsGrid({ skillSlotManager }: SkillTacticsGridProps) {
  const { skillSlots, canAddMoreSkills } = skillSlotManager

  return (
    <div className='space-y-2'>
      {/* Render existing skill slots */}
      {skillSlots.map((skillSlot, index) => (
        <SkillTacticsRow
          key={skillSlot.id}
          skillSlot={skillSlot}
          index={index}
          skillSlotManager={skillSlotManager}
        />
      ))}

      {/* Add Skill button - only show when slots are available */}
      {canAddMoreSkills && (
        <div className='grid grid-cols-3 gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='justify-start'
            onClick={() => {
              // TODO: Open skill selection modal
              console.log('Open skill selection modal')
            }}
          >
            <Plus className='size-4' />
            Add Skill
          </Button>
          <div className='text-sm text-muted-foreground flex items-center justify-center'>
            -
          </div>
          <div className='text-sm text-muted-foreground flex items-center justify-center'>
            -
          </div>
        </div>
      )}

      {/* Show skill count */}
      <div className='text-xs text-muted-foreground'>
        {skillSlots.length} / {skillSlotManager.maxSkills} skills
      </div>
    </div>
  )
}
