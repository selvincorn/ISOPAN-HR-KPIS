import React, { useState } from 'react'
import { Database, CheckCircle2, AlertTriangle, ExternalLink, HelpCircle, X } from 'lucide-react'
import { getSupabaseConfig, setSupabaseConfig } from '../../lib/supabase'

interface SupabaseConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SupabaseConfigModal({ isOpen, onClose }: SupabaseConfigModalProps) {
  const currentConfig = getSupabaseConfig()
  const [url, setUrl] = useState(
    currentConfig.url.includes('TU_PROYECTO') || currentConfig.url.includes('placeholder')
      ? ''
      : currentConfig.url
  )
  const [key, setKey] = useState(
    currentConfig.key.includes('placeholder')
      ? 'sb_publishable_Es5LUMhBYfiJk_gbnsPVSA_Kla-QJiY'
      : currentConfig.key
  )
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    let cleanUrl = url.trim()
    if (!cleanUrl) return

    // Si el usuario pega solo el ID del proyecto (ej: "xyzabc123")
    if (!cleanUrl.includes('://') && !cleanUrl.includes('.')) {
      cleanUrl = `https://${cleanUrl}.supabase.co`
    } else if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`
    }

    setSupabaseConfig(cleanUrl, key.trim())
    setSuccess(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Conexión con Supabase</h3>
              <p className="text-xs text-blue-200">Base de Datos PostgreSQL en la Nube</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {success ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">¡Credenciales Guardadas!</strong>
                <p className="text-xs">Recargando la aplicación para conectar con Supabase...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>¿Por qué no guardaba en la base de datos?</strong>
                  <p className="mt-0.5 text-amber-800">
                    Tu archivo de configuración tenía como URL temporal <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">https://tu_proyecto.supabase.co</code>. Al no existir ese dominio, las peticiones fallaban con <code className="bg-amber-100 px-1 rounded font-mono">ERR_NAME_NOT_RESOLVED</code>.
                  </p>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  1. Project URL de Supabase *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-sm font-mono rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Pega la URL completa o solo el ID de tu proyecto.
                </p>
              </div>

              {/* Publishable Key */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  2. Anon / Publishable Key *
                </label>
                <input
                  type="text"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>

              {/* Guía Rápida */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <HelpCircle className="w-4 h-4 text-[#1e3a5f]" />
                  ¿Dónde encuentro la URL de mi proyecto?
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-gray-600">
                  <li>
                    Entra a tu cuenta en{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline font-bold"
                    >
                      supabase.com/dashboard
                    </a>
                  </li>
                  <li>
                    Mira la barra de tu navegador: <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-gray-900">supabase.com/dashboard/project/<strong>[ID_DE_TU_PROYECTO]</strong></code>
                  </li>
                  <li>
                    O ve a <strong>Project Settings &gt; Data API &gt; Project URL</strong>.
                  </li>
                </ol>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Database className="w-4 h-4" /> Guardar y Conectar Ahora
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

