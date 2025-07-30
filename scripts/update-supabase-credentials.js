#!/usr/bin/env node

/**
 * 🔧 Script para atualizar credenciais do Supabase
 */

const fs = require('fs')
const path = require('path')

const CREDENTIALS = {
  SUPABASE_URL: 'https://pszfqqmmljekibmcgmig.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX',
  SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW'
}

function updateCredentials() {
  console.log('🔧 Atualizando credenciais do Supabase...')
  
  const envPath = path.join(__dirname, '../.env')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado')
    return
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8')
  
  // Atualizar cada credencial
  Object.entries(CREDENTIALS).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*`, 'm')
    const newLine = `${key}=${value}`
    
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, newLine)
      console.log(`   ✅ ${key}: Atualizado`)
    } else {
      envContent += `\n${newLine}`
      console.log(`   ➕ ${key}: Adicionado`)
    }
  })
  
  // Salvar arquivo
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Credenciais atualizadas com sucesso!')
  
  // Mostrar instruções
  console.log('\n📋 Próximos passos:')
  console.log('1. Testar conexão: npm run test:connection')
  console.log('2. Aplicar schema: npm run apply:schema')
  console.log('3. Testar schema: npm run test:schema')
}

if (require.main === module) {
  updateCredentials()
}

module.exports = { updateCredentials } 