import { SkillSelectionModal } from './skill-selection-modal'
import { SkillTacticsRow } from './skill-tactics-row'

import type { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import type { Unit } from '@/types/team'

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
    <div>
      {skillSlots.map((skillSlot, index) => (
        <SkillTacticsRow
          key={skillSlot.id}
          skillSlot={skillSlot}
          index={index}
          skillSlotManager={skillSlotManager}
        />
      ))}

      {canAddMoreSkills && (
        <div className="grid grid-cols-3 border-t">
          <div className="p-2 flex items-center">
            <SkillSelectionModal unit={unit} onSkillSelect={addSkill} />
          </div>
          <div className="p-2 border-l"></div>
          <div className="p-2 border-l"></div>
        </div>
      )}
    </div>
  )
}
