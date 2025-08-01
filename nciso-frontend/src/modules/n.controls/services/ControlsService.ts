import { supabase } from '@/lib/supabase'
import { 
  Control, 
  ControlFilters, 
  ControlStats, 
  ControlFormData,
  ControlsApiResponse,
  ControlApiResponse,
  StatsApiResponse
} from '../types'

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
        .insert(controlData)
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

  // Atualizar controle existente
  static async update(id: string, controlData: Partial<ControlFormData>): Promise<Control> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(controlData)
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

  // Obter estatísticas dos controles
  static async getStats(): Promise<ControlStats> {
    try {
      const { data: controls, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')

      if (error) {
        throw new Error(error.message)
      }

      const totalControls = controls?.length || 0
      const activeControls = controls?.filter(c => c.status === 'active').length || 0
      const averageEffectiveness = controls?.length 
        ? controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.length
        : 0

      // Estatísticas por tipo
      const controlsByType = controls?.reduce((acc, control) => {
        acc[control.type] = (acc[control.type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Estatísticas por domínio
      const controlsByDomain = controls?.reduce((acc, control) => {
        acc[control.domain] = (acc[control.domain] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Estatísticas por framework
      const controlsByFramework = controls?.reduce((acc, control) => {
        acc[control.framework] = (acc[control.framework] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total_controls: totalControls,
        active_controls: activeControls,
        average_effectiveness: Math.round(averageEffectiveness),
        controls_by_type: controlsByType,
        controls_by_domain: controlsByDomain,
        controls_by_framework: controlsByFramework
      }
    } catch (error) {
      console.error('Error getting control stats:', error)
      throw error
    }
  }

  // Duplicar controle
  static async duplicate(id: string): Promise<Control> {
    try {
      const originalControl = await this.get(id)
      
      const duplicateData = {
        ...originalControl,
        name: `${originalControl.name} (Cópia)`,
        status: 'draft' as const
      }
      delete duplicateData.id

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