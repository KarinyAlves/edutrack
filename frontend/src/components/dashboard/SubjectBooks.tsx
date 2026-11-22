import { ArrowRight, BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { StudentSubject } from '../../api/types'
import { getProfessorDisplay } from '../../utils/subjects'
import { MetricValue } from '../MetricValue'

const RADIUS = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const SUBJECT_PASTELS = [
  'bg-[var(--pastel-lavender)] text-[#513788] dark:text-[#D5C2FF]',
  'bg-[var(--pastel-peach)] text-[#8A4A1C] dark:text-[#FFD0AD]',
  'bg-[var(--pastel-green)] text-[#2D6217] dark:text-[#C8F09B]',
  'bg-[var(--pastel-pink)] text-[#922F56] dark:text-[#FBB8D0]',
]

function ProgressRing({ percent, ready }: { percent: number; ready: boolean }) {
  const offset = ready ? CIRCUMFERENCE * (1 - percent / 100) : CIRCUMFERENCE
  return (
    <span className="relative grid size-[36px] shrink-0 place-items-center">
      <svg viewBox="0 0 36 36" className="size-[36px] -rotate-90" aria-hidden="true">
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          stroke="var(--card-border)"
          strokeWidth="3.5"
        />
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          stroke="var(--accent-lime)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="ring-progress"
        />
      </svg>
    </span>
  )
}

export function SubjectBooks({
  subjects,
  loading = false,
  className = '',
}: {
  subjects: StudentSubject[]
  loading?: boolean
  className?: string
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section className={`dashboard-card p-[17px] ${className}`} aria-labelledby="subject-books">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="subject-books"
            className="text-[17px] leading-[1.2] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Disciplinas em andamento
          </h2>
          <p className="mt-0.5 text-[11px] font-normal text-[var(--text-secondary)]">
            Progresso por matéria neste semestre
          </p>
        </div>
        <Link
          to="/disciplinas"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent-lime)] hover:text-[var(--text-primary)]"
        >
          Ver disciplinas
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </header>

      {loading ? (
        <div className="mt-3.5 space-y-2.5" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-[72px] rounded-[16px] bg-line" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="mt-3.5 rounded-2xl border border-dashed border-[var(--card-border)] p-6 text-center">
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">
            Nenhuma disciplina ativa
          </p>
          <p className="mt-1 text-[11.5px] text-[var(--text-secondary)]">
            Configure seu semestre para acompanhar o progresso.
          </p>
          <Link
            to="/disciplinas"
            className="press mt-3 inline-flex h-[34px] items-center gap-2 rounded-[12px] bg-[var(--accent-lime)] px-3.5 text-[12px] font-semibold text-[#17172F] transition hover:bg-[var(--accent-lime-hover)]"
          >
            Configurar semestre
          </Link>
        </div>
      ) : (
        <ul className="mt-3.5 space-y-[10px]">
          {subjects.map((subject, index) => {
            const percent = Math.max(0, Math.min(100, subject.progress_percent))
            const workload = subject.custom_workload_hours ?? subject.subject.workload_hours
            const toneClass = SUBJECT_PASTELS[index % SUBJECT_PASTELS.length]
            const professorName = getProfessorDisplay(subject)

            return (
              <li
                key={subject.id}
                className="flex min-h-[70px] items-center justify-between gap-3 rounded-[16px] border border-[var(--card-border)] bg-[var(--surface-main)] px-3.5 py-2.5 shadow-[0_2px_8px_rgba(25,22,55,0.03)] transition hover:border-[var(--text-muted)]/35"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={`grid size-[40px] shrink-0 place-items-center rounded-[12px] ${toneClass}`}
                    aria-hidden="true"
                  >
                    <BookOpen size={17} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      title={subject.subject.name}
                      className="truncate text-[14.5px] leading-[1.25] font-semibold text-[var(--text-primary)]"
                    >
                      {subject.subject.name}
                    </h3>
                    <p
                      title={professorName}
                      className="mt-0.5 truncate text-[11.5px] font-normal text-[var(--text-secondary)]"
                    >
                      {professorName}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  {workload ? (
                    <div className="hidden text-right sm:block">
                      <p className="text-[12px] leading-none font-semibold text-[var(--text-primary)]">
                        {workload}h
                      </p>
                      <p className="mt-1 text-[10px] font-normal text-[var(--text-muted)]">
                        Carga horária
                      </p>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <ProgressRing percent={percent} ready={ready} />
                    <span className="w-10 text-right text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">
                      <MetricValue value={percent} suffix="%" />
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
