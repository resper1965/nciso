'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { EvaluationsService } from '@/lib/services/evaluations'
import { Evaluation, EvaluationFilters } from '@/lib/types/isms'
import { EvaluationForm } from './evaluation-form'
import { EvaluationDetail } from './evaluation-detail'

interface EvaluationListProps {
  className?: string
}

export function EvaluationList({ className }: EvaluationListProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<EvaluationFilters>({
    page: 1,
    limit: 10
  })
  
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null)

  useEffect(() => {
    loadEvaluations()
  }, [filters])

  const loadEvaluations = async () => {
    try {
      setLoading(true)
      const response = await EvaluationsService.list(filters)
      setEvaluations(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
      setPage(response.page)
    } catch (error) {
      console.error('Error loading evaluations:', error)
      toast({
        title: t('evaluations.loadError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (evaluation: Evaluation) => {
    if (!confirm(t('evaluations.deleteConfirm'))) return

    try {
      await EvaluationsService.delete(evaluation.id)
      toast({
        title: t('evaluations.deleteSuccess'),
        description: t('evaluations.deleteSuccessDesc')
      })
      loadEvaluations()
    } catch (error) {
      console.error('Error deleting evaluation:', error)
      toast({
        title: t('evaluations.deleteError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleStatusChange = async (evaluation: Evaluation, newStatus: string) => {
    try {
      await EvaluationsService.update(evaluation.id, { status: newStatus as any })
      toast({
        title: t('evaluations.statusUpdateSuccess'),
        description: t('evaluations.statusUpdateSuccessDesc')
      })
      loadEvaluations()
    } catch (error) {
      console.error('Error updating evaluation status:', error)
      toast({
        title: t('evaluations.statusUpdateError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'reviewed':
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: t('evaluations.status.draft'), variant: 'secondary' as const },
      in_progress: { label: t('evaluations.status.inProgress'), variant: 'default' as const },
      completed: { label: t('evaluations.status.completed'), variant: 'default' as const },
      reviewed: { label: t('evaluations.status.reviewed'), variant: 'default' as const }
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('evaluations.title')}</h2>
          <p className="text-muted-foreground">{t('evaluations.description')}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('evaluations.create')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('evaluations.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('evaluations.searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.status || ''}
              onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('evaluations.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('evaluations.allStatuses')}</SelectItem>
                <SelectItem value="draft">{t('evaluations.status.draft')}</SelectItem>
                <SelectItem value="in_progress">{t('evaluations.status.inProgress')}</SelectItem>
                <SelectItem value="completed">{t('evaluations.status.completed')}</SelectItem>
                <SelectItem value="reviewed">{t('evaluations.status.reviewed')}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder={t('evaluations.startDateFilter')}
              value={filters.start_date || ''}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
            />

            <Input
              type="date"
              placeholder={t('evaluations.endDateFilter')}
              value={filters.end_date || ''}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('evaluations.name')}</TableHead>
                <TableHead>{t('evaluations.status')}</TableHead>
                <TableHead>{t('evaluations.score')}</TableHead>
                <TableHead>{t('evaluations.evidence')}</TableHead>
                <TableHead>{t('evaluations.startDate')}</TableHead>
                <TableHead>{t('evaluations.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t('evaluations.noEvaluations')}
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{evaluation.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {evaluation.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(evaluation.status)}
                        {getStatusBadge(evaluation.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {evaluation.percentage_score !== undefined ? (
                        <div className={`font-medium ${getScoreColor(evaluation.percentage_score)}`}>
                          {evaluation.percentage_score.toFixed(1)}%
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{evaluation.evidence_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(evaluation.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvaluation(evaluation)
                            setShowDetail(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEvaluation(evaluation)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(evaluation)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setFilters({ ...filters, page: newPage })}
          />
        </div>
      )}

      {/* Forms */}
      {showForm && (
        <EvaluationForm
          evaluation={editingEvaluation}
          onClose={() => {
            setShowForm(false)
            setEditingEvaluation(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingEvaluation(null)
            loadEvaluations()
          }}
        />
      )}

      {showDetail && selectedEvaluation && (
        <EvaluationDetail
          evaluationId={selectedEvaluation.id}
          onClose={() => {
            setShowDetail(false)
            setSelectedEvaluation(null)
          }}
          onUpdate={loadEvaluations}
        />
      )}
    </div>
  )
} 