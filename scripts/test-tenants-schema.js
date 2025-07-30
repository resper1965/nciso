#!/usr/bin/env node

/**
 * 🧪 Teste do Schema de Tenants
 * 
 * Testa a criação e operações nas tabelas tenants e invites
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testTenantsSchema() {
  console.log('🧪 Testando Schema de Tenants...\n')
  
  try {
    // 1. Testar criação de tenant
    console.log('📝 1. Testando criação de tenant...')
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: 'Test Company',
        email_domain: 'testcompany.com',
        contact_email: 'admin@testcompany.com',
        logo_url: 'https://via.placeholder.com/150x50/00ade0/ffffff?text=Test'
      })
      .select()
      .single()
    
    if (tenantError) {
      console.log(`   ❌ Erro ao criar tenant: ${tenantError.message}`)
      return
    }
    
    console.log(`   ✅ Tenant criado: ${tenant.name} (${tenant.id})`)
    
    // 2. Testar criação de invite
    console.log('\n📝 2. Testando criação de invite...')
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        email: 'user@testcompany.com',
        role: 'user',
        tenant_id: tenant.id,
        token: 'test-token-123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        created_by: '00000000-0000-0000-0000-000000000000' // UUID dummy
      })
      .select()
      .single()
    
    if (inviteError) {
      console.log(`   ❌ Erro ao criar invite: ${inviteError.message}`)
      return
    }
    
    console.log(`   ✅ Invite criado: ${invite.email} (${invite.id})`)
    
    // 3. Testar consulta de tenants
    console.log('\n📋 3. Testando consulta de tenants...')
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
    
    if (tenantsError) {
      console.log(`   ❌ Erro ao consultar tenants: ${tenantsError.message}`)
    } else {
      console.log(`   ✅ Tenants encontrados: ${tenants.length}`)
      tenants.forEach(t => console.log(`      - ${t.name} (${t.email_domain})`))
    }
    
    // 4. Testar consulta de invites
    console.log('\n📋 4. Testando consulta de invites...')
    const { data: invites, error: invitesError } = await supabase
      .from('invites')
      .select('*')
    
    if (invitesError) {
      console.log(`   ❌ Erro ao consultar invites: ${invitesError.message}`)
    } else {
      console.log(`   ✅ Invites encontrados: ${invites.length}`)
      invites.forEach(i => console.log(`      - ${i.email} (${i.role})`))
    }
    
    // 5. Testar função de validação de domínio
    console.log('\n🔍 5. Testando função de validação...')
    const { data: validation, error: validationError } = await supabase
      .rpc('validate_email_domain', {
        user_email: 'user@testcompany.com',
        tenant_id: tenant.id
      })
    
    if (validationError) {
      console.log(`   ❌ Erro na validação: ${validationError.message}`)
    } else {
      console.log(`   ✅ Validação de domínio: ${validation}`)
    }
    
    // 6. Testar função de geração de token
    console.log('\n🔑 6. Testando geração de token...')
    const { data: token, error: tokenError } = await supabase
      .rpc('generate_invite_token')
    
    if (tokenError) {
      console.log(`   ❌ Erro na geração de token: ${tokenError.message}`)
    } else {
      console.log(`   ✅ Token gerado: ${token}`)
    }
    
    console.log('\n🎉 Teste do Schema de Tenants concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

if (require.main === module) {
  testTenantsSchema()
}

module.exports = { testTenantsSchema } 