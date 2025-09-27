import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

import { GROWTHS } from '@/data/constants'
import type { AllClassType, GrowthType } from '@/types/base-stats'
import { filterUnits } from '@/core/unit-filter'
import type { Team } from '@/types/team'
import { Label } from '../ui/label'

interface Option<T extends string | number> {
  label: string
  value: T
}

interface UnitSelectProps<T extends string | number> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (val: T) => void
}

export function UnitSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: UnitSelectProps<T>) {
  return (
    <div>
      <Label htmlFor={label} className='block text-xs font-medium mb-1'>
        {label}
      </Label>
      <Select value={String(value)} onValueChange={(val) => onChange(val as T)}>
        <SelectTrigger className='h-8 w-full'>
          <SelectValue id={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface LevelSelectProps {
  level: number
  onChange: (level: number) => void
}

export function LevelSelect({ level, onChange }: LevelSelectProps) {
  const levelOptions = Array.from({ length: 50 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1,
  }))

  return (
    <UnitSelect<number>
      label='Level'
      value={level}
      options={levelOptions}
      onChange={onChange}
    />
  )
}

interface GrowthSelectProps {
  label: string
  growth: GrowthType
  onChange: (growth: GrowthType) => void
}

export function GrowthSelect({ label, growth, onChange }: GrowthSelectProps) {
  const growthOptions = Object.values(GROWTHS).map((growth) => ({
    label: growth,
    value: growth,
  }))

  return (
    <UnitSelect<GrowthType>
      label={label}
      value={growth}
      options={growthOptions}
      onChange={onChange}
    />
  )
}

interface ClassSelectProps {
  unitId: string
  classType: AllClassType
  onChange: (cls: AllClassType) => void
  team: Team
}
export function ClassSelect({
  classType,
  onChange,
  team,
  unitId,
}: ClassSelectProps) {
  // needs to be team minus current unit
  // team without unitId
  const teamMinusCurrent = {
    ...team,
    formation: team.formation.filter((unit) => unit?.id !== unitId),
  }
  const filtered = filterUnits(teamMinusCurrent)

  const classOptions = filtered
    .map((cls) => ({
      label: cls,
      value: cls as AllClassType,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <UnitSelect<AllClassType>
      label='Class'
      value={classType}
      options={classOptions}
      onChange={onChange}
    />
  )
}
