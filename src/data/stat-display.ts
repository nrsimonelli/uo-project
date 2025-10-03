import {
  Sword,
  Shield,
  Zap,
  Target,
  Eye,
  Shield as ShieldIcon,
  Star,
  Heart,
} from 'lucide-react'

import { STATS } from './constants'

export const STAT_ICONS = {
  [STATS.HP]: Heart,
  [STATS.PATK]: Sword,
  [STATS.PDEF]: Shield,
  [STATS.MATK]: Zap,
  [STATS.MDEF]: ShieldIcon,
  [STATS.ACC]: Target,
  [STATS.EVA]: Eye,
  [STATS.CRT]: Star,
  [STATS.GRD]: Shield,
  [STATS.INIT]: Zap,
} as const

export const RANK_COLORS: Record<string, string> = {
  S: 'text-blue-500',
  A: 'text-blue-500',
  B: 'text-muted-foreground',
  C: 'text-muted-foreground',
  D: 'text-muted-foreground',
  E: 'text-red-500',
  F: 'text-red-500',
}
