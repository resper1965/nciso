// Tipos para o módulo n.ISMS

export interface ISMSScope {
  id: string
  name: string
  description: string
  coverage: string // abrangência
  applicable_units: string[] // unidades aplicáveis
  organization_id: string
  domain_ids: string[]
  tenant_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  type: 'company' | 'department' | 'unit' | 'division'
  parent_id?: string
  description?: string
  tenant_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  owner_id: string
  classification: AssetClassification
  description?: string
  location?: string
  value?: number
  organization_id: string
  tenant_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AssetType = 'physical' | 'digital' | 'person' | 'software' | 'infrastructure' | 'data'

export interface AssetClassification {
  confidentiality: 'low' | 'medium' | 'high' | 'critical'
  integrity: 'low' | 'medium' | 'high' | 'critical'
  availability: 'low' | 'medium' | 'high' | 'critical'
}

export interface Domain {
  id: string
  name: string
  description: string
  parent_id?: string
  path: string // breadcrumb path
  level: number
  tenant_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  name: string
  description: string
  domain_id: string
  control_ids: string[]
  questionnaire_data: any // JSON com dados do questionário
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed'
  score?: number
  evidence_files?: string[]
  evaluator_id: string
  tenant_id: string
  created_at: string
  updated_at: string
}

// Tipos para filtros
export interface ISMSScopeFilters {
  search?: string
  organization_id?: string
  is_active?: boolean
}

export interface OrganizationFilters {
  search?: string
  type?: string
  parent_id?: string
  is_active?: boolean
}

export interface AssetFilters {
  search?: string
  type?: AssetType
  organization_id?: string
  classification_level?: 'low' | 'medium' | 'high' | 'critical'
  is_active?: boolean
}

export interface DomainFilters {
  search?: string
  parent_id?: string
  level?: number
  is_active?: boolean
}

// Tipos para formulários
export interface ISMSScopeFormData {
  name: string
  description: string
  coverage: string
  applicable_units: string[]
  organization_id: string
  domain_ids: string[]
  is_active: boolean
}

export interface OrganizationFormData {
  name: string
  type: 'company' | 'department' | 'unit' | 'division'
  parent_id?: string
  description?: string
  is_active: boolean
}

export interface AssetFormData {
  name: string
  type: AssetType
  owner_id: string
  classification: AssetClassification
  description?: string
  location?: string
  value?: number
  organization_id: string
  is_active: boolean
}

export interface DomainFormData {
  name: string
  description: string
  parent_id?: string
  is_active: boolean
}

// Tipos para APIs
export interface ISMSScopeApiResponse {
  data: ISMSScope[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface OrganizationApiResponse {
  data: Organization[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface AssetApiResponse {
  data: Asset[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface DomainApiResponse {
  data: Domain[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Tipos para estatísticas
export interface ISMSStats {
  total_scopes: number
  active_scopes: number
  total_organizations: number
  total_assets: number
  assets_by_type: Record<AssetType, number>
  assets_by_classification: Record<string, number>
  total_domains: number
  domains_by_level: Record<number, number>
}

// Tipos para MCP
export interface MCPISMSRequest {
  method: 'list_scope' | 'create_scope' | 'update_scope' | 'delete_scope' | 'list_organizations' | 'list_assets' | 'list_domains' | 'evaluation_report'
  params: {
    id?: string
    filters?: any
    data?: any
  }
}

export interface MCPISMSResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
} 