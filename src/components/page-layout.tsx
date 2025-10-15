import { TopNav } from '@/components/top-nav'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  maxWidth?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

export function PageLayout({ children, maxWidth = '6xl' }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pt-36 pb-10">
        <div
          className={cn(
            'mx-auto px-4 sm:px-6 lg:px-8',
            maxWidthClasses[maxWidth]
          )}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
