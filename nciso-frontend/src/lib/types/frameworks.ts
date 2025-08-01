// Tipos para frameworks de controle

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

export interface FrameworkControl {
  id: string
  framework_id: string
  code: string // ex: "A.9.2.1", "ID.AM-1", "APO01.01"
  name: string
  description: string
  category: string
  domain: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'preventive' | 'corrective' | 'detective' | 'deterrent'
  created_at: string
  updated_at: string
}

export interface FrameworkImport {
  framework: Framework
  controls: FrameworkControl[]
}

export interface FrameworkImportResult {
  success: boolean
  framework_id?: string
  imported_controls: number
  errors: string[]
  warnings: string[]
}

export interface FrameworkStats {
  total_frameworks: number
  active_frameworks: number
  total_controls: number
  controls_by_framework: Record<string, number>
  frameworks_by_status: Record<string, number>
}

// Tipos para APIs
export interface FrameworksApiResponse {
  data: Framework[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface FrameworkApiResponse {
  data: Framework
  success: boolean
  message?: string
}

export interface FrameworkControlsApiResponse {
  data: FrameworkControl[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Tipos para MCP
export interface MCPFrameworkRequest {
  method: 'list' | 'get' | 'import' | 'export' | 'stats'
  params: {
    id?: string
    framework_data?: FrameworkImport
    export_format?: 'json' | 'csv' | 'xml'
  }
}

export interface MCPFrameworkResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// Dados de frameworks padrão
export const DEFAULT_FRAMEWORKS = {
  iso27001: {
    name: 'ISO 27001',
    version: '2022',
    description: 'Information Security Management System (ISMS) controls based on ISO/IEC 27001:2022',
    controls_count: 93
  },
  nist: {
    name: 'NIST CSF',
    version: '2.0',
    description: 'NIST Cybersecurity Framework controls for improving critical infrastructure cybersecurity',
    controls_count: 108
  },
  cobit: {
    name: 'COBIT',
    version: '2019',
    description: 'Control Objectives for Information and Related Technologies framework',
    controls_count: 40
  }
} 