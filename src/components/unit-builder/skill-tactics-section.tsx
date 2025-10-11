import { SkillSelectionModal } from './skill-selection-modal'
import { SkillTacticsRow } from './skill-tactics-row'

import { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import type { Tactic, TacticalCondition } from '@/types/tactics'
import type { Unit } from '@/types/team'

interface SkillTacticsSectionProps {
  unit: Unit
  onUpdateUnit: (updates: Partial<Unit>) => void
}

export function SkillTacticsSection({
  unit,
  onUpdateUnit,
}: SkillTacticsSectionProps) {
  const { skillSlots, addSkill, canAddMoreSkills, removeSkillSlot } =
    useSkillSlotManager({ unit, onUpdateUnit })

  const handleConditionSelect = (
    skillSlotId: string,
    tacticIndex: number,
    condition: TacticalCondition | null
  ) => {
    const updatedSkillSlots = skillSlots.map(slot => {
      if (slot.id === skillSlotId) {
        const newTactics: [Tactic | null, Tactic | null] = [...slot.tactics]

        if (condition) {
          newTactics[tacticIndex] = {
            kind: 'conditional', // Default kind for now
            condition,
          }
        } else {
          newTactics[tacticIndex] = null
        }

        return {
          ...slot,
          tactics: newTactics,
        }
      }
      return slot
    })

    onUpdateUnit({ skillSlots: updatedSkillSlots })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium">Tactics</p>
        <div className="flex items-center gap-3">
          {canAddMoreSkills && (
            <SkillSelectionModal unit={unit} onSkillSelect={addSkill} />
          )}
        </div>
      </div>
      {skillSlots.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-muted/50 border-b text-sm font-medium">
            <div className="p-3">Skill</div>
            <div className="p-3 border-l">Condition 1</div>
            <div className="p-3 border-l">Condition 2</div>
          </div>
          <div>
            {skillSlots.map(skillSlot => (
              <SkillTacticsRow
                key={skillSlot.id}
                skillSlot={skillSlot}
                removeSkillSlot={removeSkillSlot}
                handleConditionSelect={handleConditionSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
