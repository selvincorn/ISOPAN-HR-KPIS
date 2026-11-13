import React from 'react'
import { Trophy, Award, Medal, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import type { SupervisorRankingItem } from '../../hooks/useSupervisorData'
import StatusBadge from '../dashboard/StatusBadge'

interface SupervisorRankingProps {
  ranking: SupervisorRankingItem[]
}

export const SupervisorRanking: React.FC<SupervisorRankingProps> = ({ ranking }) => {
  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-500" />
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />
    if (index === 2) return <Award className="w-5 h-5 text-amber-700" />
    return (
      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center">
        {index + 1}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-base">
            Ranking Predictivo de Cumplimiento de Jefes Inmediatos
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Leading Indicators: Cierre antes de corte, justificación biométrica &lt; 24h y respuesta a entrevistas.
          </p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
          Período Noviembre 2026
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3 px-4 text-center w-12">Pos.</th>
              <th className="py-3 px-4">Líder de Área</th>
              <th className="py-3 px-4">Departamento</th>
              <th className="py-3 px-4 text-center">Cierre a Corte (100%)</th>
              <th className="py-3 px-4 text-center">Biométrico &lt; 24h (100%)</th>
              <th className="py-3 px-4 text-center">Resp. Entrevistas</th>
              <th className="py-3 px-4 text-center">Avance Eval.</th>
              <th className="py-3 px-4 text-center font-bold">Puntaje Global</th>
              <th className="py-3 px-4 text-center">Semáforo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ranking.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="py-3.5 px-4 text-center">
                  <div className="flex justify-center">{getMedalIcon(index)}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-900">
                  {item.supervisor_name}
                </td>
                <td className="py-3.5 px-4 text-gray-600">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    {item.department_name}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-medium">
                  <span
                    className={
                      item.payroll_closure_pct >= 95
                        ? 'text-emerald-600 font-bold'
                        : item.payroll_closure_pct >= 80
                        ? 'text-amber-600 font-semibold'
                        : 'text-red-600 font-bold'
                    }
                  >
                    {item.payroll_closure_pct}%
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-medium">
                  <span
                    className={
                      item.biometric_justification_pct >= 90
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }
                  >
                    {item.biometric_justification_pct}%
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center text-gray-600">
                  {item.interview_response_days ? `${item.interview_response_days} d` : '—'}
                </td>
                <td className="py-3.5 px-4 text-center text-gray-600">
                  {item.evaluation_progress_pct}%
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg text-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    {item.overall_score} pts
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SupervisorRanking

