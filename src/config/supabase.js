/**
 * 🛡️ n.CISO - Configuração do Supabase
 * 
 * Clientes para diferentes níveis de acesso
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configurações do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validação das credenciais
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('❌ Credenciais do Supabase não configuradas no .env')
}

/**
 * 🔐 Cliente Anônimo (Frontend)
 * Para operações públicas e autenticação
 */
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * 🔑 Cliente de Serviço (Backend)
 * Para operações administrativas e bypass de RLS
 */
const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * 🏢 Cliente Multi-tenant
 * Para operações específicas por tenant
 */
class TenantSupabaseClient {
  constructor(tenantId) {
    this.tenantId = tenantId
    this.client = supabaseService
  }

  // Políticas
  async listPolicies(limit = 10) {
    const { data, error } = await this.client
      .from('policies')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createPolicy(policyData) {
    const { data, error } = await this.client
      .from('policies')
      .insert({
        ...policyData,
        tenant_id: this.tenantId
      })
      .select()

    if (error) throw error
    return data[0]
  }

  // Controles
  async listControls(limit = 10) {
    const { data, error } = await this.client
      .from('controls')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createControl(controlData) {
    const { data, error } = await this.client
      .from('controls')
      .insert({
        ...controlData,
        tenant_id: this.tenantId
      })
      .select()

    if (error) throw error
    return data[0]
  }

  // Domínios
  async listDomains(limit = 10) {
    const { data, error } = await this.client
      .from('domains')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createDomain(domainData) {
    const { data, error } = await this.client
      .from('domains')
      .insert({
        ...domainData,
        tenant_id: this.tenantId
      })
      .select()

    if (error) throw error
    return data[0]
  }

  // Relatórios
  async generateEffectivenessReport() {
    const { data, error } = await this.client
      .from('controls')
      .select(`
        *,
        assessments (*)
      `)
      .eq('tenant_id', this.tenantId)

    if (error) throw error

    // Calcular efetividade média
    const totalControls = data.length
    const effectiveControls = data.filter(control => 
      control.effectiveness_score >= 7
    ).length

    return {
      totalControls,
      effectiveControls,
      effectivenessRate: totalControls > 0 ? (effectiveControls / totalControls) * 100 : 0,
      controls: data
    }
  }
}

/**
 * 🔍 Função para testar conexão
 */
async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...')

    // Testar cliente anônimo
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('users')
      .select('count')
      .limit(1)

    if (anonError) {
      console.log('⚠️  Cliente anônimo:', anonError.message)
    } else {
      console.log('✅ Cliente anônimo: Conectado')
    }

    // Testar cliente de serviço
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('users')
      .select('count')
      .limit(1)

    if (serviceError) {
      console.log('⚠️  Cliente de serviço:', serviceError.message)
    } else {
      console.log('✅ Cliente de serviço: Conectado')
    }

    // Testar cliente multi-tenant
    const tenantClient = new TenantSupabaseClient('test-tenant')
    try {
      await tenantClient.listPolicies(1)
      console.log('✅ Cliente multi-tenant: Conectado')
    } catch (error) {
      console.log('⚠️  Cliente multi-tenant:', error.message)
    }

    console.log('🎉 Teste de conexão concluído!')

  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error.message)
  }
}

module.exports = {
  supabaseAnon,
  supabaseService,
  TenantSupabaseClient,
  testConnection
} 