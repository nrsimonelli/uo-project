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
          'border-transparent bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200',
        info:
          'border-transparent bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200',
        muted:
          'border-transparent bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
        physical:
          'border-transparent bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200',
        magical:
          'border-transparent bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200',
        'home-team':
          'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700/50',
        'away-team':
          'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/50',
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
