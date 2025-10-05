import { Routes, Route } from 'react-router'

import { BattlePage } from '@/components/battle'
import { EquipmentBuilder } from '@/components/equipment-builder/equipment-builder'
import { LandingLayout } from '@/components/landing-layout'
import { LandingPage } from '@/components/landing-page'
import { TeamBuilder } from '@/components/team-builder/team-builder'

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
      <Route path="/mock-battle" element={<BattlePage />} />
    </Routes>
  )
}
