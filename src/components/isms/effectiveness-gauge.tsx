import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

// =====================================================
// TYPES
// =====================================================

export interface EffectivenessGaugeProps {
  score: number
  previousScore?: number
  target?: number
  size?: 'sm' | 'md' | 'lg'
  showTrend?: boolean
  showTarget?: boolean
  className?: string
}

export interface EffectivenessTrend {
  direction: 'up' | 'down' | 'stable'
  percentage: number
  color: string
}

// =====================================================
// UTILITIES
// =====================================================

export const getEffectivenessColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export const getEffectivenessBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-100'
  if (score >= 60) return 'bg-yellow-100'
  if (score >= 40) return 'bg-orange-100'
  return 'bg-red-100'
}

export const getEffectivenessLabel = (score: number): string => {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Good'
  if (score >= 70) return 'Fair'
  if (score >= 60) return 'Needs Improvement'
  if (score >= 40) return 'Poor'
  return 'Critical'
}

export const calculateTrend = (current: number, previous?: number): EffectivenessTrend | null => {
  if (!previous) return null
  
  const difference = current - previous
  const percentage = Math.abs((difference / previous) * 100)
  
  if (Math.abs(difference) < 1) {
    return {
      direction: 'stable',
      percentage: 0,
      color: 'text-gray-500'
    }
  }
  
  return {
    direction: difference > 0 ? 'up' : 'down',
    percentage: Math.round(percentage),
    color: difference > 0 ? 'text-green-600' : 'text-red-600'
  }
}

// =====================================================
// COMPONENT
// =====================================================

export const EffectivenessGauge: React.FC<EffectivenessGaugeProps> = ({
  score,
  previousScore,
  target = 80,
  size = 'md',
  showTrend = true,
  showTarget = true,
  className = ''
}) => {
  const { t } = useTranslation()
  const trend = calculateTrend(score, previousScore)
  
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  }
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">
          {t('control.effectiveness.title')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Gauge */}
        <div className="flex items-center justify-center">
          <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
            {/* Circular Progress */}
            <div className="absolute inset-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 283} 283`}
                  className={getEffectivenessColor(score)}
                />
              </svg>
            </div>
            
            {/* Score Text */}
            <div className="relative text-center">
              <div className={`font-bold ${textSizes[size]} ${getEffectivenessColor(score)}`}>
                {score}%
              </div>
              <div className="text-xs text-gray-500">
                {getEffectivenessLabel(score)}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('control.effectiveness.current')}</span>
            <span className="font-medium">{score}%</span>
          </div>
          <Progress 
            value={score} 
            className="h-2"
            indicatorClassName={getEffectivenessBgColor(score).replace('bg-', 'bg-')}
          />
        </div>

        {/* Target Progress */}
        {showTarget && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('control.effectiveness.target')}</span>
              <span className="font-medium">{target}%</span>
            </div>
            <Progress 
              value={target} 
              className="h-2 bg-gray-200"
              indicatorClassName="bg-gray-400"
            />
          </div>
        )}

        {/* Trend Indicator */}
        {showTrend && trend && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {t('control.effectiveness.trend')}
            </span>
            
            <div className="flex items-center space-x-2">
              {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
              {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
              {trend.direction === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
              
              <Badge 
                variant="outline" 
                className={`text-xs ${trend.color}`}
              >
                {trend.direction === 'up' && '+'}
                {trend.direction === 'down' && '-'}
                {trend.percentage}%
              </Badge>
            </div>
          </div>
        )}

        {/* Previous Score */}
        {previousScore !== undefined && (
          <div className="text-xs text-gray-500 text-center">
            {t('control.effectiveness.previous_score', { score: previousScore })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =====================================================
// COMPACT VERSION
// =====================================================

export const CompactEffectivenessGauge: React.FC<{
  score: number
  className?: string
}> = ({ score, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative w-8 h-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 251} 251`}
            className={getEffectivenessColor(score)}
          />
        </svg>
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Effectiveness</span>
          <span className={`font-medium ${getEffectivenessColor(score)}`}>
            {score}%
          </span>
        </div>
        <Progress 
          value={score} 
          className="h-1 mt-1"
          indicatorClassName={getEffectivenessBgColor(score).replace('bg-', 'bg-')}
        />
      </div>
    </div>
  )
}

// =====================================================
// HOOK
// =====================================================

export const useEffectivenessGauge = () => {
  const calculateEffectiveness = (metrics: {
    implementation: number
    testing: number
    monitoring: number
    documentation: number
  }) => {
    const weights = {
      implementation: 0.4,
      testing: 0.3,
      monitoring: 0.2,
      documentation: 0.1
    }
    
    return Math.round(
      metrics.implementation * weights.implementation +
      metrics.testing * weights.testing +
      metrics.monitoring * weights.monitoring +
      metrics.documentation * weights.documentation
    )
  }

  const getEffectivenessRecommendations = (score: number): string[] => {
    const recommendations = []
    
    if (score < 40) {
      recommendations.push('Implement basic controls immediately')
      recommendations.push('Conduct risk assessment')
      recommendations.push('Define control objectives')
    } else if (score < 60) {
      recommendations.push('Improve control implementation')
      recommendations.push('Enhance monitoring capabilities')
      recommendations.push('Update documentation')
    } else if (score < 80) {
      recommendations.push('Optimize control effectiveness')
      recommendations.push('Implement continuous monitoring')
      recommendations.push('Regular effectiveness assessments')
    } else {
      recommendations.push('Maintain current performance')
      recommendations.push('Consider advanced controls')
      recommendations.push('Share best practices')
    }
    
    return recommendations
  }

  return {
    calculateEffectiveness,
    getEffectivenessRecommendations,
    getEffectivenessColor,
    getEffectivenessLabel
  }
} 