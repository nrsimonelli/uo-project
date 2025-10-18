import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'
import { useState } from 'react'

import { SkillSelectionModal } from './skill-selection-modal'
import { SkillTacticsRow } from './skill-tactics-row'

import { CostSymbols } from '@/components/cost-symbols'
import { ConditionModal } from '@/components/tactical/condition-modal'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'
import { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import type { SkillSlot } from '@/types/skills'
import type { TacticalCondition } from '@/types/tactics'
import type { Unit } from '@/types/team'

interface SkillTacticsSectionProps {
  unit: Unit
  onUpdateUnit: (updates: Partial<Unit>) => void
}

export function SkillTacticsSection({
  unit,
  onUpdateUnit,
}: SkillTacticsSectionProps) {
  const {
    skillSlots,
    addSkill,
    canAddMoreSkills,
    removeSkillSlot,
    reorderSkillSlot,
  } = useSkillSlotManager({ unit, onUpdateUnit })

  const [activeSkill, setActiveSkill] = useState<SkillSlot | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const draggedSkill = skillSlots.find(slot => slot.id === event.active.id)
    setActiveSkill(draggedSkill || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveSkill(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = skillSlots.findIndex(slot => slot.id === active.id)
    const newIndex = skillSlots.findIndex(slot => slot.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSkillSlot(oldIndex, newIndex)
    }
  }

  const handleConditionSelect = (
    skillSlotId: string,
    tacticIndex: number,
    condition: TacticalCondition | null
  ) => {
    const updatedSkillSlots = skillSlots.map(slot => {
      if (slot.id === skillSlotId) {
        const newTactics: [TacticalCondition | null, TacticalCondition | null] = [...slot.tactics]

        if (condition) {
          newTactics[tacticIndex] = condition
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
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] bg-muted/50 border-b text-sm font-medium">
              <div className="p-3 border-r w-12 flex-shrink-0"></div>
              <div className="p-3">Skill</div>
              <div className="p-3 border-l">Condition 1</div>
              <div className="p-3 border-l">Condition 2</div>
            </div>
            <SortableContext
              items={skillSlots.map(slot => slot.id)}
              strategy={verticalListSortingStrategy}
            >
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
            </SortableContext>
          </div>
          <DragOverlay>
            {activeSkill ? (
              <div className="min-w-[600px] border rounded-lg overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[auto_1fr_1fr_1fr] border-t hover:bg-muted/30 [&:hover_.remove-btn]:opacity-100 transition-colors">
                  <div className="p-2 flex items-center justify-center min-h-[40px] border-r w-12 flex-shrink-0">
                    <GripVertical className="size-4 text-muted-foreground" />
                  </div>
                  <div className="p-2 flex items-center gap-2 min-h-[40px] relative">
                    {(() => {
                      const skill = activeSkill.skillId
                        ? [...ActiveSkills, ...PassiveSkills].find(
                            s => s.id === activeSkill.skillId
                          )
                        : null
                      return skill ? (
                        <>
                          <CostSymbols
                            cost={skill.type === 'active' ? skill.ap : skill.pp}
                            type={skill.type}
                          />
                          <span className="text-sm">{skill.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Empty
                        </span>
                      )
                    })()}
                  </div>
                  <div className="p-2 border-l min-h-[40px] relative">
                    <ConditionModal
                      onSelectCondition={() => {}}
                      currentCondition={
                        activeSkill.tactics[0] || null
                      }
                    />
                  </div>
                  <div className="p-2 border-l min-h-[40px] relative">
                    <ConditionModal
                      onSelectCondition={() => {}}
                      currentCondition={
                        activeSkill.tactics[1] || null
                      }
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
