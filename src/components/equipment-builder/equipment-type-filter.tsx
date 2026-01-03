import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type EquipmentTypeFilter = 'all' | 'skill' | 'appp'

interface EquipmentTypeFilterComponentProps {
  value: EquipmentTypeFilter
  onValueChange: (value: EquipmentTypeFilter) => void
}

export function EquipmentTypeFilterComponent({
  value,
  onValueChange,
}: EquipmentTypeFilterComponentProps) {
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue as EquipmentTypeFilter)
  }

  return (
    <Tabs value={value} onValueChange={handleValueChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="skill">Skill</TabsTrigger>
        <TabsTrigger value="appp">AP/PP</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
