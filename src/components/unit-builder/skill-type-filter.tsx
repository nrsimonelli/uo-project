import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { SkillTypeFilter } from '@/hooks/use-skill-selection'

interface SkillTypeFilterComponentProps {
  value: SkillTypeFilter
  onValueChange: (value: SkillTypeFilter) => void
}

export function SkillTypeFilterComponent({
  value,
  onValueChange,
}: SkillTypeFilterComponentProps) {
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue as SkillTypeFilter)
  }

  return (
    <Tabs value={value} onValueChange={handleValueChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="passive">Passive</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
