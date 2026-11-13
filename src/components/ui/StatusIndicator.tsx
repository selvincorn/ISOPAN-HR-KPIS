import { cn } from '../../lib/utils'

interface StatusIndicatorProps {
  status: 'green' | 'yellow' | 'red'
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const dotColors: Record<string, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
}

const sizeClasses: Record<string, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3.5 w-3.5',
  lg: 'h-5 w-5',
}

export default function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          'rounded-full ring-2 ring-white shadow-sm',
          dotColors[status],
          sizeClasses[size]
        )}
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </div>
  )
}
