import { ReactNode, memo } from 'react'
import Tooltip from '../ui/Tooltip'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        {trend && (
          <Tooltip content={trend.isPositive ? 'Indicador de crescimento' : 'Indicador de queda'} side="left">
            <span
              className={`text-xs font-bold ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
              aria-label={trend.isPositive ? `Cresceu ${Math.abs(trend.value)}%` : `Caiu ${Math.abs(trend.value)}%`}
              role="img"
            >
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
          </Tooltip>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

export default memo(StatCard)
