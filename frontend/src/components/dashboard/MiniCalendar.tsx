import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { CalendarItem } from '../../api/types'
import {
  buildMonthCells,
  getCategoryMeta,
  itemToDateKey,
  MONTH_NAMES,
  parseDateKey,
  toLocalDateKey,
  WEEKDAYS_SHORT,
} from '../../utils/calendar'

export function MiniCalendar({
  selectedDateKey,
  onSelectDate,
  items = [],
  onMonthChange,
  className = '',
}: {
  selectedDateKey: string
  onSelectDate: (key: string) => void
  items?: CalendarItem[]
  onMonthChange?: (month: Date) => void
  className?: string
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const base = parseDateKey(selectedDateKey)
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  // Sincroniza o mês exibido se a data selecionada vier de outro componente (ex: gráfico da semana)
  useEffect(() => {
    const parsed = parseDateKey(selectedDateKey)
    if (
      parsed.getFullYear() !== viewMonth.getFullYear() ||
      parsed.getMonth() !== viewMonth.getMonth()
    ) {
      const next = new Date(parsed.getFullYear(), parsed.getMonth(), 1)
      setViewMonth(next)
      onMonthChange?.(next)
    }
  }, [selectedDateKey, viewMonth, onMonthChange])

  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth])

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const item of items) {
      if (item.cancelled) continue
      const key = itemToDateKey(item)
      const bucket = map.get(key)
      if (bucket) bucket.push(item)
      else map.set(key, [item])
    }
    return map
  }, [items])

  const todayKey = toLocalDateKey(new Date())

  function shiftMonth(delta: number) {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1)
    setViewMonth(next)
    onMonthChange?.(next)
    const now = new Date()
    onSelectDate(
      next.getFullYear() === now.getFullYear() && next.getMonth() === now.getMonth()
        ? toLocalDateKey(now)
        : toLocalDateKey(next),
    )
  }

  return (
    <section
      className={`dashboard-card flex flex-col justify-between p-[16px] ${className}`}
      aria-labelledby="mini-calendar"
    >
      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Mês anterior"
          className="press grid size-[26px] place-items-center rounded-lg border border-[var(--card-border)] text-[var(--text-secondary)] transition hover:border-[var(--accent-lime)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>

        <h2
          id="mini-calendar"
          className="text-[14.5px] leading-[1.2] font-semibold tracking-tight text-[var(--text-primary)]"
        >
          {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </h2>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Próximo mês"
          className="press grid size-[26px] place-items-center rounded-lg border border-[var(--card-border)] text-[var(--text-secondary)] transition hover:border-[var(--accent-lime)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </header>

      <div className="mt-2.5 grid grid-cols-7 gap-1" aria-hidden="true">
        {WEEKDAYS_SHORT.map((label) => (
          <span
            key={label}
            className="text-center text-[10px] font-medium text-[var(--text-muted)]"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-0.5 gap-x-1">
        {cells.map((cell) => {
          const dayItems = byDay.get(cell.key) ?? []
          const selected = cell.key === selectedDateKey
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDate(cell.key)}
              aria-pressed={selected}
              aria-label={`${cell.weekdayFull}, ${cell.date.getDate()} de ${MONTH_NAMES[cell.date.getMonth()]}, ${dayItems.length} ${dayItems.length === 1 ? 'compromisso' : 'compromissos'}`}
              className={`relative mx-auto flex size-[27px] flex-col items-center justify-center rounded-full text-[12px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ink)] ${
                selected
                  ? 'bg-[var(--accent-lime)] font-semibold text-[#17172F]'
                  : cell.isCurrentMonth
                    ? 'text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                    : 'text-[var(--text-muted)]/60 hover:bg-[var(--surface-soft)]'
              } ${cell.isToday && !selected ? 'ring-1 ring-[var(--text-primary)]/25 ring-inset' : ''}`}
            >
              <span className="leading-none">{cell.date.getDate()}</span>
              {dayItems.length > 0 ? (
                <span className="mt-0.5 flex items-center gap-0.5">
                  {dayItems.slice(0, 3).map((item, index) => (
                    <span
                      key={`${item.id}-${index}`}
                      className={`size-1 rounded-full ${
                        selected ? 'bg-[#17172F]/75' : getCategoryMeta(item).dotClass
                      }`}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {todayKey === selectedDateKey ? <span className="sr-only">Dia atual selecionado</span> : null}
    </section>
  )
}
