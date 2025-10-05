export const GROWTHS = {
  HARDY: 'Hardy',
  OFFENSIVE: 'Offensive',
  DEFENSIVE: 'Defensive',
  PRECISE: 'Precise',
  LUCKY: 'Lucky',
  KEEN: 'Keen',
  GUARDIAN: 'Guardian',
  GOGETTER: 'Go-Getter',
  ALLROUNDER: 'All-Rounder',
} as const

export const STATS = {
  LV: 'Level',
  EXP: 'Exp.',
  HP: 'HP',
  PATK: 'Phys. ATK',
  PDEF: 'Phys. DEF',
  MATK: 'Mag. ATK',
  MDEF: 'Mag. DEF',
  ACC: 'Accuracy',
  EVA: 'Evasion',
  CRT: 'Crit. Rate',
  GRD: 'Guard Rate',
  INIT: 'Initiative',
  MOV: 'Movement Speed',
} as const

export const GROWTH_RANKS = {
  F: 0,
  E: 50,
  D: 70,
  C: 90,
  B: 110,
  A: 130,
  S: 150,
} as const

export const COMBATANT_TYPES = [
  'Infantry',
  'Cavalry',
  'Flying',
  'Armored',
  'Scout',
  'Archer',
  'Caster',
  'Elven',
  'Bestral',
  'Angel',
] as const
