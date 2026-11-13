import React from 'react'
import type { KPIStatusKey } from '../../lib/constants'
import { getStatusColor, getStatusLabel } from '../../lib/utils'

interface StatusBadgeProps {
  status: KPIStatusKey | string
  className?: string
  showText?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showText = true,
}) => {
  const validStatus: KPIStatusKey =
    status === 'green' || status === 'yellow' || status === 'red' ? status : 'green'

  const colors = getStatusColor(validStatus)
  const label = getStatusLabel(validStatus)

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
      {showText && <span>{label}</span>}
    </span>
  )
}

export default StatusBadge

