'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { useCoverageStats } from '../hooks/useCoverageStats'

interface FrameworkCoverageChartProps {
  tenantId: string
  className?: string
  showFilters?: boolean
  chartType?: 'bar' | 'pie' | 'line'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function FrameworkCoverageChart({ 
  tenantId, 
  className,
  showFilters = true,
  chartType = 'bar'
}: FrameworkCoverageChartProps) {
  const { t } = useTranslation()
  const [selectedChartType, setSelectedChartType] = useState(chartType)
  const [filters, setFilters] = useState({
    domain: '',
    type: '',
    framework: ''
  })

  const {
    coverageData,
    summary,
    loading,
    error,
    hasData,
    getChartData,
    getPieChartData,
    getTopFrameworks,
    getBottomFrameworks,
    getColorForCoverage,
    getInsights,
    refresh
  } = useCoverageStats({ tenantId, filters })

  const chartData = getChartData()
  const pieData = getPieChartData()
  const insights = getInsights()
  const topFrameworks = getTopFrameworks(3)
  const bottomFrameworks = getBottomFrameworks(3)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {t('controls.coverage.tooltip.total')}: {data.total}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('controls.coverage.tooltip.mapped')}: {data.mapped}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('controls.coverage.tooltip.coverage')}: {data.coverage}%
          </p>
          {data.version && (
            <p className="text-sm text-muted-foreground">
              {t('controls.coverage.tooltip.version')}: {data.version}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('controls.coverage.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('controls.coverage.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400">
              {t('controls.messages.error_loading_coverage')}
            </p>
            <Button 
              variant="outline" 
              onClick={refresh}
              className="mt-4"
            >
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
            <BarChart3 className="h-5 w-5" />
            {t('controls.coverage.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('controls.coverage.no_data')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('controls.coverage.title')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showFilters && (
              <Select value={filters.domain} onValueChange={(value) => handleFilterChange('domain', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('controls.filters.all_domains')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('controls.filters.all_domains')}</SelectItem>
                  <SelectItem value="access_control">{t('controls.domains.access_control')}</SelectItem>
                  <SelectItem value="asset_management">{t('controls.domains.asset_management')}</SelectItem>
                  <SelectItem value="business_continuity">{t('controls.domains.business_continuity')}</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={selectedChartType} onValueChange={setSelectedChartType}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t('controls.coverage.chart_types.bar')}
                </SelectItem>
                <SelectItem value="pie">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  {t('controls.coverage.chart_types.pie')}
                </SelectItem>
                <SelectItem value="line">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t('controls.coverage.chart_types.line')}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estatísticas Gerais */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.total_frameworks}</div>
              <div className="text-sm text-blue-600">{t('controls.coverage.stats.frameworks')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.total_controls}</div>
              <div className="text-sm text-green-600">{t('controls.coverage.stats.controls')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{summary.total_mapped}</div>
              <div className="text-sm text-purple-600">{t('controls.coverage.stats.mapped')}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{summary.average_coverage}%</div>
              <div className="text-sm text-orange-600">{t('controls.coverage.stats.coverage')}</div>
            </div>
          </div>
        )}

        {/* Gráfico */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedChartType === 'bar' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="mapped" 
                  fill="#10b981" 
                  name={t('controls.coverage.chart.mapped')}
                />
                <Bar 
                  dataKey="unmapped" 
                  fill="#ef4444" 
                  name={t('controls.coverage.chart.unmapped')}
                />
              </BarChart>
            )}
            
            {selectedChartType === 'pie' && (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, coverage }) => `${name}: ${coverage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColorForCoverage(entry.coverage)} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
            
            {selectedChartType === 'line' && (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="coverage" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name={t('controls.coverage.chart.coverage_percentage')}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">{t('controls.coverage.insights.title')}</h4>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    insight.type === 'success' ? 'bg-green-50 dark:bg-green-950' :
                    insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950' :
                    'bg-blue-50 dark:bg-blue-950'
                  }`}
                >
                  {insight.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  {insight.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                  <span className="text-sm">{insight.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top e Bottom Frameworks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-3">{t('controls.coverage.top_frameworks')}</h4>
            <div className="space-y-2">
              {topFrameworks.map((framework, index) => (
                <div key={framework.framework_id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                  <span className="text-sm font-medium">{framework.framework_name}</span>
                  <Badge variant="secondary">{framework.coverage_percentage}%</Badge>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">{t('controls.coverage.bottom_frameworks')}</h4>
            <div className="space-y-2">
              {bottomFrameworks.map((framework, index) => (
                <div key={framework.framework_id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
                  <span className="text-sm font-medium">{framework.framework_name}</span>
                  <Badge variant="destructive">{framework.coverage_percentage}%</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 