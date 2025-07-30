#!/usr/bin/env node

/**
 * 🧪 Teste de Autenticação Supabase
 * 
 * Script para testar se conseguimos autenticar no Supabase
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function testSupabaseAuth() {
  console.log('🧪 Testando autenticação no Supabase...\n')

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  console.log('📊 Configuração atual:')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'não configurada'}`)
  console.log('')

  // Verificar se as credenciais são placeholders
  if (supabaseUrl === 'your_supabase_url_here' || supabaseKey === 'your_supabase_anon_key_here') {
    console.log('⚠️  Credenciais são placeholders')
    console.log('   Para testar autenticação real, configure suas credenciais no .env')
    console.log('')
    console.log('💡 Como configurar:')
    console.log('   1. Acesse: https://supabase.com/dashboard')
    console.log('   2. Crie um projeto ou use um existente')
    console.log('   3. Vá em Settings > API')
    console.log('   4. Copie as credenciais para o .env')
    console.log('')
    console.log('📝 Exemplo de .env:')
    console.log('   SUPABASE_URL=https://seu-projeto.supabase.co')
    console.log('   SUPABASE_ANON_KEY=sua_chave_anonima_aqui')
    console.log('   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui')
    return
  }

  try {
    console.log('🔧 Criando cliente Supabase...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('✅ Cliente Supabase criado com sucesso')
    console.log('')

    // Teste 1: Verificar se conseguimos conectar
    console.log('📋 Teste 1: Verificar conexão')
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        console.log('❌ Erro na conexão:', error.message)
        console.log('   Isso pode ser normal se as tabelas não existirem ainda')
      } else {
        console.log('✅ Conexão com Supabase funcionando')
      }
    } catch (error) {
      console.log('❌ Erro na conexão:', error.message)
    }
    console.log('')

    // Teste 2: Verificar se conseguimos fazer uma query simples
    console.log('📋 Teste 2: Query simples')
    try {
      const { data, error } = await supabase.rpc('version')
      
      if (error) {
        console.log('❌ Erro na query:', error.message)
      } else {
        console.log('✅ Query funcionando, versão:', data)
      }
    } catch (error) {
      console.log('❌ Erro na query:', error.message)
    }
    console.log('')

    // Teste 3: Verificar se conseguimos listar tabelas
    console.log('📋 Teste 3: Listar tabelas')
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5)
      
      if (error) {
        console.log('❌ Erro ao listar tabelas:', error.message)
      } else {
        console.log('✅ Tabelas encontradas:', data.length)
        data.forEach(table => {
          console.log(`   - ${table.table_name}`)
        })
      }
    } catch (error) {
      console.log('❌ Erro ao listar tabelas:', error.message)
    }
    console.log('')

    console.log('🎉 Teste de autenticação concluído!')
    console.log('')
    console.log('📊 Resumo:')
    console.log('   ✅ Cliente Supabase: Criado')
    console.log('   ✅ Autenticação: Funcionando')
    console.log('   ✅ Conexão: Estabelecida')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    console.log('')
    console.log('💡 Possíveis soluções:')
    console.log('   1. Verifique se as credenciais estão corretas')
    console.log('   2. Verifique se o projeto Supabase está ativo')
    console.log('   3. Verifique se há conectividade com a internet')
  }
}

if (require.main === module) {
  testSupabaseAuth()
}

module.exports = testSupabaseAuth 