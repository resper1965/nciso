#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico do Backend n.CISO');
console.log('================================');

// Verificar arquivos essenciais
const essentialFiles = [
  'src/api/index.js',
  'package.json',
  'Dockerfile.backend',
  'env.example'
];

console.log('\n📁 Verificando arquivos essenciais:');
essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Verificar dependências
console.log('\n📦 Verificando dependências:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['express', 'cors', 'helmet', 'dotenv'];
  
  requiredDeps.forEach(dep => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`${hasDep ? '✅' : '❌'} ${dep}`);
  });
} catch (error) {
  console.log('❌ Erro ao ler package.json');
}

// Verificar variáveis de ambiente
console.log('\n🔧 Verificando variáveis de ambiente:');
const envVars = [
  'NODE_ENV',
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${value ? '✅' : '❌'} ${varName}: ${value ? 'definida' : 'não definida'}`);
});

// Verificar estrutura de pastas
console.log('\n📂 Verificando estrutura de pastas:');
const requiredDirs = [
  'src/api',
  'src/middleware',
  'src/config',
  'logs'
];

requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`${exists ? '✅' : '❌'} ${dir}/`);
});

console.log('\n🚀 Sugestões de correção:');
console.log('1. Verifique se todas as variáveis de ambiente estão definidas');
console.log('2. Execute: npm install');
console.log('3. Teste localmente: npm run dev');
console.log('4. Verifique logs do Docker: docker logs nciso-backend');
console.log('5. Reinicie o container: docker-compose restart backend'); 