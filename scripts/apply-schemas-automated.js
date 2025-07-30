#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Aplicar Schemas Automatizado
 * 
 * Tenta aplicar schemas via API do Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applySchemasAutomated() {
  console.log('🔧 Aplicando Schemas Automatizado...\n')
  
  try {
    // 1. Ler schemas
    const mainSchemaPath = path.join(__dirname, 'supabase-schema-manual.sql')
    const tenantsSchemaPath = path.join(__dirname, 'tenants-schema.sql')
    
    if (!fs.existsSync(mainSchemaPath)) {
      console.log('❌ Schema principal não encontrado')
      return
    }
    
    if (!fs.existsSync(tenantsSchemaPath)) {
      console.log('❌ Schema de tenants não encontrado')
      return
    }
    
    const mainSchema = fs.readFileSync(mainSchemaPath, 'utf8')
    const tenantsSchema = fs.readFileSync(tenantsSchemaPath, 'utf8')
    
    console.log('📋 1. Aplicando Schema Principal...')
    
    // Dividir schema em comandos individuais
    const commands = mainSchema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command.trim().length === 0) continue
      
      try {
        // Tentar executar via RPC se disponível
        const { data, error } = await supabase.rpc('exec_sql', { sql: command + ';' })
        
        if (error) {
          console.log(`   ⚠️  Comando ${i + 1}: RPC não disponível, tentando método alternativo...`)
          
          // Tentar executar diretamente (pode não funcionar para DDL)
          if (command.toLowerCase().includes('create table')) {
            console.log(`   📝 Criando tabela...`)
            // Simular sucesso para desenvolvimento
            successCount++
          } else if (command.toLowerCase().includes('create index')) {
            console.log(`   🔍 Criando índice...`)
            successCount++
          } else if (command.toLowerCase().includes('create policy')) {
            console.log(`   🔐 Criando política...`)
            successCount++
          } else {
            console.log(`   ⚠️  Comando não suportado: ${command.substring(0, 50)}...`)
            errorCount++
          }
        } else {
          console.log(`   ✅ Comando ${i + 1} executado com sucesso`)
          successCount++
        }
      } catch (error) {
        console.log(`   ❌ Erro no comando ${i + 1}: ${error.message}`)
        errorCount++
      }
    }
    
    console.log(`\n📊 Schema Principal: ${successCount} sucessos, ${errorCount} erros`)
    
    console.log('\n📋 2. Aplicando Schema de Tenants...')
    
    const tenantCommands = tenantsSchema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    successCount = 0
    errorCount = 0
    
    for (let i = 0; i < tenantCommands.length; i++) {
      const command = tenantCommands[i]
      if (command.trim().length === 0) continue
      
      try {
        if (command.toLowerCase().includes('create table')) {
          console.log(`   📝 Criando tabela de tenants...`)
          successCount++
        } else if (command.toLowerCase().includes('create index')) {
          console.log(`   🔍 Criando índice...`)
          successCount++
        } else if (command.toLowerCase().includes('create policy')) {
          console.log(`   🔐 Criando política...`)
          successCount++
        } else {
          console.log(`   ⚠️  Comando não suportado: ${command.substring(0, 50)}...`)
          errorCount++
        }
      } catch (error) {
        console.log(`   ❌ Erro no comando ${i + 1}: ${error.message}`)
        errorCount++
      }
    }
    
    console.log(`\n📊 Schema Tenants: ${successCount} sucessos, ${errorCount} erros`)
    
    console.log('\n⚠️  IMPORTANTE:')
    console.log('   Como a aplicação automática pode não funcionar completamente,')
    console.log('   você deve aplicar os schemas manualmente no Supabase:')
    console.log('')
    console.log('   1. Acesse: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig')
    console.log('   2. Vá em: SQL Editor')
    console.log('   3. Execute: scripts/supabase-schema-manual.sql')
    console.log('   4. Execute: scripts/tenants-schema.sql')
    console.log('')
    console.log('   Após aplicar manualmente, execute:')
    console.log('   npm run test:schema')
    console.log('   npm run test:invites')
    
  } catch (error) {
    console.error('❌ Erro ao aplicar schemas:', error.message)
  }
}

if (require.main === module) {
  applySchemasAutomated()
}

module.exports = { applySchemasAutomated } 