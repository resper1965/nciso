// Tipos para o módulo n.Controls

export interface Control {
  id: string
  name: string
  description: string
  type: ControlType
  domain: ControlDomain
  framework: ControlFramework
  status: ControlStatus
  effectiveness: number // 0-100
  priority: ControlPriority
  owner?: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export type ControlType = 'preventive' | 'corrective' | 'detective' | 'deterrent'

export type ControlStatus = 'active' | 'inactive' | 'draft' | 'archived'

export type ControlPriority = 'low' | 'medium' | 'high' | 'critical'

export type ControlFramework = 'iso27001' | 'nist' | 'cobit' | 'custom'

export type ControlDomain = 
  | 'access_control'
  | 'asset_management'
  | 'business_continuity'
  | 'communications'
  | 'compliance'
  | 'cryptography'
  | 'human_resources'
  | 'incident_management'
  | 'operations'
  | 'physical_security'
  | 'risk_management'
  | 'security_architecture'
  | 'supplier_relationships'
  | 'system_development'

export interface ControlFilters {
  search?: string
  type?: ControlType
  status?: ControlStatus
  framework?: ControlFramework
  domain?: ControlDomain
  priority?: ControlPriority
  effectiveness_min?: number
  effectiveness_max?: number
}

export interface ControlStats {
  total_controls: number
  active_controls: number
  average_effectiveness: number
  controls_by_type: Record<ControlType, number>
  controls_by_domain: Record<ControlDomain, number>
  controls_by_framework: Record<ControlFramework, number>
  controls_by_priority: Record<ControlPriority, number>
}

export interface ControlFormData {
  name: string
  description: string
  type: ControlType
  domain: ControlDomain
  framework: ControlFramework
  status: ControlStatus
  effectiveness: number
  priority: ControlPriority
  owner?: string
}

export interface ControlValidationErrors {
  name?: string
  description?: string
  type?: string
  domain?: string
  framework?: string
  effectiveness?: string
}

// Tipos para frameworks
export interface Framework {
  id: string
  name: string
  version: string
  description: string
  controls_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FrameworkMapping {
  id: string
  source_framework: string
  source_control: string
  target_framework: string
  target_control: string
  mapping_type: 'exact' | 'partial' | 'related'
  confidence: number // 0-100
  created_at: string
}

// Tipos para avaliações de efetividade
export interface EffectivenessAssessment {
  id: string
  control_id: string
  score: number // 0-100
  justification: string
  assessed_by: string
  assessment_date: string
  next_assessment_date?: string
  created_at: string
}

// Tipos para APIs
export interface ControlsApiResponse {
  data: Control[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface ControlApiResponse {
  data: Control
  success: boolean
  message?: string
}

export interface StatsApiResponse {
  data: ControlStats
  success: boolean
}

// Tipos para MCP
export interface MCPControlRequest {
  method: 'list' | 'get' | 'create' | 'update' | 'delete' | 'stats'
  params: {
    id?: string
    filters?: ControlFilters
    data?: Partial<Control>
  }
}

export interface MCPControlResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
} 