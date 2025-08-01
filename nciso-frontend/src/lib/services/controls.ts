import { supabase } from '@/lib/supabase'
import { 
  Control, 
  ControlFilters, 
  ControlStats, 
  ControlFormData,
  ControlsApiResponse,
  ControlApiResponse,
  StatsApiResponse
} from '@/lib/types/controls'

export class ControlsService {
  private static TABLE_NAME = 'controls'

  // Listar controles com filtros e paginação
  static async list(filters: ControlFilters = {}, page = 1, limit = 20): Promise<ControlsApiResponse> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.framework) {
        query = query.eq('framework', filters.framework)
      }

      if (filters.domain) {
        query = query.eq('domain', filters.domain)
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }

      if (filters.effectiveness_min !== undefined) {
        query = query.gte('effectiveness', filters.effectiveness_min)
      }

      if (filters.effectiveness_max !== undefined) {
        query = query.lte('effectiveness', filters.effectiveness_max)
      }

      // Paginação
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
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
      console.error('Error listing controls:', error)
      throw error
    }
  }

  // Buscar controle por ID
  static async get(id: string): Promise<Control> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('Control not found')
      }

      return data
    } catch (error) {
      console.error('Error getting control:', error)
      throw error
    }
  }

  // Criar novo controle
  static async create(controlData: ControlFormData): Promise<Control> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([controlData])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Error creating control:', error)
      throw error
    }
  }

  // Atualizar controle
  static async update(id: string, controlData: Partial<ControlFormData>): Promise<Control> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({ ...controlData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Error updating control:', error)
      throw error
    }
  }

  // Excluir controle
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error deleting control:', error)
      throw error
    }
  }

  // Buscar estatísticas
  static async getStats(): Promise<ControlStats> {
    try {
      // Buscar dados básicos
      const { count: totalControls } = await supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true })

      const { count: activeControls } = await supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Buscar média de efetividade
      const { data: effectivenessData } = await supabase
        .from(this.TABLE_NAME)
        .select('effectiveness')

      const averageEffectiveness = effectivenessData && effectivenessData.length > 0
        ? effectivenessData.reduce((sum, item) => sum + (item.effectiveness || 0), 0) / effectivenessData.length
        : 0

      // Buscar contagem por tipo
      const { data: typeData } = await supabase
        .from(this.TABLE_NAME)
        .select('type')

      const controlsByType = typeData?.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Buscar contagem por domínio
      const { data: domainData } = await supabase
        .from(this.TABLE_NAME)
        .select('domain')

      const controlsByDomain = domainData?.reduce((acc, item) => {
        acc[item.domain] = (acc[item.domain] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Buscar contagem por framework
      const { data: frameworkData } = await supabase
        .from(this.TABLE_NAME)
        .select('framework')

      const controlsByFramework = frameworkData?.reduce((acc, item) => {
        acc[item.framework] = (acc[item.framework] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Buscar contagem por prioridade
      const { data: priorityData } = await supabase
        .from(this.TABLE_NAME)
        .select('priority')

      const controlsByPriority = priorityData?.reduce((acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total_controls: totalControls || 0,
        active_controls: activeControls || 0,
        average_effectiveness: Math.round(averageEffectiveness * 100) / 100,
        controls_by_type: controlsByType as any,
        controls_by_domain: controlsByDomain as any,
        controls_by_framework: controlsByFramework as any,
        controls_by_priority: controlsByPriority as any
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      throw error
    }
  }

  // Duplicar controle
  static async duplicate(id: string): Promise<Control> {
    try {
      const original = await this.get(id)
      
      const duplicateData: ControlFormData = {
        name: `${original.name} (Cópia)`,
        description: original.description,
        type: original.type,
        domain: original.domain,
        framework: original.framework,
        status: 'draft',
        effectiveness: original.effectiveness,
        priority: original.priority,
        owner: original.owner
      }

      return await this.create(duplicateData)
    } catch (error) {
      console.error('Error duplicating control:', error)
      throw error
    }
  }

  // Buscar controles por domínio
  static async getByDomain(domain: string): Promise<Control[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('domain', domain)
        .order('name', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Error getting controls by domain:', error)
      throw error
    }
  }

  // Buscar controles por framework
  static async getByFramework(framework: string): Promise<Control[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('framework', framework)
        .order('name', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Error getting controls by framework:', error)
      throw error
    }
  }
} 