#!/usr/bin/env node

/**
 * 🔍 Diagnóstico do Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function diagnoseSupabase() {
  console.log('🔍 Diagnóstico do Supabase...\n')
  
  // 1. Verificar variáveis de ambiente
  console.log('📋 1. Verificando variáveis de ambiente:')
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não configurado'}`)
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n❌ Variáveis de ambiente incompletas!')
    return
  }
  
  // 2. Testar conectividade
  console.log('\n📋 2. Testando conectividade:')
  try {
    const response = await fetch(SUPABASE_URL)
    console.log(`   Status: ${response.status}`)
    console.log(`   Headers: ${response.headers.get('server')}`)
  } catch (error) {
    console.log(`   ❌ Erro de conectividade: ${error.message}`)
  }
  
  // 3. Testar cliente anônimo
  console.log('\n📋 3. Testando cliente anônimo:')
  try {
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await supabaseAnon.auth.getSession()
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    } else {
      console.log('   ✅ Cliente anônimo funcionando')
    }
  } catch (error) {
    console.log(`   ❌ Erro ao criar cliente anônimo: ${error.message}`)
  }
  
  // 4. Testar cliente de serviço
  console.log('\n📋 4. Testando cliente de serviço:')
  try {
    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data, error } = await supabaseService.from('users').select('count').limit(1)
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    } else {
      console.log('   ✅ Cliente de serviço funcionando')
    }
  } catch (error) {
    console.log(`   ❌ Erro ao criar cliente de serviço: ${error.message}`)
  }
  
  // 5. Verificar projeto no Supabase
  console.log('\n📋 5. Informações do projeto:')
  console.log(`   URL: ${SUPABASE_URL}`)
  console.log(`   Project ID: ${SUPABASE_URL.split('//')[1].split('.')[0]}`)
  
  // 6. Recomendações
  console.log('\n📋 6. Recomendações:')
  console.log('   🔧 Se as tabelas não existem:')
  console.log('      1. Acesse o painel do Supabase')
  console.log('      2. Vá em SQL Editor')
  console.log('      3. Execute o schema: scripts/supabase-schema-manual.sql')
  console.log('')
  console.log('   🔧 Se há problemas de conectividade:')
  console.log('      1. Verifique se o projeto está ativo')
  console.log('      2. Verifique as credenciais')
  console.log('      3. Teste a URL diretamente')
  console.log('')
  console.log('   🔧 Para aplicar o schema:')
  console.log('      npm run apply:schema')
  console.log('      npm run test:schema')
}

if (require.main === module) {
  diagnoseSupabase()
}

module.exports = { diagnoseSupabase } 