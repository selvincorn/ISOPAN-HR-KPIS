import React from 'react'
import { Clock, AlertTriangle, Lock, CheckCircle2 } from 'lucide-react'
import { usePayrollCutoff } from '../../hooks/usePayrollCutoff'

export const CutoffCountdown: React.FC = () => {
  const { cutoff, timeRemaining, isWarningPeriod, isLocked } = usePayrollCutoff()

  // Format date readable
  const cutoffDate = cutoff?.cutoff_datetime
    ? new Date(cutoff.cutoff_datetime).toLocaleString('es-GT', {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : ''

  if (isLocked) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Candado Automático Activado
            </span>
            <h3 className="text-lg font-black mt-1">Período de Planilla Cerrado</h3>
            <p className="text-xs text-red-100">
              Corte vencido el {cutoffDate}. Cualquier ingreso tardío requiere{' '}
              <strong className="underline">Boleta de Excepción Fuera de Corte</strong>.
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs bg-white text-red-700 font-bold px-3 py-1.5 rounded-lg shadow-sm">
            Bloqueo de Carga Regular
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl p-5 shadow-sm border transition-all ${
        isWarningPeriod
          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400'
          : 'bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white border-blue-900'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-lg ${
              isWarningPeriod ? 'bg-white/20 text-white animate-bounce' : 'bg-blue-600 text-white'
            }`}
          >
            {isWarningPeriod ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isWarningPeriod ? 'bg-white/25 text-white' : 'bg-blue-800 text-blue-200'
                }`}
              >
                {isWarningPeriod ? 'Zona de Alerta - Cierre Inminente' : 'Pre-Cierre de Planilla'}
              </span>
              <span className="text-xs text-white/80">Límite: {cutoffDate}</span>
            </div>
            <h3 className="text-base font-bold mt-1">
              Cuenta Regresiva para Validación de Novedades
            </h3>
            <p className="text-xs text-white/70">
              Horas extras, justificaciones biométricas y bonos deben cerrarse antes del límite.
            </p>
          </div>
        </div>

        {/* Countdown Digits */}
        <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl backdrop-blur-sm self-stretch md:self-auto justify-center">
          <div className="text-center px-3 py-1 bg-white/10 rounded-lg min-w-[54px]">
            <span className="text-2xl font-black block leading-none">{timeRemaining.days}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/70">Días</span>
          </div>
          <span className="text-xl font-bold text-white/50">:</span>
          <div className="text-center px-3 py-1 bg-white/10 rounded-lg min-w-[54px]">
            <span className="text-2xl font-black block leading-none">
              {String(timeRemaining.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-white/70">Horas</span>
          </div>
          <span className="text-xl font-bold text-white/50">:</span>
          <div className="text-center px-3 py-1 bg-white/10 rounded-lg min-w-[54px]">
            <span className="text-2xl font-black block leading-none">
              {String(timeRemaining.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-white/70">Min</span>
          </div>
          <span className="text-xl font-bold text-white/50">:</span>
          <div className="text-center px-3 py-1 bg-white/10 rounded-lg min-w-[54px]">
            <span className="text-2xl font-black block leading-none text-amber-300">
              {String(timeRemaining.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-white/70">Seg</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CutoffCountdown

