import { useState } from 'react'
import { Bell, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MONTHS_ES } from '../../lib/constants'
import { cn } from '../../lib/utils'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-2.5 pl-12 lg:pl-0">
          <div className="h-7 w-7 bg-white p-0.5 rounded border border-gray-200 shadow-xs hidden sm:flex items-center justify-center shrink-0">
            <img src="/isopan-logo.png" alt="ISOPAN" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Period Selector */}
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 focus:outline-none"
            >
              {MONTHS_ES.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-sm font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {profile?.full_name ?? 'Usuario'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                    className={cn(
                      'flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <UserIcon className="h-4 w-4" />
                    Mi Perfil
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
