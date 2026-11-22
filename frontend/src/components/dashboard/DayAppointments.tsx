import { BookOpen, CalendarClock, ChevronRight, GraduationCap } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import type { CalendarItem } from '../../api/types'
import {
  formatTimeRange,
  getCategoryMeta,
  itemToDateKey,
  parseDateKey,
} from '../../utils/calendar'

const TONE_PALETTE = [
  'bg-[var(--pastel-peach)] text-[#8A4A1C] dark:text-[#FFD0AD]',
  'bg-[var(--pastel-lavender)] text-[#513788] dark:text-[#D5C2FF]',
  'bg-[var(--pastel-green)] text-[#2D6217] dark:text-[#C8F09B]',
  'bg-[var(--pastel-pink)] text-[#922F56] dark:text-[#FBB8D0]',
]

export function DayAppointments({
  items,
  selectedDateKey,
  loading = false,
  error = false,
  onRetry,
  className = '',
}: {
  items: CalendarItem[]
  selectedDateKey: string
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  className?: string
}) {
  const appointments = useMemo(() => {
    return items
      .filter((item) => {
        if (item.cancelled) return false
        // Distinção obrigatória: apenas entradas agendadas do calendário (aulas, eventos, leituras), não tarefas
        if (item.source_type === 'task') return false
        return itemToDateKey(item) === selectedDateKey
      })
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  }, [items, selectedDateKey])

  const dateLabel = useMemo(() => {
    const parsed = parseDateKey(selectedDateKey)
    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }, [selectedDateKey])

  return (
    <section
      className={`dashboard-card flex h-[288px] flex-col justify-between p-[17px] ${className}`}
      aria-labelledby="day-appointments"
    >
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2
            id="day-appointments"
            className="truncate text-[17px] leading-[1.2] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Compromissos do dia
          </h2>
          <p className="mt-0.5 text-[11px] font-normal text-[var(--text-secondary)]">
            Agenda para {dateLabel}
          </p>
        </div>
        <Link
          to="/calendario"
          className="shrink-0 rounded-full border border-[var(--card-border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[10.5px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent-lime)] hover:text-[var(--text-primary)]"
        >
          Ver agenda
        </Link>
      </header>

      <div className="mt-3 flex flex-1 flex-col justify-center">
        {loading ? (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="skeleton-shimmer size-9 shrink-0 rounded-xl bg-line" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton-shimmer h-3 w-3/4 rounded-full bg-line" />
                  <div className="skeleton-shimmer h-2.5 w-1/2 rounded-full bg-line" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-[var(--card-border)] p-4 text-center">
            <p className="text-[12px] font-medium text-[var(--text-secondary)]">
              Não foi possível carregar os compromissos.
            </p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1.5 text-[11px] font-semibold text-[var(--text-primary)] underline decoration-[var(--accent-lime)] decoration-2 underline-offset-2"
              >
                Tentar novamente
              </button>
            ) : null}
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--card-border)] px-4 py-6 text-center">
            <p className="text-[13px] font-medium text-[var(--text-primary)]">
              Nenhum compromisso agendado
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              Dia livre de aulas ou eventos no calendário.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {appointments.slice(0, 3).map((item, idx) => {
              const meta = getCategoryMeta(item)
              const timeStr = formatTimeRange(item)
              const Icon =
                item.source_type === 'class'
                  ? GraduationCap
                  : item.source_type === 'reading'
                    ? BookOpen
                    : CalendarClock
              const toneClass = TONE_PALETTE[idx % TONE_PALETTE.length]
              const secondaryParts = [
                item.subject_name || meta.shortLabel,
                timeStr,
                item.room ? item.room : null,
              ].filter(Boolean)

              return (
                <li key={item.id}>
                  <Link
                    to={meta.originLink || '/calendario'}
                    className="group flex items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
                  >
                    <span
                      className={`grid size-[36px] shrink-0 place-items-center rounded-[11px] ${toneClass}`}
                      aria-hidden="true"
                    >
                      <Icon size={16} strokeWidth={1.9} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        title={item.title}
                        className="truncate text-[14px] leading-[1.25] font-semibold text-[var(--text-primary)]"
                      >
                        {item.title}
                      </p>
                      <p
                        title={secondaryParts.join(' · ')}
                        className="mt-0.5 truncate text-[11.5px] font-normal text-[var(--text-secondary)]"
                      >
                        {secondaryParts.join(' · ')}
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {!loading && appointments.length > 3 ? (
        <div className="mt-2 border-t border-[var(--divider)] pt-2 text-right">
          <Link
            to="/calendario"
            className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            +{appointments.length - 3} compromisso{appointments.length - 3 === 1 ? '' : 's'} neste dia
          </Link>
        </div>
      ) : null}
    </section>
  )
}
