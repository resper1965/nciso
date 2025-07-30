#!/usr/bin/env node

/**
 * 🚀 Iniciar Backend
 * 
 * Inicia o backend com tratamento de erros
 */

const { spawn } = require('child_process')
const path = require('path')

function startBackend() {
  console.log('🚀 Iniciando Backend...\n')
  
  // Verificar se o arquivo principal existe
  const mainFile = path.join(__dirname, '../src/app.js')
  const fs = require('fs')
  
  if (!fs.existsSync(mainFile)) {
    console.log('❌ Arquivo principal não encontrado: src/app.js')
    console.log('💡 Verifique se o arquivo existe ou crie-o')
    return
  }
  
  console.log('📁 Arquivo principal encontrado')
  console.log('🔧 Iniciando servidor...')
  
  const child = spawn('node', [mainFile], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  })
  
  child.on('error', (error) => {
    console.error('❌ Erro ao iniciar backend:', error.message)
  })
  
  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`❌ Backend encerrado com código: ${code}`)
    } else {
      console.log('✅ Backend encerrado normalmente')
    }
  })
  
  console.log('💡 Backend iniciado. Pressione Ctrl+C para parar.')
}

if (require.main === module) {
  startBackend()
}

module.exports = { startBackend } 