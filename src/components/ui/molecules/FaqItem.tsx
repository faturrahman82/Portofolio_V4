'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface FaqItemType {
  question: string
  answer: string
}

export function FaqItem({ item, index, isInView }: { item: FaqItemType; index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{
        duration: 0.45,
        delay: 0.1 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        'border-white/6 group overflow-hidden rounded-xl border bg-white/[0.02]',
        'transition-all duration-300 hover:border-cyan-500/15 hover:bg-white/[0.04]'
      )}
    >
      {/* Question */}
      <div className="flex items-start gap-3 p-5">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <span
            className="h-2 w-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 transition-transform duration-300 group-hover:scale-125"
            aria-hidden="true"
          />
        </div>
        <div className="space-y-2">
          <p className="font-syne text-sm font-bold text-slate-200 transition-colors duration-200 group-hover:text-white">
            {item.question}
          </p>
          <p className="text-[13px] leading-relaxed text-slate-500 transition-colors duration-200 group-hover:text-slate-400">
            {item.answer}
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="h-px w-0 bg-gradient-to-r from-cyan-500/40 to-violet-500/40 transition-all duration-500 group-hover:w-full"
        aria-hidden="true"
      />
    </motion.div>
  )
}
