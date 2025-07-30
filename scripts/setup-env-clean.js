#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Configurador de Ambiente Limpo
 * 
 * Script para criar um arquivo .env limpo apenas com variáveis essenciais
 */

const fs = require('fs')
const path = require('path')

const cleanConfig = {
  // Supabase (Credenciais - Configure suas próprias)
  SUPABASE_URL: 'your_supabase_url_here',
  SUPABASE_ANON_KEY: 'your_supabase_anon_key_here',
  SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key_here',

  // Segurança
  JWT_SECRET: 'nciso_jwt_secret_key_2024_development_min_32_chars_long',

  // Aplicação
  NODE_ENV: 'development',
  PORT: '3000',
  API_VERSION: 'v1',
  CORS_ORIGIN: 'http://localhost:3000',

  // MCP Server
  MCP_LOG_LEVEL: 'info',

  // i18n
  DEFAULT_LOCALE: 'pt-BR',
  SUPPORTED_LOCALES: 'pt-BR,en-US,es',

  // Desenvolvimento
  DEV_MODE: 'true',
  MOCK_DATA: 'true'
}

function createCleanEnvFile() {
  console.log('🧹 Criando arquivo .env limpo...\n')

  const envPath = path.join(process.cwd(), '.env')
  
  // Verificar se o arquivo já existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env já existe')
    console.log('   Backup será criado como .env.backup')
    
    const backupPath = path.join(process.cwd(), '.env.backup')
    fs.copyFileSync(envPath, backupPath)
    console.log('   Backup criado: .env.backup')
  }

  // Criar conteúdo do arquivo .env
  let envContent = `# =============================================================================
# 🛡️ n.CISO - Variáveis de Ambiente Essenciais
# =============================================================================

`

  // Adicionar variáveis essenciais
  for (const [key, value] of Object.entries(cleanConfig)) {
    envContent += `${key}=${value}\n`
  }

  // Escrever arquivo
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Arquivo .env limpo criado com sucesso!')
    console.log(`📁 Localização: ${envPath}`)
    
    console.log('\n🔍 Variáveis configuradas:')
    console.log(`   📊 Supabase: ✅`)
    console.log(`   🔐 JWT Secret: ✅`)
    console.log(`   🚀 Porta: ${cleanConfig.PORT}`)
    console.log(`   🛡️ MCP Server: ${cleanConfig.MCP_LOG_LEVEL}`)
    console.log(`   🌍 i18n: ${cleanConfig.DEFAULT_LOCALE}`)
    console.log(`   🧪 Dev Mode: ${cleanConfig.DEV_MODE}`)
    
    console.log('\n💡 Próximos passos:')
    console.log('   1. Execute: npm run validate:env')
    console.log('   2. Execute: npm run mcp:test')
    console.log('   3. Execute: npm run dev')
    
  } catch (error) {
    console.error('❌ Erro ao criar arquivo .env:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  createCleanEnvFile()
}

module.exports = createCleanEnvFile 