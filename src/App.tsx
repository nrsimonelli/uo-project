import { type ReactNode } from 'react'
import { Routes, Route } from 'react-router'

import { MockBattle } from '@/components/battle/mock-battle'
import { EquipmentBuilder } from '@/components/equipment-builder/equipment-builder'
import { LandingLayout } from '@/components/landing-layout'
import { LandingPage } from '@/components/landing-page'
import { TeamBuilder } from '@/components/team-builder/team-builder'
import { TeamDataError } from '@/components/team-builder/team-data-error'
import { useTeamError } from '@/components/team-builder/team-error-context'
import { UnitData } from '@/components/unit-data/unit-data'

function ErrorProtectedRoute({ children }: { children: ReactNode }) {
  const { validationError } = useTeamError()

  // Show error UI if there's a validation error
  if (validationError && !validationError.isValid) {
    return <TeamDataError />
  }

  return <>{children}</>
}

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
      <Route
        path="/team-builder"
        element={
          <ErrorProtectedRoute>
            <TeamBuilder />
          </ErrorProtectedRoute>
        }
      />
      <Route path="/equipment" element={<EquipmentBuilder />} />
      <Route path="/classes" element={<UnitData />} />
      <Route
        path="/mock-battle"
        element={
          <ErrorProtectedRoute>
            <MockBattle />
          </ErrorProtectedRoute>
        }
      />
    </Routes>
  )
}
