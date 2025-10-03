import type { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import type { Unit } from '@/types/team'
import { SkillTacticsRow } from './skill-tactics-row'
import { SkillSelectionModal } from './skill-selection-modal'

interface SkillTacticsGridProps {
  skillSlotManager: ReturnType<typeof useSkillSlotManager>
  unit: Unit
}

export function SkillTacticsGrid({
  skillSlotManager,
  unit,
}: SkillTacticsGridProps) {
  const { skillSlots, canAddMoreSkills, addSkill } = skillSlotManager

  return (
    <div className='space-y-2'>
      {skillSlots.map((skillSlot, index) => (
        <SkillTacticsRow
          key={skillSlot.id}
          skillSlot={skillSlot}
          index={index}
          skillSlotManager={skillSlotManager}
        />
      ))}

      {canAddMoreSkills && (
        <div className='grid grid-cols-3 gap-2'>
          <SkillSelectionModal unit={unit} onSkillSelect={addSkill} />
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
