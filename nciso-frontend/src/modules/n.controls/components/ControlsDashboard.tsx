'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Target,
  Shield,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useCoverageDashboardStats } from '../hooks/useCoverageDashboardStats'
import { FiltersPanel } from './FiltersPanel'
import { KPIAlert, KPIMetric } from './KPIAlert'

interface ControlsDashboardProps {
  tenantId: string
  className?: string
  showFilters?: boolean
  refreshInterval?: number
}

export function ControlsDashboard({ 
  tenantId, 
  className,
  showFilters = true,
  refreshInterval = 30
}: ControlsDashboardProps) {
  const { t } = useTranslation()
  const {
    coverageData,
    summary,
    loading,
    error,
    hasData,
    refresh,
    getChartData,
    getTopFrameworks,
    getBottomFrameworks,
    getFrameworksWithoutCoverage,
    getFrameworksWithFullCoverage
  } = useCoverageDashboardStats({
    tenantId,
    filters: {}, // Os filtros agora vêm do FiltersPanel
    refreshInterval
  })

  const handleRefresh = async () => {
    await refresh()
  }

  const getStatusColor = (coverage: number) => {
    if (coverage >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (coverage >= 75) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (coverage >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    if (coverage >= 25) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const getStatusIcon = (coverage: number) => {
    if (coverage >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (coverage >= 75) return <TrendingUp className="h-4 w-4 text-blue-600" />
    if (coverage >= 50) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t('controls.dashboard.error_title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('controls.dashboard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('controls.dashboard.no_data')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header com filtros e refresh */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            {t('controls.dashboard.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('controls.dashboard.subtitle')}
          </p>
        </div>
        
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Filtros Dinâmicos */}
      {showFilters && (
        <div className="mb-6">
          <FiltersPanel 
            layout="inline"
            showClearButton={true}
            showFilterCount={true}
            collapsible={true}
          />
        </div>
      )}

      {/* KPIs */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                {t('controls.dashboard.kpis.frameworks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_frameworks}</div>
              <p className="text-xs text-muted-foreground">
                {t('controls.dashboard.kpis.frameworks_description')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('controls.dashboard.kpis.controls')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_controls}</div>
              <p className="text-xs text-muted-foreground">
                {t('controls.dashboard.kpis.controls_description')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('controls.dashboard.kpis.mapped')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_mapped}</div>
              <p className="text-xs text-muted-foreground">
                {t('controls.dashboard.kpis.mapped_description')}
              </p>
            </CardContent>
          </Card>

          <KPIMetric
            value={summary.average_coverage}
            threshold={75}
            metric={t('controls.dashboard.kpis.coverage')}
            unit="%"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {t('controls.dashboard.kpis.coverage')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.average_coverage}%</div>
                <p className="text-xs text-muted-foreground">
                  {t('controls.dashboard.kpis.coverage_description')}
                </p>
              </CardContent>
            </Card>
          </KPIMetric>
        </div>
      )}

      {/* Gráfico de Cobertura */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('controls.dashboard.chart.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coverageData.map((framework) => (
              <div key={framework.framework_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(framework.coverage_percentage)}
                    <span className="font-medium">{framework.framework_name}</span>
                    <Badge variant="outline" className="text-xs">
                      v{framework.framework_version}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {framework.mapped_controls}/{framework.total_controls}
                    </span>
                    <KPIAlert
                      value={framework.coverage_percentage}
                      threshold={80}
                      metric={framework.framework_name}
                      unit="%"
                      showIcon={false}
                      showBadge={true}
                      showTooltip={true}
                      size="sm"
                    />
                  </div>
                </div>
                <Progress value={framework.coverage_percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Frameworks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {t('controls.dashboard.rankings.top')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopFrameworks(3).map((framework, index) => (
                <div key={framework.framework_id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{framework.framework_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {framework.mapped_controls}/{framework.total_controls} controles
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {framework.coverage_percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Frameworks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {t('controls.dashboard.rankings.bottom')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getBottomFrameworks(3).map((framework, index) => (
                <div key={framework.framework_id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{framework.framework_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {framework.mapped_controls}/{framework.total_controls} controles
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    {framework.coverage_percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(getFrameworksWithoutCoverage().length > 0 || getFrameworksWithFullCoverage().length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('controls.dashboard.alerts.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getFrameworksWithoutCoverage().length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">
                    {t('controls.dashboard.alerts.no_coverage', { 
                      count: getFrameworksWithoutCoverage().length 
                    })}
                  </span>
                </div>
              )}
              
              {getFrameworksWithFullCoverage().length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {t('controls.dashboard.alerts.full_coverage', { 
                      count: getFrameworksWithFullCoverage().length 
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 