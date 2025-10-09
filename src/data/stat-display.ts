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

export const STAT_ICONS = {
  HP: Heart,
  PATK: Sword,
  PDEF: Shield,
  MATK: Zap,
  MDEF: ShieldIcon,
  ACC: Target,
  EVA: Eye,
  CRT: Star,
  GRD: Shield,
  INIT: Zap,
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
