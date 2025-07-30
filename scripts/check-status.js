#!/usr/bin/env node

/**
 * 📊 n.CISO - Verificar Status do Projeto
 */

const fs = require('fs')
const path = require('path')

function checkProjectStatus() {
  console.log('📊 Status do Projeto n.CISO\n')
  
  // 1. Verificar estrutura de arquivos
  console.log('📁 1. Estrutura de Arquivos:')
  const files = [
    'package.json',
    '.env',
    'src/api/index.js',
    'src/middleware/auth.js',
    'src/middleware/tenant.js',
    'src/api/platform/invites.js',
    'scripts/supabase-schema-manual.sql',
    'scripts/tenants-schema.sql',
    'nciso-frontend/package.json'
  ]
  
  files.forEach(file => {
    const exists = fs.existsSync(file)
    console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  })
  
  // 2. Verificar scripts disponíveis
  console.log('\n🔧 2. Scripts Disponíveis:')
  const scripts = [
    'npm run dev',
    'npm run test:connection',
    'npm run test:schema',
    'npm run test:invites',
    'npm run diagnose:supabase',
    'npm run update:credentials',
    'npm run apply:all-schemas'
  ]
  
  scripts.forEach(script => {
    console.log(`   📋 ${script}`)
  })
  
  // 3. Verificar credenciais
  console.log('\n🔐 3. Status das Credenciais:')
  try {
    const envContent = fs.readFileSync('.env', 'utf8')
    const hasSupabaseUrl = envContent.includes('pszfqqmmljekibmcgmig.supabase.co')
    const hasAnonKey = envContent.includes('sb_publishable_')
    const hasServiceKey = envContent.includes('sb_secret_')
    
    console.log(`   ${hasSupabaseUrl ? '✅' : '❌'} SUPABASE_URL configurado`)
    console.log(`   ${hasAnonKey ? '✅' : '❌'} SUPABASE_ANON_KEY configurado`)
    console.log(`   ${hasServiceKey ? '✅' : '❌'} SUPABASE_SERVICE_ROLE_KEY configurado`)
  } catch (error) {
    console.log('   ❌ Arquivo .env não encontrado')
  }
  
  // 4. Verificar frontend
  console.log('\n🎨 4. Status do Frontend:')
  const frontendPath = 'nciso-frontend'
  if (fs.existsSync(frontendPath)) {
    console.log('   ✅ Frontend criado')
    
    const frontendFiles = [
      'src/app/login/page.tsx',
      'src/app/dashboard/page.tsx',
      'src/components/ui/mcp-table.tsx',
      'src/lib/supabase.ts',
      'src/lib/i18n.ts'
    ]
    
    frontendFiles.forEach(file => {
      const exists = fs.existsSync(path.join(frontendPath, file))
      console.log(`   ${exists ? '✅' : '❌'} ${file}`)
    })
  } else {
    console.log('   ❌ Frontend não encontrado')
  }
  
  // 5. Próximos passos
  console.log('\n🎯 5. PRÓXIMOS PASSOS:')
  console.log('')
  console.log('🔥 PRIORIDADE ALTA:')
  console.log('   1. Aplicar schemas no Supabase')
  console.log('   2. Testar conexão: npm run test:schema')
  console.log('   3. Configurar autenticação real')
  console.log('')
  console.log('⚡ PRIORIDADE MÉDIA:')
  console.log('   4. Iniciar frontend: cd nciso-frontend && npm run dev')
  console.log('   5. Configurar .env.local no frontend')
  console.log('   6. Conectar frontend com backend')
  console.log('')
  console.log('📊 PRIORIDADE BAIXA:')
  console.log('   7. Implementar sistema de e-mail')
  console.log('   8. Melhorar UI/UX')
  console.log('   9. Adicionar testes automatizados')
  console.log('')
  
  // 6. Comandos úteis
  console.log('💡 COMANDOS ÚTEIS:')
  console.log('   npm run diagnose:supabase     # Diagnosticar Supabase')
  console.log('   npm run test:connection       # Testar conexão')
  console.log('   npm run test:schema           # Testar schema')
  console.log('   npm run test:invites          # Testar convites')
  console.log('   cd nciso-frontend && npm run dev  # Iniciar frontend')
  console.log('')
  
  console.log('🚀 Status: Pronto para aplicar schemas e conectar frontend!')
}

if (require.main === module) {
  checkProjectStatus()
}

module.exports = { checkProjectStatus } 