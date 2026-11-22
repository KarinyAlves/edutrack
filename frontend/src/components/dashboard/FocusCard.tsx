import { ArrowRight, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { AcademicTask } from '../../api/types'
import { formatDueLabel } from '../../utils/dashboard'

export function FocusCard({
  task,
  subjectsCount,
  loading = false,
}: {
  task: AcademicTask | null
  subjectsCount: number
  loading?: boolean
}) {
  if (loading) {
    return (
      <section className="flex h-full min-h-[118px] flex-col justify-between rounded-[18px] bg-[var(--sidebar-bg)] p-[16px]">
        <div className="skeleton-shimmer h-2.5 w-20 rounded-full bg-white/10" />
        <div className="skeleton-shimmer mt-2 h-5 w-4/5 rounded-full bg-white/10" />
        <div className="skeleton-shimmer mt-2 h-8 w-36 rounded-xl bg-white/10" />
      </section>
    )
  }

  const hasNoSubjects = subjectsCount === 0
  const due = task ? formatDueLabel(task.due_date) : null

  const content = hasNoSubjects
    ? {
        title: 'Comece pelo seu semestre',
        meta: 'Nenhuma disciplina ativa ainda.',
        cta: 'Configurar disciplinas',
        to: '/disciplinas',
      }
    : task
      ? {
          title: task.title,
          meta: `${task.subject_name || 'Disciplina'}${due ? ` · ${due.label}` : ''}`,
          cta: 'Continuar estudando',
          to: `/estudo/${task.id}`,
        }
      : {
          title: 'Tudo em dia por aqui',
          meta: 'Nenhuma entrega pendente no momento.',
          cta: 'Planejar a semana',
          to: '/tarefas',
        }

  return (
    <section className="flex h-full min-h-[118px] flex-col justify-between rounded-[18px] bg-[var(--sidebar-bg)] p-[14px] text-white shadow-[var(--card-shadow)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-[var(--accent-lime)] uppercase">
            Foco de hoje
          </p>
          <h2
            title={content.title}
            className="mt-1 truncate text-[15.5px] leading-[1.25] font-semibold tracking-tight text-white"
          >
            {content.title}
          </h2>
          <p title={content.meta} className="mt-0.5 truncate text-[11px] font-normal text-white/70">
            {content.meta}
          </p>
        </div>
        <span className="grid size-7 shrink-0 place-items-center rounded-[9px] bg-white/8 text-[var(--accent-lime)]">
          <Target size={14} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-2 flex items-center justify-end">
        <Link
          to={content.to}
          className="press inline-flex h-[32px] shrink-0 items-center gap-1.5 rounded-[11px] bg-[var(--accent-lime)] px-3 text-[11.5px] font-semibold text-[#17172F] transition hover:bg-[var(--accent-lime-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
        >
          {content.cta}
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
