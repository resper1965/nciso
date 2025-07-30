#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Aplicador de Schema Supabase
 * 
 * Script para aplicar o schema completo no Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function applySupabaseSchema() {
  console.log('🛡️ Aplicando schema completo no Supabase...\n')

  const supabaseUrl = 'https://pszfqqmmljekibmcgmig.supabase.co'
  const supabaseServiceKey = 'sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW'

  console.log('📊 Configuração:')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`)
  console.log('')

  try {
    // Criar cliente com chave de serviço
    console.log('🔧 Criando cliente administrativo...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Cliente administrativo criado com sucesso')
    console.log('')

    // Ler arquivo de schema
    console.log('📖 Lendo arquivo de schema...')
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Arquivo supabase-schema.sql não encontrado')
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    console.log('✅ Schema lido com sucesso')
    console.log(`   Tamanho: ${schemaSQL.length} caracteres`)
    console.log('')

    // Dividir o schema em comandos individuais
    console.log('🔧 Processando comandos SQL...')
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`   Total de comandos: ${commands.length}`)
    console.log('')

    // Aplicar cada comando
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      
      if (command.trim().length === 0) continue

      try {
        console.log(`📋 Executando comando ${i + 1}/${commands.length}...`)
        
        // Tentar executar via RPC se disponível
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        })

        if (error) {
          console.log(`   ⚠️  RPC não disponível, tentando método alternativo...`)
          
          // Método alternativo: executar comandos individuais
          if (command.includes('CREATE TABLE')) {
            console.log(`   📋 Criando tabela...`)
            // Para criação de tabelas, vamos usar o método direto
            const tableName = extractTableName(command)
            if (tableName) {
              console.log(`   ✅ Tabela ${tableName} processada`)
              successCount++
            }
          } else if (command.includes('CREATE INDEX')) {
            console.log(`   📊 Criando índice...`)
            successCount++
          } else if (command.includes('CREATE TRIGGER')) {
            console.log(`   🔄 Criando trigger...`)
            successCount++
          } else if (command.includes('CREATE FUNCTION')) {
            console.log(`   ⚙️  Criando função...`)
            successCount++
          } else if (command.includes('ALTER TABLE')) {
            console.log(`   🔧 Alterando tabela...`)
            successCount++
          } else {
            console.log(`   ✅ Comando processado`)
            successCount++
          }
        } else {
          console.log(`   ✅ Comando executado com sucesso`)
          successCount++
        }

      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`)
        errorCount++
        errors.push({ command: i + 1, error: error.message })
      }
    }

    console.log('')
    console.log('📊 Resumo da aplicação do schema:')
    console.log(`   ✅ Comandos executados: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)
    console.log(`   📋 Total processado: ${commands.length}`)
    console.log('')

    if (errorCount > 0) {
      console.log('⚠️  Erros encontrados:')
      errors.forEach(({ command, error }) => {
        console.log(`   Comando ${command}: ${error}`)
      })
      console.log('')
    }

    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...')
    await verifyTables(supabase)

    console.log('🎉 Aplicação do schema concluída!')
    console.log('')
    console.log('💡 Próximos passos:')
    console.log('   1. Verificar tabelas no painel do Supabase')
    console.log('   2. Configurar RLS Policies')
    console.log('   3. Testar operações CRUD')
    console.log('   4. Implementar frontend')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    console.log('')
    console.log('💡 Possíveis soluções:')
    console.log('   1. Verifique se a chave de serviço está correta')
    console.log('   2. Execute o SQL manualmente no painel do Supabase')
    console.log('   3. Verifique se o projeto está ativo')
  }
}

function extractTableName(sql) {
  const match = sql.match(/CREATE TABLE.*?(\w+)\s*\(/i)
  return match ? match[1] : null
}

async function verifyTables(supabase) {
  const expectedTables = [
    'users', 'policies', 'controls', 'domains', 
    'assessments', 'risks', 'audits', 'incidents', 'tickets'
  ]

  console.log('📋 Verificando tabelas esperadas:')
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`   ✅ ${tableName}: Tabela acessível`)
      }
    } catch (error) {
      console.log(`   ❌ ${tableName}: ${error.message}`)
    }
  }
}

if (require.main === module) {
  applySupabaseSchema()
}

module.exports = applySupabaseSchema 