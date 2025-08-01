'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download, FileText, CheckCircle, Clock, AlertCircle, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { EvaluationsService } from '@/lib/services/evaluations'
import { EvaluationDetailResponse, Question, EvaluationResponse } from '@/lib/types/isms'

interface EvaluationDetailProps {
  evaluationId: string
  onClose: () => void
  onUpdate: () => void
}

export function EvaluationDetail({ evaluationId, onClose, onUpdate }: EvaluationDetailProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [evaluation, setEvaluation] = useState<EvaluationDetailResponse | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'report'>('overview')

  useEffect(() => {
    loadEvaluation()
  }, [evaluationId])

  const loadEvaluation = async () => {
    try {
      setLoading(true)
      const data = await EvaluationsService.get(evaluationId)
      setEvaluation(data)
    } catch (error) {
      console.error('Error loading evaluation:', error)
      toast({
        title: t('evaluations.loadError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      const report = await EvaluationsService.mcpGetReport(evaluationId)
      
      // Create downloadable report
      const reportContent = `
# Evaluation Report: ${evaluation?.evaluation.name}

## Overview
- **Status**: ${evaluation?.evaluation.status}
- **Score**: ${evaluation?.stats.score_percentage.toFixed(1)}%
- **Questions Answered**: ${evaluation?.stats.answered_questions}/${evaluation?.stats.total_questions}
- **Evidence Count**: ${evaluation?.stats.evidence_count}

## Recommendations
${report.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

## Risk Level
**${report.risk_level.toUpperCase()}** - ${getRiskDescription(report.risk_level)}

## Detailed Responses
${evaluation?.questions.map((question, index) => {
  const response = evaluation?.responses.find(r => r.question_id === question.id)
  return `
### Question ${index + 1}: ${question.question_text}
**Response**: ${response?.response_value || 'Not answered'}
**Score**: ${response?.score || 0}/${response?.max_score || 100}
**Notes**: ${response?.notes || 'No notes'}
**Evidence**: ${response?.evidence_files?.join(', ') || 'No evidence'}
`
}).join('\n')}
      `

      const blob = new Blob([reportContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evaluation-report-${evaluation?.evaluation.name}-${new Date().toISOString().split('T')[0]}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: t('evaluations.reportGenerated'),
        description: t('evaluations.reportGeneratedDesc')
      })
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: t('evaluations.reportError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'reviewed':
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getRiskDescription = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return t('evaluations.riskLevels.low')
      case 'medium':
        return t('evaluations.riskLevels.medium')
      case 'high':
        return t('evaluations.riskLevels.high')
      case 'critical':
        return t('evaluations.riskLevels.critical')
      default:
        return t('evaluations.riskLevels.unknown')
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    const variantMap = {
      low: 'default' as const,
      medium: 'secondary' as const,
      high: 'destructive' as const,
      critical: 'destructive' as const
    }

    return (
      <Badge variant={variantMap[riskLevel as keyof typeof variantMap] || 'secondary'}>
        {riskLevel.toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('common.loading')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!evaluation) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('evaluations.notFound')}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('evaluations.notFoundDesc')}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{evaluation.evaluation.name}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={generateReport}>
                <Download className="h-4 w-4 mr-2" />
                {t('evaluations.generateReport')}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            {t('evaluations.overview')}
          </Button>
          <Button
            variant={activeTab === 'responses' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('responses')}
          >
            {t('evaluations.responses')} ({evaluation.stats.answered_questions})
          </Button>
          <Button
            variant={activeTab === 'report' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('report')}
          >
            {t('evaluations.report')}
          </Button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Evaluation Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(evaluation.evaluation.status)}
                    {t('evaluations.evaluationInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">{t('evaluations.name')}</p>
                      <p className="text-sm text-muted-foreground">{evaluation.evaluation.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('evaluations.status')}</p>
                      <p className="text-sm text-muted-foreground">{evaluation.evaluation.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('evaluations.startDate')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(evaluation.evaluation.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('evaluations.description')}</p>
                      <p className="text-sm text-muted-foreground">{evaluation.evaluation.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('evaluations.score')}</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(evaluation.stats.score_percentage)}`}>
                      {evaluation.stats.score_percentage.toFixed(1)}%
                    </div>
                    <Progress value={evaluation.stats.score_percentage} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('evaluations.progress')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {evaluation.stats.answered_questions}/{evaluation.stats.total_questions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('evaluations.questionsAnswered')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('evaluations.evidence')}</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{evaluation.stats.evidence_count}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('evaluations.evidenceFiles')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('evaluations.riskAssessment')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {getRiskBadge(evaluation.stats.score_percentage < 40 ? 'critical' : 
                                  evaluation.stats.score_percentage < 60 ? 'high' :
                                  evaluation.stats.score_percentage < 80 ? 'medium' : 'low')}
                    <div>
                      <p className="text-sm font-medium">{t('evaluations.riskLevel')}</p>
                      <p className="text-sm text-muted-foreground">
                        {getRiskDescription(evaluation.stats.score_percentage < 40 ? 'critical' : 
                                          evaluation.stats.score_percentage < 60 ? 'high' :
                                          evaluation.stats.score_percentage < 80 ? 'medium' : 'low')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-4">
              {evaluation.questions.map((question, index) => {
                const response = evaluation.responses.find(r => r.question_id === question.id)
                return (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">
                          {t('evaluations.question')} {index + 1}: {question.question_text}
                        </span>
                        {response && (
                          <Badge variant={response.score && response.score > 50 ? 'default' : 'secondary'}>
                            {response.score || 0}/{response.max_score || 100}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">{t('evaluations.response')}</p>
                          <p className="text-sm text-muted-foreground">
                            {response ? (
                              typeof response.response_value === 'boolean' 
                                ? (response.response_value ? t('evaluations.yes') : t('evaluations.no'))
                                : response.response_value?.toString() || t('evaluations.noResponse')
                            ) : (
                              t('evaluations.noResponse')
                            )}
                          </p>
                        </div>

                        {response?.response_text && (
                          <div>
                            <p className="text-sm font-medium">{t('evaluations.details')}</p>
                            <p className="text-sm text-muted-foreground">{response.response_text}</p>
                          </div>
                        )}

                        {response?.evidence_files && response.evidence_files.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">{t('evaluations.evidence')}</p>
                            <ul className="text-sm text-muted-foreground">
                              {response.evidence_files.map((file, fileIndex) => (
                                <li key={fileIndex} className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  {file}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {response?.notes && (
                          <div>
                            <p className="text-sm font-medium">{t('evaluations.notes')}</p>
                            <p className="text-sm text-muted-foreground">{response.notes}</p>
                          </div>
                        )}

                        {!response && (
                          <div className="text-center py-4 text-muted-foreground">
                            {t('evaluations.noResponseYet')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('evaluations.reportSummary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{t('evaluations.complianceScore')}</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {evaluation.stats.score_percentage.toFixed(1)}%
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium">{t('evaluations.recommendations')}</h3>
                      <ul className="mt-2 space-y-2">
                        {evaluation.stats.score_percentage < 50 ? (
                          <>
                            <li className="text-sm">• {t('evaluations.recommendations.implementCritical')}</li>
                            <li className="text-sm">• {t('evaluations.recommendations.reviewPolicies')}</li>
                            <li className="text-sm">• {t('evaluations.recommendations.training')}</li>
                          </>
                        ) : evaluation.stats.score_percentage < 75 ? (
                          <>
                            <li className="text-sm">• {t('evaluations.recommendations.improveControls')}</li>
                            <li className="text-sm">• {t('evaluations.recommendations.monitoring')}</li>
                            <li className="text-sm">• {t('evaluations.recommendations.updateProcedures')}</li>
                          </>
                        ) : (
                          <>
                            <li className="text-sm">• {t('evaluations.recommendations.maintainControls')}</li>
                            <li className="text-sm">• {t('evaluations.recommendations.incrementalImprovements')}</li>
                            <li className="text-sm">• {t('evaluations.recommendations.additionalCertifications')}</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium">{t('evaluations.nextSteps')}</h3>
                      <div className="mt-2 space-y-2">
                        <Button onClick={generateReport} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          {t('evaluations.downloadReport')}
                        </Button>
                        <Button variant="outline" onClick={onUpdate} className="w-full">
                          {t('evaluations.updateEvaluation')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 