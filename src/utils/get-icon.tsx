import {
  Shield,
  Footprints,
  TreePine,
  Eye,
  CandyCane,
  Cat,
  Feather,
  Sparkle,
  BowArrow,
  Magnet,
} from 'lucide-react'
// TODO: better icons

const RACE_ICONS = {
  Elven: TreePine,
  Bestral: Cat,
  Angel: Sparkle,
} as const

const TRAIT_ICONS = {
  Caster: CandyCane,
  Scout: Eye,
  Armored: Shield,
  Archer: BowArrow,
} as const

const MOVEMENT_ICONS = {
  Infantry: Footprints,
  Flying: Feather,
  Cavalry: Magnet,
} as const

type RaceType = keyof typeof RACE_ICONS
type TraitType = keyof typeof TRAIT_ICONS
type MovementType = keyof typeof MOVEMENT_ICONS

const ICON_MAPS = {
  race: RACE_ICONS,
  trait: TRAIT_ICONS,
  movement: MOVEMENT_ICONS,
} as const

export function getIcon(
  type: 'race' | 'trait' | 'movement',
  value: RaceType | TraitType | MovementType
): React.ComponentType<{ className?: string }> {
  const iconMap = ICON_MAPS[type]
  return iconMap[value as keyof typeof iconMap]
}
