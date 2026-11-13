import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray'
  className?: string
}

const colorClasses: Record<string, string> = {
  green: 'bg-emerald-100 text-emerald-800',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
}

export default function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  )
}
