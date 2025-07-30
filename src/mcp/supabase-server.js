#!/usr/bin/env node

/**
 * 🛡️ n.CISO - MCP Server do Supabase
 * 
 * Model Context Protocol Server para integração com Supabase
 * Fornece acesso seguro e padronizado aos dados do n.CISO
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

class SupabaseMCPServer {
  constructor() {
    this.supabase = null
    this.initializeSupabase()
  }

  /**
   * Inicializa conexão com Supabase
   */
  initializeSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase não configurado. Usando modo desenvolvimento.')
      return
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey)
      console.log('✅ Supabase conectado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message)
    }
  }

  /**
   * Implementação das ferramentas
   */

  async listPolicies(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado',
          data: []
        }
      }

      const { data, error } = await this.supabase
        .from('policies')
        .select('*')
        .eq('tenant_id', args.tenant_id)
        .limit(args.limit || 50)

      if (args.status) {
        data = data.filter(policy => policy.status === args.status)
      }

      if (error) throw error

      return {
        success: true,
        data: data || [],
        count: data?.length || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  async createPolicy(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const policyData = {
        tenant_id: args.tenant_id,
        name: args.name,
        description: args.description || '',
        content: args.content,
        version: args.version || '1.0',
        status: 'draft',
        created_by: args.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('policies')
        .insert(policyData)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Política criada com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async listControls(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado',
          data: []
        }
      }

      let query = this.supabase
        .from('controls')
        .select('*')
        .eq('tenant_id', args.tenant_id)
        .limit(args.limit || 50)

      if (args.control_type) {
        query = query.eq('control_type', args.control_type)
      }

      if (args.implementation_status) {
        query = query.eq('implementation_status', args.implementation_status)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || [],
        count: data?.length || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  async createControl(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const controlData = {
        tenant_id: args.tenant_id,
        name: args.name,
        description: args.description || '',
        control_type: args.control_type,
        implementation_status: args.implementation_status || 'planned',
        effectiveness_score: args.effectiveness_score || 0,
        domain_id: args.domain_id,
        created_by: args.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('controls')
        .insert(controlData)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Controle criado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async listDomains(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado',
          data: []
        }
      }

      let query = this.supabase
        .from('domains')
        .select('*')
        .eq('tenant_id', args.tenant_id)

      if (args.level) {
        query = query.eq('level', args.level)
      }

      if (args.parent_id) {
        query = query.eq('parent_id', args.parent_id)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || [],
        count: data?.length || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  async createDomain(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      // Determinar nível hierárquico
      let level = 1
      let path = '/1'

      if (args.parent_id) {
        const { data: parent } = await this.supabase
          .from('domains')
          .select('level, path')
          .eq('id', args.parent_id)
          .single()

        if (parent) {
          level = parent.level + 1
          path = `${parent.path}/${level}`
        }
      }

      const domainData = {
        tenant_id: args.tenant_id,
        name: args.name,
        description: args.description || '',
        parent_id: args.parent_id || null,
        level: level,
        path: path,
        controls_count: 0,
        created_by: args.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('domains')
        .insert(domainData)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Domínio criado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async generateEffectivenessReport(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      let query = this.supabase
        .from('controls')
        .select('*')
        .eq('tenant_id', args.tenant_id)

      if (args.domain_id) {
        query = query.eq('domain_id', args.domain_id)
      }

      if (args.control_type) {
        query = query.eq('control_type', args.control_type)
      }

      const { data: controls, error } = await query

      if (error) throw error

      // Calcular métricas
      const total = controls?.length || 0
      const implemented = controls?.filter(c => c.implementation_status === 'implemented').length || 0
      const operational = controls?.filter(c => c.implementation_status === 'operational').length || 0
      const avgEffectiveness = controls?.length > 0 
        ? controls.reduce((sum, c) => sum + (c.effectiveness_score || 0), 0) / controls.length 
        : 0

      const lowEffectiveness = controls?.filter(c => (c.effectiveness_score || 0) < 70).length || 0

      return {
        success: true,
        data: {
          total_controls: total,
          implemented_controls: implemented,
          operational_controls: operational,
          average_effectiveness: Math.round(avgEffectiveness * 100) / 100,
          low_effectiveness_count: lowEffectiveness,
          implementation_rate: total > 0 ? Math.round((implemented / total) * 100) : 0,
          operational_rate: total > 0 ? Math.round((operational / total) * 100) : 0
        },
        message: 'Relatório gerado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async healthCheck() {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado',
          status: 'disconnected'
        }
      }

      // Testar conexão
      const { data, error } = await this.supabase
        .from('policies')
        .select('count')
        .limit(1)

      if (error) throw error

      return {
        success: true,
        status: 'connected',
        message: 'Conexão com Supabase funcionando',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'error'
      }
    }
  }

  /**
   * Inicia o servidor MCP
   */
  async start() {
    try {
      console.log('🚀 n.CISO MCP Server iniciado com sucesso!')
      console.log('📋 Ferramentas disponíveis:')
      console.log('  - list_policies')
      console.log('  - create_policy')
      console.log('  - list_controls')
      console.log('  - create_control')
      console.log('  - list_domains')
      console.log('  - create_domain')
      console.log('  - effectiveness_report')
      console.log('  - health_check')
      
      // Manter o processo ativo
      process.stdin.resume()
      
    } catch (error) {
      console.error('❌ Erro ao iniciar servidor MCP:', error)
      process.exit(1)
    }
  }
}

// Iniciar servidor
if (require.main === module) {
  const server = new SupabaseMCPServer()
  server.start()
}

module.exports = SupabaseMCPServer 