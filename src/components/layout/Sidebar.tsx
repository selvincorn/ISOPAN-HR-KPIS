import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Target,
  Users,
  Briefcase,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ROLE_LABELS } from '../../lib/constants'
import Badge from '../ui/Badge'
import { cn } from '../../lib/utils'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/kpis', label: 'KPIs', icon: Target },
  { path: '/vacancies', label: 'Plazas y Reclutamiento', icon: Briefcase },
  { path: '/supervisors', label: 'Supervisores', icon: Users },
  { path: '/reports', label: 'Reportes', icon: FileBarChart },
  { path: '/settings', label: 'Configuración', icon: Settings },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const roleBadgeColor = profile?.role === 'admin' ? 'blue' : profile?.role === 'analyst' ? 'green' : 'yellow'

  const filteredNav = profile?.role === 'supervisor'
    ? navItems.filter((item) => item.path === '/' || item.path === '/supervisors')
    : navItems

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white p-1 shadow-sm shrink-0">
          <img src="/isopan-logo.png" alt="ISOPAN" className="h-full w-full object-contain" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">ISOPAN HR KPI</h1>
          <p className="text-[10px] text-blue-200 uppercase tracking-widest">Control System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-white/20 text-white text-sm font-bold">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name ?? 'Usuario'}
            </p>
            <Badge color={roleBadgeColor}>
              {ROLE_LABELS[profile?.role ?? ''] ?? profile?.role ?? 'Sin rol'}
            </Badge>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1e3a5f] text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1e3a5f] transform transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
