#!/usr/bin/env node

/**
 * 🛡️ n.CISO - MCP Client
 * 
 * Cliente MCP para integração com o servidor n.CISO
 * Permite que AI assistants acessem dados do n.CISO via MCP
 */

const { Client } = require('../../node_modules/@modelcontextprotocol/sdk/dist/client/index.js')
const { StdioClientTransport } = require('../../node_modules/@modelcontextprotocol/sdk/dist/client/stdio.js')
const { spawn } = require('child_process')
const path = require('path')

class NCISOMCPClient {
  constructor() {
    this.client = null
    this.transport = null
    this.serverProcess = null
  }

  /**
   * Inicializa o cliente MCP
   */
  async initialize() {
    try {
      console.log('🚀 Inicializando cliente MCP n.CISO...')

      // Iniciar processo do servidor MCP
      this.serverProcess = spawn('node', [
        path.join(__dirname, '../supabase-server.js')
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      // Configurar transport
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [path.join(__dirname, '../supabase-server.js')],
        env: {
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
          NODE_ENV: process.env.NODE_ENV || 'development'
        }
      })

      // Criar cliente
      this.client = new Client({
        name: 'nciso-mcp-client',
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {}
        }
      })

      // Conectar ao servidor
      await this.client.connect(this.transport)

      console.log('✅ Cliente MCP n.CISO inicializado com sucesso!')
      console.log('📋 Ferramentas disponíveis:')
      console.log('  - list_policies')
      console.log('  - create_policy')
      console.log('  - list_controls')
      console.log('  - create_control')
      console.log('  - list_domains')
      console.log('  - create_domain')
      console.log('  - effectiveness_report')
      console.log('  - health_check')

    } catch (error) {
      console.error('❌ Erro ao inicializar cliente MCP:', error.message)
      throw error
    }
  }

  /**
   * Lista políticas de segurança
   */
  async listPolicies(tenantId = 'dev-tenant', limit = 10) {
    try {
      const result = await this.client.callTool('list_policies', {
        tenant_id: tenantId,
        limit: limit
      })

      return {
        success: true,
        data: result.content,
        count: result.content.length
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
   * Cria uma nova política
   */
  async createPolicy(policyData) {
    try {
      const result = await this.client.callTool('create_policy', {
        tenant_id: policyData.tenant_id || 'dev-tenant',
        title: policyData.title,
        description: policyData.description,
        content: policyData.content,
        status: policyData.status || 'draft'
      })

      return {
        success: true,
        data: result.content,
        message: 'Política criada com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Lista controles de segurança
   */
  async listControls(tenantId = 'dev-tenant', limit = 10) {
    try {
      const result = await this.client.callTool('list_controls', {
        tenant_id: tenantId,
        limit: limit
      })

      return {
        success: true,
        data: result.content,
        count: result.content.length
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
   * Cria um novo controle
   */
  async createControl(controlData) {
    try {
      const result = await this.client.callTool('create_control', {
        tenant_id: controlData.tenant_id || 'dev-tenant',
        policy_id: controlData.policy_id,
        title: controlData.title,
        description: controlData.description,
        control_type: controlData.control_type,
        effectiveness_score: controlData.effectiveness_score || 0
      })

      return {
        success: true,
        data: result.content,
        message: 'Controle criado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Lista domínios hierárquicos
   */
  async listDomains(tenantId = 'dev-tenant', limit = 10) {
    try {
      const result = await this.client.callTool('list_domains', {
        tenant_id: tenantId,
        limit: limit
      })

      return {
        success: true,
        data: result.content,
        count: result.content.length
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
   * Cria um novo domínio
   */
  async createDomain(domainData) {
    try {
      const result = await this.client.callTool('create_domain', {
        tenant_id: domainData.tenant_id || 'dev-tenant',
        parent_id: domainData.parent_id,
        name: domainData.name,
        description: domainData.description,
        level: domainData.level || 1
      })

      return {
        success: true,
        data: result.content,
        message: 'Domínio criado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Gera relatório de efetividade
   */
  async generateEffectivenessReport(tenantId = 'dev-tenant') {
    try {
      const result = await this.client.callTool('effectiveness_report', {
        tenant_id: tenantId
      })

      return {
        success: true,
        data: result.content,
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
   * Verifica saúde do sistema
   */
  async healthCheck() {
    try {
      const result = await this.client.callTool('health_check', {})

      return {
        success: true,
        data: result.content,
        message: 'Sistema funcionando normalmente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Fecha conexão com o servidor
   */
  async close() {
    try {
      if (this.client) {
        await this.client.close()
      }
      
      if (this.serverProcess) {
        this.serverProcess.kill()
      }
      
      console.log('✅ Cliente MCP n.CISO fechado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao fechar cliente MCP:', error.message)
    }
  }
}

// Exemplo de uso
async function example() {
  const client = new NCISOMCPClient()
  
  try {
    await client.initialize()
    
    // Testar health check
    const health = await client.healthCheck()
    console.log('Health Check:', health)
    
    // Listar políticas
    const policies = await client.listPolicies()
    console.log('Políticas:', policies)
    
    // Criar política
    const newPolicy = await client.createPolicy({
      title: 'Política de Segurança da Informação',
      description: 'Política geral de segurança',
      content: 'Esta política define as diretrizes de segurança...',
      status: 'draft'
    })
    console.log('Nova Política:', newPolicy)
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await client.close()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  example()
}

module.exports = NCISOMCPClient 