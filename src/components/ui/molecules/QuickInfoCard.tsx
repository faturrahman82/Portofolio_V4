'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import React from 'react'

export interface QuickInfoItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
  color: string
}

export function QuickInfoCard({
  item,
  index,
  isInView,
}: {
  item: QuickInfoItem
  index: number
  isInView: boolean
}) {
  const Wrapper = item.href ? 'a' : 'div'
  const linkProps = item.href
    ? {
        href: item.href,
        target: item.href.startsWith('mailto') ? undefined : '_blank',
        rel: item.href.startsWith('mailto') ? undefined : 'noopener noreferrer',
      }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
      transition={{
        duration: 0.45,
        delay: 0.1 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* @ts-ignore - dynamic wrapper polymorphic ref error */}
      <Wrapper
        {...linkProps}
        className={cn(
          'border-white/8 group flex items-center gap-3.5 rounded-xl border bg-white/[0.03] p-4',
          'transition-all duration-300',
          item.href &&
            'hover:border-white/14 cursor-pointer hover:-translate-y-0.5 hover:bg-white/[0.06] hover:shadow-md hover:shadow-black/20'
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            'border-white/8 border bg-white/5 transition-colors duration-300',
            item.color
          )}
        >
          <item.icon className="h-4 w-4" />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            {item.label}
          </p>
          <p className="truncate font-syne text-sm font-semibold text-slate-300 transition-colors duration-200 group-hover:text-white">
            {item.value}
          </p>
        </div>

        {/* Arrow on link items */}
        {item.href && (
          <span className="shrink-0 text-slate-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400">
            →
          </span>
        )}
      </Wrapper>
    </motion.div>
  )
}
