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

  // ===== NOVOS MÉTODOS PARA TECHNICAL DOCUMENTS =====

  async listTechnicalDocuments(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado',
          data: []
        }
      }

      let query = this.supabase
        .from('technical_documents')
        .select('*')
        .eq('tenant_id', args.tenant_id)
        .limit(args.limit || 50)

      if (args.document_type) {
        query = query.eq('document_type', args.document_type)
      }

      if (args.status) {
        query = query.eq('status', args.status)
      }

      if (args.scope_id) {
        query = query.eq('scope_id', args.scope_id)
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

  async createTechnicalDocument(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const documentData = {
        tenant_id: args.tenant_id,
        name: args.name,
        description: args.description || '',
        document_type: args.document_type,
        version: args.version || '1.0',
        content: args.content || '',
        file_path: args.file_path || null,
        file_size: args.file_size || null,
        file_type: args.file_type || null,
        tags: args.tags || [],
        scope_id: args.scope_id || null,
        asset_id: args.asset_id || null,
        control_id: args.control_id || null,
        status: 'draft',
        created_by: args.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('technical_documents')
        .insert(documentData)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Documento técnico criado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ===== NOVOS MÉTODOS PARA CREDENTIALS REGISTRY =====

  async listCredentialsRegistry(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado',
          data: []
        }
      }

      let query = this.supabase
        .from('credentials_registry')
        .select('*')
        .eq('tenant_id', args.tenant_id)
        .limit(args.limit || 50)

      if (args.status) {
        query = query.eq('status', args.status)
      }

      if (args.access_type) {
        query = query.eq('access_type', args.access_type)
      }

      if (args.asset_id) {
        query = query.eq('asset_id', args.asset_id)
      }

      if (args.holder_type) {
        query = query.eq('holder_type', args.holder_type)
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

  async createCredentialsRegistry(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const credentialData = {
        tenant_id: args.tenant_id,
        asset_id: args.asset_id,
        holder_type: args.holder_type, // 'user' or 'team'
        holder_id: args.holder_id,
        access_type: args.access_type,
        justification: args.justification || '',
        valid_from: args.valid_from,
        valid_until: args.valid_until,
        status: 'pending',
        approved_by: null,
        approved_at: null,
        revoked_by: null,
        revoked_at: null,
        created_by: args.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('credentials_registry')
        .insert(credentialData)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Credencial criada com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async approveCredential(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const { data, error } = await this.supabase
        .from('credentials_registry')
        .update({
          status: 'approved',
          approved_by: args.approved_by,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', args.credential_id)
        .eq('tenant_id', args.tenant_id)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Credencial aprovada com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async revokeCredential(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const { data, error } = await this.supabase
        .from('credentials_registry')
        .update({
          status: 'revoked',
          revoked_by: args.revoked_by,
          revoked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', args.credential_id)
        .eq('tenant_id', args.tenant_id)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Credencial revogada com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ===== NOVOS MÉTODOS PARA PRIVILEGED ACCESS =====

  async listPrivilegedAccess(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado',
          data: []
        }
      }

      let query = this.supabase
        .from('privileged_access')
        .select('*')
        .eq('tenant_id', args.tenant_id)
        .limit(args.limit || 50)

      if (args.status) {
        query = query.eq('status', args.status)
      }

      if (args.access_level) {
        query = query.eq('access_level', args.access_level)
      }

      if (args.scope_type) {
        query = query.eq('scope_type', args.scope_type)
      }

      if (args.user_id) {
        query = query.eq('user_id', args.user_id)
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

  async createPrivilegedAccess(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const accessData = {
        tenant_id: args.tenant_id,
        user_id: args.user_id,
        scope_type: args.scope_type,
        scope_id: args.scope_id,
        access_level: args.access_level,
        justification: args.justification || '',
        valid_from: args.valid_from,
        valid_until: args.valid_until,
        status: 'pending',
        approved_by: null,
        approved_at: null,
        revoked_by: null,
        revoked_at: null,
        last_audit_date: null,
        audit_notes: null,
        created_by: args.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('privileged_access')
        .insert(accessData)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Acesso privilegiado criado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async revokePrivilegedAccess(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const { data, error } = await this.supabase
        .from('privileged_access')
        .update({
          status: 'revoked',
          revoked_by: args.revoked_by,
          revoked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', args.access_id)
        .eq('tenant_id', args.tenant_id)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Acesso privilegiado revogado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async updatePrivilegedAccessAudit(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const { data, error } = await this.supabase
        .from('privileged_access')
        .update({
          last_audit_date: new Date().toISOString(),
          audit_notes: args.audit_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', args.access_id)
        .eq('tenant_id', args.tenant_id)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Auditoria de acesso privilegiado atualizada com sucesso'
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
      console.log('  - list_technical_documents')
      console.log('  - create_technical_document')
      console.log('  - list_credentials_registry')
      console.log('  - create_credentials_registry')
      console.log('  - approve_credential')
      console.log('  - revoke_credential')
      console.log('  - list_privileged_access')
      console.log('  - create_privileged_access')
      console.log('  - revoke_privileged_access')
      console.log('  - update_privileged_access_audit')
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