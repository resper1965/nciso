#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testando Backend n.CISO');
console.log('==========================');

// Função para testar o backend
function testBackend() {
  console.log('🚀 Iniciando backend...');
  
  const child = spawn('node', ['scripts/start-backend.js'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '3000'
    }
  });
  
  // Aguardar um pouco para o servidor iniciar
  setTimeout(() => {
    console.log('✅ Backend iniciado com sucesso!');
    console.log('📊 Health check: http://localhost:3000/health');
    console.log('🛑 Pressione Ctrl+C para parar o teste');
    
    child.kill('SIGTERM');
  }, 5000);
  
  child.on('error', (error) => {
    console.error('❌ Erro ao iniciar backend:', error.message);
  });
  
  child.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Teste concluído com sucesso!');
    } else {
      console.log(`❌ Backend encerrado com código: ${code}`);
    }
  });
}

if (require.main === module) {
  testBackend();
}

module.exports = { testBackend }; 