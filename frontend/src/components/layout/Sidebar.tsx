import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bot, ChevronLeft, FileText, FolderKanban, LayoutDashboard,
  LogOut, Settings, Sparkles, BarChart3,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/8 bg-surface/80 backdrop-blur-2xl transition-all duration-300',
      collapsed ? 'w-[72px]' : 'w-64',
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/8 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-krew-500 to-krew-700 shadow-lg shadow-krew-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Krew AI</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Multi-Agent Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-krew-500/15 text-krew-300 shadow-sm'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/8 p-3">
        {!collapsed && user && (
          <div className="mb-3 rounded-xl bg-white/5 px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-surface-raised text-zinc-400 hover:text-white"
        >
          <ChevronLeft className={cn('h-3 w-3 transition-transform', collapsed && 'rotate-180')} />
        </button>
      )}
    </aside>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-krew-900/20 via-surface to-surface pointer-events-none" />
      <Sidebar />
      <main className="relative ml-64 min-h-screen p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
