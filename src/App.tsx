import { Routes, Route } from 'react-router'

import { MockBattle } from '@/components/battle/mock-battle'
import { EquipmentBuilder } from '@/components/equipment-builder/equipment-builder'
import { LandingLayout } from '@/components/landing-layout'
import { LandingPage } from '@/components/landing-page'
import { TeamBuilder } from '@/components/team-builder/team-builder'
import { UnitData } from '@/components/unit-data/unit-data'

export const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingLayout>
            <LandingPage />
          </LandingLayout>
        }
      />
      <Route path="/team-builder" element={<TeamBuilder />} />
      <Route path="/equipment-builder" element={<EquipmentBuilder />} />
      <Route path="/classes" element={<UnitData />} />
      <Route path="/mock-battle" element={<MockBattle />} />
    </Routes>
  )
}
