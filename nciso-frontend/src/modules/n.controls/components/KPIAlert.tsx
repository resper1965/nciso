'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type AlertLevel = 'critical' | 'warning' | 'success' | 'info'

export interface KPIAlertProps {
  value: number
  threshold: number
  metric: string
  unit?: string
  className?: string
  showIcon?: boolean
  showBadge?: boolean
  showTooltip?: boolean
  position?: 'inline' | 'overlay'
  size?: 'sm' | 'md' | 'lg'
}

interface AlertConfig {
  level: AlertLevel
  color: string
  icon: React.ReactNode
  message: string
}

export function KPIAlert({
  value,
  threshold,
  metric,
  unit = '%',
  className = '',
  showIcon = true,
  showBadge = true,
  showTooltip = true,
  position = 'inline',
  size = 'md'
}: KPIAlertProps) {
  const { t } = useTranslation()

  // Calcular nível de alerta baseado no valor e threshold
  const getAlertConfig = (): AlertConfig => {
    const percentage = value
    const thresholdPercentage = threshold

    if (percentage < thresholdPercentage * 0.5) {
      return {
        level: 'critical',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300',
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        message: t('controls.kpi_alert.critical', { metric, threshold: thresholdPercentage })
      }
    } else if (percentage < thresholdPercentage * 0.8) {
      return {
        level: 'warning',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
        icon: <TrendingDown className="h-4 w-4 text-yellow-600" />,
        message: t('controls.kpi_alert.warning', { metric, threshold: thresholdPercentage })
      }
    } else if (percentage >= thresholdPercentage) {
      return {
        level: 'success',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        message: t('controls.kpi_alert.success', { metric, threshold: thresholdPercentage })
      }
    } else {
      return {
        level: 'info',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
        icon: <Info className="h-4 w-4 text-blue-600" />,
        message: t('controls.kpi_alert.info', { metric, threshold: thresholdPercentage })
      }
    }
  }

  const alertConfig = getAlertConfig()
  const isAlert = value < threshold

  // Se não há alerta e não deve mostrar sucesso, retorna null
  if (!isAlert && !showBadge) {
    return null
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const renderAlert = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0">
          {React.cloneElement(alertConfig.icon as React.ReactElement, {
            className: iconSizeClasses[size]
          })}
        </div>
      )}
      
      {showBadge && (
        <Badge 
          variant="outline" 
          className={`${alertConfig.color} ${sizeClasses[size]} font-medium`}
        >
          {value}{unit}
        </Badge>
      )}
    </div>
  )

  // Se não deve mostrar tooltip, retorna o alerta diretamente
  if (!showTooltip) {
    return renderAlert()
  }

  // Com tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {renderAlert()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium">
              {t(`controls.kpi_alert.${alertConfig.level}_title`)}
            </div>
            <div className="text-sm text-muted-foreground">
              {alertConfig.message}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('controls.kpi_alert.threshold_info', { 
                current: value, 
                threshold: threshold,
                unit 
              })}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Componente wrapper para métricas com alerta automático
interface KPIMetricProps {
  value: number
  threshold: number
  metric: string
  unit?: string
  className?: string
  children: React.ReactNode
}

export function KPIMetric({ 
  value, 
  threshold, 
  metric, 
  unit = '%', 
  className = '',
  children 
}: KPIMetricProps) {
  const isAlert = value < threshold

  return (
    <div className={`relative ${className}`}>
      {children}
      {isAlert && (
        <div className="absolute -top-2 -right-2">
          <KPIAlert
            value={value}
            threshold={threshold}
            metric={metric}
            unit={unit}
            showIcon={true}
            showBadge={false}
            showTooltip={true}
            size="sm"
          />
        </div>
      )}
    </div>
  )
}

// Hook para gerenciar alertas de KPI
export function useKPIAlerts() {
  const { t } = useTranslation()

  const getAlertLevel = (value: number, threshold: number): AlertLevel => {
    if (value < threshold * 0.5) return 'critical'
    if (value < threshold * 0.8) return 'warning'
    if (value >= threshold) return 'success'
    return 'info'
  }

  const getAlertMessage = (level: AlertLevel, metric: string, threshold: number) => {
    return t(`controls.kpi_alert.${level}`, { metric, threshold })
  }

  const shouldShowAlert = (value: number, threshold: number): boolean => {
    return value < threshold
  }

  return {
    getAlertLevel,
    getAlertMessage,
    shouldShowAlert
  }
} 