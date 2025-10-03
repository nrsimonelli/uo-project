import { SkillSelectionModal } from './skill-selection-modal'
import { SkillTacticsGrid } from './skill-tactics-grid'

import { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import type { Unit } from '@/types/team'

interface SkillTacticsSectionProps {
  unit: Unit
  onUpdateUnit: (updates: Partial<Unit>) => void
}

export function SkillTacticsSection({
  unit,
  onUpdateUnit,
}: SkillTacticsSectionProps) {
  const skillSlotManager = useSkillSlotManager({ unit, onUpdateUnit })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium">Skills & Tactics</p>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {skillSlotManager.skillSlots.length} / {skillSlotManager.maxSkills}
          </div>
          {skillSlotManager.canAddMoreSkills && (
            <SkillSelectionModal
              unit={unit}
              onSkillSelect={skillSlotManager.addSkill}
            />
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 bg-muted/50 border-b text-sm font-medium">
          <div className="p-3">Skill</div>
          <div className="p-3 border-l">Tactics</div>
          <div className="p-3 border-l"></div>
        </div>
        <SkillTacticsGrid skillSlotManager={skillSlotManager} unit={unit} />
      </div>
    </div>
  )
}
