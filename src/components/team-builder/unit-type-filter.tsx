import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type UnitTypeFilter = 'all' | 'advanced' | 'base'

interface UnitTypeFilterComponentProps {
  value: UnitTypeFilter
  onValueChange: (value: UnitTypeFilter) => void
}

export function UnitTypeFilterComponent({
  value,
  onValueChange,
}: UnitTypeFilterComponentProps) {
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue as UnitTypeFilter)
  }

  return (
    <Tabs value={value} onValueChange={handleValueChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="base">Base</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

