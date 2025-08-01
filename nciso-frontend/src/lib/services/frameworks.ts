import { supabase } from '@/lib/supabase'
import { 
  Framework, 
  FrameworkControl,
  FrameworkImport,
  FrameworkImportResult,
  FrameworkStats,
  FrameworksApiResponse,
  FrameworkControlsApiResponse,
  DEFAULT_FRAMEWORKS
} from '@/lib/types/frameworks'

export class FrameworksService {
  private static FRAMEWORKS_TABLE = 'frameworks'
  private static FRAMEWORK_CONTROLS_TABLE = 'framework_controls'

  // Listar frameworks
  static async list(page = 1, limit = 20): Promise<FrameworksApiResponse> {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabase
        .from(this.FRAMEWORKS_TABLE)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        throw new Error(error.message)
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('Error listing frameworks:', error)
      throw error
    }
  }

  // Buscar framework por ID
  static async get(id: string): Promise<Framework> {
    try {
      const { data, error } = await supabase
        .from(this.FRAMEWORKS_TABLE)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('Framework not found')
      }

      return data
    } catch (error) {
      console.error('Error getting framework:', error)
      throw error
    }
  }

  // Buscar controles de um framework
  static async getControls(frameworkId: string, page = 1, limit = 50): Promise<FrameworkControlsApiResponse> {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabase
        .from(this.FRAMEWORK_CONTROLS_TABLE)
        .select('*', { count: 'exact' })
        .eq('framework_id', frameworkId)
        .order('code', { ascending: true })
        .range(from, to)

      if (error) {
        throw new Error(error.message)
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('Error getting framework controls:', error)
      throw error
    }
  }

  // Importar framework padrão
  static async importDefaultFramework(frameworkKey: 'iso27001' | 'nist' | 'cobit'): Promise<FrameworkImportResult> {
    try {
      const frameworkData = DEFAULT_FRAMEWORKS[frameworkKey]
      
      // Verificar se já existe
      const { data: existing } = await supabase
        .from(this.FRAMEWORKS_TABLE)
        .select('id')
        .eq('name', frameworkData.name)
        .single()

      if (existing) {
        return {
          success: false,
          errors: [`Framework ${frameworkData.name} already exists`],
          warnings: [],
          imported_controls: 0
        }
      }

      // Criar framework
      const { data: framework, error: frameworkError } = await supabase
        .from(this.FRAMEWORKS_TABLE)
        .insert([{
          name: frameworkData.name,
          version: frameworkData.version,
          description: frameworkData.description,
          controls_count: frameworkData.controls_count,
          is_active: true
        }])
        .select()
        .single()

      if (frameworkError) {
        throw new Error(frameworkError.message)
      }

      // Importar controles do framework
      const controls = await this.getDefaultFrameworkControls(frameworkKey, framework.id)
      
      if (controls.length > 0) {
        const { error: controlsError } = await supabase
          .from(this.FRAMEWORK_CONTROLS_TABLE)
          .insert(controls)

        if (controlsError) {
          throw new Error(controlsError.message)
        }
      }

      return {
        success: true,
        framework_id: framework.id,
        imported_controls: controls.length,
        errors: [],
        warnings: []
      }
    } catch (error) {
      console.error('Error importing default framework:', error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        imported_controls: 0
      }
    }
  }

  // Importar framework customizado
  static async importCustomFramework(frameworkImport: FrameworkImport): Promise<FrameworkImportResult> {
    try {
      // Criar framework
      const { data: framework, error: frameworkError } = await supabase
        .from(this.FRAMEWORKS_TABLE)
        .insert([{
          name: frameworkImport.framework.name,
          version: frameworkImport.framework.version,
          description: frameworkImport.framework.description,
          controls_count: frameworkImport.controls.length,
          is_active: frameworkImport.framework.is_active
        }])
        .select()
        .single()

      if (frameworkError) {
        throw new Error(frameworkError.message)
      }

      // Preparar controles com framework_id
      const controlsWithFrameworkId = frameworkImport.controls.map(control => ({
        ...control,
        framework_id: framework.id
      }))

      // Inserir controles
      const { error: controlsError } = await supabase
        .from(this.FRAMEWORK_CONTROLS_TABLE)
        .insert(controlsWithFrameworkId)

      if (controlsError) {
        throw new Error(controlsError.message)
      }

      return {
        success: true,
        framework_id: framework.id,
        imported_controls: frameworkImport.controls.length,
        errors: [],
        warnings: []
      }
    } catch (error) {
      console.error('Error importing custom framework:', error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        imported_controls: 0
      }
    }
  }

  // Exportar framework
  static async exportFramework(frameworkId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const framework = await this.get(frameworkId)
      const controls = await this.getControls(frameworkId, 1, 1000)

      const exportData = {
        framework,
        controls: controls.data,
        exported_at: new Date().toISOString(),
        format
      }

      if (format === 'json') {
        return exportData
      } else if (format === 'csv') {
        // Implementar conversão para CSV
        return this.convertToCSV(exportData)
      }

      return exportData
    } catch (error) {
      console.error('Error exporting framework:', error)
      throw error
    }
  }

  // Buscar estatísticas
  static async getStats(): Promise<FrameworkStats> {
    try {
      // Contagem de frameworks
      const { count: totalFrameworks } = await supabase
        .from(this.FRAMEWORKS_TABLE)
        .select('*', { count: 'exact', head: true })

      const { count: activeFrameworks } = await supabase
        .from(this.FRAMEWORKS_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Contagem de controles
      const { count: totalControls } = await supabase
        .from(this.FRAMEWORK_CONTROLS_TABLE)
        .select('*', { count: 'exact', head: true })

      // Controles por framework
      const { data: controlsByFramework } = await supabase
        .from(this.FRAMEWORK_CONTROLS_TABLE)
        .select('framework_id')

      const controlsByFrameworkCount = controlsByFramework?.reduce((acc, item) => {
        acc[item.framework_id] = (acc[item.framework_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Frameworks por status
      const { data: frameworksByStatus } = await supabase
        .from(this.FRAMEWORKS_TABLE)
        .select('is_active')

      const frameworksByStatusCount = frameworksByStatus?.reduce((acc, item) => {
        const status = item.is_active ? 'active' : 'inactive'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total_frameworks: totalFrameworks || 0,
        active_frameworks: activeFrameworks || 0,
        total_controls: totalControls || 0,
        controls_by_framework: controlsByFrameworkCount,
        frameworks_by_status: frameworksByStatusCount
      }
    } catch (error) {
      console.error('Error getting framework stats:', error)
      throw error
    }
  }

  // Métodos privados
  private static async getDefaultFrameworkControls(frameworkKey: string, frameworkId: string): Promise<Partial<FrameworkControl>[]> {
    // Aqui você pode implementar a lógica para carregar controles padrão
    // Por enquanto, retornamos um array vazio
    return []
  }

  private static convertToCSV(data: any): string {
    // Implementar conversão para CSV
    return JSON.stringify(data)
  }
} 