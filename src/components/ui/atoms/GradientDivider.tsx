import { cn } from '@/lib/utils'

interface GradientDividerProps {
  className?: string
}

export function GradientDivider({ className }: GradientDividerProps) {
  return (
    <div
      className={cn(
        'via-white/8 h-px w-full bg-gradient-to-r from-transparent to-transparent',
        className
      )}
      aria-hidden="true"
    />
  )
}
