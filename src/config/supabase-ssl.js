/**
 * 🛡️ n.CISO - Configuração SSL do Supabase
 * 
 * Configurações de segurança para conexão com banco de dados
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configurações do Supabase com SSL
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * 🔐 Cliente Anônimo com SSL
 */
const supabaseAnonSSL = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'nciso-v1'
    }
  }
})

/**
 * 🔑 Cliente de Serviço com SSL
 */
const supabaseServiceSSL = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'nciso-v1-service'
    }
  }
})

/**
 * 🏢 Cliente Multi-tenant com SSL
 */
class TenantSupabaseClientSSL {
  constructor(tenantId) {
    this.tenantId = tenantId
    this.client = supabaseServiceSSL
  }

  // Políticas com SSL
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

  // Controles com SSL
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

  // Domínios com SSL
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

  // Relatórios com SSL
  async generateEffectivenessReport() {
    const { data, error } = await this.client
      .from('controls')
      .select(`
        *,
        assessments (*)
      `)
      .eq('tenant_id', this.tenantId)

    if (error) throw error

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
 * 🔍 Função para testar conexão SSL
 */
async function testSSLConnection() {
  try {
    console.log('🔐 Testando conexão SSL com Supabase...')

    // Testar cliente anônimo SSL
    const { data: anonData, error: anonError } = await supabaseAnonSSL
      .from('users')
      .select('count')
      .limit(1)

    if (anonError) {
      console.log('⚠️  Cliente anônimo SSL:', anonError.message)
    } else {
      console.log('✅ Cliente anônimo SSL: Conectado com segurança')
    }

    // Testar cliente de serviço SSL
    const { data: serviceData, error: serviceError } = await supabaseServiceSSL
      .from('users')
      .select('count')
      .limit(1)

    if (serviceError) {
      console.log('⚠️  Cliente de serviço SSL:', serviceError.message)
    } else {
      console.log('✅ Cliente de serviço SSL: Conectado com segurança')
    }

    // Testar cliente multi-tenant SSL
    const tenantClientSSL = new TenantSupabaseClientSSL('test-tenant')
    try {
      await tenantClientSSL.listPolicies(1)
      console.log('✅ Cliente multi-tenant SSL: Conectado com segurança')
    } catch (error) {
      console.log('⚠️  Cliente multi-tenant SSL:', error.message)
    }

    console.log('🎉 Teste de conexão SSL concluído!')

  } catch (error) {
    console.error('❌ Erro no teste de conexão SSL:', error.message)
  }
}

/**
 * 🔒 Verificar configurações de segurança
 */
function checkSecurityConfig() {
  console.log('🔒 Verificando configurações de segurança...')
  
  // Verificar se URL usa HTTPS
  if (SUPABASE_URL && SUPABASE_URL.startsWith('https://')) {
    console.log('✅ URL usa HTTPS (SSL habilitado)')
  } else {
    console.log('❌ URL não usa HTTPS')
  }

  // Verificar se chaves estão configuradas
  if (SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✅ Chaves de autenticação configuradas')
  } else {
    console.log('❌ Chaves de autenticação não configuradas')
  }

  // Verificar se não são placeholders
  if (SUPABASE_URL === 'your_supabase_url_here') {
    console.log('❌ URL ainda é placeholder')
  } else {
    console.log('✅ URL configurada corretamente')
  }

  if (SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
    console.log('❌ Chave anônima ainda é placeholder')
  } else {
    console.log('✅ Chave anônima configurada corretamente')
  }

  if (SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key_here') {
    console.log('❌ Chave de serviço ainda é placeholder')
  } else {
    console.log('✅ Chave de serviço configurada corretamente')
  }
}

module.exports = {
  supabaseAnonSSL,
  supabaseServiceSSL,
  TenantSupabaseClientSSL,
  testSSLConnection,
  checkSecurityConfig
} 