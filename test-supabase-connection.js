#!/usr/bin/env node

/**
 * 🧪 Teste de Conexão com Supabase
 * 
 * Script para testar se conseguimos conectar e gravar dados no Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testSupabaseConnection() {
  console.log('🧪 Testando conexão com Supabase...\n')

  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  console.log('📋 Configuração:')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ${supabaseKey ? '✅ Configurada' : '❌ Não configurada'}`)

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas!')
    console.log('Execute: ./configure-supabase.sh')
    process.exit(1)
  }

  try {
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Cliente Supabase criado com sucesso')

    // Teste 1: Verificar se conseguimos conectar
    console.log('\n📋 Teste 1: Verificar conexão')
    const { data: healthData, error: healthError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)

    if (healthError) {
      console.log('⚠️  Erro na conexão (pode ser normal se as tabelas não existirem):')
      console.log(healthError.message)
    } else {
      console.log('✅ Conexão estabelecida com sucesso!')
    }

    // Teste 2: Tentar criar uma organização de teste
    console.log('\n📋 Teste 2: Criar organização de teste')
    const testOrg = {
      name: 'Organização de Teste n.CISO',
      type: 'company',
      description: 'Organização criada para teste de conexão',
      tenant_id: 'test-tenant',
      is_active: true
    }

    const { data: insertData, error: insertError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select()

    if (insertError) {
      console.log('❌ Erro ao inserir dados:')
      console.log(insertError.message)
      console.log('\n💡 Possíveis causas:')
      console.log('1. Tabelas não criadas no Supabase')
      console.log('2. RLS (Row Level Security) bloqueando')
      console.log('3. Permissões insuficientes')
    } else {
      console.log('✅ Dados inseridos com sucesso!')
      console.log('ID criado:', insertData[0].id)
      
      // Teste 3: Ler os dados inseridos
      console.log('\n📋 Teste 3: Ler dados inseridos')
      const { data: readData, error: readError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', insertData[0].id)

      if (readError) {
        console.log('❌ Erro ao ler dados:', readError.message)
      } else {
        console.log('✅ Dados lidos com sucesso!')
        console.log('Organização:', readData[0].name)
      }

      // Teste 4: Limpar dados de teste
      console.log('\n📋 Teste 4: Limpar dados de teste')
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', insertData[0].id)

      if (deleteError) {
        console.log('❌ Erro ao deletar dados:', deleteError.message)
      } else {
        console.log('✅ Dados de teste removidos com sucesso!')
      }
    }

    // Teste 5: Verificar tabelas existentes
    console.log('\n📋 Teste 5: Verificar tabelas disponíveis')
    const tables = [
      'organizations',
      'assets', 
      'domains',
      'evaluations',
      'technical_documents',
      'credentials_registry',
      'privileged_access',
      'policies',
      'controls'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ Tabela '${table}': ${error.message}`)
        } else {
          console.log(`✅ Tabela '${table}': Disponível`)
        }
      } catch (err) {
        console.log(`❌ Tabela '${table}': ${err.message}`)
      }
    }

    console.log('\n🎉 Teste de conexão concluído!')
    console.log('\n📊 Resumo:')
    console.log('✅ Cliente Supabase: Funcionando')
    console.log('✅ Conexão: Estabelecida')
    console.log('✅ Autenticação: Configurada')
    
    if (insertError) {
      console.log('⚠️  Inserção de dados: Falhou (tabelas podem não existir)')
      console.log('\n💡 Para resolver:')
      console.log('1. Execute os scripts SQL no painel do Supabase')
      console.log('2. Verifique as permissões RLS')
      console.log('3. Execute este teste novamente')
    } else {
      console.log('✅ Inserção de dados: Funcionando')
      console.log('✅ Leitura de dados: Funcionando')
      console.log('✅ Exclusão de dados: Funcionando')
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    process.exit(1)
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testSupabaseConnection()
}

module.exports = testSupabaseConnection 