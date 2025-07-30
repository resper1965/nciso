// =====================================================
// MCP - MODEL CONTENT PROTOCOL
// =====================================================

// Base exports
export * from './base'

// Model exports
export * from './policy'
export * from './control'
export * from './domain'
export * from './framework'
export * from './control-assessment'

// =====================================================
// MCP REGISTRY
// =====================================================

import { policyMeta, Policy } from './policy'
import { controlMeta, Control } from './control'
import { domainMeta, Domain } from './domain'
import { FrameworkModelMeta, Framework } from './framework'
import { assessmentMeta, ControlAssessment } from './control-assessment'

export type MCPModel = Policy | Control | Domain | Framework | ControlAssessment

export type MCPModelType = 'policy' | 'control' | 'domain' | 'framework' | 'control_assessment'

export const MCPRegistry = {
  policy: {
    meta: policyMeta,
    type: 'policy' as const,
    model: Policy
  },
  control: {
    meta: controlMeta,
    type: 'control' as const,
    model: Control
  },
  domain: {
    meta: domainMeta,
    type: 'domain' as const,
    model: Domain
  },
  framework: {
    meta: FrameworkModelMeta,
    type: 'framework' as const,
    model: Framework
  },
  control_assessment: {
    meta: assessmentMeta,
    type: 'control_assessment' as const,
    model: ControlAssessment
  }
}

// =====================================================
// MCP UTILITIES
// =====================================================

export const getMCPModel = (type: MCPModelType) => {
  return MCPRegistry[type]
}

export const getAllMCPModels = () => {
  return Object.values(MCPRegistry)
}

export const getMCPModelMeta = (type: MCPModelType) => {
  return MCPRegistry[type].meta
}

export const isMCPModel = (obj: any): obj is MCPModel => {
  return obj && typeof obj === 'object' && 'id' in obj && 'tenant_id' in obj
}

export const getMCPModelType = (obj: MCPModel): MCPModelType => {
  if ('content' in obj && 'version' in obj) return 'policy'
  if ('control_type' in obj && 'effectiveness_score' in obj) return 'control'
  if ('level' in obj && 'path' in obj) return 'domain'
  if ('type' in obj && 'version' in obj && 'total_controls' in obj) return 'framework'
  if ('score' in obj && 'justification' in obj && 'assessed_by' in obj) return 'control_assessment'
  throw new Error('Unknown MCP model type')
}

// =====================================================
// MCP VALIDATION
// =====================================================

export const validateMCPModel = (type: MCPModelType, data: any) => {
  const model = getMCPModel(type)
  // Aqui você pode adicionar validação específica por tipo
  return data
}

// =====================================================
// MCP PERMISSIONS
// =====================================================

import { User } from './base'
import { policyPermissions } from './policy'
import { controlPermissions } from './control'
import { domainPermissions } from './domain'
import { assessmentPermissions } from './control-assessment'

export const MCPPermissions = {
  policy: policyPermissions,
  control: controlPermissions,
  domain: domainPermissions,
  framework: {
    canCreate: (user: User, tenantId: string) => user.role === 'admin',
    canRead: (user: User, resource?: any) => true,
    canUpdate: (user: User, resource?: any) => user.role === 'admin',
    canDelete: (user: User, resource?: any) => user.role === 'admin',
    canExport: (user: User, resource?: any) => user.role === 'admin' || user.role === 'auditor'
  },
  control_assessment: assessmentPermissions
}

export const checkMCPPermission = (
  type: MCPModelType,
  permission: string,
  user: User,
  resource?: any,
  tenantId?: string
) => {
  const permissions = MCPPermissions[type]
  
  switch (permission) {
    case 'create':
      return permissions.canCreate(user, tenantId!)
    case 'read':
      return permissions.canRead(user, resource)
    case 'update':
      return permissions.canUpdate(user, resource)
    case 'delete':
      return permissions.canDelete(user, resource)
    case 'export':
      return permissions.canExport(user, resource)
    default:
      return false
  }
}

// =====================================================
// MCP I18N KEYS
// =====================================================

import { policyI18nKeys } from './policy'
import { controlI18nKeys } from './control'
import { domainI18nKeys } from './domain'
import { assessmentI18nKeys } from './control-assessment'

export const MCPI18nKeys = {
  policy: policyI18nKeys,
  control: controlI18nKeys,
  domain: domainI18nKeys,
  framework: {
    title: 'models.framework.title',
    description: 'models.framework.description',
    fields: {
      name: 'forms.framework.name',
      type: 'forms.framework.type',
      version: 'forms.framework.version',
      description: 'forms.framework.description',
      status: 'forms.framework.status'
    }
  },
  control_assessment: assessmentI18nKeys
}

export const getMCPI18nKeys = (type: MCPModelType) => {
  return MCPI18nKeys[type]
}

// =====================================================
// MCP MOCK DATA
// =====================================================

import { mockPolicies } from './policy'
import { mockControls } from './control'
import { mockDomains } from './domain'
import { getFrameworkMockData } from './framework'
import { mockAssessments } from './control-assessment'

export const MCPMockData = {
  policy: mockPolicies,
  control: mockControls,
  domain: mockDomains,
  framework: getFrameworkMockData(),
  control_assessment: mockAssessments
}

export const getMCPMockData = (type: MCPModelType) => {
  return MCPMockData[type]
}

// =====================================================
// MCP SCHEMAS
// =====================================================

import { createPolicySchema, updatePolicySchema } from './policy'
import { createControlSchema, updateControlSchema } from './control'
import { createDomainSchema, updateDomainSchema } from './domain'
import { FrameworkSchema } from './framework'
import { createAssessmentSchema, updateAssessmentSchema } from './control-assessment'

export const MCPSchemas = {
  policy: {
    create: createPolicySchema,
    update: updatePolicySchema
  },
  control: {
    create: createControlSchema,
    update: updateControlSchema
  },
  domain: {
    create: createDomainSchema,
    update: updateDomainSchema
  },
  framework: {
    create: FrameworkSchema,
    update: FrameworkSchema
  },
  control_assessment: {
    create: createAssessmentSchema,
    update: updateAssessmentSchema
  }
}

export const getMCPSchema = (type: MCPModelType, operation: 'create' | 'update') => {
  return MCPSchemas[type][operation]
}

// =====================================================
// MCP FACTORY
// =====================================================

export class MCPFactory {
  static createModel(type: MCPModelType, data: Partial<MCPModel>): MCPModel {
    const model = getMCPModel(type)
    const schema = getMCPSchema(type, 'create')
    
    // Aqui você pode adicionar lógica de criação específica
    return {
      id: data.id || crypto.randomUUID(),
      tenant_id: data.tenant_id || '',
      created_by: data.created_by || '',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      ...data
    } as MCPModel
  }
  
  static validateModel(type: MCPModelType, data: any, t: any) => {
    const schema = getMCPSchema(type, 'create')(t)
    return schema.parse(data)
  }
  
  static getModelMeta(type: MCPModelType) {
    return getMCPModelMeta(type)
  }
  
  static getModelPermissions(type: MCPModelType) {
    return MCPPermissions[type]
  }
  
  static getModelI18nKeys(type: MCPModelType) {
    return getMCPI18nKeys(type)
  }
  
  static getModelMockData(type: MCPModelType) {
    return getMCPMockData(type)
  }
}

// =====================================================
// MCP TYPES
// =====================================================

export type MCPModelConfig = {
  type: MCPModelType
  meta: any
  permissions: any
  i18nKeys: any
  schemas: any
  mockData: any[]
}

export type MCPRegistryConfig = {
  [K in MCPModelType]: MCPModelConfig
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  registry: MCPRegistry,
  permissions: MCPPermissions,
  i18nKeys: MCPI18nKeys,
  schemas: MCPSchemas,
  mockData: MCPMockData,
  factory: MCPFactory
} 