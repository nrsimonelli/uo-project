import {
  Sword,
  Zap,
  Target,
  Eye,
  Shield,
  ShieldBan,
  Heart,
  Sparkles,
  Wind,
} from 'lucide-react'

export const STAT_ICONS = {
  HP: Heart,
  PATK: Sword,
  PDEF: Shield,
  MATK: Sparkles,
  MDEF: ShieldBan,
  ACC: Target,
  EVA: Eye,
  CRT: Zap,
  GRD: Shield,
  INIT: Wind,
} as const

export const RANK_COLORS: Record<string, string> = {
  S: 'text-success',
  A: 'text-info',
  B: 'text-muted-foreground',
  C: 'text-muted-foreground',
  D: 'text-muted-foreground',
  E: 'text-warning',
  F: 'text-destructive',
}
