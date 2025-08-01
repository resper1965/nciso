'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Target,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface GapReportCardProps {
  tenantId: string
  frameworkId: string
  className?: string
  showDetails?: boolean
}

interface GapReport {
  framework: {
    id: string
    name: string
    version: string
    description: string
  }
  summary: {
    total_expected: number
    total_mapped: number
    total_gaps: number
    compliance_percentage: number
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  }
  expected_controls: Array<{
    id: string
    name: string
    type: string
    domain: string
    priority: 'critical' | 'high' | 'medium' | 'low'
  }>
  mapped_controls: Array<{
    id: string
    name: string
    type: string
    domain: string
    status: string
    priority: string
  }>
  gaps: Array<{
    id: string
    name: string
    type: string
    domain: string
    priority: 'critical' | 'high' | 'medium' | 'low'
  }>
  recommendations: Array<{
    type: 'critical' | 'warning' | 'info' | 'success'
    message: string
  }>
}

export function GapReportCard({ 
  tenantId, 
  frameworkId, 
  className,
  showDetails = true 
}: GapReportCardProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [gapReport, setGapReport] = useState<GapReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGaps, setShowGaps] = useState(false)
  const [showMapped, setShowMapped] = useState(false)

  useEffect(() => {
    loadGapReport()
  }, [tenantId, frameworkId])

  const loadGapReport = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simular chamada MCP (em produção seria via MCP Server)
      const { data, error } = await supabase
        .rpc('simulate_gap_report', {
          p_tenant_id: tenantId,
          p_framework_id: frameworkId
        })

      if (error) {
        // Fallback para simulação local
        const mockReport = generateMockGapReport()
        setGapReport(mockReport)
      } else {
        setGapReport(data)
      }

    } catch (error) {
      console.error('Error loading gap report:', error)
      setError('Erro ao carregar relatório de gaps')
      toast({
        title: t('common.error'),
        description: t('controls.gap_report.error_loading'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const generateMockGapReport = (): GapReport => {
    return {
      framework: {
        id: frameworkId,
        name: 'ISO 27001',
        version: '2022',
        description: 'Sistema de Gestão de Segurança da Informação'
      },
      summary: {
        total_expected: 10,
        total_mapped: 7,
        total_gaps: 3,
        compliance_percentage: 70,
        status: 'good'
      },
      expected_controls: [
        { id: 'iso-001', name: 'Política de Segurança da Informação', type: 'preventive', domain: 'governance', priority: 'critical' },
        { id: 'iso-002', name: 'Organização da Segurança da Informação', type: 'preventive', domain: 'governance', priority: 'critical' },
        { id: 'iso-003', name: 'Controle de Acesso', type: 'preventive', domain: 'access_control', priority: 'high' },
        { id: 'iso-004', name: 'Gestão de Ativos', type: 'preventive', domain: 'asset_management', priority: 'high' },
        { id: 'iso-005', name: 'Continuidade de Negócio', type: 'preventive', domain: 'business_continuity', priority: 'high' },
        { id: 'iso-006', name: 'Gestão de Incidentes', type: 'corrective', domain: 'incident_management', priority: 'medium' },
        { id: 'iso-007', name: 'Monitoramento e Auditoria', type: 'detective', domain: 'monitoring', priority: 'medium' },
        { id: 'iso-008', name: 'Gestão de Riscos', type: 'preventive', domain: 'risk_management', priority: 'critical' },
        { id: 'iso-009', name: 'Gestão de Fornecedores', type: 'preventive', domain: 'vendor_management', priority: 'medium' },
        { id: 'iso-010', name: 'Treinamento e Conscientização', type: 'preventive', domain: 'training', priority: 'medium' }
      ],
      mapped_controls: [
        { id: 'iso-001', name: 'Política de Segurança da Informação', type: 'preventive', domain: 'governance', status: 'active', priority: 'critical' },
        { id: 'iso-002', name: 'Organização da Segurança da Informação', type: 'preventive', domain: 'governance', status: 'active', priority: 'critical' },
        { id: 'iso-003', name: 'Controle de Acesso', type: 'preventive', domain: 'access_control', status: 'active', priority: 'high' },
        { id: 'iso-004', name: 'Gestão de Ativos', type: 'preventive', domain: 'asset_management', status: 'active', priority: 'high' },
        { id: 'iso-005', name: 'Continuidade de Negócio', type: 'preventive', domain: 'business_continuity', status: 'active', priority: 'high' },
        { id: 'iso-006', name: 'Gestão de Incidentes', type: 'corrective', domain: 'incident_management', status: 'active', priority: 'medium' },
        { id: 'iso-007', name: 'Monitoramento e Auditoria', type: 'detective', domain: 'monitoring', status: 'active', priority: 'medium' }
      ],
      gaps: [
        { id: 'iso-008', name: 'Gestão de Riscos', type: 'preventive', domain: 'risk_management', priority: 'critical' },
        { id: 'iso-009', name: 'Gestão de Fornecedores', type: 'preventive', domain: 'vendor_management', priority: 'medium' },
        { id: 'iso-010', name: 'Treinamento e Conscientização', type: 'preventive', domain: 'training', priority: 'medium' }
      ],
      recommendations: [
        {
          type: 'warning',
          message: 'Cobertura baixa (70%). Foque nos controles de alta prioridade.'
        },
        {
          type: 'critical',
          message: '1 controle crítico não implementado: Gestão de Riscos'
        },
        {
          type: 'success',
          message: 'Framework ISO 27001: 3 controles pendentes de implementação.'
        }
      ]
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'poor': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'info': return <Info className="h-4 w-4 text-blue-600" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('controls.gap_report.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !gapReport) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('controls.gap_report.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400">
              {error || t('controls.gap_report.error_loading')}
            </p>
            <Button 
              variant="outline" 
              onClick={loadGapReport}
              className="mt-4"
            >
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t('controls.gap_report.title')} - {gapReport.framework.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{gapReport.summary.total_expected}</div>
            <div className="text-sm text-blue-600">{t('controls.gap_report.stats.expected')}</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{gapReport.summary.total_mapped}</div>
            <div className="text-sm text-green-600">{t('controls.gap_report.stats.mapped')}</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{gapReport.summary.total_gaps}</div>
            <div className="text-sm text-red-600">{t('controls.gap_report.stats.gaps')}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{gapReport.summary.compliance_percentage}%</div>
            <div className="text-sm text-purple-600">{t('controls.gap_report.stats.compliance')}</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('controls.gap_report.progress.label')}</span>
            <span>{gapReport.summary.compliance_percentage}%</span>
          </div>
          <Progress value={gapReport.summary.compliance_percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{gapReport.summary.total_mapped} {t('controls.gap_report.progress.mapped')}</span>
            <span>{gapReport.summary.total_gaps} {t('controls.gap_report.progress.gaps')}</span>
          </div>
        </div>

        {/* Status de Conformidade */}
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(gapReport.summary.status)}>
            {t(`controls.gap_report.status.${gapReport.summary.status}`)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {t('controls.gap_report.status.description', { percentage: gapReport.summary.compliance_percentage })}
          </span>
        </div>

        {/* Recomendações */}
        {gapReport.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">{t('controls.gap_report.recommendations.title')}</h4>
            <div className="space-y-2">
              {gapReport.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    rec.type === 'critical' ? 'bg-red-50 dark:bg-red-950' :
                    rec.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950' :
                    rec.type === 'info' ? 'bg-blue-50 dark:bg-blue-950' :
                    'bg-green-50 dark:bg-green-950'
                  }`}
                >
                  {getRecommendationIcon(rec.type)}
                  <span className="text-sm">{rec.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detalhes */}
        {showDetails && (
          <div className="space-y-4">
            {/* Gaps */}
            <Collapsible open={showGaps} onOpenChange={setShowGaps}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    {t('controls.gap_report.gaps.title')} ({gapReport.gaps.length})
                  </span>
                  {showGaps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {gapReport.gaps.map((gap) => (
                  <div key={gap.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{gap.name}</div>
                      <div className="text-xs text-muted-foreground">{gap.domain} • {gap.type}</div>
                    </div>
                    <Badge className={getPriorityColor(gap.priority)}>
                      {gap.priority}
                    </Badge>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Controles Mapeados */}
            <Collapsible open={showMapped} onOpenChange={setShowMapped}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {t('controls.gap_report.mapped.title')} ({gapReport.mapped_controls.length})
                  </span>
                  {showMapped ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {gapReport.mapped_controls.map((control) => (
                  <div key={control.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{control.name}</div>
                      <div className="text-xs text-muted-foreground">{control.domain} • {control.type}</div>
                    </div>
                    <Badge variant="secondary">{control.status}</Badge>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 