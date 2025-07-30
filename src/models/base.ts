import { z } from 'zod'
import { Shield, Users, Network, FileText, Settings, AlertTriangle } from 'lucide-react'

// =====================================================
// TYPES BASE
// =====================================================

export type BaseEntity = {
  id: string
  tenant_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export type ImplementationStatus = 'planned' | 'implemented' | 'operational' | 'deprecated'

export type User = {
  user_id: string
  email: string
  role: 'admin' | 'manager' | 'user'
  tenant_id: string
  permissions: string[]
}

// =====================================================
// SCHEMAS BASE
// =====================================================

export const baseEntitySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const approvalStatusSchema = z.enum(['draft', 'pending', 'approved', 'rejected'])

export const implementationStatusSchema = z.enum(['planned', 'implemented', 'operational', 'deprecated'])

// =====================================================
// PERMISSIONS BASE
// =====================================================

export type Permission = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export'

export const checkPermission = (user: User, permission: Permission, resource?: any): boolean => {
  // Admin tem todas as permissões
  if (user.role === 'admin') return true
  
  // Verificar permissões específicas do usuário
  if (user.permissions.includes(permission)) return true
  
  // Verificar se o recurso pertence ao usuário (para edit/delete)
  if (resource && resource.created_by === user.user_id) {
    return ['read', 'update'].includes(permission)
  }
  
  return false
}

export const canCreate = (user: User, tenantId: string): boolean => {
  return user.tenant_id === tenantId && checkPermission(user, 'create')
}

export const canRead = (user: User, resource: BaseEntity): boolean => {
  return user.tenant_id === resource.tenant_id && checkPermission(user, 'read', resource)
}

export const canUpdate = (user: User, resource: BaseEntity): boolean => {
  return user.tenant_id === resource.tenant_id && checkPermission(user, 'update', resource)
}

export const canDelete = (user: User, resource: BaseEntity): boolean => {
  return user.tenant_id === resource.tenant_id && checkPermission(user, 'delete', resource)
}

export const canApprove = (user: User, resource: BaseEntity): boolean => {
  return user.tenant_id === resource.tenant_id && checkPermission(user, 'approve', resource)
}

// =====================================================
// METADATA BASE
// =====================================================

export type ModelMeta = {
  displayName: string
  displayNamePlural: string
  icon: any
  color: string
  permissions: Permission[]
  fields: {
    [key: string]: {
      label: string
      type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean' | 'relation'
      required: boolean
      options?: { value: string; label: string }[]
      validation?: any
    }
  }
  actions: {
    [key: string]: {
      label: string
      icon: any
      permission: Permission
      variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    }
  }
  views: {
    [key: string]: {
      label: string
      icon: any
      component: string
    }
  }
}

// =====================================================
// UTILITIES BASE
// =====================================================

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusColor = (status: string): string => {
  const colors = {
    draft: 'bg-gray-500',
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    planned: 'bg-blue-500',
    implemented: 'bg-green-500',
    operational: 'bg-green-600',
    deprecated: 'bg-red-600'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

export const getStatusIcon = (status: string): any => {
  const icons = {
    draft: FileText,
    pending: AlertTriangle,
    approved: Shield,
    rejected: AlertTriangle,
    planned: Settings,
    implemented: Shield,
    operational: Shield,
    deprecated: AlertTriangle
  }
  return icons[status as keyof typeof icons] || FileText
}

// =====================================================
// I18N KEYS BASE
// =====================================================

export const baseI18nKeys = {
  // Status
  status: {
    draft: 'status.draft',
    pending: 'status.pending',
    approved: 'status.approved',
    rejected: 'status.rejected',
    planned: 'status.planned',
    implemented: 'status.implemented',
    operational: 'status.operational',
    deprecated: 'status.deprecated'
  },
  // Actions
  actions: {
    create: 'actions.create',
    edit: 'actions.edit',
    delete: 'actions.delete',
    view: 'actions.view',
    approve: 'actions.approve',
    reject: 'actions.reject',
    export: 'actions.export',
    save: 'actions.save',
    cancel: 'actions.cancel',
    close: 'actions.close'
  },
  // Forms
  forms: {
    name: 'forms.name',
    description: 'forms.description',
    status: 'forms.status',
    created_at: 'forms.created_at',
    updated_at: 'forms.updated_at',
    created_by: 'forms.created_by',
    loading: 'forms.loading',
    saving: 'forms.saving',
    error: 'forms.error',
    success: 'forms.success'
  },
  // Messages
  messages: {
    confirm: {
      delete: 'messages.confirm.delete',
      save: 'messages.confirm.save',
      approve: 'messages.confirm.approve',
      reject: 'messages.confirm.reject'
    },
    success: {
      created: 'messages.success.created',
      updated: 'messages.success.updated',
      deleted: 'messages.success.deleted',
      approved: 'messages.success.approved',
      rejected: 'messages.success.rejected'
    },
    error: {
      not_found: 'messages.error.not_found',
      unauthorized: 'messages.error.unauthorized',
      forbidden: 'messages.error.forbidden',
      validation: 'messages.error.validation'
    }
  }
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export type ApiResponse<T> = {
  message: string
  data?: T
  error?: string
  total?: number
  page?: number
  limit?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

export const createI18nSchema = (t: any) => ({
  name: z.string().min(2, t('validation.name_min')),
  description: z.string().min(10, t('validation.description_min')),
  tenant_id: z.string().uuid(t('validation.tenant_required')),
})

export const validateTenantAccess = (user: User, tenantId: string): boolean => {
  return user.tenant_id === tenantId || user.role === 'admin'
}

export const validateResourceAccess = (user: User, resource: BaseEntity): boolean => {
  return validateTenantAccess(user, resource.tenant_id)
} 