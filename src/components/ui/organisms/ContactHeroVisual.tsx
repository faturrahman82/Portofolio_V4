'use client'

import { motion } from 'framer-motion'
import {
  FiMail,
  FiGithub,
  FiLinkedin,
  FiInstagram,
  FiMessageSquare,
} from 'react-icons/fi'
import { cn } from '@/lib/utils'

export function ContactHeroVisual({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto hidden w-full max-w-xs lg:block"
      aria-hidden="true"
    >
      {/* Central message icon */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute h-56 w-56 rounded-full border border-dashed border-cyan-500/15"
        />

        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute h-40 w-40 rounded-full border border-violet-500/15"
        />

        {/* Core */}
        <div
          className={cn(
            'relative flex h-28 w-28 flex-col items-center justify-center rounded-3xl',
            'from-white/8 border border-white/10 bg-gradient-to-br to-white/[0.03]',
            'shadow-xl shadow-black/30 backdrop-blur-sm'
          )}
        >
          <FiMessageSquare className="h-10 w-10 text-cyan-400" />
          <span className="mt-1.5 font-jetbrains text-[10px] uppercase tracking-wider text-cyan-400/60">
            Let's Talk
          </span>
        </div>

        {/* Orbit dots */}
        {[
          { label: 'Gmail', icon: FiMail, color: '#ea4335', angle: 0 },
          { label: 'GitHub', icon: FiGithub, color: '#ffffff', angle: 90 },
          { label: 'LinkedIn', icon: FiLinkedin, color: '#0a66c2', angle: 180 },
          { label: 'Instagram', icon: FiInstagram, color: '#e1306c', angle: 270 },
        ].map((item, i) => {
          const rad = (item.angle * Math.PI) / 180
          const r = 112
          const x = Math.cos(rad) * r
          const y = Math.sin(rad) * r

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                delay: 0.4 + i * 0.1,
                duration: 0.4,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className={cn(
                'absolute flex h-10 w-10 items-center justify-center rounded-xl',
                'border border-white/10 bg-[#0d1117]/90 shadow-md backdrop-blur-sm'
              )}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              aria-label={item.label}
            >
              <item.icon className="h-4 w-4" style={{ color: item.color }} />
            </motion.div>
          )
        })}

        {/* Glow blobs */}
        <div className="bg-cyan-500/8 pointer-events-none absolute h-56 w-56 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute h-32 w-32 rounded-full bg-violet-600/10 blur-2xl" />
      </div>
    </motion.div>
  )
}
