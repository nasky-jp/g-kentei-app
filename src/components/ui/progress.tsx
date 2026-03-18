import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-4 w-full overflow-hidden rounded-full', className)}
      style={{ backgroundColor: 'hsl(240 4.8% 95.9%)' }}
      {...props}
    >
      <div
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - (value ?? 0)}%)`,
          backgroundColor: 'hsl(262 83% 58%)',
        }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
