import { cn } from '@/lib/utils'

interface SectionLabelProps {
  text: string
  className?: string
}

export function SectionLabel({ text, className }: SectionLabelProps) {
  return (
    <div className={cn('mb-4 inline-flex items-center gap-2', className)}>
      <span className="font-jetbrains text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
        <span className="opacity-50">// </span>
        {text}
      </span>
    </div>
  )
}
