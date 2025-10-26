import {
  TACTIC_CATEGORY_MAP,
  type TacticCategoryKey,
} from '@/data/tactics/tactic-conditions'
import type { CombatantType } from '@/types/core'

export type ConditionType = 'filter' | 'sort'

export type ComparisonOperator = 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq'

export type ValueType =
  | 'hp-raw'
  | 'hp-percent'
  | 'hp-average'
  | 'ap'
  | 'pp'
  | 'own-hp-percent'
  | 'own-ap'
  | 'own-pp'
  | 'combatant-type'
  | 'status'
  | 'enemy-presence'
  | 'formation'
  | 'attack-history'
  | 'unit-count'
  | 'user-condition'
  | 'action-number'
  | 'stat-high'
  | 'stat-low'

export interface ConditionMetadata {
  type: ConditionType
  valueType: ValueType
  operator?: ComparisonOperator
  threshold?: number
  combatantType?: CombatantType
  statusName?: string
  formationType?:
    | 'front-row'
    | 'back-row'
    | 'full-column'
    | 'daytime'
    | 'nighttime'
    | 'most-combatants'
    | 'least-combatants'
    | 'min-combatants'
  minCombatants?: number
  attackType?:
    | 'physical'
    | 'magical'
    | 'row'
    | 'column'
    | 'all-allies'
    | 'by-type'
  unitTarget?: 'allies' | 'enemies'
  userCondition?: 'self' | 'others' | 'buffed' | 'debuffed'
  actionNumber?: number
  statName?: string
  negated?: boolean
  // Runtime property added by tactical targeting system
  conditionKey?: string
}

export type TacticConditionKey =
  (typeof TACTIC_CATEGORY_MAP)[TacticCategoryKey][number]
export const COMPLETE_TACTIC_METADATA: Record<
  TacticConditionKey,
  ConditionMetadata
> = {
  // === HP CONDITIONS ===
  'Highest HP': { type: 'sort', valueType: 'hp-raw' },
  'Lowest HP': { type: 'sort', valueType: 'hp-raw' },
  'Highest % HP': { type: 'sort', valueType: 'hp-percent' },
  'Lowest % HP': { type: 'sort', valueType: 'hp-percent' },
  'Target HP is >25%': {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'gt',
    threshold: 25,
  },
  'Target HP is >50%': {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'gt',
    threshold: 50,
  },
  'Target HP is >75%': {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'gt',
    threshold: 75,
  },
  'Target HP is >100%': {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'gt',
    threshold: 100,
  },
  'Target HP is <25%': {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'lt',
    threshold: 25,
  },
  'Target HP is <50%': {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'lt',
    threshold: 50,
  },
  'Target HP is <75%': {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'lt',
    threshold: 75,
  },
  'Target HP is <100%': {
    type: 'filter',
    valueType: 'hp-percent',
    operator: 'lt',
    threshold: 100,
  },
  'Average HP is >25%': {
    type: 'filter',
    valueType: 'hp-average',
    operator: 'gt',
    threshold: 25,
  },
  'Average HP is >50%': {
    type: 'filter',
    valueType: 'hp-average',
    operator: 'gt',
    threshold: 50,
  },
  'Average HP is >75%': {
    type: 'filter',
    valueType: 'hp-average',
    operator: 'gt',
    threshold: 75,
  },
  'Average HP is >100%': {
    type: 'filter',
    valueType: 'hp-average',
    operator: 'gt',
    threshold: 100,
  },
  'Average HP is <25%': {
    type: 'filter',
    valueType: 'hp-average',
    operator: 'lt',
    threshold: 25,
  },
  'Average HP is <50%': {
    type: 'filter',
    valueType: 'hp-average',
    operator: 'lt',
    threshold: 50,
  },
  'Average HP is <75%': {
    type: 'filter',
    valueType: 'hp-average',
    operator: 'lt',
    threshold: 75,
  },
  'Average HP is <100%': {
    type: 'filter',
    valueType: 'hp-average',
    operator: 'lt',
    threshold: 100,
  },

  // === OWN HP CONDITIONS ===
  'Own HP is <25%': {
    type: 'filter',
    valueType: 'own-hp-percent',
    operator: 'lt',
    threshold: 25,
  },
  'Own HP is <50%': {
    type: 'filter',
    valueType: 'own-hp-percent',
    operator: 'lt',
    threshold: 50,
  },
  'Own HP is <75%': {
    type: 'filter',
    valueType: 'own-hp-percent',
    operator: 'lt',
    threshold: 75,
  },
  'Own HP is <100%': {
    type: 'filter',
    valueType: 'own-hp-percent',
    operator: 'lt',
    threshold: 100,
  },
  'Own HP is >25%': {
    type: 'filter',
    valueType: 'own-hp-percent',
    operator: 'gt',
    threshold: 25,
  },
  'Own HP is >50%': {
    type: 'filter',
    valueType: 'own-hp-percent',
    operator: 'gt',
    threshold: 50,
  },
  'Own HP is >75%': {
    type: 'filter',
    valueType: 'own-hp-percent',
    operator: 'gt',
    threshold: 75,
  },
  'Own HP is >100%': {
    type: 'filter',
    valueType: 'own-hp-percent',
    operator: 'gt',
    threshold: 100,
  },

  // === AP/PP CONDITIONS ===
  'Most AP': { type: 'sort', valueType: 'ap' },
  'Least AP': { type: 'sort', valueType: 'ap' },
  '0 AP': { type: 'filter', valueType: 'ap', operator: 'eq', threshold: 0 },
  '1 or Less AP': {
    type: 'filter',
    valueType: 'ap',
    operator: 'lte',
    threshold: 1,
  },
  '2 or Less AP': {
    type: 'filter',
    valueType: 'ap',
    operator: 'lte',
    threshold: 2,
  },
  '3 or Less AP': {
    type: 'filter',
    valueType: 'ap',
    operator: 'lte',
    threshold: 3,
  },
  '1 or More AP': {
    type: 'filter',
    valueType: 'ap',
    operator: 'gte',
    threshold: 1,
  },
  '2 or More AP': {
    type: 'filter',
    valueType: 'ap',
    operator: 'gte',
    threshold: 2,
  },
  '3 or More AP': {
    type: 'filter',
    valueType: 'ap',
    operator: 'gte',
    threshold: 3,
  },
  '4 or More AP': {
    type: 'filter',
    valueType: 'ap',
    operator: 'gte',
    threshold: 4,
  },
  'Most PP': { type: 'sort', valueType: 'pp' },
  'Least PP': { type: 'sort', valueType: 'pp' },
  '0 PP': { type: 'filter', valueType: 'pp', operator: 'eq', threshold: 0 },
  '1 or Less PP': {
    type: 'filter',
    valueType: 'pp',
    operator: 'lte',
    threshold: 1,
  },
  '2 or Less PP': {
    type: 'filter',
    valueType: 'pp',
    operator: 'lte',
    threshold: 2,
  },
  '3 or Less PP': {
    type: 'filter',
    valueType: 'pp',
    operator: 'lte',
    threshold: 3,
  },
  '1 or More PP': {
    type: 'filter',
    valueType: 'pp',
    operator: 'gte',
    threshold: 1,
  },
  '2 or More PP': {
    type: 'filter',
    valueType: 'pp',
    operator: 'gte',
    threshold: 2,
  },
  '3 or More PP': {
    type: 'filter',
    valueType: 'pp',
    operator: 'gte',
    threshold: 3,
  },
  '4 or More PP': {
    type: 'filter',
    valueType: 'pp',
    operator: 'gte',
    threshold: 4,
  },

  // === OWN AP/PP CONDITIONS ===
  'Own AP is 0': {
    type: 'filter',
    valueType: 'own-ap',
    operator: 'eq',
    threshold: 0,
  },
  'Own AP is 1 or Less': {
    type: 'filter',
    valueType: 'own-ap',
    operator: 'lte',
    threshold: 1,
  },
  'Own AP is 2 or Less': {
    type: 'filter',
    valueType: 'own-ap',
    operator: 'lte',
    threshold: 2,
  },
  'Own AP is 3 or Less': {
    type: 'filter',
    valueType: 'own-ap',
    operator: 'lte',
    threshold: 3,
  },
  'Own AP is 1 or More': {
    type: 'filter',
    valueType: 'own-ap',
    operator: 'gte',
    threshold: 1,
  },
  'Own AP is 2 or More': {
    type: 'filter',
    valueType: 'own-ap',
    operator: 'gte',
    threshold: 2,
  },
  'Own AP is 3 or More': {
    type: 'filter',
    valueType: 'own-ap',
    operator: 'gte',
    threshold: 3,
  },
  'Own AP is 4 or More': {
    type: 'filter',
    valueType: 'own-ap',
    operator: 'gte',
    threshold: 4,
  },
  'Own PP is 0': {
    type: 'filter',
    valueType: 'own-pp',
    operator: 'eq',
    threshold: 0,
  },
  'Own PP is 1 or Less': {
    type: 'filter',
    valueType: 'own-pp',
    operator: 'lte',
    threshold: 1,
  },
  'Own PP is 2 or Less': {
    type: 'filter',
    valueType: 'own-pp',
    operator: 'lte',
    threshold: 2,
  },
  'Own PP is 3 or Less': {
    type: 'filter',
    valueType: 'own-pp',
    operator: 'lte',
    threshold: 3,
  },
  'Own PP is 1 or More': {
    type: 'filter',
    valueType: 'own-pp',
    operator: 'gte',
    threshold: 1,
  },
  'Own PP is 2 or More': {
    type: 'filter',
    valueType: 'own-pp',
    operator: 'gte',
    threshold: 2,
  },
  'Own PP is 3 or More': {
    type: 'filter',
    valueType: 'own-pp',
    operator: 'gte',
    threshold: 3,
  },
  'Own PP is 4 or More': {
    type: 'filter',
    valueType: 'own-pp',
    operator: 'gte',
    threshold: 4,
  },

  // === COMBATANT TYPE CONDITIONS ===
  'Prioritize Infantry': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Infantry',
  },
  'Prioritize Cavalry': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Cavalry',
  },
  'Prioritize Flying': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Flying',
  },
  'Prioritize Armored': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Armored',
  },
  'Prioritize Scout': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Scout',
  },
  'Prioritize Archer': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Archer',
  },
  'Prioritize Caster': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Caster',
  },
  'Prioritize Elven': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Elven',
  },
  'Prioritize Bestral': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Bestral',
  },
  'Prioritize Angel': {
    type: 'sort',
    valueType: 'combatant-type',
    combatantType: 'Angel',
  },
  Infantry: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Infantry',
  },
  Cavalry: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Cavalry',
  },
  Flying: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Flying',
  },
  Armored: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Armored',
  },
  Scout: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Scout',
  },
  Archer: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Archer',
  },
  Caster: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Caster',
  },
  Elven: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Elven',
  },
  Bestral: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Bestral',
  },
  Angel: {
    type: 'filter',
    valueType: 'combatant-type',
    combatantType: 'Angel',
  },

  // === STATUS CONDITIONS ===
  'Prioritize Buffed': {
    type: 'sort',
    valueType: 'status',
    statusName: 'Buff',
  },
  'Prioritize Debuffed': {
    type: 'sort',
    valueType: 'status',
    statusName: 'Debuff',
  },
  Buffed: { type: 'filter', valueType: 'status', statusName: 'Buff' },
  Debuffed: { type: 'filter', valueType: 'status', statusName: 'Debuff' },
  Afflicted: { type: 'filter', valueType: 'status', statusName: 'Afflicted' },
  Poisoned: { type: 'filter', valueType: 'status', statusName: 'Poisoned' },
  Burning: { type: 'filter', valueType: 'status', statusName: 'Burning' },
  Frozen: { type: 'filter', valueType: 'status', statusName: 'Frozen' },
  Stunned: { type: 'filter', valueType: 'status', statusName: 'Stunned' },
  Blinded: { type: 'filter', valueType: 'status', statusName: 'Blinded' },
  'Passive Sealed': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Passive Sealed',
  },
  'Guard Sealed': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Guard Sealed',
  },
  'Not Buffed': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Buff',
    negated: true,
  },
  'Not Debuffed': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Debuff',
    negated: true,
  },
  'Not Afflicted': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Afflicted',
    negated: true,
  },
  'Not Poisoned': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Poisoned',
    negated: true,
  },
  'Not Burning': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Burning',
    negated: true,
  },
  'Not Frozen': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Frozen',
    negated: true,
  },
  'Not Stunned': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Stunned',
    negated: true,
  },
  'Not Blinded': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Blinded',
    negated: true,
  },
  'Not Passive Sealed': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Passive Sealed',
    negated: true,
  },
  'Not Guard Sealed': {
    type: 'filter',
    valueType: 'status',
    statusName: 'Guard Sealed',
    negated: true,
  },

  // === ENEMY PRESENCE CONDITIONS ===
  'No Infantry Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Infantry',
    negated: true,
  },
  'No Cavalry Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Cavalry',
    negated: true,
  },
  'No Flying Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Flying',
    negated: true,
  },
  'No Armored Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Armored',
    negated: true,
  },
  'No Scout Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Scout',
    negated: true,
  },
  'No Archer Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Archer',
    negated: true,
  },
  'No Caster Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Caster',
    negated: true,
  },
  'No Elven Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Elven',
    negated: true,
  },
  'No Bestral Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Bestral',
    negated: true,
  },
  'No Angel Enemies': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Angel',
    negated: true,
  },
  'Infantry Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Infantry',
  },
  'Cavalry Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Cavalry',
  },
  'Flying Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Flying',
  },
  'Armored Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Armored',
  },
  'Scout Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Scout',
  },
  'Archer Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Archer',
  },
  'Caster Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Caster',
  },
  'Elven Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Elven',
  },
  'Bestral Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Bestral',
  },
  'Angel Enemies Present': {
    type: 'filter',
    valueType: 'enemy-presence',
    combatantType: 'Angel',
  },

  // === FORMATION CONDITIONS ===
  'Prioritize Front Row': {
    type: 'sort',
    valueType: 'formation',
    formationType: 'front-row',
  },
  'Prioritize Back Row': {
    type: 'sort',
    valueType: 'formation',
    formationType: 'back-row',
  },
  'Front Row': {
    type: 'filter',
    valueType: 'formation',
    formationType: 'front-row',
  },
  'Back Row': {
    type: 'filter',
    valueType: 'formation',
    formationType: 'back-row',
  },
  'Full Column': {
    type: 'filter',
    valueType: 'formation',
    formationType: 'full-column',
  },
  'Row with Most Combatants': {
    type: 'sort',
    valueType: 'formation',
    formationType: 'most-combatants',
  },
  'Row with Least Combatants': {
    type: 'sort',
    valueType: 'formation',
    formationType: 'least-combatants',
  },
  'Row with 2+ Combatants': {
    type: 'filter',
    valueType: 'formation',
    formationType: 'min-combatants',
    minCombatants: 2,
  },
  'Row with 3+ Combatants': {
    type: 'filter',
    valueType: 'formation',
    formationType: 'min-combatants',
    minCombatants: 3,
  },
  Daytime: { type: 'filter', valueType: 'formation', formationType: 'daytime' },
  Nighttime: {
    type: 'filter',
    valueType: 'formation',
    formationType: 'nighttime',
  },

  // === ATTACK TYPE CONDITIONS ===
  'Physically Attacked': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'physical',
  },
  'Magically Attacked': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'magical',
  },
  'Row is Attacked': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'row',
  },
  'Column is Attacked': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'column',
  },
  'All Allies are Attacked': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'all-allies',
  },
  'Attacked by Infantry': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Infantry',
  },
  'Attacked by Cavalry': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Cavalry',
  },
  'Attacked by Flying': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Flying',
  },
  'Attacked by Armored': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Armored',
  },
  'Attacked by Scout': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Scout',
  },
  'Attacked by Archer': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Archer',
  },
  'Attacked by Caster': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Caster',
  },
  'Attacked by Elven': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Elven',
  },
  'Attacked by Bestral': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Bestral',
  },
  'Attacked by Angel': {
    type: 'filter',
    valueType: 'attack-history',
    attackType: 'by-type',
    combatantType: 'Angel',
  },

  // === UNIT SIZE CONDITIONS ===
  '2 or More Enemies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'gte',
    threshold: 2,
    unitTarget: 'enemies',
  },
  '3 or More Enemies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'gte',
    threshold: 3,
    unitTarget: 'enemies',
  },
  '4 or More Enemies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'gte',
    threshold: 4,
    unitTarget: 'enemies',
  },
  '5 or More Enemies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'gte',
    threshold: 5,
    unitTarget: 'enemies',
  },
  '1 or Fewer Enemies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'lte',
    threshold: 1,
    unitTarget: 'enemies',
  },
  '2 or Fewer Enemies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'lte',
    threshold: 2,
    unitTarget: 'enemies',
  },
  '3 or Fewer Enemies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'lte',
    threshold: 3,
    unitTarget: 'enemies',
  },
  '4 or Fewer Enemies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'lte',
    threshold: 4,
    unitTarget: 'enemies',
  },
  '2 or More Allies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'gte',
    threshold: 2,
    unitTarget: 'allies',
  },
  '3 or More Allies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'gte',
    threshold: 3,
    unitTarget: 'allies',
  },
  '4 or More Allies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'gte',
    threshold: 4,
    unitTarget: 'allies',
  },
  '5 or More Allies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'gte',
    threshold: 5,
    unitTarget: 'allies',
  },
  '1 or Fewer Allies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'lte',
    threshold: 1,
    unitTarget: 'allies',
  },
  '2 or Fewer Allies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'lte',
    threshold: 2,
    unitTarget: 'allies',
  },
  '3 or Fewer Allies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'lte',
    threshold: 3,
    unitTarget: 'allies',
  },
  '4 or Fewer Allies': {
    type: 'filter',
    valueType: 'unit-count',
    operator: 'lte',
    threshold: 4,
    unitTarget: 'allies',
  },

  // === OWN CONDITION ===
  User: { type: 'filter', valueType: 'user-condition', userCondition: 'self' },
  'Other Combatants': {
    type: 'filter',
    valueType: 'user-condition',
    userCondition: 'others',
  },
  'User is Buffed': {
    type: 'filter',
    valueType: 'user-condition',
    userCondition: 'buffed',
  },
  'User is Debuffed': {
    type: 'filter',
    valueType: 'user-condition',
    userCondition: 'debuffed',
  },
  'First Action': {
    type: 'filter',
    valueType: 'action-number',
    actionNumber: 1,
  },
  'Second Action': {
    type: 'filter',
    valueType: 'action-number',
    actionNumber: 2,
  },
  'Third Action': {
    type: 'filter',
    valueType: 'action-number',
    actionNumber: 3,
  },
  'Fourth Action': {
    type: 'filter',
    valueType: 'action-number',
    actionNumber: 4,
  },
  'Fifth Action': {
    type: 'filter',
    valueType: 'action-number',
    actionNumber: 5,
  },

  // === HIGH STATS ===
  'Highest Max AP': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'Max AP',
  },
  'Highest Max PP': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'Max PP',
  },
  'Highest Max HP': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'Max HP',
  },
  'Highest Phys. ATK': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'PATK',
  },
  'Highest Phys. DEF': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'PDEF',
  },
  'Highest Mag. ATK': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'MATK',
  },
  'Highest Mag. DEF': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'MDEF',
  },
  'Highest Accuracy': { type: 'sort', valueType: 'stat-high', statName: 'ACC' },
  'Highest Evasion': { type: 'sort', valueType: 'stat-high', statName: 'EVA' },
  'Highest Crit. Rate': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'CRT',
  },
  'Highest Guard Rate': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'GRD',
  },
  'Highest Initiative': {
    type: 'sort',
    valueType: 'stat-high',
    statName: 'INIT',
  },

  // === LOW STATS ===
  'Lowest Max AP': { type: 'sort', valueType: 'stat-low', statName: 'Max AP' },
  'Lowest Max PP': { type: 'sort', valueType: 'stat-low', statName: 'Max PP' },
  'Lowest Max HP': { type: 'sort', valueType: 'stat-low', statName: 'Max HP' },
  'Lowest Phys. ATK': { type: 'sort', valueType: 'stat-low', statName: 'PATK' },
  'Lowest Phys. DEF': { type: 'sort', valueType: 'stat-low', statName: 'PDEF' },
  'Lowest Mag. ATK': { type: 'sort', valueType: 'stat-low', statName: 'MATK' },
  'Lowest Mag. DEF': { type: 'sort', valueType: 'stat-low', statName: 'MDEF' },
  'Lowest Accuracy': { type: 'sort', valueType: 'stat-low', statName: 'ACC' },
  'Lowest Evasion': { type: 'sort', valueType: 'stat-low', statName: 'EVA' },
  'Lowest Crit. Rate': { type: 'sort', valueType: 'stat-low', statName: 'CRT' },
  'Lowest Guard Rate': { type: 'sort', valueType: 'stat-low', statName: 'GRD' },
  'Lowest Initiative': {
    type: 'sort',
    valueType: 'stat-low',
    statName: 'INIT',
  },
}
