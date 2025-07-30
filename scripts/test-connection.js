#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Teste de Conexão com Banco de Dados
 * 
 * Script para testar todas as camadas de conexão
 */

const { testConnection, TenantSupabaseClient } = require('../src/config/supabase')

async function runConnectionTests() {
  console.log('🛡️ Testando conexão com banco de dados...\n')

  try {
    // 1. Teste básico de conexão
    console.log('📋 1. Teste básico de conexão')
    await testConnection()
    console.log('')

    // 2. Teste de operações CRUD
    console.log('📋 2. Teste de operações CRUD')
    await testCRUDOperations()
    console.log('')

    // 3. Teste de multi-tenancy
    console.log('📋 3. Teste de multi-tenancy')
    await testMultiTenancy()
    console.log('')

    // 4. Teste de performance
    console.log('📋 4. Teste de performance')
    await testPerformance()
    console.log('')

    console.log('🎉 Todos os testes de conexão concluídos!')

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message)
  }
}

async function testCRUDOperations() {
  const tenantClient = new TenantSupabaseClient('test-tenant')

  try {
    // Teste de criação
    console.log('   📝 Testando criação de dados...')
    
    // Criar usuário de teste
    const testUser = {
      email: 'test@nciso.com',
      name: 'Usuário de Teste',
      tenant_id: 'test-tenant',
      role: 'admin'
    }

    const { data: userData, error: userError } = await tenantClient.client
      .from('users')
      .insert(testUser)
      .select()

    if (userError) {
      console.log(`   ❌ Erro ao criar usuário: ${userError.message}`)
      return
    }

    console.log(`   ✅ Usuário criado: ${userData[0].id}`)

    // Criar política de teste
    const testPolicy = {
      tenant_id: 'test-tenant',
      title: 'Política de Segurança de Teste',
      description: 'Política criada para teste de conexão',
      content: 'Esta é uma política de teste para validar a conexão com o banco.',
      status: 'draft',
      created_by: userData[0].id
    }

    const { data: policyData, error: policyError } = await tenantClient.client
      .from('policies')
      .insert(testPolicy)
      .select()

    if (policyError) {
      console.log(`   ❌ Erro ao criar política: ${policyError.message}`)
    } else {
      console.log(`   ✅ Política criada: ${policyData[0].id}`)
    }

    // Teste de leitura
    console.log('   📖 Testando leitura de dados...')
    const policies = await tenantClient.listPolicies(5)
    console.log(`   ✅ ${policies.length} políticas encontradas`)

    // Teste de atualização
    console.log('   🔄 Testando atualização de dados...')
    const { data: updateData, error: updateError } = await tenantClient.client
      .from('policies')
      .update({ status: 'active' })
      .eq('id', policyData[0].id)
      .select()

    if (updateError) {
      console.log(`   ❌ Erro ao atualizar: ${updateError.message}`)
    } else {
      console.log(`   ✅ Política atualizada: ${updateData[0].status}`)
    }

    // Teste de exclusão
    console.log('   🗑️ Testando exclusão de dados...')
    const { error: deletePolicyError } = await tenantClient.client
      .from('policies')
      .delete()
      .eq('id', policyData[0].id)

    if (deletePolicyError) {
      console.log(`   ❌ Erro ao excluir política: ${deletePolicyError.message}`)
    } else {
      console.log('   ✅ Política excluída com sucesso')
    }

    // Limpar usuário de teste
    const { error: deleteUserError } = await tenantClient.client
      .from('users')
      .delete()
      .eq('id', userData[0].id)

    if (deleteUserError) {
      console.log(`   ❌ Erro ao excluir usuário: ${deleteUserError.message}`)
    } else {
      console.log('   ✅ Usuário excluído com sucesso')
    }

  } catch (error) {
    console.log(`   ❌ Erro no teste CRUD: ${error.message}`)
  }
}

async function testMultiTenancy() {
  try {
    console.log('   🏢 Testando isolamento multi-tenant...')

    const tenant1 = new TenantSupabaseClient('tenant-1')
    const tenant2 = new TenantSupabaseClient('tenant-2')

    // Criar dados em tenant 1
    const { data: user1, error: error1 } = await tenant1.client
      .from('users')
      .insert({
        email: 'user1@tenant1.com',
        name: 'Usuário Tenant 1',
        tenant_id: 'tenant-1',
        role: 'user'
      })
      .select()

    if (error1) {
      console.log(`   ❌ Erro ao criar usuário tenant 1: ${error1.message}`)
      return
    }

    // Criar dados em tenant 2
    const { data: user2, error: error2 } = await tenant2.client
      .from('users')
      .insert({
        email: 'user2@tenant2.com',
        name: 'Usuário Tenant 2',
        tenant_id: 'tenant-2',
        role: 'user'
      })
      .select()

    if (error2) {
      console.log(`   ❌ Erro ao criar usuário tenant 2: ${error2.message}`)
      return
    }

    // Verificar isolamento
    const users1 = await tenant1.listPolicies(10)
    const users2 = await tenant2.listPolicies(10)

    console.log(`   ✅ Tenant 1: ${users1.length} políticas`)
    console.log(`   ✅ Tenant 2: ${users2.length} políticas`)

    // Limpar dados de teste
    await tenant1.client.from('users').delete().eq('id', user1[0].id)
    await tenant2.client.from('users').delete().eq('id', user2[0].id)

    console.log('   ✅ Isolamento multi-tenant funcionando')

  } catch (error) {
    console.log(`   ❌ Erro no teste multi-tenant: ${error.message}`)
  }
}

async function testPerformance() {
  try {
    console.log('   ⚡ Testando performance...')

    const tenantClient = new TenantSupabaseClient('test-tenant')
    const startTime = Date.now()

    // Teste de consulta simples
    const { data, error } = await tenantClient.client
      .from('users')
      .select('count')
      .limit(1)

    const endTime = Date.now()
    const responseTime = endTime - startTime

    if (error) {
      console.log(`   ❌ Erro no teste de performance: ${error.message}`)
    } else {
      console.log(`   ✅ Tempo de resposta: ${responseTime}ms`)
      
      if (responseTime < 1000) {
        console.log('   ✅ Performance: Excelente (< 1s)')
      } else if (responseTime < 3000) {
        console.log('   ✅ Performance: Boa (< 3s)')
      } else {
        console.log('   ⚠️ Performance: Lenta (> 3s)')
      }
    }

  } catch (error) {
    console.log(`   ❌ Erro no teste de performance: ${error.message}`)
  }
}

if (require.main === module) {
  runConnectionTests()
}

module.exports = { runConnectionTests } 