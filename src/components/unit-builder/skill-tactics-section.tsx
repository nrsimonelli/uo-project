import type { Unit } from '@/types/team'
import { useSkillSlotManager } from '@/hooks/use-skill-slot-manager'
import { SkillTacticsGrid } from './skill-tactics-grid'

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
    <div className='space-y-3'>
      <p className='text-lg font-medium'>Skills & Tactics</p>

      {/* Three-column header */}
      <div className='grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground'>
        <div>Skills</div>
        <div>Tactics 1</div>
        <div>Tactics 2</div>
      </div>

      {/* Skills and tactics grid */}
      <SkillTacticsGrid skillSlotManager={skillSlotManager} unit={unit} />
    </div>
  )
}
