import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { isSupabaseConfigured } from '../../lib/supabase'
import { AlertTriangle, Database } from 'lucide-react'
import SupabaseConfigModal from '../ui/SupabaseConfigModal'

interface LayoutProps {
  children: ReactNode
  title: string
}

export default function Layout({ children, title }: LayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isConfigured = isSupabaseConfigured()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} />

        {/* Banner de alerta si Supabase no tiene URL real */}
        {!isConfigured && (
          <div className="print:hidden bg-amber-600 text-white px-4 py-2 text-xs font-medium flex flex-wrap items-center justify-between gap-2 shadow-xs shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
              <span>
                <strong>Atención:</strong> Falta conectar la URL de tu proyecto Supabase. Tus cambios se guardan localmente en tu navegador.
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 bg-white text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-700" /> Conectar con Supabase
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Modal de Configuración Supabase */}
        <SupabaseConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  )
}
