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
  const { skillSlots } = skillSlotManager

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
    </div>
  )
}
