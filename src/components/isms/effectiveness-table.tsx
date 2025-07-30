import React, { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp, 
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { 
  ControlAssessment, 
  Control,
  calculateTrend,
  getEffectivenessColor,
  getEffectivenessLabel,
  isImprovementNeeded
} from '@/models/control-assessment'
import { EffectivenessBadge, CriticalEffectivenessBadge } from './effectiveness-badge'

// =====================================================
// TYPES
// =====================================================

export interface EffectivenessTableProps {
  assessments: ControlAssessment[]
  controls: Control[]
  onViewAssessment?: (assessment: ControlAssessment) => void
  onEditAssessment?: (assessment: ControlAssessment) => void
  onDeleteAssessment?: (assessment: ControlAssessment) => void
  onViewHistory?: (controlId: string) => void
  user?: any
  className?: string
}

export interface EffectivenessFilter {
  domain?: string
  effectivenessRange?: 'all' | 'high' | 'medium' | 'low' | 'critical'
  assessor?: string
  search?: string
}

// =====================================================
// COMPONENT
// =====================================================

export const EffectivenessTable: React.FC<EffectivenessTableProps> = ({
  assessments,
  controls,
  onViewAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onViewHistory,
  user,
  className = ''
}) => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<EffectivenessFilter>({})
  const [sortBy, setSortBy] = useState<'score' | 'assessed_at' | 'control_name'>('assessed_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // =====================================================
  // FILTERS AND SORTING
  // =====================================================

  const filteredAssessments = useMemo(() => {
    let filtered = assessments

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(assessment => {
        const control = controls.find(c => c.id === assessment.control_id)
        return (
          control?.name.toLowerCase().includes(searchLower) ||
          control?.description.toLowerCase().includes(searchLower) ||
          assessment.justification.toLowerCase().includes(searchLower)
        )
      })
    }

    // Domain filter
    if (filters.domain) {
      filtered = filtered.filter(assessment => {
        const control = controls.find(c => c.id === assessment.control_id)
        return control?.domain_id === filters.domain
      })
    }

    // Effectiveness range filter
    if (filters.effectivenessRange && filters.effectivenessRange !== 'all') {
      filtered = filtered.filter(assessment => {
        const score = assessment.score
        switch (filters.effectivenessRange) {
          case 'high':
            return score >= 80
          case 'medium':
            return score >= 50 && score < 80
          case 'low':
            return score >= 30 && score < 50
          case 'critical':
            return score < 30
          default:
            return true
        }
      })
    }

    // Assessor filter
    if (filters.assessor) {
      filtered = filtered.filter(assessment => 
        assessment.assessed_by === filters.assessor
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'score':
          aValue = a.score
          bValue = b.score
          break
        case 'assessed_at':
          aValue = new Date(a.assessed_at)
          bValue = new Date(b.assessed_at)
          break
        case 'control_name':
          const aControl = controls.find(c => c.id === a.control_id)
          const bControl = controls.find(c => c.id === b.control_id)
          aValue = aControl?.name || ''
          bValue = bControl?.name || ''
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [assessments, controls, filters, sortBy, sortOrder])

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleFilterChange = (key: keyof EffectivenessFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const getControlName = (controlId: string): string => {
    const control = controls.find(c => c.id === controlId)
    return control?.name || 'Unknown Control'
  }

  const getControlDomain = (controlId: string): string => {
    const control = controls.find(c => c.id === controlId)
    return control?.domain_id || ''
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('assessment.table.title')}</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {filteredAssessments.length} {t('common.assessments')}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('assessment.table.search_placeholder')}
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select
            value={filters.effectivenessRange || 'all'}
            onValueChange={(value) => handleFilterChange('effectivenessRange', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('assessment.table.filter_effectiveness')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="high">{t('assessment.table.high_effectiveness')}</SelectItem>
              <SelectItem value="medium">{t('assessment.table.medium_effectiveness')}</SelectItem>
              <SelectItem value="low">{t('assessment.table.low_effectiveness')}</SelectItem>
              <SelectItem value="critical">{t('assessment.table.critical_effectiveness')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.domain || 'all'}
            onValueChange={(value) => handleFilterChange('domain', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('assessment.table.filter_domain')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="governance">{t('domain.categories.governance')}</SelectItem>
              <SelectItem value="access_control">{t('domain.categories.access_control')}</SelectItem>
              <SelectItem value="network_security">{t('domain.categories.network_security')}</SelectItem>
              <SelectItem value="data_protection">{t('domain.categories.data_protection')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('control_name')}
                >
                  {t('assessment.table.control')}
                  {sortBy === 'control_name' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('score')}
                >
                  {t('assessment.table.effectiveness')}
                  {sortBy === 'score' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead>{t('assessment.table.justification')}</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('assessed_at')}
                >
                  {t('assessment.table.assessed_at')}
                  {sortBy === 'assessed_at' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead>{t('assessment.table.assessor')}</TableHead>
                <TableHead>{t('assessment.table.trend')}</TableHead>
                <TableHead className="w-[50px]">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => {
                const control = controls.find(c => c.id === assessment.control_id)
                const trend = calculateTrend(assessment.score, assessment.previous_score)
                
                return (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {getControlName(assessment.control_id)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {control?.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <EffectivenessBadge
                          score={assessment.score}
                          previousScore={assessment.previous_score}
                          showTrend={false}
                          size="sm"
                        />
                        {isImprovementNeeded(assessment.score) && (
                          <CriticalEffectivenessBadge score={assessment.score} />
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {assessment.justification}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {format(new Date(assessment.assessed_at), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(assessment.assessed_at), 'HH:mm')}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {assessment.assessed_by}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {trend && (
                        <div className={`flex items-center space-x-1 ${trend.color}`}>
                          {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                          {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                          {trend.direction === 'stable' && <span className="w-4 h-4">-</span>}
                          <span className="text-xs">
                            {trend.direction === 'up' && '+'}
                            {trend.direction === 'down' && '-'}
                            {trend.percentage}%
                          </span>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewAssessment?.(assessment)}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewHistory?.(assessment.control_id)}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            {t('assessment.table.view_history')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditAssessment?.(assessment)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteAssessment?.(assessment)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>{t('assessment.table.no_assessments')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =====================================================
// HOOK
// =====================================================

export const useEffectivenessTable = () => {
  const getFilteredAssessments = (
    assessments: ControlAssessment[],
    filters: EffectivenessFilter
  ) => {
    return assessments.filter(assessment => {
      // Implementar lógica de filtro aqui
      return true
    })
  }

  const getAssessmentStats = (assessments: ControlAssessment[]) => {
    const total = assessments.length
    const high = assessments.filter(a => a.score >= 80).length
    const medium = assessments.filter(a => a.score >= 50 && a.score < 80).length
    const low = assessments.filter(a => a.score < 50).length
    const critical = assessments.filter(a => a.score < 30).length

    return {
      total,
      high,
      medium,
      low,
      critical,
      average: total > 0 ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / total) : 0
    }
  }

  return {
    getFilteredAssessments,
    getAssessmentStats
  }
} 