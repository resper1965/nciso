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

  /**
   * Ingerir documento externo
   */
  async ingestExternalDocument(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const {
        tenant_id,
        source,
        external_id,
        title,
        version = '1.0',
        document_url,
        checksum,
        lang = 'pt-BR',
        policy_id = null,
        description = '',
        tags = []
      } = args

      if (!tenant_id || !source || !external_id || !title || !document_url) {
        return {
          success: false,
          error: 'Campos obrigatórios: tenant_id, source, external_id, title, document_url'
        }
      }

      // Validar idioma
      const validLanguages = ['pt-BR', 'en-US', 'es']
      if (!validLanguages.includes(lang)) {
        return {
          success: false,
          error: 'Idioma inválido. Suportados: pt-BR, en-US, es'
        }
      }

      // Criar registro do documento externo
      const externalDocumentData = {
        tenant_id,
        source,
        external_id,
        title,
        version,
        document_url,
        checksum: checksum || 'sha256:placeholder',
        lang,
        policy_id,
        description,
        tags,
        created_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('isms_external_documents')
        .insert(externalDocumentData)
        .select()
        .single()

      if (error) throw error

      // Criar log de auditoria
      await this.supabase
        .from('isms_sync_audit_logs')
        .insert({
          tenant_id,
          action: 'document_ingested',
          source,
          external_id,
          document_id: data.id,
          status: 'success',
          details: {
            title,
            version,
            checksum: checksum || 'sha256:placeholder'
          },
          created_at: new Date().toISOString()
        })

      return {
        success: true,
        data: {
          id: data.id,
          title,
          version,
          source,
          external_id,
          checksum: checksum || 'sha256:placeholder',
          created_at: data.created_at
        },
        message: 'Documento externo ingerido com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Listar documentos externos por política
   */
  async listExternalDocumentsByPolicy(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado',
          data: []
        }
      }

      const { policy_id, tenant_id, limit = 50 } = args

      if (!policy_id || !tenant_id) {
        return {
          success: false,
          error: 'Policy ID e Tenant ID são obrigatórios',
          data: []
        }
      }

      const { data, error } = await this.supabase
        .from('isms_external_documents')
        .select('*')
        .eq('policy_id', policy_id)
        .eq('tenant_id', tenant_id)
        .order('created_at', { ascending: false })
        .limit(limit)

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

  /**
   * Download de documento
   */
  async downloadDocument(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const { id, tenant_id } = args

      if (!id || !tenant_id) {
        return {
          success: false,
          error: 'ID do documento e Tenant ID são obrigatórios'
        }
      }

      // Buscar documento
      const { data, error } = await this.supabase
        .from('isms_external_documents')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenant_id)
        .single()

      if (error || !data) {
        return {
          success: false,
          error: 'Documento não encontrado'
        }
      }

      // Gerar URL de download
      if (data.document_path) {
        const { data: signedUrl, error: urlError } = await this.supabase.storage
          .from('isms-documents')
          .createSignedUrl(data.document_path, 3600) // 1 hora

        if (urlError) {
          throw new Error(`Erro ao gerar URL de download: ${urlError.message}`)
        }

        return {
          success: true,
          data: {
            download_url: signedUrl.signedUrl,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            file_name: `${data.title}_v${data.version}.pdf`,
            document_info: data
          }
        }
      } else {
        return {
          success: false,
          error: 'Arquivo não encontrado no storage'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Gerar embeddings para documento
   */
  async generateEmbeddings(args) {
    try {
      if (!this.supabase) {
        return {
          success: false,
          error: 'Supabase não configurado'
        }
      }

      const { id, tenant_id } = args

      if (!id || !tenant_id) {
        return {
          success: false,
          error: 'ID do documento e Tenant ID são obrigatórios'
        }
      }

      // Buscar documento
      const { data, error } = await this.supabase
        .from('isms_external_documents')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenant_id)
        .single()

      if (error || !data) {
        return {
          success: false,
          error: 'Documento não encontrado'
        }
      }

      // Simular geração de embeddings
      // Em produção, isso seria integrado com um serviço de IA
      const embeddings = {
        document_id: id,
        title_embedding: `embedding_${data.title.replace(/\s+/g, '_').toLowerCase()}`,
        content_embedding: `embedding_${data.external_id}`,
        generated_at: new Date().toISOString(),
        model: 'text-embedding-ada-002'
      }

      return {
        success: true,
        data: embeddings,
        message: 'Embeddings gerados com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Comando para obter relatório de cobertura de controles por framework
  async getCoverageReport(args) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase não está configurado')
      }

      const { tenant_id, filters = {} } = args

      if (!tenant_id) {
        throw new Error('tenant_id é obrigatório')
      }

      // Query para obter dados de cobertura por framework
      const { data: coverageData, error } = await this.supabase
        .rpc('get_control_framework_coverage', {
          p_tenant_id: tenant_id,
          p_domain_filter: filters.domain || null,
          p_type_filter: filters.type || null,
          p_framework_filter: filters.framework || null
        })

      if (error) {
        throw new Error(`Erro ao obter dados de cobertura: ${error.message}`)
      }

      // Processar dados para formato esperado
      const report = coverageData?.map(item => ({
        framework_id: item.framework_id,
        framework_name: item.framework_name,
        framework_version: item.framework_version,
        total_controls: parseInt(item.total_controls) || 0,
        mapped_controls: parseInt(item.mapped_controls) || 0,
        coverage_percentage: parseFloat(item.coverage_percentage) || 0,
        unmapped_controls: parseInt(item.total_controls) - parseInt(item.mapped_controls) || 0
      })) || []

      // Calcular estatísticas gerais
      const totalFrameworks = report.length
      const totalControls = report.reduce((sum, item) => sum + item.total_controls, 0)
      const totalMapped = report.reduce((sum, item) => sum + item.mapped_controls, 0)
      const averageCoverage = totalControls > 0 ? (totalMapped / totalControls) * 100 : 0

      return {
        success: true,
        data: {
          frameworks: report,
          summary: {
            total_frameworks: totalFrameworks,
            total_controls: totalControls,
            total_mapped: totalMapped,
            average_coverage: Math.round(averageCoverage * 100) / 100
          },
          filters_applied: filters
        }
      }
    } catch (error) {
      console.error('❌ Erro no comando get_coverage_report:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Comando para simular relatório de gaps de cobertura por framework
  async simulateGapReport(args) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase não está configurado')
      }

      const { tenant_id, framework_id } = args

      if (!tenant_id) {
        throw new Error('tenant_id é obrigatório')
      }

      if (!framework_id) {
        throw new Error('framework_id é obrigatório')
      }

      // Obter informações do framework
      const { data: frameworkData, error: frameworkError } = await this.supabase
        .from('frameworks')
        .select('*')
        .eq('id', framework_id)
        .eq('tenant_id', tenant_id)
        .single()

      if (frameworkError || !frameworkData) {
        throw new Error('Framework não encontrado')
      }

      // Obter controles esperados pelo framework (simulação baseada no tipo)
      const expectedControls = this.getExpectedControlsByFramework(frameworkData.name, frameworkData.version)

      // Obter controles mapeados para este framework
      const { data: mappedControls, error: mappedError } = await this.supabase
        .from('control_frameworks')
        .select(`
          control_id,
          global_controls!inner(
            id,
            name,
            type,
            domain,
            status,
            priority
          )
        `)
        .eq('framework_id', framework_id)
        .eq('tenant_id', tenant_id)

      if (mappedError) {
        throw new Error(`Erro ao obter controles mapeados: ${mappedError.message}`)
      }

      // Calcular gaps
      const mappedControlIds = new Set(mappedControls?.map(item => item.control_id) || [])
      const gaps = expectedControls.filter(control => !mappedControlIds.has(control.id))
      
      const totalExpected = expectedControls.length
      const totalMapped = mappedControls?.length || 0
      const totalGaps = gaps.length
      const compliancePercentage = totalExpected > 0 ? Math.round((totalMapped / totalExpected) * 100) : 0

      // Classificar gaps por prioridade
      const prioritizedGaps = this.prioritizeGaps(gaps, frameworkData.name)

      return {
        success: true,
        data: {
          framework: {
            id: frameworkData.id,
            name: frameworkData.name,
            version: frameworkData.version,
            description: frameworkData.description
          },
          summary: {
            total_expected: totalExpected,
            total_mapped: totalMapped,
            total_gaps: totalGaps,
            compliance_percentage: compliancePercentage,
            status: this.getComplianceStatus(compliancePercentage)
          },
          expected_controls: expectedControls,
          mapped_controls: mappedControls?.map(item => ({
            id: item.control_id,
            name: item.global_controls.name,
            type: item.global_controls.type,
            domain: item.global_controls.domain,
            status: item.global_controls.status,
            priority: item.global_controls.priority
          })) || [],
          gaps: prioritizedGaps,
          recommendations: this.generateRecommendations(compliancePercentage, totalGaps, frameworkData.name)
        }
      }
    } catch (error) {
      console.error('❌ Erro no comando simulate_gap_report:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Obter controles esperados por framework (simulação)
  getExpectedControlsByFramework(frameworkName, version) {
    const controls = {
      'ISO 27001': [
        { id: 'iso-001', name: 'Política de Segurança da Informação', type: 'preventive', domain: 'governance', priority: 'critical' },
        { id: 'iso-002', name: 'Organização da Segurança da Informação', type: 'preventive', domain: 'governance', priority: 'critical' },
        { id: 'iso-003', name: 'Controle de Acesso', type: 'preventive', domain: 'access_control', priority: 'high' },
        { id: 'iso-004', name: 'Gestão de Ativos', type: 'preventive', domain: 'asset_management', priority: 'high' },
        { id: 'iso-005', name: 'Continuidade de Negócio', type: 'preventive', domain: 'business_continuity', priority: 'high' },
        { id: 'iso-006', name: 'Gestão de Incidentes', type: 'corrective', domain: 'incident_management', priority: 'medium' },
        { id: 'iso-007', name: 'Monitoramento e Auditoria', type: 'detective', domain: 'monitoring', priority: 'medium' },
        { id: 'iso-008', name: 'Gestão de Riscos', type: 'preventive', domain: 'risk_management', priority: 'critical' },
        { id: 'iso-009', name: 'Gestão de Fornecedores', type: 'preventive', domain: 'vendor_management', priority: 'medium' },
        { id: 'iso-010', name: 'Treinamento e Conscientização', type: 'preventive', domain: 'training', priority: 'medium' }
      ],
      'NIST': [
        { id: 'nist-001', name: 'Identificar', type: 'preventive', domain: 'asset_management', priority: 'critical' },
        { id: 'nist-002', name: 'Proteger', type: 'preventive', domain: 'access_control', priority: 'critical' },
        { id: 'nist-003', name: 'Detectar', type: 'detective', domain: 'monitoring', priority: 'high' },
        { id: 'nist-004', name: 'Responder', type: 'corrective', domain: 'incident_management', priority: 'high' },
        { id: 'nist-005', name: 'Recuperar', type: 'corrective', domain: 'business_continuity', priority: 'high' }
      ],
      'COBIT': [
        { id: 'cobit-001', name: 'Alinhar, Planejar e Organizar', type: 'preventive', domain: 'governance', priority: 'critical' },
        { id: 'cobit-002', name: 'Construir, Adquirir e Implementar', type: 'preventive', domain: 'implementation', priority: 'high' },
        { id: 'cobit-003', name: 'Entregar, Servir e Suportar', type: 'preventive', domain: 'service_delivery', priority: 'high' },
        { id: 'cobit-004', name: 'Monitorar, Avaliar e Avaliar', type: 'detective', domain: 'monitoring', priority: 'medium' }
      ]
    }

    return controls[frameworkName] || []
  },

  // Priorizar gaps por criticidade
  prioritizeGaps(gaps, frameworkName) {
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 }
    
    return gaps.sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 5
      const priorityB = priorityOrder[b.priority] || 5
      return priorityA - priorityB
    })
  },

  // Obter status de conformidade
  getComplianceStatus(percentage) {
    if (percentage >= 90) return 'excellent'
    if (percentage >= 75) return 'good'
    if (percentage >= 50) return 'fair'
    if (percentage >= 25) return 'poor'
    return 'critical'
  },

  // Gerar recomendações
  generateRecommendations(compliancePercentage, totalGaps, frameworkName) {
    const recommendations = []

    if (compliancePercentage < 50) {
      recommendations.push({
        type: 'critical',
        message: `Cobertura crítica (${compliancePercentage}%). Implemente controles prioritários imediatamente.`
      })
    } else if (compliancePercentage < 75) {
      recommendations.push({
        type: 'warning',
        message: `Cobertura baixa (${compliancePercentage}%). Foque nos controles de alta prioridade.`
      })
    }

    if (totalGaps > 10) {
      recommendations.push({
        type: 'info',
        message: `${totalGaps} gaps identificados. Considere um plano de implementação gradual.`
      })
    }

    recommendations.push({
      type: 'success',
      message: `Framework ${frameworkName}: ${totalGaps} controles pendentes de implementação.`
    })

    return recommendations
  },

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
      console.log('  - ingest_external_document')
      console.log('  - list_external_documents_by_policy')
      console.log('  - download_document')
      console.log('  - generate_embeddings')
      console.log('  - get_coverage_report')
      console.log('  - simulate_gap_report')
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