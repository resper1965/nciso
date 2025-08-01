'use client'

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
}

interface CoverageSummary {
  total_frameworks: number
  total_controls: number
  total_mapped: number
  average_coverage: number
  frameworks_with_full_coverage: number
  frameworks_without_coverage: number
}

interface UseCoverageDashboardStatsProps {
  tenantId: string
  filters?: {
    domain?: string
    type?: string
    framework?: string
  }
  refreshInterval?: number // em segundos
}

interface UseCoverageDashboardStatsReturn {
  coverageData: CoverageData[]
  summary: CoverageSummary | null
  loading: boolean
  error: string | null
  hasData: boolean
  refresh: () => Promise<void>
  getChartData: () => Array<{
    name: string
    mapped: number
    gaps: number
    coverage: number
  }>
  getTopFrameworks: (limit?: number) => CoverageData[]
  getBottomFrameworks: (limit?: number) => CoverageData[]
  getFrameworksWithoutCoverage: () => CoverageData[]
  getFrameworksWithFullCoverage: () => CoverageData[]
}

export function useCoverageDashboardStats({
  tenantId,
  filters = {},
  refreshInterval = 30
}: UseCoverageDashboardStatsProps): UseCoverageDashboardStatsReturn {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [coverageData, setCoverageData] = useState<CoverageData[]>([])
  const [summary, setSummary] = useState<CoverageSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Função para carregar dados de cobertura via MCP
  const loadCoverageData = useCallback(async () => {
    if (!tenantId) {
      setError(t('controls.coverage.error_no_tenant'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Chamada para o comando MCP get_coverage_report via Supabase RPC
      const { data, error: rpcError } = await supabase
        .rpc('get_control_framework_coverage', {
          p_tenant_id: tenantId,
          p_domain_filter: filters.domain || null,
          p_type_filter: filters.type || null,
          p_framework_filter: filters.framework || null
        })

      if (rpcError) {
        console.error('❌ Erro na chamada MCP get_coverage_report:', rpcError)
        
        // Fallback para dados simulados em caso de erro
        const mockData = generateMockCoverageData()
        setCoverageData(mockData)
        setSummary(calculateSummary(mockData))
        
        toast({
          title: t('controls.coverage.error_loading'),
          description: t('controls.coverage.using_mock_data'),
          variant: 'destructive'
        })
        
        return
      }

      if (!data || data.length === 0) {
        setCoverageData([])
        setSummary({
          total_frameworks: 0,
          total_controls: 0,
          total_mapped: 0,
          average_coverage: 0,
          frameworks_with_full_coverage: 0,
          frameworks_without_coverage: 0
        })
        return
      }

      // Processar dados retornados pelo MCP
      const processedData: CoverageData[] = data.map((item: any) => ({
        framework_id: item.framework_id,
        framework_name: item.framework_name,
        framework_version: item.framework_version,
        total_controls: item.total_controls,
        mapped_controls: item.mapped_controls,
        coverage_percentage: item.coverage_percentage
      }))

      setCoverageData(processedData)
      setSummary(calculateSummary(processedData))
      setLastRefresh(new Date())

      // Log silencioso para debug
      console.log('✅ Dados de cobertura carregados via MCP:', {
        tenantId,
        frameworks: processedData.length,
        totalControls: processedData.reduce((sum, item) => sum + item.total_controls, 0),
        averageCoverage: calculateSummary(processedData).average_coverage
      })

    } catch (error) {
      console.error('❌ Erro ao carregar dados de cobertura:', error)
      
      // Fallback para dados simulados
      const mockData = generateMockCoverageData()
      setCoverageData(mockData)
      setSummary(calculateSummary(mockData))
      setError(t('controls.coverage.error_loading'))
      
      toast({
        title: t('controls.coverage.error_loading'),
        description: t('controls.coverage.using_mock_data'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [tenantId, filters, t, toast])

  // Carregar dados iniciais
  useEffect(() => {
    loadCoverageData()
  }, [loadCoverageData])

  // Configurar refresh automático
  useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(() => {
      loadCoverageData()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [refreshInterval, loadCoverageData])

  // Função para gerar dados simulados como fallback
  const generateMockCoverageData = (): CoverageData[] => {
    return [
      {
        framework_id: 'iso-27001',
        framework_name: 'ISO 27001',
        framework_version: '2022',
        total_controls: 120,
        mapped_controls: 90,
        coverage_percentage: 75.0
      },
      {
        framework_id: 'nist-csf',
        framework_name: 'NIST CSF',
        framework_version: '2.0',
        total_controls: 100,
        mapped_controls: 95,
        coverage_percentage: 95.0
      },
      {
        framework_id: 'cobit',
        framework_name: 'COBIT',
        framework_version: '2019',
        total_controls: 80,
        mapped_controls: 60,
        coverage_percentage: 75.0
      },
      {
        framework_id: 'pci-dss',
        framework_name: 'PCI DSS',
        framework_version: '4.0',
        total_controls: 50,
        mapped_controls: 35,
        coverage_percentage: 70.0
      }
    ]
  }

  // Função para calcular resumo dos dados
  const calculateSummary = (data: CoverageData[]): CoverageSummary => {
    if (data.length === 0) {
      return {
        total_frameworks: 0,
        total_controls: 0,
        total_mapped: 0,
        average_coverage: 0,
        frameworks_with_full_coverage: 0,
        frameworks_without_coverage: 0
      }
    }

    const totalControls = data.reduce((sum, item) => sum + item.total_controls, 0)
    const totalMapped = data.reduce((sum, item) => sum + item.mapped_controls, 0)
    const averageCoverage = data.reduce((sum, item) => sum + item.coverage_percentage, 0) / data.length
    const frameworksWithFullCoverage = data.filter(item => item.coverage_percentage >= 100).length
    const frameworksWithoutCoverage = data.filter(item => item.coverage_percentage === 0).length

    return {
      total_frameworks: data.length,
      total_controls: totalControls,
      total_mapped: totalMapped,
      average_coverage: Math.round(averageCoverage * 100) / 100,
      frameworks_with_full_coverage: frameworksWithFullCoverage,
      frameworks_without_coverage: frameworksWithoutCoverage
    }
  }

  // Função para obter dados formatados para gráficos
  const getChartData = () => {
    return coverageData.map(item => ({
      name: item.framework_name,
      mapped: item.mapped_controls,
      gaps: item.total_controls - item.mapped_controls,
      coverage: item.coverage_percentage
    }))
  }

  // Função para obter frameworks com melhor cobertura
  const getTopFrameworks = (limit = 3) => {
    return [...coverageData]
      .sort((a, b) => b.coverage_percentage - a.coverage_percentage)
      .slice(0, limit)
  }

  // Função para obter frameworks com pior cobertura
  const getBottomFrameworks = (limit = 3) => {
    return [...coverageData]
      .sort((a, b) => a.coverage_percentage - b.coverage_percentage)
      .slice(0, limit)
  }

  // Função para obter frameworks sem cobertura
  const getFrameworksWithoutCoverage = () => {
    return coverageData.filter(item => item.coverage_percentage === 0)
  }

  // Função para obter frameworks com cobertura completa
  const getFrameworksWithFullCoverage = () => {
    return coverageData.filter(item => item.coverage_percentage >= 100)
  }

  return {
    coverageData,
    summary,
    loading,
    error,
    hasData: coverageData.length > 0,
    refresh: loadCoverageData,
    getChartData,
    getTopFrameworks,
    getBottomFrameworks,
    getFrameworksWithoutCoverage,
    getFrameworksWithFullCoverage
  }
} 