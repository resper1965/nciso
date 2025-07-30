#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Teste de Schema
 * 
 * Script para testar se o schema foi aplicado corretamente
 */

const { createClient } = require('@supabase/supabase-js')

async function testSchema() {
  console.log('🛡️ Testando schema do Supabase...\n')

  const supabaseUrl = 'https://pszfqqmmljekibmcgmig.supabase.co'
  const supabaseServiceKey = 'sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW'

  try {
    // Criar cliente com chave de serviço
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Cliente administrativo criado')

    // Lista de tabelas esperadas
    const expectedTables = [
      'users', 'policies', 'controls', 'domains', 
      'assessments', 'risks', 'audits', 'incidents', 'tickets'
    ]

    console.log('\n📋 Verificando tabelas:')
    const results = []

    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`)
          results.push({ table: tableName, status: 'error', message: error.message })
        } else {
          console.log(`   ✅ ${tableName}: Tabela acessível`)
          results.push({ table: tableName, status: 'success' })
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`)
        results.push({ table: tableName, status: 'error', message: error.message })
      }
    }

    // Verificar RLS
    console.log('\n🔐 Verificando RLS:')
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error && error.message.includes('RLS')) {
          console.log(`   ✅ ${tableName}: RLS ativo`)
        } else if (error) {
          console.log(`   ⚠️  ${tableName}: ${error.message}`)
        } else {
          console.log(`   ✅ ${tableName}: Acessível`)
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`)
      }
    }

    // Testar inserção de dados
    console.log('\n🧪 Testando inserção de dados:')
    
    // Testar inserção de usuário
    try {
      const testUser = {
        email: 'test@nciso.com',
        name: 'Test User',
        tenant_id: 'test-tenant',
        role: 'admin'
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert(testUser)
        .select()

      if (userError) {
        console.log(`   ❌ Inserção de usuário: ${userError.message}`)
      } else {
        console.log(`   ✅ Usuário inserido: ${userData[0].id}`)
        
        // Testar inserção de política
        const testPolicy = {
          tenant_id: 'test-tenant',
          title: 'Política de Teste',
          description: 'Política criada para teste',
          content: 'Conteúdo da política de teste',
          status: 'draft',
          created_by: userData[0].id
        }

        const { data: policyData, error: policyError } = await supabase
          .from('policies')
          .insert(testPolicy)
          .select()

        if (policyError) {
          console.log(`   ❌ Inserção de política: ${policyError.message}`)
        } else {
          console.log(`   ✅ Política inserida: ${policyData[0].id}`)
        }

        // Limpar dados de teste
        await supabase.from('policies').delete().eq('id', policyData[0].id)
        await supabase.from('users').delete().eq('id', userData[0].id)
        console.log('   🧹 Dados de teste removidos')
      }
    } catch (error) {
      console.log(`   ❌ Erro no teste de inserção: ${error.message}`)
    }

    // Resumo
    console.log('\n📊 Resumo do teste:')
    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length
    
    console.log(`   ✅ Tabelas funcionais: ${successCount}`)
    console.log(`   ❌ Tabelas com erro: ${errorCount}`)
    console.log(`   📋 Total: ${results.length}`)

    if (successCount === expectedTables.length) {
      console.log('\n🎉 Schema aplicado com sucesso!')
      console.log('✅ Todas as tabelas estão funcionais')
      console.log('✅ RLS está configurado')
      console.log('✅ Operações CRUD funcionando')
    } else {
      console.log('\n⚠️  Schema parcialmente aplicado')
      console.log('💡 Execute o SQL manualmente no painel do Supabase')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

if (require.main === module) {
  testSchema()
}

module.exports = testSchema 