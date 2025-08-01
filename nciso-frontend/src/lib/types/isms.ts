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

// Evaluation Types
export interface Question {
  id: string
  domain_id: string
  control_id?: string
  question_text: string
  question_type: 'multiple_choice' | 'yes_no' | 'scale' | 'text' | 'file'
  options?: string[]
  scale_min?: number
  scale_max?: number
  scale_labels?: string[]
  required: boolean
  weight: number
  order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  name: string
  description: string
  scope_id: string
  domain_id: string
  control_id?: string
  evaluator_id: string
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed'
  start_date: string
  end_date?: string
  total_score?: number
  max_score?: number
  percentage_score?: number
  evidence_count: number
  notes?: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface EvaluationResponse {
  id: string
  evaluation_id: string
  question_id: string
  response_value: string | number | boolean
  response_text?: string
  evidence_files?: string[]
  score?: number
  max_score?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface EvaluationTemplate {
  id: string
  name: string
  description: string
  domain_id: string
  control_id?: string
  questions: Question[]
  total_weight: number
  active: boolean
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

export interface EvaluationFilters {
  search?: string
  status?: string
  domain_id?: string
  control_id?: string
  evaluator_id?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

export interface EvaluationFormData {
  name: string
  description: string
  scope_id: string
  domain_id: string
  control_id?: string
  start_date: string
  notes?: string
}

export interface QuestionFormData {
  question_text: string
  question_type: 'multiple_choice' | 'yes_no' | 'scale' | 'text' | 'file'
  options?: string[]
  scale_min?: number
  scale_max?: number
  scale_labels?: string[]
  required: boolean
  weight: number
  order: number
}

export interface EvaluationResponseFormData {
  response_value: string | number | boolean
  response_text?: string
  evidence_files?: File[]
  notes?: string
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

export interface EvaluationListResponse {
  data: Evaluation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface EvaluationDetailResponse {
  evaluation: Evaluation
  responses: EvaluationResponse[]
  questions: Question[]
  stats: {
    answered_questions: number
    total_questions: number
    evidence_count: number
    score_percentage: number
  }
}

export interface QuestionListResponse {
  data: Question[]
  total: number
}

export interface EvaluationStats {
  total_evaluations: number
  completed_evaluations: number
  average_score: number
  evaluations_by_status: Record<string, number>
  evaluations_by_domain: Record<string, number>
  recent_evaluations: Evaluation[]
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
  total_evaluations: number
  completed_evaluations: number
  average_evaluation_score: number
  evaluations_by_status: Record<string, number>
}

// Tipos para MCP
export interface MCPISMSRequest {
  method: 'list_scope' | 'create_scope' | 'update_scope' | 'delete_scope' | 'list_organizations' | 'list_assets' | 'list_domains' | 'list_evaluations' | 'get_evaluation' | 'create_evaluation' | 'update_evaluation' | 'delete_evaluation' | 'get_evaluation_report' | 'list_questions' | 'create_question' | 'update_question' | 'delete_question'
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

// Technical Documentation Types
export interface TechnicalDocument {
  id: string
  title: string
  description: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  document_type: 'infrastructure' | 'application' | 'engineering' | 'security' | 'architecture' | 'procedure'
  scope_id?: string
  asset_id?: string
  control_id?: string
  version: string
  author_id: string
  tags: string[]
  is_public: boolean
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface CredentialsRegistry {
  id: string
  asset_id: string
  user_id?: string
  team_id?: string
  access_type: 'read' | 'write' | 'admin' | 'full'
  justification: string
  valid_from: string
  valid_until: string
  is_active: boolean
  approved_by?: string
  approved_at?: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface PrivilegedAccess {
  id: string
  user_id: string
  scope_type: 'system' | 'database' | 'network' | 'application' | 'infrastructure'
  scope_id: string
  access_level: 'read' | 'write' | 'admin' | 'super_admin'
  justification: string
  valid_from: string
  valid_until: string
  is_active: boolean
  approved_by: string
  approved_at: string
  last_audit_date?: string
  audit_notes?: string
  tenant_id: string
  created_at: string
  updated_at: string
}

// Filter types for new entities
export interface TechnicalDocumentFilters {
  search?: string
  document_type?: string
  scope_id?: string
  asset_id?: string
  control_id?: string
  author_id?: string
  is_public?: boolean
  page?: number
  limit?: number
}

export interface CredentialsRegistryFilters {
  search?: string
  asset_id?: string
  user_id?: string
  team_id?: string
  access_type?: string
  is_active?: boolean
  page?: number
  limit?: number
}

export interface PrivilegedAccessFilters {
  search?: string
  user_id?: string
  scope_type?: string
  scope_id?: string
  access_level?: string
  is_active?: boolean
  page?: number
  limit?: number
}

// Form data types
export interface TechnicalDocumentFormData {
  title: string
  description: string
  document_type: 'infrastructure' | 'application' | 'engineering' | 'security' | 'architecture' | 'procedure'
  scope_id?: string
  asset_id?: string
  control_id?: string
  version: string
  tags: string[]
  is_public: boolean
  file?: File
}

export interface CredentialsRegistryFormData {
  asset_id: string
  user_id?: string
  team_id?: string
  access_type: 'read' | 'write' | 'admin' | 'full'
  justification: string
  valid_from: string
  valid_until: string
  is_active: boolean
}

export interface PrivilegedAccessFormData {
  user_id: string
  scope_type: 'system' | 'database' | 'network' | 'application' | 'infrastructure'
  scope_id: string
  access_level: 'read' | 'write' | 'admin' | 'super_admin'
  justification: string
  valid_from: string
  valid_until: string
  is_active: boolean
}

// API Response types
export interface TechnicalDocumentListResponse {
  data: TechnicalDocument[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CredentialsRegistryListResponse {
  data: CredentialsRegistry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PrivilegedAccessListResponse {
  data: PrivilegedAccess[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Statistics types
export interface TechnicalDocumentStats {
  total_documents: number
  documents_by_type: Record<string, number>
  total_size: number
  recent_documents: TechnicalDocument[]
}

export interface CredentialsRegistryStats {
  total_credentials: number
  active_credentials: number
  credentials_by_asset: Record<string, number>
  credentials_by_type: Record<string, number>
  expiring_soon: CredentialsRegistry[]
}

export interface PrivilegedAccessStats {
  total_privileged_access: number
  active_privileged_access: number
  privileged_access_by_type: Record<string, number>
  privileged_access_by_level: Record<string, number>
  needs_audit: PrivilegedAccess[]
}

// MCP Types for new entities
export interface MCPTechnicalDocumentRequest {
  action: 'list_documents' | 'get_document' | 'create_document' | 'update_document' | 'delete_document' | 'upload_document' | 'search_documents' | 'list_documents_by_scope'
  filters?: TechnicalDocumentFilters
  document_id?: string
  data?: TechnicalDocumentFormData
  file?: File
}

export interface MCPCredentialsRegistryRequest {
  action: 'list_credentials' | 'get_credential' | 'create_credential_holder' | 'update_credential' | 'delete_credential'
  filters?: CredentialsRegistryFilters
  credential_id?: string
  data?: CredentialsRegistryFormData
}

export interface MCPPrivilegedAccessRequest {
  action: 'list_privileged_access' | 'get_privileged_access' | 'create_privileged_access' | 'update_privileged_access' | 'delete_privileged_access'
  filters?: PrivilegedAccessFilters
  privileged_access_id?: string
  data?: PrivilegedAccessFormData
}

export interface MCPTechnicalDocumentResponse {
  success: boolean
  data?: TechnicalDocument | TechnicalDocument[] | TechnicalDocumentListResponse
  message?: string
  error?: string
}

export interface MCPCredentialsRegistryResponse {
  success: boolean
  data?: CredentialsRegistry | CredentialsRegistry[] | CredentialsRegistryListResponse
  message?: string
  error?: string
}

export interface MCPPrivilegedAccessResponse {
  success: boolean
  data?: PrivilegedAccess | PrivilegedAccess[] | PrivilegedAccessListResponse
  message?: string
  error?: string
} 