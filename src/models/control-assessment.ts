import { z } from 'zod'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react'
import { MCPModelType } from './index'
import { 
  BaseEntity, 
  User, 
  baseEntitySchema,
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  formatDate
} from './base'

// =====================================================
// TYPES
// =====================================================

export interface ControlAssessment extends BaseEntity {
  control_id: string
  score: number
  justification: string
  assessed_by: string
  assessed_at: string
  previous_score?: number
  trend?: 'up' | 'down' | 'stable'
  improvement_needed?: boolean
  recommendations?: string[]
  next_assessment_date?: string
}

export interface AssessmentTrend {
  direction: 'up' | 'down' | 'stable'
  percentage: number
  color: string
}

export interface EffectivenessSummary {
  total_controls: number
  average_score: number
  high_effectiveness: number // >= 80
  medium_effectiveness: number // 50-79
  low_effectiveness: number // < 50
  critical_controls: number // < 30
  improvement_needed: number
}

// =====================================================
// ZOD SCHEMAS
// =====================================================

export const createAssessmentSchema = (t: any) => z.object({
  control_id: z.string().uuid(t('assessment.validation.control_required')),
  score: z.number()
    .min(0, t('assessment.validation.score_min'))
    .max(100, t('assessment.validation.score_max')),
  justification: z.string()
    .min(10, t('assessment.validation.justification_min'))
    .refine((val) => {
      // Se score < 50, justificativa é obrigatória
      return true // Validação será feita no componente
    }, t('assessment.validation.justification_required_low_score')),
  assessed_at: z.string().datetime().default(() => new Date().toISOString()),
  next_assessment_date: z.string().datetime().optional(),
  recommendations: z.array(z.string()).optional()
})

export const updateAssessmentSchema = (t: any) => createAssessmentSchema(t).partial()

export const assessmentTrendSchema = z.object({
  direction: z.enum(['up', 'down', 'stable']),
  percentage: z.number().min(0),
  color: z.string()
})

// =====================================================
// MCP METADATA
// =====================================================

export const assessmentMeta = {
  type: 'control_assessment' as MCPModelType,
  icon: TrendingUp,
  title: 'models.control_assessment.title',
  description: 'models.control_assessment.description',
  fields: {
    control_id: {
      label: 'forms.assessment.control',
      type: 'relation' as const,
      required: true,
      relation: 'controls',
      placeholder: 'forms.assessment.control_placeholder'
    },
    score: {
      label: 'forms.assessment.score',
      type: 'number' as const,
      required: true,
      validation: { min: 0, max: 100 },
      placeholder: 'forms.assessment.score_placeholder'
    },
    justification: {
      label: 'forms.assessment.justification',
      type: 'textarea' as const,
      required: true,
      validation: { min: 10 },
      placeholder: 'forms.assessment.justification_placeholder'
    },
    assessed_at: {
      label: 'forms.assessment.assessed_at',
      type: 'datetime' as const,
      required: true
    },
    next_assessment_date: {
      label: 'forms.assessment.next_assessment_date',
      type: 'datetime' as const,
      required: false
    },
    recommendations: {
      label: 'forms.assessment.recommendations',
      type: 'tags' as const,
      required: false,
      placeholder: 'forms.assessment.recommendations_placeholder'
    }
  }
}

// =====================================================
// PERMISSIONS
// =====================================================

export const assessmentPermissions = {
  canCreate: (user: User, tenantId: string): boolean => {
    return user.role === 'admin' || user.role === 'auditor' || user.role === 'manager'
  },
  
  canRead: (user: User, assessment: ControlAssessment): boolean => {
    return canRead(user, assessment)
  },
  
  canUpdate: (user: User, assessment: ControlAssessment): boolean => {
    // Apenas o avaliador original ou admin pode editar
    if (user.id === assessment.assessed_by) return true
    return user.role === 'admin'
  },
  
  canDelete: (user: User, assessment: ControlAssessment): boolean => {
    return user.role === 'admin'
  },
  
  canExport: (user: User, assessment: ControlAssessment): boolean => {
    return user.role === 'admin' || user.role === 'auditor'
  }
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
  if (score >= 20) return 'Critical'
  return 'Failing'
}

export const getEffectivenessIcon = (score: number) => {
  if (score >= 80) return CheckCircle
  if (score >= 50) return TrendingUp
  return AlertTriangle
}

export const calculateTrend = (current: number, previous?: number): AssessmentTrend | null => {
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

export const isImprovementNeeded = (score: number): boolean => {
  return score < 50
}

export const getRecommendations = (score: number): string[] => {
  const recommendations = []
  
  if (score < 30) {
    recommendations.push('Implementar controles básicos imediatamente')
    recommendations.push('Realizar avaliação de risco detalhada')
    recommendations.push('Definir plano de ação urgente')
  } else if (score < 50) {
    recommendations.push('Melhorar implementação dos controles')
    recommendations.push('Aumentar monitoramento')
    recommendations.push('Atualizar documentação')
  } else if (score < 70) {
    recommendations.push('Otimizar eficácia dos controles')
    recommendations.push('Implementar monitoramento contínuo')
    recommendations.push('Avaliações regulares de efetividade')
  } else if (score < 80) {
    recommendations.push('Manter performance atual')
    recommendations.push('Considerar controles avançados')
    recommendations.push('Compartilhar melhores práticas')
  }
  
  return recommendations
}

export const calculateEffectivenessSummary = (assessments: ControlAssessment[]): EffectivenessSummary => {
  if (assessments.length === 0) {
    return {
      total_controls: 0,
      average_score: 0,
      high_effectiveness: 0,
      medium_effectiveness: 0,
      low_effectiveness: 0,
      critical_controls: 0,
      improvement_needed: 0
    }
  }

  const scores = assessments.map(a => a.score)
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length

  return {
    total_controls: assessments.length,
    average_score: Math.round(average),
    high_effectiveness: scores.filter(s => s >= 80).length,
    medium_effectiveness: scores.filter(s => s >= 50 && s < 80).length,
    low_effectiveness: scores.filter(s => s < 50).length,
    critical_controls: scores.filter(s => s < 30).length,
    improvement_needed: scores.filter(s => s < 50).length
  }
}

// =====================================================
// MOCK DATA
// =====================================================

export const mockAssessments: ControlAssessment[] = [
  {
    id: '1',
    tenant_id: 'dev-tenant',
    control_id: 'control-1',
    score: 85,
    justification: 'Controle implementado corretamente com monitoramento ativo e documentação atualizada.',
    assessed_by: 'admin',
    assessed_at: '2024-01-15T10:00:00Z',
    previous_score: 78,
    trend: 'up',
    improvement_needed: false,
    recommendations: ['Manter performance atual', 'Considerar controles avançados'],
    next_assessment_date: '2024-04-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    tenant_id: 'dev-tenant',
    control_id: 'control-2',
    score: 45,
    justification: 'Controle implementado parcialmente. Necessita melhorias na documentação e treinamento da equipe.',
    assessed_by: 'auditor',
    assessed_at: '2024-01-14T14:30:00Z',
    previous_score: 52,
    trend: 'down',
    improvement_needed: true,
    recommendations: ['Melhorar implementação dos controles', 'Aumentar monitoramento', 'Atualizar documentação'],
    next_assessment_date: '2024-02-14T14:30:00Z',
    created_at: '2024-01-14T14:30:00Z',
    updated_at: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    tenant_id: 'dev-tenant',
    control_id: 'control-3',
    score: 92,
    justification: 'Controle operacional com excelente performance. Monitoramento contínuo ativo.',
    assessed_by: 'admin',
    assessed_at: '2024-01-13T09:15:00Z',
    previous_score: 89,
    trend: 'up',
    improvement_needed: false,
    recommendations: ['Manter performance atual', 'Compartilhar melhores práticas'],
    next_assessment_date: '2024-04-13T09:15:00Z',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    tenant_id: 'dev-tenant',
    control_id: 'control-4',
    score: 25,
    justification: 'Controle crítico com implementação inadequada. Requer ação imediata.',
    assessed_by: 'manager',
    assessed_at: '2024-01-12T16:45:00Z',
    previous_score: 30,
    trend: 'down',
    improvement_needed: true,
    recommendations: ['Implementar controles básicos imediatamente', 'Realizar avaliação de risco detalhada'],
    next_assessment_date: '2024-01-26T16:45:00Z',
    created_at: '2024-01-12T16:45:00Z',
    updated_at: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    tenant_id: 'dev-tenant',
    control_id: 'control-5',
    score: 68,
    justification: 'Controle funcional com algumas melhorias necessárias na automação.',
    assessed_by: 'auditor',
    assessed_at: '2024-01-11T11:20:00Z',
    previous_score: 65,
    trend: 'up',
    improvement_needed: false,
    recommendations: ['Otimizar eficácia dos controles', 'Implementar monitoramento contínuo'],
    next_assessment_date: '2024-03-11T11:20:00Z',
    created_at: '2024-01-11T11:20:00Z',
    updated_at: '2024-01-11T11:20:00Z'
  }
]

// =====================================================
// I18N KEYS
// =====================================================

export const assessmentI18nKeys = {
  title: 'models.control_assessment.title',
  description: 'models.control_assessment.description',
  fields: {
    control_id: 'forms.assessment.control',
    score: 'forms.assessment.score',
    justification: 'forms.assessment.justification',
    assessed_at: 'forms.assessment.assessed_at',
    next_assessment_date: 'forms.assessment.next_assessment_date',
    recommendations: 'forms.assessment.recommendations'
  },
  validation: {
    control_required: 'assessment.validation.control_required',
    score_min: 'assessment.validation.score_min',
    score_max: 'assessment.validation.score_max',
    justification_min: 'assessment.validation.justification_min',
    justification_required_low_score: 'assessment.validation.justification_required_low_score'
  },
  effectiveness: {
    excellent: 'assessment.effectiveness.excellent',
    good: 'assessment.effectiveness.good',
    fair: 'assessment.effectiveness.fair',
    needs_improvement: 'assessment.effectiveness.needs_improvement',
    poor: 'assessment.effectiveness.poor',
    critical: 'assessment.effectiveness.critical',
    failing: 'assessment.effectiveness.failing'
  },
  trend: {
    up: 'assessment.trend.up',
    down: 'assessment.trend.down',
    stable: 'assessment.trend.stable'
  },
  alerts: {
    low_effectiveness: 'assessment.alerts.low_effectiveness',
    critical_control: 'assessment.alerts.critical_control',
    improvement_needed: 'assessment.alerts.improvement_needed'
  }
} 