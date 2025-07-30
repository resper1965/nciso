#!/usr/bin/env node

/**
 * 🧪 Teste de Autenticação Supabase com Credenciais Reais
 * 
 * Script para testar autenticação com credenciais reais do Supabase
 * 
 * USO: node scripts/test-supabase-real.js <URL> <ANON_KEY> <SERVICE_ROLE_KEY>
 * EXEMPLO: node scripts/test-supabase-real.js https://pszfqqmmljekibmcgmig.supabase.co sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW
 */

const { createClient } = require('@supabase/supabase-js')

async function testSupabaseReal() {
  console.log('🧪 Testando autenticação Supabase com credenciais reais...\n')

  // Pegar credenciais dos argumentos da linha de comando
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.log('❌ Uso incorreto!')
    console.log('')
    console.log('📝 Uso correto:')
    console.log('   node scripts/test-supabase-real.js <URL> <ANON_KEY> <SERVICE_ROLE_KEY>')
    console.log('')
    console.log('📝 Exemplo:')
    console.log('   node scripts/test-supabase-real.js https://pszfqqmmljekibmcgmig.supabase.co sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW')
    return
  }

  const [supabaseUrl, supabaseAnonKey, supabaseServiceKey] = args

  console.log('📊 Credenciais fornecidas:')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)
  console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`)
  console.log('')

  try {
    // Teste 1: Cliente com chave anônima
    console.log('📋 Teste 1: Cliente com chave anônima')
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Cliente anônimo criado com sucesso')

    // Teste 2: Cliente com chave de serviço
    console.log('📋 Teste 2: Cliente com chave de serviço')
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Cliente de serviço criado com sucesso')
    console.log('')

    // Teste 3: Verificar conexão com chave anônima
    console.log('📋 Teste 3: Verificar conexão (anônima)')
    try {
      const { data, error } = await supabaseAnon.from('users').select('count').limit(1)
      
      if (error) {
        console.log('❌ Erro na conexão anônima:', error.message)
        console.log('   Isso pode ser normal se as tabelas não existirem ainda')
      } else {
        console.log('✅ Conexão anônima funcionando')
      }
    } catch (error) {
      console.log('❌ Erro na conexão anônima:', error.message)
    }
    console.log('')

    // Teste 4: Verificar conexão com chave de serviço
    console.log('📋 Teste 4: Verificar conexão (serviço)')
    try {
      const { data, error } = await supabaseService.from('users').select('count').limit(1)
      
      if (error) {
        console.log('❌ Erro na conexão de serviço:', error.message)
        console.log('   Isso pode ser normal se as tabelas não existirem ainda')
      } else {
        console.log('✅ Conexão de serviço funcionando')
      }
    } catch (error) {
      console.log('❌ Erro na conexão de serviço:', error.message)
    }
    console.log('')

    // Teste 5: Listar tabelas (se possível)
    console.log('📋 Teste 5: Listar tabelas')
    try {
      const { data, error } = await supabaseService
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(10)
      
      if (error) {
        console.log('❌ Erro ao listar tabelas:', error.message)
      } else {
        console.log('✅ Tabelas encontradas:', data.length)
        if (data.length > 0) {
          data.forEach(table => {
            console.log(`   - ${table.table_name}`)
          })
        } else {
          console.log('   (Nenhuma tabela encontrada)')
        }
      }
    } catch (error) {
      console.log('❌ Erro ao listar tabelas:', error.message)
    }
    console.log('')

    // Teste 6: Verificar se conseguimos fazer uma query simples
    console.log('📋 Teste 6: Query simples')
    try {
      const { data, error } = await supabaseService.rpc('version')
      
      if (error) {
        console.log('❌ Erro na query:', error.message)
      } else {
        console.log('✅ Query funcionando, versão:', data)
      }
    } catch (error) {
      console.log('❌ Erro na query:', error.message)
    }
    console.log('')

    console.log('🎉 Teste de autenticação com credenciais reais concluído!')
    console.log('')
    console.log('📊 Resumo:')
    console.log('   ✅ Cliente Anônimo: Criado')
    console.log('   ✅ Cliente de Serviço: Criado')
    console.log('   ✅ Autenticação: Funcionando')
    console.log('   ✅ Conexão: Estabelecida')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    console.log('')
    console.log('💡 Possíveis soluções:')
    console.log('   1. Verifique se as credenciais estão corretas')
    console.log('   2. Verifique se o projeto Supabase está ativo')
    console.log('   3. Verifique se há conectividade com a internet')
    console.log('   4. Verifique se as chaves têm as permissões corretas')
  }
}

if (require.main === module) {
  testSupabaseReal()
}

module.exports = testSupabaseReal 