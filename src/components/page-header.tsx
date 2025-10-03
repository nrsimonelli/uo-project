import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('pb-5 sm:pb-0', className)}>
      <div className='md:flex md:items-center md:justify-between'>
        <div className='min-w-0 flex-1'>
          <h1 className='text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight'>
            {title}
          </h1>
          {description && (
            <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
          )}
        </div>
        {children && (
          <div className='mt-4 flex md:ml-4 md:mt-0'>{children}</div>
        )}
      </div>
    </div>
  )
}
