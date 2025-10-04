import { COMBATANT_TYPES, STATS } from './constants'

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
type TacticCategoryKey =
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
const ENEMIES_PRESENT_KEYS = COMBATANT_TYPES.flatMap(
  combatant =>
    [`No ${combatant} Enemies`, `${combatant} Enemies Present`] as const
)

const HP_THRESHOLDS = ['25%', '50%', '75%', '100%'] as const
const HP_KEYS = [
  ...(['Highest HP', 'Lowest HP', 'Highest % HP', 'Lowest % HP'] as const),
  ...HP_THRESHOLDS.flatMap(
    val =>
      [
        `Target HP is >${val}`,
        `Target HP is <${val}`,
        `Average HP is >${val}`,
        `Average HP is <${val}`,
      ] as const
  ),
]
const OWN_HP_KEYS = HP_THRESHOLDS.flatMap(
  val => [`Own HP is <${val}`, `Own HP is >${val}`] as const
)

const AP_PP_THRESHOLDS = [
  '0',
  '1 or Less',
  '2 or Less',
  '3 or Less',
  '1 or More',
  '2 or More',
  '3 or More',
  '4 or More',
] as const
const AP_PP_KEYS = (['Most', 'Least', ...AP_PP_THRESHOLDS] as const).flatMap(
  val => [`${val} AP`, `${val} PP`] as const
)
const OWN_AP_PP_KEYS = AP_PP_THRESHOLDS.flatMap(
  val => [`Own AP is ${val}`, `Own PP is ${val}`] as const
)
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
  ...STATUS_OPTIONS.flatMap(val => [`${val}`, `Not ${val}`] as const),
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

const UNIT_SIZE_OPTIONS = [
  '2 or More',
  '3 or More',
  '4 or More',
  '5 or More',
  '1 or Fewer',
  '2 or Fewer',
  '3 or Fewer',
  '4 or Fewer',
] as const
const UNIT_SIZE_KEYS = [
  ...UNIT_SIZE_OPTIONS.flatMap(
    opt => [`${opt} Enemies`, `${opt} Allies`] as const
  ),
]
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
