import { supabase } from '@/lib/supabase'

interface ExportFilters {
  domain?: string
  type?: string
  framework?: string
  status?: string
}

interface ExportOptions {
  format: 'csv' | 'json'
  filters?: ExportFilters
  includeHeaders?: boolean
}

interface MappingData {
  control_id: string
  control_name: string
  control_type: string
  control_domain: string
  control_status: string
  framework_id: string
  framework_name: string
  framework_version: string
  mapped_at: string
}

export class ExportService {
  /**
   * Exporta mapeamentos controle-framework
   */
  static async exportMappings(tenantId: string, options: ExportOptions): Promise<void> {
    try {
      // Buscar dados de mapeamento
      const { data, error } = await supabase
        .from('control_frameworks')
        .select(`
          control_id,
          framework_id,
          created_at,
          global_controls!inner(
            id,
            name,
            type,
            domain,
            status
          ),
          frameworks!inner(
            id,
            name,
            version
          )
        `)
        .eq('tenant_id', tenantId)

      if (error) throw error

      // Aplicar filtros
      let filteredData = data || []
      
      if (options.filters) {
        filteredData = filteredData.filter(item => {
          const control = item.global_controls
          const framework = item.frameworks
          
          if (options.filters?.domain && control.domain !== options.filters.domain) return false
          if (options.filters?.type && control.type !== options.filters.type) return false
          if (options.filters?.status && control.status !== options.filters.status) return false
          if (options.filters?.framework && !framework.name.toLowerCase().includes(options.filters.framework.toLowerCase())) return false
          
          return true
        })
      }

      // Transformar dados para formato de exportação
      const exportData = filteredData.map(item => ({
        control_id: item.control_id,
        control_name: item.global_controls.name,
        control_type: item.global_controls.type,
        control_domain: item.global_controls.domain,
        control_status: item.global_controls.status,
        framework_id: item.framework_id,
        framework_name: item.frameworks.name,
        framework_version: item.frameworks.version,
        mapped_at: item.created_at
      }))

      // Gerar arquivo baseado no formato
      if (options.format === 'csv') {
        await this.exportToCSV(exportData, options)
      } else {
        await this.exportToJSON(exportData, options)
      }

    } catch (error) {
      console.error('Error exporting mappings:', error)
      throw new Error('Erro ao exportar mapeamentos')
    }
  }

  /**
   * Exporta para CSV
   */
  private static async exportToCSV(data: MappingData[], options: ExportOptions): Promise<void> {
    // Headers do CSV
    const headers = [
      'ID do Controle',
      'Nome do Controle',
      'Tipo do Controle',
      'Domínio do Controle',
      'Status do Controle',
      'ID do Framework',
      'Nome do Framework',
      'Versão do Framework',
      'Data do Mapeamento'
    ]

    // Converter dados para linhas CSV
    const csvRows = data.map(item => [
      item.control_id,
      `"${item.control_name}"`,
      item.control_type,
      item.control_domain,
      item.control_status,
      item.framework_id,
      `"${item.framework_name}"`,
      item.framework_version,
      new Date(item.mapped_at).toLocaleDateString('pt-BR')
    ])

    // Adicionar headers se solicitado
    const allRows = options.includeHeaders !== false ? [headers, ...csvRows] : csvRows

    // Gerar conteúdo CSV
    const csvContent = allRows.map(row => row.join(',')).join('\n')

    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', this.generateFileName('csv', options.filters))
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Exporta para JSON
   */
  private static async exportToJSON(data: MappingData[], options: ExportOptions): Promise<void> {
    // Agrupar por controle para formato mais organizado
    const groupedData = data.reduce((acc, item) => {
      const existingControl = acc.find(control => control.control_id === item.control_id)
      
      if (existingControl) {
        existingControl.frameworks.push({
          framework_id: item.framework_id,
          framework_name: item.framework_name,
          framework_version: item.framework_version,
          mapped_at: item.mapped_at
        })
      } else {
        acc.push({
          control_id: item.control_id,
          control_name: item.control_name,
          control_type: item.control_type,
          control_domain: item.control_domain,
          control_status: item.control_status,
          frameworks: [{
            framework_id: item.framework_id,
            framework_name: item.framework_name,
            framework_version: item.framework_version,
            mapped_at: item.mapped_at
          }]
        })
      }
      
      return acc
    }, [] as any[])

    // Gerar conteúdo JSON
    const jsonContent = JSON.stringify(groupedData, null, 2)

    // Criar blob e download
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', this.generateFileName('json', options.filters))
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Gera nome do arquivo com timestamp
   */
  private static generateFileName(format: string, filters?: ExportFilters): string {
    const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-') // HH-MM-SS
    
    let prefix = 'mappings'
    
    // Adicionar filtros ao nome do arquivo
    if (filters) {
      const filterParts = []
      if (filters.domain) filterParts.push(`domain_${filters.domain}`)
      if (filters.type) filterParts.push(`type_${filters.type}`)
      if (filters.framework) filterParts.push(`framework_${filters.framework}`)
      if (filters.status) filterParts.push(`status_${filters.status}`)
      
      if (filterParts.length > 0) {
        prefix += `_${filterParts.join('_')}`
      }
    }
    
    return `${prefix}_${timestamp}_${time}.${format}`
  }

  /**
   * Valida se o usuário tem permissão para exportar
   */
  static async validateExportPermission(tenantId: string): Promise<boolean> {
    try {
      // Verificar se o usuário está autenticado e tem acesso ao tenant
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        throw new Error('Usuário não autenticado')
      }

      // Verificar se o tenant_id está no JWT
      const userTenantId = user.user_metadata?.tenant_id
      if (userTenantId !== tenantId) {
        throw new Error('Acesso negado ao tenant')
      }

      return true
    } catch (error) {
      console.error('Error validating export permission:', error)
      return false
    }
  }

  /**
   * Obtém estatísticas de exportação
   */
  static async getExportStats(tenantId: string, filters?: ExportFilters): Promise<{
    totalMappings: number
    totalControls: number
    totalFrameworks: number
    estimatedFileSize: string
  }> {
    try {
      const { data, error } = await supabase
        .from('control_frameworks')
        .select('control_id, framework_id')
        .eq('tenant_id', tenantId)

      if (error) throw error

      const totalMappings = data?.length || 0
      const uniqueControls = new Set(data?.map(item => item.control_id) || []).size
      const uniqueFrameworks = new Set(data?.map(item => item.framework_id) || []).size

      // Estimativa de tamanho do arquivo (aproximada)
      const estimatedSizeKB = totalMappings * 0.5 // ~500 bytes por linha
      const estimatedFileSize = estimatedSizeKB > 1024 
        ? `${(estimatedSizeKB / 1024).toFixed(1)} MB`
        : `${estimatedSizeKB.toFixed(0)} KB`

      return {
        totalMappings,
        totalControls: uniqueControls,
        totalFrameworks: uniqueFrameworks,
        estimatedFileSize
      }
    } catch (error) {
      console.error('Error getting export stats:', error)
      throw new Error('Erro ao obter estatísticas de exportação')
    }
  }
} 