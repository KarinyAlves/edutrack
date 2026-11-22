import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { MetricValue } from '../MetricValue'

export type MetricTone = 'lilac' | 'peach' | 'mint' | 'sky' | 'rose'

const TONE_CLASS: Record<MetricTone, string> = {
  lilac: 'bg-[var(--pastel-lavender)] text-[#513788] dark:text-[#D5C2FF]',
  peach: 'bg-[var(--pastel-peach)] text-[#8A4A1C] dark:text-[#FFD0AD]',
  mint: 'bg-[var(--pastel-green)] text-[#2D6217] dark:text-[#C8F09B]',
  sky: 'bg-[var(--pastel-sky)] text-[#1D5B87] dark:text-[#B4E0FC]',
  rose: 'bg-[var(--pastel-pink)] text-[#922F56] dark:text-[#FBB8D0]',
}

export function MetricCard({
  label,
  value,
  suffix,
  detail,
  icon: Icon,
  tone,
  to,
  alert = false,
  loading = false,
  className = '',
}: {
  label: string
  value: number
  suffix?: string
  detail: ReactNode
  icon: LucideIcon
  tone: MetricTone
  to?: string
  alert?: boolean
  loading?: boolean
  className?: string
}) {
  if (loading) {
    return (
      <div
        className={`dashboard-card flex min-h-[118px] flex-col justify-between p-[14px] ${className}`}
        aria-hidden="true"
      >
        <div className="skeleton-shimmer size-[30px] rounded-[10px] bg-line" />
        <div className="skeleton-shimmer mt-2 h-2.5 w-20 rounded-full bg-line" />
        <div className="skeleton-shimmer mt-1.5 h-6 w-12 rounded-full bg-line" />
        <div className="skeleton-shimmer mt-1 h-2.5 w-24 rounded-full bg-line" />
      </div>
    )
  }

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`grid size-[30px] shrink-0 place-items-center rounded-[10px] ${TONE_CLASS[tone]}`}
        >
          <Icon size={15} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2">
        <p className="text-[10px] leading-[1.2] font-semibold tracking-[0.03em] text-[var(--text-secondary)] uppercase">
          {label}
        </p>
        <p
          className={`mt-1 text-[25px] leading-[1.1] font-bold tracking-tight ${
            alert ? 'text-[#E14658] dark:text-rose-400' : 'text-[var(--text-primary)]'
          }`}
        >
          <MetricValue value={value} suffix={suffix} />
        </p>
        <p className="mt-1 truncate text-[11px] leading-4 font-normal text-[var(--text-secondary)]">
          {detail}
        </p>
      </div>
    </>
  )

  const shellClass = `dashboard-card group flex min-h-[118px] flex-col justify-between p-[14px] ${className}`

  if (to) {
    return (
      <Link
        to={to}
        className={`${shellClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]`}
      >
        {body}
      </Link>
    )
  }

  return <article className={shellClass}>{body}</article>
}
