import { UnitDataTable } from './unit-data-table'

import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'

export function UnitData() {
  return (
    <PageLayout>
      <div className="space-y-8">
        <PageHeader
          title="Unit Data Table"
          description="Comprehensive data for all unit classes including base stats, equipment, and traits."
        />

        <UnitDataTable />
      </div>
    </PageLayout>
  )
}
