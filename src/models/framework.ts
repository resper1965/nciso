import { z } from 'zod'
import { Shield, FileText, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react'
import { MCPModelType } from './index'

// =====================================================
// FRAMEWORK MODEL - MCP COMPLIANCE FRAMEWORKS
// =====================================================

export type FrameworkType = 'iso27001' | 'nist' | 'cobit' | 'pci-dss' | 'sox' | 'gdpr' | 'custom'

export interface Framework {
  id: string
  name: string
  type: FrameworkType
  version: string
  description: string
  status: 'active' | 'inactive' | 'deprecated'
  total_controls: number
  mapped_controls: number
  coverage_percentage: number
  tenant_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface FrameworkControl {
  id: string
  framework_id: string
  control_id: string
  control_name: string
  control_description: string
  domain: string
  category: string
  priority: 'high' | 'medium' | 'low'
  status: 'mapped' | 'unmapped' | 'partial'
  mapped_internal_controls: string[]
  created_at: string
  updated_at: string
}

export interface ControlFrameworkMapping {
  id: string
  internal_control_id: string
  framework_control_id: string
  framework_id: string
  confidence_level: 'high' | 'medium' | 'low'
  mapping_type: 'direct' | 'partial' | 'custom'
  notes: string
  evidence: string
  last_reviewed: string
  reviewed_by: string
  tenant_id: string
  created_by: string
  created_at: string
  updated_at: string
}

// =====================================================
// ZOD SCHEMAS
// =====================================================

export const FrameworkSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'forms.framework.name_min'),
  type: z.enum(['iso27001', 'nist', 'cobit', 'pci-dss', 'sox', 'gdpr', 'custom']),
  version: z.string().min(1, 'forms.framework.version_required'),
  description: z.string().min(10, 'forms.framework.description_min'),
  status: z.enum(['active', 'inactive', 'deprecated']),
  total_controls: z.number().int().min(0),
  mapped_controls: z.number().int().min(0),
  coverage_percentage: z.number().min(0).max(100),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const FrameworkControlSchema = z.object({
  id: z.string().uuid(),
  framework_id: z.string().uuid(),
  control_id: z.string().min(1, 'forms.framework_control.id_required'),
  control_name: z.string().min(2, 'forms.framework_control.name_min'),
  control_description: z.string().min(10, 'forms.framework_control.description_min'),
  domain: z.string().min(1, 'forms.framework_control.domain_required'),
  category: z.string().min(1, 'forms.framework_control.category_required'),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['mapped', 'unmapped', 'partial']),
  mapped_internal_controls: z.array(z.string().uuid()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const ControlFrameworkMappingSchema = z.object({
  id: z.string().uuid(),
  internal_control_id: z.string().uuid(),
  framework_control_id: z.string().uuid(),
  framework_id: z.string().uuid(),
  confidence_level: z.enum(['high', 'medium', 'low']),
  mapping_type: z.enum(['direct', 'partial', 'custom']),
  notes: z.string().optional(),
  evidence: z.string().optional(),
  last_reviewed: z.string().datetime().optional(),
  reviewed_by: z.string().uuid().optional(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// =====================================================
// MCP METADATA
// =====================================================

export const FrameworkModelMeta = {
  type: 'framework' as MCPModelType,
  icon: Shield,
  title: 'models.framework.title',
  description: 'models.framework.description',
  fields: {
    name: {
      label: 'forms.framework.name',
      type: 'text' as const,
      required: true,
      validation: { min: 2 }
    },
    type: {
      label: 'forms.framework.type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'iso27001', label: 'models.framework.types.iso27001' },
        { value: 'nist', label: 'models.framework.types.nist' },
        { value: 'cobit', label: 'models.framework.types.cobit' },
        { value: 'pci-dss', label: 'models.framework.types.pci_dss' },
        { value: 'sox', label: 'models.framework.types.sox' },
        { value: 'gdpr', label: 'models.framework.types.gdpr' },
        { value: 'custom', label: 'models.framework.types.custom' }
      ]
    },
    version: {
      label: 'forms.framework.version',
      type: 'text' as const,
      required: true,
      placeholder: 'forms.framework.version_placeholder'
    },
    description: {
      label: 'forms.framework.description',
      type: 'textarea' as const,
      required: true,
      validation: { min: 10 }
    },
    status: {
      label: 'forms.framework.status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'status.active' },
        { value: 'inactive', label: 'status.inactive' },
        { value: 'deprecated', label: 'status.deprecated' }
      ]
    }
  }
}

export const FrameworkControlModelMeta = {
  type: 'framework_control' as MCPModelType,
  icon: FileText,
  title: 'models.framework_control.title',
  description: 'models.framework_control.description',
  fields: {
    control_id: {
      label: 'forms.framework_control.id',
      type: 'text' as const,
      required: true,
      placeholder: 'forms.framework_control.id_placeholder'
    },
    control_name: {
      label: 'forms.framework_control.name',
      type: 'text' as const,
      required: true,
      validation: { min: 2 }
    },
    control_description: {
      label: 'forms.framework_control.description',
      type: 'textarea' as const,
      required: true,
      validation: { min: 10 }
    },
    domain: {
      label: 'forms.framework_control.domain',
      type: 'text' as const,
      required: true,
      placeholder: 'forms.framework_control.domain_placeholder'
    },
    category: {
      label: 'forms.framework_control.category',
      type: 'text' as const,
      required: true,
      placeholder: 'forms.framework_control.category_placeholder'
    },
    priority: {
      label: 'forms.framework_control.priority',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'high', label: 'priority.high' },
        { value: 'medium', label: 'priority.medium' },
        { value: 'low', label: 'priority.low' }
      ]
    },
    status: {
      label: 'forms.framework_control.status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'mapped', label: 'status.mapped' },
        { value: 'unmapped', label: 'status.unmapped' },
        { value: 'partial', label: 'status.partial' }
      ]
    }
  }
}

export const ControlFrameworkMappingModelMeta = {
  type: 'control_framework_mapping' as MCPModelType,
  icon: CheckCircle,
  title: 'models.control_framework_mapping.title',
  description: 'models.control_framework_mapping.description',
  fields: {
    internal_control_id: {
      label: 'forms.mapping.internal_control',
      type: 'relation' as const,
      required: true,
      relation: 'control'
    },
    framework_control_id: {
      label: 'forms.mapping.framework_control',
      type: 'relation' as const,
      required: true,
      relation: 'framework_control'
    },
    framework_id: {
      label: 'forms.mapping.framework',
      type: 'relation' as const,
      required: true,
      relation: 'framework'
    },
    confidence_level: {
      label: 'forms.mapping.confidence_level',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'high', label: 'confidence.high' },
        { value: 'medium', label: 'confidence.medium' },
        { value: 'low', label: 'confidence.low' }
      ]
    },
    mapping_type: {
      label: 'forms.mapping.mapping_type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'direct', label: 'mapping_type.direct' },
        { value: 'partial', label: 'mapping_type.partial' },
        { value: 'custom', label: 'mapping_type.custom' }
      ]
    },
    notes: {
      label: 'forms.mapping.notes',
      type: 'textarea' as const,
      required: false,
      placeholder: 'forms.mapping.notes_placeholder'
    },
    evidence: {
      label: 'forms.mapping.evidence',
      type: 'textarea' as const,
      required: false,
      placeholder: 'forms.mapping.evidence_placeholder'
    }
  }
}

// =====================================================
// MOCK DATA
// =====================================================

export const getFrameworkMockData = (): Framework[] => [
  {
    id: '1',
    name: 'ISO 27001:2022',
    type: 'iso27001',
    version: '2022',
    description: 'Sistema de Gestão da Segurança da Informação',
    status: 'active',
    total_controls: 114,
    mapped_controls: 89,
    coverage_percentage: 78.1,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'NIST Cybersecurity Framework',
    type: 'nist',
    version: '2.0',
    description: 'Framework de Cibersegurança do NIST',
    status: 'active',
    total_controls: 108,
    mapped_controls: 72,
    coverage_percentage: 66.7,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'COBIT 2019',
    type: 'cobit',
    version: '2019',
    description: 'Framework de Governança de TI',
    status: 'active',
    total_controls: 40,
    mapped_controls: 28,
    coverage_percentage: 70.0,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

export const getFrameworkControlMockData = (frameworkId: string): FrameworkControl[] => [
  {
    id: '1',
    framework_id: frameworkId,
    control_id: 'A.5.1',
    control_name: 'Políticas de Segurança da Informação',
    control_description: 'Estabelecer políticas de segurança da informação',
    domain: 'Organizational Controls',
    category: 'Information Security Policies',
    priority: 'high',
    status: 'mapped',
    mapped_internal_controls: ['control-1', 'control-2'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    framework_id: frameworkId,
    control_id: 'A.5.2',
    control_name: 'Organização da Segurança da Informação',
    control_description: 'Definir responsabilidades de segurança',
    domain: 'Organizational Controls',
    category: 'Information Security Organization',
    priority: 'high',
    status: 'mapped',
    mapped_internal_controls: ['control-3'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    framework_id: frameworkId,
    control_id: 'A.6.1',
    control_name: 'Contratos com Terceiros',
    control_description: 'Incluir requisitos de segurança em contratos',
    domain: 'Organizational Controls',
    category: 'Human Resource Security',
    priority: 'medium',
    status: 'unmapped',
    mapped_internal_controls: [],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

export const getControlFrameworkMappingMockData = (): ControlFrameworkMapping[] => [
  {
    id: '1',
    internal_control_id: 'control-1',
    framework_control_id: '1',
    framework_id: '1',
    confidence_level: 'high',
    mapping_type: 'direct',
    notes: 'Mapeamento direto entre controle interno e ISO 27001',
    evidence: 'Documentação de políticas de segurança',
    last_reviewed: '2024-01-15T10:00:00Z',
    reviewed_by: 'admin',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    internal_control_id: 'control-2',
    framework_control_id: '1',
    framework_id: '1',
    confidence_level: 'medium',
    mapping_type: 'partial',
    notes: 'Mapeamento parcial - cobre apenas parte do requisito',
    evidence: 'Implementação parcial de controles',
    last_reviewed: '2024-01-15T10:00:00Z',
    reviewed_by: 'admin',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

// =====================================================
// UTILITIES
// =====================================================

export const getFrameworkTypeLabel = (type: FrameworkType): string => {
  const labels = {
    iso27001: 'ISO 27001',
    nist: 'NIST CSF',
    cobit: 'COBIT',
    'pci-dss': 'PCI DSS',
    sox: 'SOX',
    gdpr: 'GDPR',
    custom: 'Custom'
  }
  return labels[type] || type
}

export const getFrameworkTypeColor = (type: FrameworkType): string => {
  const colors = {
    iso27001: 'bg-blue-100 text-blue-800',
    nist: 'bg-green-100 text-green-800',
    cobit: 'bg-purple-100 text-purple-800',
    'pci-dss': 'bg-red-100 text-red-800',
    sox: 'bg-orange-100 text-orange-800',
    gdpr: 'bg-yellow-100 text-yellow-800',
    custom: 'bg-gray-100 text-gray-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export const getConfidenceLevelColor = (level: string): string => {
  const colors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800'
  }
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export const getMappingTypeColor = (type: string): string => {
  const colors = {
    direct: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    custom: 'bg-blue-100 text-blue-800'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export const calculateCoveragePercentage = (mapped: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((mapped / total) * 100)
}

export const getCoverageStatus = (percentage: number): string => {
  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'poor'
}

export const getCoverageColor = (percentage: number): string => {
  const status = getCoverageStatus(percentage)
  const colors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
} 