import { z } from 'zod'
import { Shield, Settings, CheckCircle, AlertTriangle, TrendingUp, Users, Network } from 'lucide-react'
import { MCPModelType } from './index'
import { 
  BaseEntity, 
  ImplementationStatus, 
  User, 
  baseEntitySchema, 
  implementationStatusSchema,
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  formatDate,
  getStatusColor,
  getStatusIcon
} from './base'

// =====================================================
// TYPES
// =====================================================

export type ControlType = 'preventive' | 'detective' | 'corrective' | 'deterrent' | 'recovery' | 'compensating'

export type Control = BaseEntity & {
  name: string
  description: string
  control_type: ControlType
  implementation_status: ImplementationStatus
  effectiveness_score: number
  domain_id?: string
  policy_ids?: string[]
  owner?: string
  cost?: number
  priority?: 'low' | 'medium' | 'high' | 'critical'
  last_assessment_date?: string
  next_assessment_date?: string
  tags?: string[]
  notes?: string
  attachments?: string[]
  dependencies?: string[]
  metrics?: {
    [key: string]: {
      value: number
      unit: string
      target: number
      current: number
    }
  }
}

// =====================================================
// ZOD SCHEMAS
// =====================================================

export const controlTypeSchema = z.enum(['preventive', 'detective', 'corrective', 'deterrent', 'recovery', 'compensating'])

export const createControlSchema = (t: any) => z.object({
  name: z.string().min(2, t('control.validation.name_min')),
  description: z.string().min(10, t('control.validation.description_min')),
  control_type: controlTypeSchema,
  implementation_status: implementationStatusSchema.default('planned'),
  effectiveness_score: z.number().min(0).max(100).default(0),
  domain_id: z.string().uuid().optional(),
  policy_ids: z.array(z.string().uuid()).optional(),
  owner: z.string().optional(),
  cost: z.number().positive().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  last_assessment_date: z.string().datetime().optional(),
  next_assessment_date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
})

export const updateControlSchema = (t: any) => createControlSchema(t).partial()

export const assessControlSchema = z.object({
  effectiveness_score: z.number().min(0).max(100),
  assessment_date: z.string().datetime(),
  assessor: z.string().uuid(),
  notes: z.string().optional(),
  metrics: z.record(z.object({
    value: z.number(),
    unit: z.string(),
    target: z.number(),
    current: z.number()
  })).optional(),
})

// =====================================================
// PERMISSIONS
// =====================================================

export const controlPermissions = {
  canCreate: (user: User, tenantId: string): boolean => {
    return canCreate(user, tenantId)
  },
  
  canRead: (user: User, control: Control): boolean => {
    return canRead(user, control)
  },
  
  canUpdate: (user: User, control: Control): boolean => {
    return canUpdate(user, control)
  },
  
  canDelete: (user: User, control: Control): boolean => {
    // Não permitir excluir controles operacionais
    if (control.implementation_status === 'operational') return false
    return canDelete(user, control)
  },
  
  canAssess: (user: User, control: Control): boolean => {
    return canUpdate(user, control)
  },
  
  canExport: (user: User, control: Control): boolean => {
    return canRead(user, control)
  }
}

// =====================================================
// METADATA
// =====================================================

export const controlMeta = {
  type: 'control' as MCPModelType,
  icon: Shield,
  title: 'models.control.title',
  description: 'models.control.description',
  fields: {
    name: {
      label: 'forms.control.name',
      type: 'text' as const,
      required: true,
      validation: { min: 2 },
      placeholder: 'forms.control.name_placeholder'
    },
    description: {
      label: 'forms.control.description',
      type: 'textarea' as const,
      required: true,
      validation: { min: 10 },
      placeholder: 'forms.control.description_placeholder'
    },
    control_type: {
      label: 'forms.control.control_type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'preventive', label: 'control.types.preventive' },
        { value: 'detective', label: 'control.types.detective' },
        { value: 'corrective', label: 'control.types.corrective' },
        { value: 'deterrent', label: 'control.types.deterrent' },
        { value: 'recovery', label: 'control.types.recovery' },
        { value: 'compensating', label: 'control.types.compensating' }
      ]
    },
    implementation_status: {
      label: 'forms.control.implementation_status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'planned', label: 'status.planned' },
        { value: 'implemented', label: 'status.implemented' },
        { value: 'operational', label: 'status.operational' },
        { value: 'deprecated', label: 'status.deprecated' }
      ]
    },
    effectiveness_score: {
      label: 'forms.control.effectiveness_score',
      type: 'number' as const,
      required: true,
      validation: { min: 0, max: 100 },
      placeholder: 'forms.control.effectiveness_score_placeholder'
    },
    domain_id: {
      label: 'forms.control.domain',
      type: 'relation' as const,
      required: false,
      relation: 'domains'
    },
    policy_ids: {
      label: 'forms.control.policies',
      type: 'multiselect' as const,
      required: false,
      relation: 'policies',
      multiple: true
    },
    owner: {
      label: 'forms.control.owner',
      type: 'text' as const,
      required: false,
      placeholder: 'forms.control.owner_placeholder'
    },
    cost: {
      label: 'forms.control.cost',
      type: 'number' as const,
      required: false,
      validation: { min: 0 },
      placeholder: 'forms.control.cost_placeholder'
    },
    priority: {
      label: 'forms.control.priority',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'low', label: 'control.priorities.low' },
        { value: 'medium', label: 'control.priorities.medium' },
        { value: 'high', label: 'control.priorities.high' },
        { value: 'critical', label: 'control.priorities.critical' }
      ]
    },
    last_assessment_date: {
      label: 'forms.control.last_assessment_date',
      type: 'date' as const,
      required: false
    },
    next_assessment_date: {
      label: 'forms.control.next_assessment_date',
      type: 'date' as const,
      required: false
    },
    tags: {
      label: 'forms.control.tags',
      type: 'tags' as const,
      required: false,
      placeholder: 'forms.control.tags_placeholder'
    },
    notes: {
      label: 'forms.control.notes',
      type: 'textarea' as const,
      required: false,
      placeholder: 'forms.control.notes_placeholder'
    }
  }
}
    assess: {
      label: 'control.actions.assess',
      icon: TrendingUp,
      permission: 'update',
      variant: 'default'
    },
    export: {
      label: 'control.actions.export',
      icon: Shield,
      permission: 'export',
      variant: 'outline'
    }
  },
  views: {
    list: {
      label: 'control.views.list',
      icon: Shield,
      component: 'ControlListView'
    },
    grid: {
      label: 'control.views.grid',
      icon: Settings,
      component: 'ControlGridView'
    },
    effectiveness: {
      label: 'control.views.effectiveness',
      icon: TrendingUp,
      component: 'ControlEffectivenessView'
    }
  }
}

// =====================================================
// UTILITIES
// =====================================================

export const getControlTypeInfo = (type: ControlType) => {
  const typeInfo = {
    preventive: {
      color: 'bg-blue-500',
      icon: Shield,
      label: 'control.types.preventive'
    },
    detective: {
      color: 'bg-yellow-500',
      icon: AlertTriangle,
      label: 'control.types.detective'
    },
    corrective: {
      color: 'bg-green-500',
      icon: CheckCircle,
      label: 'control.types.corrective'
    },
    deterrent: {
      color: 'bg-purple-500',
      icon: Shield,
      label: 'control.types.deterrent'
    },
    recovery: {
      color: 'bg-orange-500',
      icon: TrendingUp,
      label: 'control.types.recovery'
    },
    compensating: {
      color: 'bg-gray-500',
      icon: Settings,
      label: 'control.types.compensating'
    }
  }
  
  return typeInfo[type] || typeInfo.preventive
}

export const getControlPriorityInfo = (priority: string) => {
  const priorityInfo = {
    low: {
      color: 'bg-green-500',
      label: 'control.priorities.low'
    },
    medium: {
      color: 'bg-yellow-500',
      label: 'control.priorities.medium'
    },
    high: {
      color: 'bg-orange-500',
      label: 'control.priorities.high'
    },
    critical: {
      color: 'bg-red-500',
      label: 'control.priorities.critical'
    }
  }
  
  return priorityInfo[priority as keyof typeof priorityInfo] || priorityInfo.medium
}

export const getEffectivenessColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

export const getEffectivenessLabel = (score: number): string => {
  if (score >= 80) return 'control.effectiveness.excellent'
  if (score >= 60) return 'control.effectiveness.good'
  if (score >= 40) return 'control.effectiveness.fair'
  return 'control.effectiveness.poor'
}

export const isControlOverdue = (control: Control): boolean => {
  if (!control.next_assessment_date) return false
  return new Date(control.next_assessment_date) < new Date()
}

export const isControlEffective = (control: Control): boolean => {
  return control.effectiveness_score >= 60
}

export const calculateControlROI = (control: Control): number => {
  if (!control.cost || control.cost === 0) return 0
  // ROI simplificado baseado na efetividade
  return (control.effectiveness_score / 100) * 100 / control.cost
}

// =====================================================
// I18N KEYS
// =====================================================

export const controlI18nKeys = {
  // Títulos
  title: 'control.title',
  subtitle: 'control.subtitle',
  new_control: 'control.new_control',
  edit_control: 'control.edit_control',
  
  // Campos
  control_type: 'control.control_type',
  implementation_status: 'control.implementation_status',
  effectiveness_score: 'control.effectiveness_score',
  domain: 'control.domain',
  policies: 'control.policies',
  owner: 'control.owner',
  cost: 'control.cost',
  priority: 'control.priority',
  last_assessment_date: 'control.last_assessment_date',
  next_assessment_date: 'control.next_assessment_date',
  tags: 'control.tags',
  notes: 'control.notes',
  
  // Tipos de Controle
  types: {
    preventive: 'control.types.preventive',
    detective: 'control.types.detective',
    corrective: 'control.types.corrective',
    deterrent: 'control.types.deterrent',
    recovery: 'control.types.recovery',
    compensating: 'control.types.compensating'
  },
  
  // Prioridades
  priorities: {
    low: 'control.priorities.low',
    medium: 'control.priorities.medium',
    high: 'control.priorities.high',
    critical: 'control.priorities.critical'
  },
  
  // Efetividade
  effectiveness: {
    excellent: 'control.effectiveness.excellent',
    good: 'control.effectiveness.good',
    fair: 'control.effectiveness.fair',
    poor: 'control.effectiveness.poor'
  },
  
  // Ações
  actions: {
    create: 'control.actions.create',
    edit: 'control.actions.edit',
    delete: 'control.actions.delete',
    assess: 'control.actions.assess',
    export: 'control.actions.export',
    view: 'control.actions.view'
  },
  
  // Visualizações
  views: {
    list: 'control.views.list',
    grid: 'control.views.grid',
    effectiveness: 'control.views.effectiveness'
  },
  
  // Validação
  validation: {
    name_min: 'control.validation.name_min',
    description_min: 'control.validation.description_min',
    effectiveness_min: 'control.validation.effectiveness_min',
    effectiveness_max: 'control.validation.effectiveness_max',
    cost_positive: 'control.validation.cost_positive'
  },
  
  // Status específicos
  status: {
    planned: 'control.status.planned',
    implemented: 'control.status.implemented',
    operational: 'control.status.operational',
    deprecated: 'control.status.deprecated'
  }
}

// =====================================================
// MOCK DATA
// =====================================================

export const mockControls: Control[] = [
  {
    id: '1',
    name: 'Controle de Acesso por Função (RBAC)',
    description: 'Implementação de controle de acesso baseado em funções para sistemas críticos',
    control_type: 'preventive',
    implementation_status: 'operational',
    effectiveness_score: 85,
    domain_id: '2',
    policy_ids: ['1'],
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    owner: 'admin',
    cost: 15000,
    priority: 'high',
    last_assessment_date: '2024-01-10T10:00:00Z',
    next_assessment_date: '2024-04-10T10:00:00Z',
    tags: ['acesso', 'rbac', 'autenticação'],
    notes: 'Controle implementado com sucesso. Monitoramento contínuo necessário.',
    metrics: {
      'incidentes_prevenidos': {
        value: 12,
        unit: 'incidentes',
        target: 10,
        current: 12
      },
      'tempo_resposta': {
        value: 2.5,
        unit: 'minutos',
        target: 5,
        current: 2.5
      }
    }
  },
  {
    id: '2',
    name: 'Autenticação Multi-Fator (MFA)',
    description: 'Implementação de autenticação multi-fator para todos os usuários',
    control_type: 'preventive',
    implementation_status: 'implemented',
    effectiveness_score: 92,
    domain_id: '3',
    policy_ids: ['1'],
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    owner: 'manager',
    cost: 8000,
    priority: 'critical',
    last_assessment_date: '2024-01-05T10:00:00Z',
    next_assessment_date: '2024-03-05T10:00:00Z',
    tags: ['mfa', 'autenticação', 'segurança'],
    notes: 'MFA implementado com sucesso. Taxa de adoção de 95%.',
    metrics: {
      'taxa_adoção': {
        value: 95,
        unit: '%',
        target: 90,
        current: 95
      },
      'tentativas_bloqueadas': {
        value: 45,
        unit: 'tentativas',
        target: 30,
        current: 45
      }
    }
  },
  {
    id: '3',
    name: 'Monitoramento de Rede (IDS/IPS)',
    description: 'Sistema de detecção e prevenção de intrusões na rede',
    control_type: 'detective',
    implementation_status: 'operational',
    effectiveness_score: 78,
    domain_id: '5',
    policy_ids: ['1'],
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-01-08T10:00:00Z',
    owner: 'admin',
    cost: 25000,
    priority: 'high',
    last_assessment_date: '2024-01-12T10:00:00Z',
    next_assessment_date: '2024-04-12T10:00:00Z',
    tags: ['rede', 'ids', 'ips', 'monitoramento'],
    notes: 'Sistema operacional. Necessita ajustes na configuração de alertas.',
    metrics: {
      'alertas_gerados': {
        value: 156,
        unit: 'alertas',
        target: 100,
        current: 156
      },
      'falsos_positivos': {
        value: 12,
        unit: '%',
        target: 10,
        current: 12
      }
    }
  }
] 