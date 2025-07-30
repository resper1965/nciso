import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { 
  getEffectivenessColor, 
  getEffectivenessBgColor, 
  getEffectivenessLabel,
  getEffectivenessIcon,
  calculateTrend
} from '@/models/control-assessment'

// =====================================================
// TYPES
// =====================================================

export interface EffectivenessBadgeProps {
  score: number
  previousScore?: number
  showTrend?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

// =====================================================
// COMPONENT
// =====================================================

export const EffectivenessBadge: React.FC<EffectivenessBadgeProps> = ({
  score,
  previousScore,
  showTrend = true,
  showIcon = true,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const { t } = useTranslation()
  const trend = calculateTrend(score, previousScore)
  const Icon = getEffectivenessIcon(score)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Main Badge */}
      <Badge
        variant={variant}
        className={`
          ${sizeClasses[size]}
          ${getEffectivenessBgColor(score)}
          ${getEffectivenessColor(score)}
          font-medium
        `}
      >
        {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
        {score}%
        <span className="ml-1 opacity-75">
          ({getEffectivenessLabel(score)})
        </span>
      </Badge>

      {/* Trend Indicator */}
      {showTrend && trend && (
        <div className={`flex items-center space-x-1 ${trend.color}`}>
          {trend.direction === 'up' && <TrendingUp className={`${iconSizes[size]}`} />}
          {trend.direction === 'down' && <TrendingDown className={`${iconSizes[size]}`} />}
          {trend.direction === 'stable' && <Minus className={`${iconSizes[size]}`} />}
          
          {trend.percentage > 0 && (
            <span className={`text-xs ${trend.color}`}>
              {trend.direction === 'up' && '+'}
              {trend.direction === 'down' && '-'}
              {trend.percentage}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// =====================================================
// COMPACT VERSION
// =====================================================

export const CompactEffectivenessBadge: React.FC<{
  score: number
  className?: string
}> = ({ score, className = '' }) => {
  const Icon = getEffectivenessIcon(score)
  
  return (
    <Badge
      variant="outline"
      className={`
        text-xs px-2 py-1
        ${getEffectivenessBgColor(score)}
        ${getEffectivenessColor(score)}
        ${className}
      `}
    >
      <Icon className="w-3 h-3 mr-1" />
      {score}%
    </Badge>
  )
}

// =====================================================
// CRITICAL ALERT BADGE
// =====================================================

export const CriticalEffectivenessBadge: React.FC<{
  score: number
  className?: string
}> = ({ score, className = '' }) => {
  const { t } = useTranslation()
  const isCritical = score < 30
  const isLow = score < 50
  
  if (!isLow) return null
  
  return (
    <Badge
      variant="destructive"
      className={`text-xs px-2 py-1 font-medium ${className}`}
    >
      <AlertTriangle className="w-3 h-3 mr-1" />
      {isCritical 
        ? t('assessment.alerts.critical_control')
        : t('assessment.alerts.low_effectiveness')
      }
    </Badge>
  )
}

// =====================================================
// IMPROVEMENT NEEDED BADGE
// =====================================================

export const ImprovementNeededBadge: React.FC<{
  score: number
  className?: string
}> = ({ score, className = '' }) => {
  const { t } = useTranslation()
  const needsImprovement = score < 50
  
  if (!needsImprovement) return null
  
  return (
    <Badge
      variant="outline"
      className={`text-xs px-2 py-1 border-orange-300 text-orange-700 bg-orange-50 ${className}`}
    >
      <AlertTriangle className="w-3 h-3 mr-1" />
      {t('assessment.alerts.improvement_needed')}
    </Badge>
  )
}

// =====================================================
// EFFECTIVENESS RANGE BADGE
// =====================================================

export const EffectivenessRangeBadge: React.FC<{
  minScore: number
  maxScore: number
  className?: string
}> = ({ minScore, maxScore, className = '' }) => {
  const { t } = useTranslation()
  const averageScore = Math.round((minScore + maxScore) / 2)
  const range = maxScore - minScore
  
  const getRangeColor = () => {
    if (averageScore >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (averageScore >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (averageScore >= 40) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }
  
  return (
    <Badge
      variant="outline"
      className={`text-xs px-2 py-1 ${getRangeColor()} ${className}`}
    >
      {minScore}-{maxScore}%
      {range > 20 && (
        <span className="ml-1 opacity-75">
          ({t('assessment.range_high_variance')})
        </span>
      )}
    </Badge>
  )
}

// =====================================================
// HOOK
// =====================================================

export const useEffectivenessBadge = () => {
  const getScoreLevel = (score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' => {
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 70) return 'fair'
    if (score >= 50) return 'poor'
    return 'critical'
  }
  
  const getScoreColor = (score: number): string => {
    const level = getScoreLevel(score)
    const colors = {
      excellent: 'text-green-600',
      good: 'text-green-600',
      fair: 'text-yellow-600',
      poor: 'text-orange-600',
      critical: 'text-red-600'
    }
    return colors[level]
  }
  
  const getScoreBgColor = (score: number): string => {
    const level = getScoreLevel(score)
    const colors = {
      excellent: 'bg-green-100',
      good: 'bg-green-100',
      fair: 'bg-yellow-100',
      poor: 'bg-orange-100',
      critical: 'bg-red-100'
    }
    return colors[level]
  }
  
  const isCritical = (score: number): boolean => {
    return score < 30
  }
  
  const needsImprovement = (score: number): boolean => {
    return score < 50
  }
  
  const isExcellent = (score: number): boolean => {
    return score >= 90
  }
  
  return {
    getScoreLevel,
    getScoreColor,
    getScoreBgColor,
    isCritical,
    needsImprovement,
    isExcellent
  }
} 