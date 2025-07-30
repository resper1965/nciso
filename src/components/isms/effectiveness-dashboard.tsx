import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  BarChart3,
  Users,
  Clock
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { 
  ControlAssessment, 
  Control,
  EffectivenessSummary,
  calculateEffectivenessSummary,
  getEffectivenessColor,
  getEffectivenessLabel,
  isImprovementNeeded
} from '@/models/control-assessment'
import { EffectivenessBadge } from './effectiveness-badge'

// =====================================================
// TYPES
// =====================================================

export interface EffectivenessDashboardProps {
  assessments: ControlAssessment[]
  controls: Control[]
  onViewCritical?: () => void
  onViewImprovements?: () => void
  onViewHistory?: (controlId: string) => void
  className?: string
}

export interface DashboardMetric {
  title: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  color: string
  icon: React.ComponentType<any>
}

// =====================================================
// COMPONENT
// =====================================================

export const EffectivenessDashboard: React.FC<EffectivenessDashboardProps> = ({
  assessments,
  controls,
  onViewCritical,
  onViewImprovements,
  onViewHistory,
  className = ''
}) => {
  const { t } = useTranslation()
  
  // =====================================================
  // CALCULATIONS
  // =====================================================

  const summary = calculateEffectivenessSummary(assessments)
  
  const criticalControls = assessments.filter(a => a.score < 30)
  const improvementNeeded = assessments.filter(a => isImprovementNeeded(a.score))
  
  const averageChange = assessments.length > 0 
    ? assessments.reduce((sum, a) => {
        if (a.previous_score) {
          return sum + (a.score - a.previous_score)
        }
        return sum
      }, 0) / assessments.filter(a => a.previous_score).length
    : 0

  const recentAssessments = assessments
    .sort((a, b) => new Date(b.assessed_at).getTime() - new Date(a.assessed_at).getTime())
    .slice(0, 5)

  // =====================================================
  // METRICS
  // =====================================================

  const metrics: DashboardMetric[] = [
    {
      title: t('dashboard.overall_effectiveness'),
      value: summary.average_score,
      change: averageChange,
      trend: averageChange > 0 ? 'up' : averageChange < 0 ? 'down' : 'stable',
      color: getEffectivenessColor(summary.average_score),
      icon: Target
    },
    {
      title: t('dashboard.total_controls'),
      value: summary.total_controls,
      color: 'text-blue-600',
      icon: BarChart3
    },
    {
      title: t('dashboard.high_effectiveness'),
      value: summary.high_effectiveness,
      color: 'text-green-600',
      icon: CheckCircle
    },
    {
      title: t('dashboard.improvement_needed'),
      value: summary.improvement_needed,
      color: 'text-orange-600',
      icon: AlertTriangle
    }
  ]

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('dashboard.effectiveness_title')}
          </h2>
          <p className="text-gray-600">
            {t('dashboard.effectiveness_description')}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {criticalControls.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onViewCritical}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t('dashboard.view_critical')} ({criticalControls.length})
            </Button>
          )}
          
          {improvementNeeded.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewImprovements}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {t('dashboard.view_improvements')} ({improvementNeeded.length})
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value}
                  {metric.title.includes('effectiveness') && '%'}
                </div>
                
                {metric.change !== undefined && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                    {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                    <span>
                      {metric.change > 0 && '+'}
                      {metric.change.toFixed(1)}%
                    </span>
                    <span>{t('dashboard.from_last_month')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Effectiveness Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.effectiveness_distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">
                  {t('dashboard.high_effectiveness')} (≥80%)
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {summary.high_effectiveness}
                </Badge>
              </div>
              <Progress 
                value={(summary.high_effectiveness / summary.total_controls) * 100} 
                className="h-2"
                indicatorClassName="bg-green-500"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-600">
                  {t('dashboard.medium_effectiveness')} (50-79%)
                </span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {summary.medium_effectiveness}
                </Badge>
              </div>
              <Progress 
                value={(summary.medium_effectiveness / summary.total_controls) * 100} 
                className="h-2"
                indicatorClassName="bg-yellow-500"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-600">
                  {t('dashboard.low_effectiveness')} (30-49%)
                </span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {summary.low_effectiveness}
                </Badge>
              </div>
              <Progress 
                value={(summary.low_effectiveness / summary.total_controls) * 100} 
                className="h-2"
                indicatorClassName="bg-orange-500"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-600">
                  {t('dashboard.critical_effectiveness')} (&lt;30%)
                </span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {summary.critical_controls}
                </Badge>
              </div>
              <Progress 
                value={(summary.critical_controls / summary.total_controls) * 100} 
                className="h-2"
                indicatorClassName="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recent_assessments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssessments.map((assessment) => {
                const control = controls.find(c => c.id === assessment.control_id)
                
                return (
                  <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {control?.name || 'Unknown Control'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(assessment.assessed_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <EffectivenessBadge
                        score={assessment.score}
                        previousScore={assessment.previous_score}
                        showTrend={true}
                        size="sm"
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewHistory?.(assessment.control_id)}
                      >
                        <Clock className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              
              {recentAssessments.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm">{t('dashboard.no_recent_assessments')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Controls Alert */}
      {criticalControls.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {t('dashboard.critical_controls_alert')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                {t('dashboard.critical_controls_description', { count: criticalControls.length })}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criticalControls.slice(0, 4).map((assessment) => {
                  const control = controls.find(c => c.id === assessment.control_id)
                  
                  return (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {control?.name || 'Unknown Control'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(assessment.assessed_at), 'dd/MM/yyyy')}
                        </div>
                      </div>
                      
                      <EffectivenessBadge
                        score={assessment.score}
                        size="sm"
                      />
                    </div>
                  )
                })}
              </div>
              
              {criticalControls.length > 4 && (
                <div className="text-center">
                  <Button variant="outline" size="sm" onClick={onViewCritical}>
                    {t('dashboard.view_all_critical')} ({criticalControls.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// =====================================================
// COMPACT DASHBOARD
// =====================================================

export const CompactEffectivenessDashboard: React.FC<{
  assessments: ControlAssessment[]
  controls: Control[]
  className?: string
}> = ({ assessments, controls, className = '' }) => {
  const { t } = useTranslation()
  const summary = calculateEffectivenessSummary(assessments)
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.overall_effectiveness')}
              </p>
              <p className={`text-2xl font-bold ${getEffectivenessColor(summary.average_score)}`}>
                {summary.average_score}%
              </p>
            </div>
            <Target className={`w-8 h-8 ${getEffectivenessColor(summary.average_score)}`} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.total_controls')}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.total_controls}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.improvement_needed')}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {summary.improvement_needed}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================================
// HOOK
// =====================================================

export const useEffectivenessDashboard = () => {
  const getDashboardInsights = (assessments: ControlAssessment[]) => {
    const insights = []
    
    const criticalCount = assessments.filter(a => a.score < 30).length
    if (criticalCount > 0) {
      insights.push({
        type: 'critical',
        message: `${criticalCount} controles críticos precisam de atenção imediata`,
        priority: 'high'
      })
    }
    
    const improvementCount = assessments.filter(a => a.score < 50).length
    if (improvementCount > 0) {
      insights.push({
        type: 'improvement',
        message: `${improvementCount} controles precisam de melhorias`,
        priority: 'medium'
      })
    }
    
    const averageScore = assessments.length > 0 
      ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
      : 0
    
    if (averageScore >= 80) {
      insights.push({
        type: 'excellent',
        message: 'Efetividade geral excelente!',
        priority: 'low'
      })
    }
    
    return insights
  }
  
  return {
    getDashboardInsights
  }
} 