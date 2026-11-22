import { LoaderCircle, LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { useSignOut } from '../../auth/useSignOut'
import { getInitials } from '../../utils/dashboard'
import { Brand } from '../Brand'
import { MOBILE_SIDEBAR_ID, PRIMARY_NAV, PROFILE_NAV, SIDEBAR_ID } from './nav-items'

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  mobile = false,
  onClose,
}: {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
  mobile?: boolean
  onClose?: () => void
}) {
  const { user } = useAuth()
  const { leave, leaving } = useSignOut()
  const initials = getInitials(user?.full_name)
  const compact = collapsed && !mobile

  function navLinkClass(isActive: boolean) {
    return `press relative flex min-h-[40px] items-center rounded-[15px] text-[13px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      compact ? 'justify-center gap-0 px-0' : 'gap-[11px] px-3'
    } ${
      isActive
        ? 'bg-[var(--accent-lime)] font-semibold text-[#17172F]'
        : 'text-white/75 hover:bg-white/8 hover:text-white'
    }`
  }

  return (
    <aside
      id={mobile ? MOBILE_SIDEBAR_ID : SIDEBAR_ID}
      data-collapsed={compact}
      className={
        mobile
          ? 'flex h-full w-full flex-col rounded-[20px] bg-[var(--sidebar-bg)]'
          : `sticky top-4 flex h-[calc(100dvh-76px)] shrink-0 flex-col overflow-hidden rounded-[20px] bg-[var(--sidebar-bg)] transition-[width] duration-300 ease-out xl:h-[calc(100dvh-88px)] ${
              compact ? 'w-[68px]' : 'w-[202px]'
            }`
      }
    >
      <div
        className={`flex px-3.5 pt-4 pb-3.5 ${
          compact ? 'flex-col items-center gap-3' : 'items-center justify-between gap-2'
        }`}
      >
        <Brand light showMark />
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            data-drawer-autofocus
            aria-label="Fechar menu"
            className="press grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-controls={SIDEBAR_ID}
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="press grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {collapsed ? (
              <PanelLeftOpen size={15} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={15} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-[7px] px-2.5 pb-3">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/home'}
              onClick={onNavigate}
              title={compact ? item.label : undefined}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon size={17} strokeWidth={1.85} aria-hidden="true" className="shrink-0" />
              <span className="sidebar-label whitespace-nowrap">{item.label}</span>
            </NavLink>
          )
        })}

        <div className="mt-auto flex flex-col gap-[7px] pt-2">
          <NavLink
            to={PROFILE_NAV.to}
            onClick={onNavigate}
            title={compact ? PROFILE_NAV.label : undefined}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <PROFILE_NAV.icon size={17} strokeWidth={1.85} aria-hidden="true" className="shrink-0" />
            <span className="sidebar-label whitespace-nowrap">{PROFILE_NAV.label}</span>
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-white/8 px-2.5 pt-2.5 pb-3.5">
        {compact ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/perfil"
              onClick={onNavigate}
              aria-label="Abrir perfil"
              title={user?.full_name || 'Perfil'}
              className="press grid size-8 place-items-center rounded-full bg-[var(--accent-lime)] text-[11px] font-bold text-[#17172F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {initials}
            </Link>
            <button
              type="button"
              onClick={() => void leave()}
              disabled={leaving}
              aria-label="Sair"
              title="Sair"
              className="press grid size-8 place-items-center rounded-lg border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
            >
              {leaving ? (
                <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <LogOut size={15} aria-hidden="true" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-[14px] bg-white/[0.04] px-2.5 py-2">
            <Link
              to="/perfil"
              onClick={onNavigate}
              aria-label="Abrir perfil"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--accent-lime)] text-[10px] font-bold text-[#17172F]">
                {initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-white">
                  {user?.full_name || 'Estudante'}
                </span>
                <span className="block truncate text-[10px] text-white/50">{user?.email ?? ''}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => void leave()}
              disabled={leaving}
              className="press inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
            >
              {leaving ? (
                <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
              ) : (
                <LogOut size={13} aria-hidden="true" />
              )}
              <span>{leaving ? 'Saindo…' : 'Sair'}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
