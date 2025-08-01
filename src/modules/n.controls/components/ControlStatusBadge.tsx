'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type ControlStatus = 'active' | 'inactive' | 'draft' | 'archived'

interface ControlStatusBadgeProps {
  status: ControlStatus
  className?: string
}

const statusConfig = {
  active: {
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200',
    icon: '🟢'
  },
  inactive: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200',
    icon: '⚪'
  },
  draft: {
    variant: 'outline' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
    icon: '🟡'
  },
  archived: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200',
    icon: '🔴'
  }
}

export function ControlStatusBadge({ status, className }: ControlStatusBadgeProps) {
  const { t } = useTranslation()
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium',
        config.className,
        className
      )}
      role="status"
      aria-label={t(`controls.status.${status}`)}
    >
      <span className="text-xs">{config.icon}</span>
      <span>{t(`controls.status.${status}`)}</span>
    </Badge>
  )
} 