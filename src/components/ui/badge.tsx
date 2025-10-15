import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-success/10 text-success hover:bg-success/20 dark:bg-success/20 dark:text-success-foreground',
        warning:
          'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
        info: 'border-transparent bg-info/10 text-info hover:bg-info/20 dark:bg-info/20 dark:text-info-foreground',
        muted:
          'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
        physical:
          'border-transparent bg-physical/10 text-physical hover:bg-physical/20 dark:bg-physical/20 dark:text-physical-foreground',
        magical:
          'border-transparent bg-magical/10 text-magical hover:bg-magical/20 dark:bg-magical/20 dark:text-magical-foreground',
        'home-team':
          'bg-home/10 text-home border-home/20 dark:bg-home/20 dark:text-home-foreground dark:border-home/50',
        'away-team':
          'bg-away/10 text-away border-away/20 dark:bg-away/20 dark:text-away-foreground dark:border-away/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
