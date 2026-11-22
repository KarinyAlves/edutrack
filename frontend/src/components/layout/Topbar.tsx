import { Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { formatLongDate, getGreeting, getInitials } from '../../utils/dashboard'
import { Brand } from '../Brand'
import { ThemeToggle } from '../ThemeToggle'
import { getPageTitle, MOBILE_SIDEBAR_ID } from './nav-items'

export function Topbar({
  onOpenMenu,
  menuOpen,
}: {
  onOpenMenu: () => void
  menuOpen: boolean
}) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const initials = getInitials(user?.full_name)
  const firstName = user?.full_name.trim().split(/\s+/)[0] || 'estudante'
  const isHome = pathname === '/home' || pathname === '/home/'

  return (
    <header className="z-20 shrink-0 px-4 pt-3 pb-1 sm:px-5 lg:px-5 lg:pt-1.5 lg:pb-2">
      <div className="flex min-h-[60px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menu"
            aria-controls={MOBILE_SIDEBAR_ID}
            aria-expanded={menuOpen}
            className="press grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--card-border)] bg-surface text-ink transition hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] lg:hidden"
          >
            <Menu size={17} aria-hidden="true" />
          </button>

          {isHome ? (
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-[0.06em] text-[var(--text-secondary)]">
                {formatLongDate(new Date())}
              </p>
              <h1 className="mt-0.5 truncate text-[22px] leading-[1.2] font-bold tracking-tight text-[var(--text-primary)] sm:text-[26px]">
                {getGreeting()}, {firstName}
              </h1>
              <p className="mt-0.5 hidden text-[12px] font-medium text-[var(--text-secondary)] sm:block">
                Seu dia, suas entregas e seu ritmo em um só lugar.
              </p>
            </div>
          ) : (
            <>
              <div className="lg:hidden">
                <Brand />
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="text-[11px] font-medium tracking-[0.06em] text-[var(--text-secondary)]">
                  {formatLongDate(new Date())}
                </p>
                <h1 className="mt-0.5 truncate text-[20px] leading-tight font-bold tracking-tight text-[var(--text-primary)]">
                  {getPageTitle(pathname)}
                </h1>
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
          <ThemeToggle compact />
          <Link
            to="/perfil"
            aria-label="Abrir perfil"
            title={user?.full_name || 'Perfil'}
            className="press grid size-9 place-items-center rounded-full bg-[var(--accent-lime)] text-[11px] font-bold text-[#17172F] ring-2 ring-transparent transition hover:bg-[var(--accent-lime-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  )
}
