import { SwordIcon, ShieldIcon, HardHatIcon, GemIcon } from 'lucide-react'

import { PageContent } from '../page-content'
import { PageHeader } from '../page-header'
import { PageLayout } from '../page-layout'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

export function EquipmentBuilder() {
  return (
    <PageLayout>
      <PageHeader
        title="Equipment Builder"
        description="Manage and optimize equipment loadouts for your teams"
      >
        <Button>Import Team</Button>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Categories</CardTitle>
                <CardDescription>Browse equipment by type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <SwordIcon className="mr-2 h-4 w-4" />
                  Weapons
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ShieldIcon className="mr-2 h-4 w-4" />
                  Armor
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HardHatIcon className="mr-2 h-4 w-4" />
                  Accessories
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <GemIcon className="mr-2 h-4 w-4" />
                  Consumables
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Equipment List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Inventory</CardTitle>
                <CardDescription>All available equipment items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <SwordIcon className="mx-auto h-12 w-12 mb-4" />
                  <p>Equipment management interface coming soon</p>
                  <p className="text-sm mt-2">
                    This will integrate with the existing equipment components
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  )
}
