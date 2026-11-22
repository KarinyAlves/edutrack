import {
  BookOpen,
  Check,
  ClipboardList,
  GraduationCap,
  ListTodo,
  LoaderCircle,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import type { AcademicTask, AcademicTaskCategory } from '../../api/types'
import { formatDueLabel } from '../../utils/dashboard'

const CATEGORY_ICON: Record<AcademicTaskCategory, typeof ListTodo> = {
  task: ListTodo,
  assignment: ClipboardList,
  exam: GraduationCap,
  other: BookOpen,
}

const CATEGORY_TONE: Record<AcademicTaskCategory, string> = {
  task: 'bg-[var(--pastel-peach)] text-[#8A4A1C] dark:text-[#FFD0AD]',
  assignment: 'bg-[var(--pastel-lavender)] text-[#513788] dark:text-[#D5C2FF]',
  exam: 'bg-[var(--pastel-pink)] text-[#922F56] dark:text-[#FBB8D0]',
  other: 'bg-[var(--pastel-green)] text-[#2D6217] dark:text-[#C8F09B]',
}

function getStatusBadge(task: AcademicTask, due: ReturnType<typeof formatDueLabel>) {
  if (task.status === 'completed') {
    return {
      label: 'Concluída',
      tone: 'bg-[var(--pastel-green)] text-[#2D6217] dark:text-[#C8F09B]',
    }
  }
  if (due.overdue) {
    return {
      label: 'Vencida',
      tone: 'bg-[var(--pastel-pink)] text-[#922F56] dark:text-[#FBB8D0]',
    }
  }
  if (task.status === 'in_progress') {
    return {
      label: 'Em andamento',
      tone: 'bg-[var(--pastel-peach)] text-[#8A4A1C] dark:text-[#FFD0AD]',
    }
  }
  if (due.urgent) {
    return {
      label: 'Próxima',
      tone: 'bg-[var(--pastel-lavender)] text-[#513788] dark:text-[#D5C2FF]',
    }
  }
  return {
    label: 'Pendente',
    tone: 'bg-[var(--pastel-lavender)] text-[#513788] dark:text-[#D5C2FF]',
  }
}

export function UpcomingTasks({
  tasks,
  loading = false,
  busyId,
  onToggle,
  onRetry,
  error = false,
  className = '',
}: {
  tasks: AcademicTask[]
  loading?: boolean
  busyId: string | null
  onToggle: (id: string) => void
  onRetry?: () => void
  error?: boolean
  className?: string
}) {
  // Prioriza próximas/vencidas (pendentes ordenadas por prazo) e completa até 3 com as mais recentes se necessário
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      const aDone = a.status === 'completed' ? 1 : 0
      const bDone = b.status === 'completed' ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      const aTime = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY
      const bTime = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY
      return aTime - bTime
    })
    .slice(0, 3)

  return (
    <section className={`dashboard-card p-[17px] ${className}`} aria-labelledby="upcoming-tasks">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="upcoming-tasks"
            className="text-[17px] leading-[1.2] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Atividades
          </h2>
          <p className="mt-0.5 text-[11px] font-normal text-[var(--text-secondary)]">
            Entregas e acompanhamentos
          </p>
        </div>
        <Link
          to="/tarefas"
          aria-label="Abrir página de atividades"
          title="Ver todas as atividades"
          className="press grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--card-border)] bg-[var(--surface-soft)] text-[var(--text-primary)] transition hover:border-[var(--accent-lime)] hover:bg-[var(--accent-lime)] hover:text-[#17172F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
        >
          <Plus size={15} aria-hidden="true" />
        </Link>
      </header>

      {loading ? (
        <div className="mt-3.5 space-y-2.5" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-[52px] rounded-xl bg-line" />
          ))}
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="mt-3.5 rounded-2xl border border-dashed border-[var(--card-border)] px-4 py-5 text-center">
          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            Nenhuma atividade cadastrada
          </p>
          <Link
            to="/tarefas"
            className="mt-1.5 inline-flex text-[11px] font-semibold text-[var(--text-primary)] underline decoration-[var(--accent-lime)] decoration-2 underline-offset-4"
          >
            Abrir tarefas
          </Link>
        </div>
      ) : (
        <ul className="mt-3.5 space-y-2.5">
          {sortedTasks.map((task) => {
            const category = (task.category ?? 'task') as AcademicTaskCategory
            const Icon = CATEGORY_ICON[category] ?? ListTodo
            const due = formatDueLabel(task.due_date)
            const status = getStatusBadge(task, due)
            const isCompleted = task.status === 'completed'
            const metaLine = `${due.label} · ${task.subject_name || 'Geral'}`

            return (
              <li
                key={task.id}
                className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-[var(--surface-soft)]"
              >
                <button
                  type="button"
                  onClick={() => onToggle(task.id)}
                  disabled={busyId === task.id}
                  aria-label={isCompleted ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
                  title={isCompleted ? 'Clique para reabrir' : 'Clique para concluir'}
                  className={`press relative grid size-[34px] shrink-0 place-items-center rounded-[10px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:opacity-50 ${
                    CATEGORY_TONE[category] ?? CATEGORY_TONE.task
                  }`}
                >
                  {busyId === task.id ? (
                    <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                  ) : isCompleted ? (
                    <Check size={15} strokeWidth={2.3} aria-hidden="true" />
                  ) : (
                    <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    title={task.title}
                    className={`truncate text-[13px] leading-[1.25] font-semibold text-[var(--text-primary)] ${
                      isCompleted ? 'line-through opacity-65' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <p
                    title={metaLine}
                    className="mt-0.5 truncate text-[10.5px] font-normal text-[var(--text-secondary)]"
                  >
                    {metaLine}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${status.tone}`}
                >
                  {status.label}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {error ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-secondary)]">
          <span>Não foi possível carregar as atividades.</span>
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
