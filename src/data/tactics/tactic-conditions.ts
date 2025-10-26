import { COMBATANT_TYPES, STATS } from '@/data/constants'

// categories from UO
export const TACTIC_CATEGORIES = {
  FORMATION_SITUATION: 'Formation & Situation',
  COMBATANT_TYPE: 'Combatant Type',
  HP: 'HP',
  AP_PP: 'AP & PP',
  COMBATANT_STATUS: 'Combatant Status',
  ATTACK_TYPE: 'Attack Type',
  UNIT_SIZE: 'Unit Size',
  OWN_CONDITION: 'Own Condition',
  OWN_HP: 'Own HP',
  OWN_AP_PP: 'Own AP & PP',
  ENEMIES_PRESENT: 'Enemies Present',
  HIGH_STATS: 'High Stats',
  LOW_STATS: 'Low Stats',
} as const
export type TacticCategoryKey =
  (typeof TACTIC_CATEGORIES)[keyof typeof TACTIC_CATEGORIES]

export const STAT_CONDITIONS = [
  'Max AP',
  'Max PP',
  'Max HP',
  STATS.PATK,
  STATS.PDEF,
  STATS.MATK,
  STATS.MDEF,
  STATS.ACC,
  STATS.EVA,
  STATS.CRT,
  STATS.GRD,
  STATS.INIT,
] as const

const HIGH_STAT_KEYS = STAT_CONDITIONS.map(stat => `Highest ${stat}` as const)
const LOW_STAT_KEYS = STAT_CONDITIONS.map(stat => `Lowest ${stat}` as const)
const COMBATANT_TYPE_KEYS = [
  ...COMBATANT_TYPES.map(combatant => `Prioritize ${combatant}` as const),
  ...COMBATANT_TYPES,
]
const ENEMIES_PRESENT_KEYS = [
  'No Infantry Enemies',
  'No Cavalry Enemies',
  'No Flying Enemies',
  'No Armored Enemies',
  'No Scout Enemies',
  'No Archer Enemies',
  'No Caster Enemies',
  'No Elven Enemies',
  'No Bestral Enemies',
  'No Angel Enemies',
  'Infantry Enemies Present',
  'Cavalry Enemies Present',
  'Flying Enemies Present',
  'Armored Enemies Present',
  'Scout Enemies Present',
  'Archer Enemies Present',
  'Caster Enemies Present',
  'Elven Enemies Present',
  'Bestral Enemies Present',
  'Angel Enemies Present',
] as const

const HP_KEYS = [
  'Highest HP',
  'Lowest HP',
  'Highest % HP',
  'Lowest % HP',
  'Target HP is >25%',
  'Target HP is >50%',
  'Target HP is >75%',
  'Target HP is >100%',
  'Target HP is <25%',
  'Target HP is <50%',
  'Target HP is <75%',
  'Target HP is <100%',
  'Average HP is >25%',
  'Average HP is >50%',
  'Average HP is >75%',
  'Average HP is >100%',
  'Average HP is <25%',
  'Average HP is <50%',
  'Average HP is <75%',
  'Average HP is <100%',
] as const
const OWN_HP_KEYS = [
  'Own HP is <25%',
  'Own HP is <50%',
  'Own HP is <75%',
  'Own HP is <100%',
  'Own HP is >25%',
  'Own HP is >50%',
  'Own HP is >75%',
  'Own HP is >100%',
] as const

const AP_PP_KEYS = [
  '0 AP',
  '1 or Less AP',
  '2 or Less AP',
  '3 or Less AP',
  '1 or More AP',
  '2 or More AP',
  '3 or More AP',
  '4 or More AP',
  'Most AP',
  'Least AP',
  '0 PP',
  '1 or Less PP',
  '2 or Less PP',
  '3 or Less PP',
  '1 or More PP',
  '2 or More PP',
  '3 or More PP',
  '4 or More PP',
  'Most PP',
  'Least PP',
] as const

const OWN_AP_PP_KEYS = [
  'Own AP is 0',
  'Own AP is 1 or Less',
  'Own AP is 2 or Less',
  'Own AP is 3 or Less',
  'Own AP is 1 or More',
  'Own AP is 2 or More',
  'Own AP is 3 or More',
  'Own AP is 4 or More',
  'Own PP is 0',
  'Own PP is 1 or Less',
  'Own PP is 2 or Less',
  'Own PP is 3 or Less',
  'Own PP is 1 or More',
  'Own PP is 2 or More',
  'Own PP is 3 or More',
  'Own PP is 4 or More',
] as const

const FORMATION_KEYS = [
  'Prioritize Front Row',
  'Prioritize Back Row',
  'Front Row',
  'Back Row',
  'Full Column',
  'Row with Most Combatants',
  'Row with Least Combatants',
  'Row with 2+ Combatants',
  'Row with 3+ Combatants',
  'Daytime',
  'Nighttime',
] as const

const STATUS_OPTIONS = [
  'Buffed',
  'Debuffed',
  'Afflicted',
  'Poisoned',
  'Burning',
  'Frozen',
  'Stunned',
  'Blinded',
  'Passive Sealed',
  'Guard Sealed',
] as const
const COMBATANT_STATUS_KEYS = [
  ...(['Prioritize Buffed', 'Prioritize Debuffed'] as const),
  ...STATUS_OPTIONS,
  ...STATUS_OPTIONS.map(val => `Not ${val}` as const),
]
const ATTACK_TYPE_KEYS = [
  ...([
    'Physically Attacked',
    'Magically Attacked',
    'Row is Attacked',
    'Column is Attacked',
    'All Allies are Attacked',
  ] as const),
  ...COMBATANT_TYPES.map(combatant => `Attacked by ${combatant}` as const),
]

const UNIT_SIZE_KEYS = [
  '2 or More Enemies',
  '3 or More Enemies',
  '4 or More Enemies',
  '5 or More Enemies',
  '1 or Fewer Enemies',
  '2 or Fewer Enemies',
  '3 or Fewer Enemies',
  '4 or Fewer Enemies',
  '2 or More Allies',
  '3 or More Allies',
  '4 or More Allies',
  '5 or More Allies',
  '1 or Fewer Allies',
  '2 or Fewer Allies',
  '3 or Fewer Allies',
  '4 or Fewer Allies',
] as const
const OWN_CONDITION_KEYS = [
  'User',
  'Other Combatants',
  'User is Buffed',
  'User is Debuffed',
  'First Action',
  'Second Action',
  'Third Action',
  'Fourth Action',
  'Fifth Action',
] as const

export const TACTIC_CATEGORY_MAP: Record<TacticCategoryKey, readonly string[]> =
  {
    'Formation & Situation': FORMATION_KEYS, // Uses the skill's targeting (ally, enemy, self)
    'Combatant Type': COMBATANT_TYPE_KEYS, // Uses skill targeting
    HP: HP_KEYS, // uses skill targeting
    'AP & PP': AP_PP_KEYS, // uses skill targeting
    'Combatant Status': COMBATANT_STATUS_KEYS, // uses skill targeting
    'Attack Type': ATTACK_TYPE_KEYS, // always enemy
    'Unit Size': UNIT_SIZE_KEYS, // overrides skill targeting
    'Own Condition': OWN_CONDITION_KEYS, // overrides skill targeting
    'Own HP': OWN_HP_KEYS, // always self
    'Own AP & PP': OWN_AP_PP_KEYS, // always self
    'Enemies Present': ENEMIES_PRESENT_KEYS, // Always enemy units
    'High Stats': HIGH_STAT_KEYS, // Uses skill targeting
    'Low Stats': LOW_STAT_KEYS, // Uses skill targeting
  }
