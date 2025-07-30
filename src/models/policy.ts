import { z } from 'zod'
import { Shield, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Upload } from 'lucide-react'
import { MCPModelType } from './index'
import { 
  BaseEntity, 
  ApprovalStatus, 
  User, 
  baseEntitySchema, 
  approvalStatusSchema,
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  canApprove,
  formatDate,
  getStatusColor,
  getStatusIcon
} from './base'

// =====================================================
// TYPES
// =====================================================

export type Policy = BaseEntity & {
  name: string
  description: string
  content: string
  version: string
  status: ApprovalStatus
  organization_id?: string
  approved_by?: string
  approved_at?: string
  effective_date?: string
  review_date?: string
  tags?: string[]
  category?: string
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
  compliance_frameworks?: string[]
}

// =====================================================
// ZOD SCHEMAS
// =====================================================

export const createPolicySchema = (t: any) => z.object({
  name: z.string().min(2, t('policy.validation.name_min')),
  description: z.string().min(10, t('policy.validation.description_min')),
  content: z.string().min(50, t('policy.validation.content_min')),
  version: z.string().default('1.0'),
  status: approvalStatusSchema.default('draft'),
  organization_id: z.string().uuid().optional(),
  effective_date: z.string().datetime().optional(),
  review_date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  compliance_frameworks: z.array(z.string()).optional(),
})

export const updatePolicySchema = (t: any) => createPolicySchema(t).partial()

export const approvePolicySchema = z.object({
  approved_by: z.string().uuid(),
  approved_at: z.string().datetime(),
  effective_date: z.string().datetime().optional(),
})

// =====================================================
// PERMISSIONS
// =====================================================

export const policyPermissions = {
  canCreate: (user: User, tenantId: string): boolean => {
    return canCreate(user, tenantId)
  },
  
  canRead: (user: User, policy: Policy): boolean => {
    return canRead(user, policy)
  },
  
  canUpdate: (user: User, policy: Policy): boolean => {
    // Apenas rascunhos podem ser editados
    if (policy.status !== 'draft') return false
    return canUpdate(user, policy)
  },
  
  canDelete: (user: User, policy: Policy): boolean => {
    // Apenas rascunhos podem ser excluídos
    if (policy.status !== 'draft') return false
    return canDelete(user, policy)
  },
  
  canApprove: (user: User, policy: Policy): boolean => {
    // Apenas pendentes podem ser aprovadas
    if (policy.status !== 'pending') return false
    return canApprove(user, policy)
  },
  
  canReject: (user: User, policy: Policy): boolean => {
    // Apenas pendentes podem ser rejeitadas
    if (policy.status !== 'pending') return false
    return canApprove(user, policy)
  },
  
  canExport: (user: User, policy: Policy): boolean => {
    return canRead(user, policy)
  }
}

// =====================================================
// METADATA
// =====================================================

export const policyMeta = {
  type: 'policy' as MCPModelType,
  icon: Shield,
  title: 'models.policy.title',
  description: 'models.policy.description',
  fields: {
    name: {
      label: 'forms.policy.name',
      type: 'text' as const,
      required: true,
      validation: { min: 2 },
      placeholder: 'forms.policy.name_placeholder'
    },
    description: {
      label: 'forms.policy.description',
      type: 'textarea' as const,
      required: true,
      validation: { min: 10 },
      placeholder: 'forms.policy.description_placeholder'
    },
    content: {
      label: 'forms.policy.content',
      type: 'textarea' as const,
      required: true,
      validation: { min: 50 },
      placeholder: 'forms.policy.content_placeholder'
    },
    version: {
      label: 'forms.policy.version',
      type: 'text' as const,
      required: true,
      validation: { pattern: '^\\d+\\.\\d+$' },
      placeholder: 'forms.policy.version_placeholder'
    },
    status: {
      label: 'forms.policy.status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'draft', label: 'status.draft' },
        { value: 'pending', label: 'status.pending' },
        { value: 'approved', label: 'status.approved' },
        { value: 'rejected', label: 'status.rejected' }
      ]
    },
    category: {
      label: 'forms.policy.category',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'access_control', label: 'policy.categories.access_control' },
        { value: 'data_protection', label: 'policy.categories.data_protection' },
        { value: 'network_security', label: 'policy.categories.network_security' },
        { value: 'incident_response', label: 'policy.categories.incident_response' },
        { value: 'business_continuity', label: 'policy.categories.business_continuity' }
      ]
    },
    risk_level: {
      label: 'forms.policy.risk_level',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'low', label: 'policy.risk_levels.low' },
        { value: 'medium', label: 'policy.risk_levels.medium' },
        { value: 'high', label: 'policy.risk_levels.high' },
        { value: 'critical', label: 'policy.risk_levels.critical' }
      ]
    },
    effective_date: {
      label: 'forms.policy.effective_date',
      type: 'date' as const,
      required: false
    },
    review_date: {
      label: 'forms.policy.review_date',
      type: 'date' as const,
      required: false
    },
    tags: {
      label: 'forms.policy.tags',
      type: 'tags' as const,
      required: false,
      placeholder: 'forms.policy.tags_placeholder'
    },
    documentUrl: {
      label: 'forms.policy.document_url',
      type: 'file' as const,
      required: false,
      accept: '.pdf,.doc,.docx,.txt',
      maxSize: 10 * 1024 * 1024 // 10MB
    }
  }
}

// =====================================================
// UTILITIES
// =====================================================

export const getPolicyStatusInfo = (status: ApprovalStatus) => {
  const statusInfo = {
    draft: {
      color: 'bg-gray-500',
      icon: FileText,
      label: 'status.draft'
    },
    pending: {
      color: 'bg-yellow-500',
      icon: Clock,
      label: 'status.pending'
    },
    approved: {
      color: 'bg-green-500',
      icon: CheckCircle,
      label: 'status.approved'
    },
    rejected: {
      color: 'bg-red-500',
      icon: XCircle,
      label: 'status.rejected'
    }
  }
  
  return statusInfo[status] || statusInfo.draft
}

export const getPolicyRiskLevelInfo = (riskLevel: string) => {
  const riskInfo = {
    low: {
      color: 'bg-green-500',
      label: 'policy.risk_levels.low'
    },
    medium: {
      color: 'bg-yellow-500',
      label: 'policy.risk_levels.medium'
    },
    high: {
      color: 'bg-orange-500',
      label: 'policy.risk_levels.high'
    },
    critical: {
      color: 'bg-red-500',
      label: 'policy.risk_levels.critical'
    }
  }
  
  return riskInfo[riskLevel as keyof typeof riskInfo] || riskInfo.low
}

export const formatPolicyDate = (date: string): string => {
  return formatDate(date)
}

export const isPolicyExpired = (policy: Policy): boolean => {
  if (!policy.review_date) return false
  return new Date(policy.review_date) < new Date()
}

export const isPolicyEffective = (policy: Policy): boolean => {
  if (!policy.effective_date) return false
  return new Date(policy.effective_date) <= new Date()
}

// =====================================================
// I18N KEYS
// =====================================================

export const policyI18nKeys = {
  // Títulos
  title: 'policy.title',
  subtitle: 'policy.subtitle',
  new_policy: 'policy.new_policy',
  edit_policy: 'policy.edit_policy',
  
  // Campos
  content: 'policy.content',
  version: 'policy.version',
  category: 'policy.category',
  risk_level: 'policy.risk_level',
  effective_date: 'policy.effective_date',
  review_date: 'policy.review_date',
  tags: 'policy.tags',
  approved_by: 'policy.approved_by',
  approved_at: 'policy.approved_at',
  
  // Categorias
  categories: {
    access_control: 'policy.categories.access_control',
    data_protection: 'policy.categories.data_protection',
    network_security: 'policy.categories.network_security',
    incident_response: 'policy.categories.incident_response',
    business_continuity: 'policy.categories.business_continuity'
  },
  
  // Níveis de Risco
  risk_levels: {
    low: 'policy.risk_levels.low',
    medium: 'policy.risk_levels.medium',
    high: 'policy.risk_levels.high',
    critical: 'policy.risk_levels.critical'
  },
  
  // Ações
  actions: {
    create: 'policy.actions.create',
    edit: 'policy.actions.edit',
    delete: 'policy.actions.delete',
    approve: 'policy.actions.approve',
    reject: 'policy.actions.reject',
    export: 'policy.actions.export',
    view: 'policy.actions.view'
  },
  
  // Visualizações
  views: {
    list: 'policy.views.list',
    grid: 'policy.views.grid',
    timeline: 'policy.views.timeline'
  },
  
  // Validação
  validation: {
    name_min: 'policy.validation.name_min',
    description_min: 'policy.validation.description_min',
    content_min: 'policy.validation.content_min',
    version_format: 'policy.validation.version_format',
    effective_date_future: 'policy.validation.effective_date_future',
    review_date_future: 'policy.validation.review_date_future'
  },
  
  // Status específicos
  status: {
    draft: 'policy.status.draft',
    pending: 'policy.status.pending',
    approved: 'policy.status.approved',
    rejected: 'policy.status.rejected'
  }
}

// =====================================================
// MOCK DATA
// =====================================================

export const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'Política de Controle de Acesso',
    description: 'Define os controles de acesso físico e lógico aos recursos da organização',
    content: 'Esta política estabelece os requisitos para controle de acesso...',
    version: '1.0',
    status: 'approved',
    organization_id: 'org-1',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    approved_by: 'admin',
    approved_at: '2024-01-20T10:00:00Z',
    effective_date: '2024-02-01T00:00:00Z',
    review_date: '2025-01-15T00:00:00Z',
    category: 'access_control',
    risk_level: 'high',
    tags: ['acesso', 'segurança', 'controle'],
    compliance_frameworks: ['ISO27001', 'NIST']
  },
  {
    id: '2',
    name: 'Política de Proteção de Dados',
    description: 'Estabelece diretrizes para proteção de dados pessoais e sensíveis',
    content: 'Esta política define os requisitos para proteção de dados...',
    version: '2.1',
    status: 'pending',
    organization_id: 'org-1',
    tenant_id: 'dev-tenant',
    created_by: 'manager',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    category: 'data_protection',
    risk_level: 'critical',
    tags: ['dados', 'privacidade', 'lgpd'],
    compliance_frameworks: ['LGPD', 'GDPR']
  }
] 