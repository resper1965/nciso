#!/usr/bin/env node

/**
 * 🔍 Verificar Status do Schema
 * 
 * Verifica se as tabelas foram criadas no Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchemaStatus() {
  console.log('🔍 Verificando Status do Schema...\n')
  
  try {
    // 1. Verificar tabela tenants
    console.log('📋 1. Verificando tabela tenants...')
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1)
    
    if (tenantsError) {
      console.log(`   ❌ Tabela tenants não existe: ${tenantsError.message}`)
    } else {
      console.log('   ✅ Tabela tenants existe')
    }
    
    // 2. Verificar tabela invites
    console.log('\n📋 2. Verificando tabela invites...')
    const { data: invites, error: invitesError } = await supabase
      .from('invites')
      .select('count')
      .limit(1)
    
    if (invitesError) {
      console.log(`   ❌ Tabela invites não existe: ${invitesError.message}`)
    } else {
      console.log('   ✅ Tabela invites existe')
    }
    
    // 3. Verificar outras tabelas importantes
    const tablesToCheck = [
      'users', 'policies', 'controls', 'domains', 
      'assessments', 'risks', 'audits', 'incidents', 'tickets'
    ]
    
    console.log('\n📋 3. Verificando outras tabelas...')
    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ Tabela ${table} não existe`)
      } else {
        console.log(`   ✅ Tabela ${table} existe`)
      }
    }
    
    // 4. Verificar funções
    console.log('\n📋 4. Verificando funções...')
    const functionsToCheck = [
      'validate_email_domain',
      'generate_invite_token', 
      'is_invite_expired',
      'update_updated_at_column'
    ]
    
    for (const func of functionsToCheck) {
      try {
        const { data, error } = await supabase.rpc(func, {})
        if (error && error.message.includes('function') && error.message.includes('does not exist')) {
          console.log(`   ❌ Função ${func} não existe`)
        } else {
          console.log(`   ✅ Função ${func} existe`)
        }
      } catch (error) {
        console.log(`   ❌ Função ${func} não existe`)
      }
    }
    
    console.log('\n📊 RESUMO:')
    console.log('   Para aplicar os schemas:')
    console.log('   1. Acesse: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig')
    console.log('   2. Vá em: SQL Editor')
    console.log('   3. Execute: scripts/apply-tenants-only.sql')
    console.log('   4. Execute: scripts/supabase-schema-manual.sql')
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message)
  }
}

if (require.main === module) {
  checkSchemaStatus()
}

module.exports = { checkSchemaStatus } 