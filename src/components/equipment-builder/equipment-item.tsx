import { EquipmentSlotIcon } from './equipment-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { SPRITES } from '@/data/sprites'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'
import type { EquippedByInfo } from '@/hooks/use-equipment-manager'
import type { EquipmentSlotType } from '@/types/equipment'
import type { GeneratedEquipment } from '@/types/generated-equipment'

interface EquipmentItemProps {
  item: GeneratedEquipment
  equippedBy: EquippedByInfo | null
  isCurrentlyEquipped: boolean
  isEquippedByCurrentUnitElsewhere: boolean
  onSelect: (item: GeneratedEquipment) => void
}

export function EquipmentItem({
  item,
  equippedBy,
  isCurrentlyEquipped,
  isEquippedByCurrentUnitElsewhere,
  onSelect,
}: EquipmentItemProps) {
  const isDisabled = isCurrentlyEquipped || isEquippedByCurrentUnitElsewhere

  return (
    <Button
      variant="outline"
      className="w-full justify-start h-auto p-3 text-left"
      onClick={() => onSelect(item)}
      disabled={isDisabled}
    >
      <div className="flex items-start w-full gap-3">
        <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded bg-muted">
          <EquipmentSlotIcon
            // TODO: revisit later
            slotType={item.type as EquipmentSlotType}
            className="w-6 h-6"
          />
        </div>
        <div className="flex flex-col items-start w-full min-w-0 gap-1">
          <div className="flex items-center w-full gap-2">
            <div className="font-medium truncate">{item.name}</div>
            <EquipmentStatusBadge
              equippedBy={equippedBy}
              isCurrentlyEquipped={isCurrentlyEquipped}
              isEquippedByCurrentUnitElsewhere={
                isEquippedByCurrentUnitElsewhere
              }
            />
          </div>
          <EquipmentStats stats={item.stats} />
          <EquipmentSkill skillId={item.skillId} />
          <EquipmentRestrictions classRestrictions={item.classRestrictions} />
        </div>
      </div>
    </Button>
  )
}

interface EquipmentStatusBadgeProps {
  equippedBy: EquippedByInfo | null
  isCurrentlyEquipped: boolean
  isEquippedByCurrentUnitElsewhere: boolean
}

function EquipmentStatusBadge({
  equippedBy,
  isCurrentlyEquipped,
  isEquippedByCurrentUnitElsewhere,
}: EquipmentStatusBadgeProps) {
  if (isCurrentlyEquipped || isEquippedByCurrentUnitElsewhere) {
    return (
      <Badge variant="default" className="shrink-0 text-xs">
        Current
      </Badge>
    )
  }

  if (equippedBy) {
    return (
      <Badge
        variant="secondary"
        className="flex items-center shrink-0 gap-1 px-2 py-1 text-xs"
      >
        <img
          src={SPRITES[equippedBy.unitClass]}
          alt={equippedBy.unitName}
          className="w-3 h-3 rounded-sm"
        />
        Equipped
      </Badge>
    )
  }

  return null
}

interface EquipmentStatsProps {
  stats: Record<string, unknown>
}

function EquipmentStats({ stats }: EquipmentStatsProps) {
  if (Object.keys(stats).length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
      {Object.entries(stats)
        .slice(0, 4)
        .filter(([, value]) => typeof value === 'number')
        .map(([stat, value]) => (
          <span key={stat} className="bg-muted/50 px-1.5 py-0.5 rounded">
            {stat}: +{String(value)}
          </span>
        ))}
    </div>
  )
}

interface EquipmentSkillProps {
  skillId: string | null
}

function EquipmentSkill({ skillId }: EquipmentSkillProps) {
  if (!skillId) return null

  const skill = [...ActiveSkills, ...PassiveSkills].find(s => s.id === skillId)

  if (!skill)
    return (
      <div className="text-xs text-primary truncate w-full">
        Skill: {skillId}
      </div>
    )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-xs text-primary cursor-help truncate w-full">
          Skill: {skill.name}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">{skill.name}</p>
          <p className="text-sm">{skill.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

interface EquipmentRestrictionsProps {
  classRestrictions: readonly string[]
}

function EquipmentRestrictions({
  classRestrictions,
}: EquipmentRestrictionsProps) {
  if (classRestrictions.length === 0) return null

  const displayText =
    classRestrictions.length > 3
      ? `${classRestrictions.slice(0, 3).join(', ')}... (+${
          classRestrictions.length - 3
        } more)`
      : classRestrictions.join(', ')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-xs text-warning cursor-help truncate w-full">
          Restricted to: {displayText}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="text-xs">
          <div className="mb-1 font-semibold">Restricted to:</div>
          {classRestrictions.join(', ')}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
