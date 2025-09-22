import { useState } from 'react'
import { TeamSlot } from './team-slot'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { UnitSearchModal } from './unit-search-modal'
import { useCurrentTeam, useTeam } from '@/hooks/use-team'

export const TeamBuilder = () => {
  const currentTeam = useCurrentTeam()
  const { removeUnit } = useTeam()
  const [selectedUnitSlot, setSelectedUnitSlot] = useState<string | undefined>(
    undefined
  )

  return (
    <div className='max-w-6xl mx-auto space-y-6 p-6'>
      {JSON.stringify(currentTeam)}
      <p>Team Builder</p>
      <div>formation display...</div>
      {/* <TeamFormation /> */}
      <Tabs value={selectedUnitSlot}>
        <TabsList>
          {currentTeam.formation.map((unit, i) => (
            <TabsTrigger
              key={i}
              value={`tab-${i}`}
              onClick={() => setSelectedUnitSlot(`tab-${i}`)}
            >
              {unit ? unit.class : `Slot ${i + 1}`}
            </TabsTrigger>
          ))}
        </TabsList>
        {currentTeam.formation.map((unit, i) => (
          <TabsContent key={`tab-${i}`} value={`tab-${i}`}>
            <TeamSlot unit={unit} onRemove={() => unit && removeUnit(unit.id)}>
              <UnitSearchModal team={currentTeam} slotNumber={i} />
            </TeamSlot>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
