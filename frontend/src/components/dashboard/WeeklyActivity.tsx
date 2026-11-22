import { formatMinutes, type WeekLoad } from '../../utils/dashboard'

export function WeeklyActivity({
  loads,
  selectedKey,
  onSelectDay,
  loading = false,
  error = false,
  onRetry,
  className = '',
}: {
  loads: WeekLoad[]
  selectedKey: string
  onSelectDay: (key: string) => void
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  className?: string
}) {
  const total = loads.reduce((sum, day) => sum + day.minutes, 0)
  const maxRaw = Math.max(...loads.map((day) => day.minutes), 0)
  // Escala em horas arredondada para múltiplo confortável (mínimo 4h = 240min)
  const peak = Math.max(240, Math.ceil(maxRaw / 120) * 120)
  const yTicks = [peak, Math.round(peak * 0.66), Math.round(peak * 0.33), 0]

  return (
    <section
      className={`dashboard-card flex h-[288px] flex-col justify-between p-[17px] ${className}`}
      aria-labelledby="weekly-load"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="weekly-load"
            className="text-[17px] leading-[1.2] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Carga da semana
          </h2>
          <p className="mt-0.5 text-[11px] font-normal text-[var(--text-secondary)]">
            Aulas e entregas planejadas
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--pastel-green)] px-2.5 py-1 text-[11px] font-semibold text-[#17172F] dark:text-[#C8F09B]">
          {formatMinutes(total)}
        </span>
      </header>

      {loading ? (
        <div className="mt-3 flex h-[172px] items-end gap-3 px-2" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex h-full flex-1 items-end justify-center">
              <div
                className="skeleton-shimmer w-[12px] rounded-t-[6px] bg-line"
                style={{ height: `${30 + ((index * 17) % 55)}%` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-1 flex-col justify-end">
          <div className="relative flex h-[160px] items-stretch gap-2.5">
            {/* Eixo vertical discreto */}
            <div
              className="flex w-7 shrink-0 flex-col justify-between pb-0.5 text-right text-[10px] font-medium text-[var(--text-muted)]"
              aria-hidden="true"
            >
              {yTicks.map((mins, idx) => (
                <span key={idx} className="leading-none">
                  {mins === 0 ? '0h' : `${Math.round(mins / 60)}h`}
                </span>
              ))}
            </div>

            {/* Grade horizontal de 1px + barras */}
            <div className="relative flex flex-1 items-end">
              <div
                className="pointer-events-none absolute inset-0 flex flex-col justify-between py-0.5"
                aria-hidden="true"
              >
                {yTicks.map((_, idx) => (
                  <div key={idx} className="h-px w-full bg-[var(--divider)]" />
                ))}
              </div>

              <div className="relative z-10 flex h-full w-full items-end justify-between px-1">
                {loads.map((day, index) => {
                  const pct =
                    day.minutes === 0 ? 4 : Math.max(8, Math.round((day.minutes / peak) * 100))
                  const selected = day.key === selectedKey
                  const barTone = selected
                    ? 'bg-[var(--accent-lime)]'
                    : day.minutes === 0
                      ? 'bg-[var(--card-border)]'
                      : 'bg-[var(--chart-bar)] hover:opacity-85'

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => onSelectDay(day.key)}
                      aria-pressed={selected}
                      aria-label={`${day.weekdayFull}: ${formatMinutes(day.minutes)} planejados, ${day.items} ${day.items === 1 ? 'compromisso' : 'compromissos'}`}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
                    >
                      <span
                        className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full rounded-md bg-[var(--sidebar-bg)] px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-white opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100"
                        role="presentation"
                      >
                        {formatMinutes(day.minutes)}
                      </span>
                      <span
                        className={`bar-rise w-[12px] rounded-t-[6px] transition-colors ${barTone}`}
                        style={{
                          height: `${pct}%`,
                          animationDelay: `${index * 45}ms`,
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="w-7 shrink-0" aria-hidden="true" />
            <div className="flex flex-1 justify-between px-1" aria-hidden="true">
              {loads.map((day) => {
                const selected = day.key === selectedKey
                return (
                  <span
                    key={day.key}
                    className={`flex-1 text-center text-[10.5px] ${
                      selected
                        ? 'font-semibold text-[var(--text-primary)]'
                        : 'font-medium text-[var(--text-muted)]'
                    }`}
                  >
                    {day.weekdayShort}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-secondary)]">
          <span>Não foi possível carregar a agenda.</span>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="font-semibold text-[var(--text-primary)] underline decoration-[var(--accent-lime)] decoration-2 underline-offset-2"
            >
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
