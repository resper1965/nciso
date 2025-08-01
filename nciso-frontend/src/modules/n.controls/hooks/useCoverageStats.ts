import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface CoverageData {
  framework_id: string
  framework_name: string
  framework_version: string
  total_controls: number
  mapped_controls: number
  coverage_percentage: number
  unmapped_controls: number
}

interface CoverageSummary {
  total_frameworks: number
  total_controls: number
  total_mapped: number
  average_coverage: number
}

interface CoverageFilters {
  domain?: string
  type?: string
  framework?: string
}

interface UseCoverageStatsProps {
  tenantId: string
  filters?: CoverageFilters
}

export function useCoverageStats({ tenantId, filters = {} }: UseCoverageStatsProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [coverageData, setCoverageData] = useState<CoverageData[]>([])
  const [summary, setSummary] = useState<CoverageSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados de cobertura
  const loadCoverageData = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)

      // Chamar função SQL para obter dados de cobertura
      const { data, error } = await supabase
        .rpc('get_control_framework_coverage', {
          p_tenant_id: tenantId,
          p_domain_filter: filters.domain || null,
          p_type_filter: filters.type || null,
          p_framework_filter: filters.framework || null
        })

      if (error) throw error

      // Processar dados
      const processedData = data?.map(item => ({
        framework_id: item.framework_id,
        framework_name: item.framework_name,
        framework_version: item.framework_version,
        total_controls: parseInt(item.total_controls) || 0,
        mapped_controls: parseInt(item.mapped_controls) || 0,
        coverage_percentage: parseFloat(item.coverage_percentage) || 0,
        unmapped_controls: parseInt(item.total_controls) - parseInt(item.mapped_controls) || 0
      })) || []

      setCoverageData(processedData)

      // Calcular estatísticas gerais
      const totalFrameworks = processedData.length
      const totalControls = processedData.reduce((sum, item) => sum + item.total_controls, 0)
      const totalMapped = processedData.reduce((sum, item) => sum + item.mapped_controls, 0)
      const averageCoverage = totalControls > 0 ? (totalMapped / totalControls) * 100 : 0

      setSummary({
        total_frameworks: totalFrameworks,
        total_controls: totalControls,
        total_mapped: totalMapped,
        average_coverage: Math.round(averageCoverage * 100) / 100
      })

    } catch (error) {
      console.error('Error loading coverage data:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_loading_coverage'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [tenantId, filters, t, toast])

  // Carregar dados quando tenantId ou filtros mudarem
  useEffect(() => {
    loadCoverageData()
  }, [loadCoverageData])

  // Obter dados para gráficos
  const getChartData = useCallback(() => {
    return coverageData.map(item => ({
      name: item.framework_name,
      total: item.total_controls,
      mapped: item.mapped_controls,
      unmapped: item.unmapped_controls,
      coverage: item.coverage_percentage,
      version: item.framework_version
    }))
  }, [coverageData])

  // Obter dados para gráfico de pizza
  const getPieChartData = useCallback(() => {
    return coverageData.map(item => ({
      name: item.framework_name,
      value: item.mapped_controls,
      coverage: item.coverage_percentage
    }))
  }, [coverageData])

  // Obter frameworks com melhor cobertura
  const getTopFrameworks = useCallback((limit = 5) => {
    return coverageData
      .sort((a, b) => b.coverage_percentage - a.coverage_percentage)
      .slice(0, limit)
  }, [coverageData])

  // Obter frameworks com pior cobertura
  const getBottomFrameworks = useCallback((limit = 5) => {
    return coverageData
      .sort((a, b) => a.coverage_percentage - b.coverage_percentage)
      .slice(0, limit)
  }, [coverageData])

  // Obter frameworks sem cobertura
  const getFrameworksWithoutCoverage = useCallback(() => {
    return coverageData.filter(item => item.mapped_controls === 0)
  }, [coverageData])

  // Obter frameworks com cobertura completa
  const getFrameworksWithFullCoverage = useCallback(() => {
    return coverageData.filter(item => item.coverage_percentage === 100)
  }, [coverageData])

  // Verificar se há dados
  const hasData = coverageData.length > 0

  // Obter estatísticas de cores para gráficos
  const getColorForCoverage = useCallback((coverage: number) => {
    if (coverage >= 80) return '#10b981' // Verde
    if (coverage >= 60) return '#f59e0b' // Amarelo
    if (coverage >= 40) return '#f97316' // Laranja
    return '#ef4444' // Vermelho
  }, [])

  // Obter insights baseados nos dados
  const getInsights = useCallback(() => {
    if (!summary || coverageData.length === 0) return []

    const insights = []

    // Insight sobre cobertura geral
    if (summary.average_coverage < 50) {
      insights.push({
        type: 'warning',
        message: t('controls.coverage.insights.low_coverage', { 
          percentage: summary.average_coverage 
        })
      })
    } else if (summary.average_coverage >= 80) {
      insights.push({
        type: 'success',
        message: t('controls.coverage.insights.good_coverage', { 
          percentage: summary.average_coverage 
        })
      })
    }

    // Insight sobre frameworks sem cobertura
    const frameworksWithoutCoverage = getFrameworksWithoutCoverage()
    if (frameworksWithoutCoverage.length > 0) {
      insights.push({
        type: 'info',
        message: t('controls.coverage.insights.frameworks_without_coverage', { 
          count: frameworksWithoutCoverage.length 
        })
      })
    }

    // Insight sobre frameworks com cobertura completa
    const frameworksWithFullCoverage = getFrameworksWithFullCoverage()
    if (frameworksWithFullCoverage.length > 0) {
      insights.push({
        type: 'success',
        message: t('controls.coverage.insights.frameworks_full_coverage', { 
          count: frameworksWithFullCoverage.length 
        })
      })
    }

    return insights
  }, [summary, coverageData, getFrameworksWithoutCoverage, getFrameworksWithFullCoverage, t])

  return {
    coverageData,
    summary,
    loading,
    error,
    hasData,
    getChartData,
    getPieChartData,
    getTopFrameworks,
    getBottomFrameworks,
    getFrameworksWithoutCoverage,
    getFrameworksWithFullCoverage,
    getColorForCoverage,
    getInsights,
    refresh: loadCoverageData
  }
} 