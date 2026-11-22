import {
  BookOpenCheck,
  Clock3,
  ListTodo,
  TriangleAlert,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getDashboardSummary,
  listAcademicTasks,
  listCalendarItems,
  listStudentSubjects,
  toggleAcademicTaskComplete,
} from '../api/client'
import type { AcademicTask, CalendarItem, DashboardSummary, StudentSubject } from '../api/types'
import { Alert } from '../components/Feedback'
import { DayAppointments } from '../components/dashboard/DayAppointments'
import { FocusCard } from '../components/dashboard/FocusCard'
import { MetricCard } from '../components/dashboard/MetricCard'
import { MiniCalendar } from '../components/dashboard/MiniCalendar'
import { SubjectBooks } from '../components/dashboard/SubjectBooks'
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks'
import { WeeklyActivity } from '../components/dashboard/WeeklyActivity'
import { buildMonthCells, parseDateKey, toLocalDateKey } from '../utils/calendar'
import {
  buildWeekLoad,
  formatMinutes,
  getWeekDays,
} from '../utils/dashboard'

export function HomePage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [subjects, setSubjects] = useState<StudentSubject[]>([])
  const [tasks, setTasks] = useState<AcademicTask[]>([])
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [partialError, setPartialError] = useState('')
  const [calendarError, setCalendarError] = useState(false)
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [selectedDateKey, setSelectedDateKey] = useState(() => toLocalDateKey(new Date()))
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [reloadKey, setReloadKey] = useState(0)

  const monthCells = useMemo(() => buildMonthCells(viewMonth), [viewMonth])

  useEffect(() => {
    let alive = true
    const weekDays = getWeekDays(new Date())
    const firstMonthCell = monthCells[0]?.date ?? weekDays[0]
    const lastMonthCell = monthCells[monthCells.length - 1]?.date ?? weekDays[6]
    const rangeStart = firstMonthCell < weekDays[0] ? firstMonthCell : weekDays[0]
    const rangeEnd = lastMonthCell > weekDays[6] ? lastMonthCell : weekDays[6]

    async function loadDashboard() {
      setLoading(true)
      setError('')
      setPartialError('')
      setCalendarError(false)

      const [summaryResult, subjectsResult, tasksResult, calendarResult] =
        await Promise.allSettled([
          getDashboardSummary(),
          listStudentSubjects(),
          listAcademicTasks(),
          listCalendarItems({
            from: new Date(
              rangeStart.getFullYear(),
              rangeStart.getMonth(),
              rangeStart.getDate(),
              0,
              0,
              0,
            ).toISOString(),
            to: new Date(
              rangeEnd.getFullYear(),
              rangeEnd.getMonth(),
              rangeEnd.getDate(),
              23,
              59,
              59,
            ).toISOString(),
          }),
        ])

      if (!alive) return

      if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value)
      else setError('Não foi possível carregar o resumo do seu dia.')

      if (subjectsResult.status === 'fulfilled') {
        setSubjects(subjectsResult.value.filter((item) => item.status === 'active'))
      } else {
        setPartialError('Não foi possível carregar suas disciplinas.')
      }

      if (tasksResult.status === 'fulfilled') setTasks(tasksResult.value)
      else setPartialError('Não foi possível carregar suas tarefas.')

      if (calendarResult.status === 'fulfilled') setCalendarItems(calendarResult.value)
      else setCalendarError(true)

      setLoading(false)
    }

    void loadDashboard()
    return () => {
      alive = false
    }
  }, [reloadKey, monthCells])

  const pendingTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status !== 'completed')
        .sort((a, b) => {
          const aTime = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY
          const bTime = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY
          return aTime - bTime
        }),
    [tasks],
  )

  const nextTask =
    summary?.upcoming_tasks.find((task) => task.status !== 'completed') ?? pendingTasks[0] ?? null

  const activeWeekDays = useMemo(
    () => getWeekDays(parseDateKey(selectedDateKey)),
    [selectedDateKey],
  )

  const weekLoads = useMemo(
    () => buildWeekLoad(activeWeekDays, calendarItems, tasks),
    [activeWeekDays, calendarItems, tasks],
  )

  const retry = useCallback(() => setReloadKey((value) => value + 1), [])

  async function handleToggleTask(id: string) {
    setBusyTaskId(id)
    setPartialError('')
    try {
      const updated = await toggleAcademicTaskComplete(id)
      setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)))
      try {
        setSummary(await getDashboardSummary())
      } catch {
        setPartialError('Resumo atualizado parcialmente. Recarregue para sincronizar.')
      }
    } catch {
      setPartialError('Não foi possível concluir a tarefa.')
    } finally {
      setBusyTaskId(null)
    }
  }

  const summaryValue = summary ?? null

  return (
    <div className="mx-auto w-full px-4 pt-1 pb-6 sm:px-5 lg:px-5">
      {!loading && summaryValue?.subjects_count === 0 ? (
        <section className="mb-4 overflow-hidden rounded-[18px] border border-[var(--card-border)] bg-[var(--surface-soft)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--text-secondary)] uppercase">
                Primeiros passos
              </p>
              <h2 className="mt-0.5 text-[16px] font-bold tracking-tight text-[var(--text-primary)]">
                Vamos montar seu semestre
              </h2>
              <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">
                Selecione suas disciplinas para liberar o calendário e o progresso.
              </p>
            </div>
            <Link
              to="/disciplinas"
              className="press inline-flex h-9 shrink-0 items-center gap-2 rounded-[12px] bg-[var(--accent-lime)] px-3.5 text-[12px] font-semibold text-[#17172F] transition hover:bg-[var(--accent-lime-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
            >
              <BookOpenCheck size={16} aria-hidden="true" />
              Configurar disciplinas
            </Link>
          </div>
        </section>
      ) : null}

      {error ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Alert>{error}</Alert>
          </div>
          <button
            type="button"
            onClick={retry}
            className="press inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[var(--card-border)] bg-surface px-4 text-xs font-semibold text-ink transition hover:border-[var(--accent-lime)]"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {partialError ? (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <TriangleAlert size={15} aria-hidden="true" className="shrink-0" />
          <span className="flex-1">{partialError}</span>
          <button
            type="button"
            onClick={retry}
            className="font-semibold underline decoration-2 underline-offset-2"
          >
            Recarregar
          </button>
        </div>
      ) : null}

      {/* Primeira faixa — 4 indicadores (~66%) à esquerda + Foco de hoje (~34%) à direita */}
      <div className="grid gap-3.5 xl:grid-cols-12 xl:gap-4">
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 xl:col-span-8 xl:gap-3.5">
          <MetricCard
            label="Disciplinas ativas"
            value={summaryValue?.subjects_count ?? 0}
            detail={`${subjects.length} ${subjects.length === 1 ? 'matéria ativa' : 'matérias ativas'}`}
            icon={BookOpenCheck}
            tone="lilac"
            to="/disciplinas"
            loading={loading}
          />
          <MetricCard
            label="Tarefas pendentes"
            value={summaryValue?.pending_tasks_count ?? 0}
            detail={`${summaryValue?.completed_tasks_count ?? 0} concluídas`}
            icon={ListTodo}
            tone="peach"
            to="/tarefas"
            loading={loading}
          />
          <MetricCard
            label="Tarefas vencidas"
            value={summaryValue?.overdue_tasks_count ?? 0}
            detail={
              (summaryValue?.overdue_tasks_count ?? 0) > 0
                ? 'Priorize hoje'
                : 'Nenhuma atrasada'
            }
            icon={TriangleAlert}
            tone="rose"
            alert={(summaryValue?.overdue_tasks_count ?? 0) > 0}
            to="/tarefas"
            loading={loading}
          />
          <MetricCard
            label="Progresso ponderado"
            value={summaryValue?.weighted_progress_percent ?? 0}
            suffix="%"
            detail={`${formatMinutes(summaryValue?.actual_minutes_total ?? 0)} de ${formatMinutes(summaryValue?.planned_minutes_total ?? 0)}`}
            icon={Clock3}
            tone="mint"
            loading={loading}
          />
        </div>

        <div className="min-w-0 xl:col-span-4">
          <FocusCard
            task={nextTask}
            subjectsCount={summaryValue?.subjects_count ?? 0}
            loading={loading}
          />
        </div>
      </div>

      {/* Grade principal — 3 colunas distintas (1.1fr 0.9fr 1fr) */}
      <div className="mt-4 grid gap-3.5 lg:grid-cols-2 lg:gap-4 xl:grid-cols-[1.1fr_0.9fr_1fr]">
        {/* Coluna 1 (Esquerda): Carga da semana — 7º item no mobile (order-4 no container) */}
        <WeeklyActivity
          className="order-4 min-w-0 lg:order-1 xl:col-start-1 xl:row-start-1"
          loads={weekLoads}
          selectedKey={selectedDateKey}
          onSelectDay={setSelectedDateKey}
          loading={loading}
          error={calendarError}
          onRetry={retry}
        />

        {/* Coluna 2 (Centro): Compromissos do dia — 4º item no mobile (order-1 no container) */}
        <DayAppointments
          className="order-1 min-w-0 lg:order-2 xl:col-start-2 xl:row-start-1"
          items={calendarItems}
          selectedDateKey={selectedDateKey}
          loading={loading}
          error={calendarError}
          onRetry={retry}
        />

        {/* Coluna 3 (Direita): Calendário compacto no topo + Atividades logo abaixo */}
        <div className="order-2 flex min-w-0 flex-col gap-3.5 lg:order-3 lg:gap-4 xl:col-start-3 xl:row-span-2 xl:row-start-1">
          <MiniCalendar
            selectedDateKey={selectedDateKey}
            onSelectDate={setSelectedDateKey}
            items={calendarItems}
            onMonthChange={setViewMonth}
          />

          <UpcomingTasks
            tasks={tasks}
            loading={loading}
            busyId={busyTaskId}
            onToggle={(id) => void handleToggleTask(id)}
            onRetry={retry}
            error={partialError.length > 0}
          />
        </div>

        {/* Faixa inferior (Colunas 1 e 2 combinadas): Disciplinas em andamento — 8º item no mobile (order-5 no container) */}
        <SubjectBooks
          className="order-5 min-w-0 lg:order-4 xl:col-span-2 xl:col-start-1 xl:row-start-2"
          subjects={subjects}
          loading={loading}
        />
      </div>
    </div>
  )
}
