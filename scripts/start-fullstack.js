#!/usr/bin/env node

/**
 * 🚀 Iniciar Fullstack
 * 
 * Inicia backend na porta 3000 e frontend na porta 3001
 */

const { spawn } = require('child_process')
const path = require('path')

function startFullstack() {
  console.log('🚀 Iniciando Fullstack n.CISO...\n')
  
  // 1. Iniciar Backend (porta 3000)
  console.log('🔧 Iniciando Backend na porta 3000...')
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  })
  
  // 2. Aguardar 3 segundos e iniciar Frontend (porta 3001)
  setTimeout(() => {
    console.log('\n🎨 Iniciando Frontend na porta 3001...')
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(process.cwd(), 'nciso-frontend'),
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: '3001' }
    })
    
    // 3. Aguardar 5 segundos e mostrar URLs
    setTimeout(() => {
      console.log('\n✅ Fullstack iniciado com sucesso!')
      console.log('🌐 URLs disponíveis:')
      console.log('   Backend:  http://localhost:3000')
      console.log('   Frontend: http://localhost:3001')
      console.log('   Health:   http://localhost:3000/health')
      console.log('   API:      http://localhost:3000/api/v1')
      console.log('\n💡 Comandos úteis:')
      console.log('   npm run check:backend    # Verificar backend')
      console.log('   npm run test:policies    # Testar API')
      console.log('   npm run check:schema     # Verificar schema')
    }, 5000)
    
  }, 3000)
  
  // 4. Tratamento de erros
  backend.on('error', (error) => {
    console.error('❌ Erro no backend:', error.message)
  })
  
  backend.on('close', (code) => {
    console.log(`🔧 Backend encerrado com código: ${code}`)
  })
}

if (require.main === module) {
  startFullstack()
}

module.exports = { startFullstack } 