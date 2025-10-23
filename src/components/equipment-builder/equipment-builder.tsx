import { SwordIcon } from 'lucide-react'
import { useState } from 'react'

import { getEquipmentIcon } from './equipment-icons'
import { EquipmentInventoryCard } from './equipment-inventory-card'

import { PageContent } from '@/components/page-content'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useFilteredEquipment } from '@/hooks/use-filtered-equipment'
import {
  EQUIPMENT_SLOTS,
  WEAPONS,
  type EquipmentSlotType,
  type EquipmentStatKey,
} from '@/types/equipment'

export function EquipmentBuilder() {
  const [selectedCategory, setSelectedCategory] =
    useState<EquipmentSlotType>('Accessory')
  const [searchTerm, setSearchTerm] = useState('')

  const equipmentList = useFilteredEquipment(
    selectedCategory,
    'All',
    searchTerm
  )

  const handleCategorySelect = (equipmentType: EquipmentSlotType) => {
    if (equipmentType !== selectedCategory) {
      setSelectedCategory(equipmentType)
    }
  }

  const getPrimaryEquipmentStats = (
    slotType: EquipmentSlotType
  ): [EquipmentStatKey, EquipmentStatKey] => {
    if (slotType === 'Accessory') {
      return ['PDEF', 'MDEF']
    }
    if (slotType === 'Shield' || slotType === 'Greatshield') {
      return ['PDEF', 'GRD']
    }
    return ['PATK', 'MATK']
  }

  return (
    <PageLayout>
      <PageHeader
        title="Equipment Builder"
        description="Manage and optimize equipment loadouts for your teams"
      >
        {/* <Button>Import Team</Button> */}
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
                {[...WEAPONS, ...EQUIPMENT_SLOTS].map(equipmentType => {
                  const Icon = getEquipmentIcon(equipmentType)
                  const isSelected = selectedCategory === equipmentType
                  return (
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleCategorySelect(equipmentType)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {equipmentType}
                    </Button>
                  )
                })}
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
              <CardContent className="space-y-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search equipment..."
                />
                {equipmentList.length === 0 && !searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    <SwordIcon className="mx-auto h-12 w-12 mb-4" />
                    <p>No equipment found in this category</p>
                  </div>
                )}
                {equipmentList.length === 0 && searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    <SwordIcon className="mx-auto h-12 w-12 mb-4" />
                    <p>No equipment found matching "{searchTerm}"</p>
                  </div>
                )}
                <div className="space-y-2">
                  {equipmentList.map(item => (
                    <EquipmentInventoryCard
                      key={item.name}
                      item={item}
                      primaryStats={getPrimaryEquipmentStats(item.type)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  )
}
