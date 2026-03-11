'use client'

import { motion } from 'framer-motion'
import { FiClock } from 'react-icons/fi'
import { cn } from '@/lib/utils'

export function AvailabilityBanner({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-emerald-500/20',
        'from-emerald-500/8 to-cyan-500/6 bg-gradient-to-br via-transparent p-6'
      )}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Pulsing dot */}
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>

          <div>
            <p className="font-syne text-sm font-bold text-emerald-300">Currently Available</p>
            <p className="font-jetbrains text-[11px] text-emerald-500/70">
              Open to freelance & full-time opportunities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-jetbrains text-[11px] text-slate-500">
          <FiClock className="h-3 w-3 text-slate-600" aria-hidden="true" />
          <span>UTC+7 (Jakarta)</span>
        </div>
      </div>
    </motion.div>
  )
}
