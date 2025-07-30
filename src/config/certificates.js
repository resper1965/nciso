/**
 * 🛡️ n.CISO - Configuração de Certificados SSL
 * 
 * Configuração para certificados SSL customizados do Supabase
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

/**
 * 📁 Estrutura de Diretórios para Certificados
 */
const CERT_DIR = path.join(__dirname, '../../certs')
const SSL_CONFIG = {
  // Diretórios de certificados
  certPath: path.join(CERT_DIR, 'supabase.crt'),
  keyPath: path.join(CERT_DIR, 'supabase.key'),
  caPath: path.join(CERT_DIR, 'ca.crt'),
  
  // Configurações SSL
  sslOptions: {
    rejectUnauthorized: true,
    secureProtocol: 'TLSv1_2_method'
  }
}

/**
 * 🔍 Verificar se certificados existem
 */
function checkCertificates() {
  console.log('🔍 Verificando certificados SSL...')
  
  const checks = [
    { name: 'Certificado (.crt)', path: SSL_CONFIG.certPath },
    { name: 'Chave privada (.key)', path: SSL_CONFIG.keyPath },
    { name: 'CA Bundle (.crt)', path: SSL_CONFIG.caPath }
  ]
  
  checks.forEach(check => {
    if (fs.existsSync(check.path)) {
      console.log(`   ✅ ${check.name}: Encontrado`)
    } else {
      console.log(`   ❌ ${check.name}: Não encontrado`)
    }
  })
  
  return checks.every(check => fs.existsSync(check.path))
}

/**
 * 📋 Criar estrutura de diretórios
 */
function createCertificateStructure() {
  console.log('📁 Criando estrutura de certificados...')
  
  // Criar diretório de certificados
  if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true })
    console.log('   ✅ Diretório de certificados criado')
  } else {
    console.log('   ✅ Diretório de certificados já existe')
  }
  
  // Criar arquivo .gitignore para certificados
  const gitignorePath = path.join(CERT_DIR, '.gitignore')
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, `# Certificados SSL
*.crt
*.key
*.pem
*.p12
*.pfx
ca.crt
supabase.crt
supabase.key
`)
    console.log('   ✅ .gitignore criado para certificados')
  }
  
  // Criar README para certificados
  const readmePath = path.join(CERT_DIR, 'README.md')
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, `# 🔐 Certificados SSL

## 📋 Estrutura de Arquivos

Coloque seus certificados SSL aqui:

- \`supabase.crt\` - Certificado do servidor
- \`supabase.key\` - Chave privada
- \`ca.crt\` - Certificado da autoridade certificadora

## ⚠️ Segurança

- **NUNCA** commite certificados no git
- Mantenha as chaves privadas seguras
- Use variáveis de ambiente para produção

## 🔧 Como Configurar

1. Obtenha os certificados do Supabase
2. Coloque os arquivos neste diretório
3. Configure as permissões adequadas
4. Teste a conexão SSL

## 🧪 Teste

\`\`\`bash
npm run test:ssl
\`\`\`
`)
    console.log('   ✅ README criado para certificados')
  }
}

/**
 * 🔐 Configurar certificados para cliente HTTPS
 */
function createSSLAgent() {
  try {
    // Verificar se certificados existem
    if (!checkCertificates()) {
      console.log('⚠️  Certificados não encontrados, usando configuração padrão')
      return null
    }
    
    // Criar agente HTTPS com certificados customizados
    const sslAgent = new https.Agent({
      cert: fs.readFileSync(SSL_CONFIG.certPath),
      key: fs.readFileSync(SSL_CONFIG.keyPath),
      ca: fs.readFileSync(SSL_CONFIG.caPath),
      rejectUnauthorized: true
    })
    
    console.log('✅ Agente HTTPS criado com certificados customizados')
    return sslAgent
    
  } catch (error) {
    console.log(`❌ Erro ao criar agente HTTPS: ${error.message}`)
    return null
  }
}

/**
 * 🔧 Configurar cliente Supabase com certificados customizados
 */
function createSupabaseClientWithCertificates() {
  const sslAgent = createSSLAgent()
  
  if (!sslAgent) {
    console.log('⚠️  Usando configuração SSL padrão do Supabase')
    return null
  }
  
  // Retornar configuração para cliente customizado
  return {
    agent: sslAgent,
    rejectUnauthorized: true,
    secureProtocol: 'TLSv1_2_method'
  }
}

/**
 * 📋 Instruções para configurar certificados
 */
function showCertificateInstructions() {
  console.log('📋 Instruções para configurar certificados SSL:')
  console.log('')
  console.log('1. 📁 Estrutura de diretórios:')
  console.log(`   ${CERT_DIR}/`)
  console.log('   ├── supabase.crt    # Certificado do servidor')
  console.log('   ├── supabase.key    # Chave privada')
  console.log('   ├── ca.crt          # Certificado CA')
  console.log('   ├── .gitignore      # Ignorar certificados')
  console.log('   └── README.md       # Instruções')
  console.log('')
  console.log('2. 🔐 Obter certificados:')
  console.log('   - Acesse o painel do Supabase')
  console.log('   - Vá em Settings > Database')
  console.log('   - Baixe os certificados SSL')
  console.log('')
  console.log('3. 🔧 Configurar permissões:')
  console.log('   chmod 600 certs/*.key')
  console.log('   chmod 644 certs/*.crt')
  console.log('')
  console.log('4. 🧪 Testar configuração:')
  console.log('   npm run test:ssl')
  console.log('')
  console.log('⚠️  IMPORTANTE:')
  console.log('   - NUNCA commite certificados no git')
  console.log('   - Use variáveis de ambiente em produção')
  console.log('   - Mantenha as chaves privadas seguras')
}

/**
 * 🔍 Verificar configuração SSL atual
 */
async function checkCurrentSSL() {
  console.log('🔍 Verificando configuração SSL atual...')
  
  try {
    const https = require('https')
    const url = require('url')
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://pszfqqmmljekibmcgmig.supabase.co'
    const parsedUrl = url.parse(supabaseUrl)
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: '/',
      method: 'GET',
      rejectUnauthorized: true
    }
    
    const req = https.request(options, (res) => {
      console.log(`   ✅ Status: ${res.statusCode}`)
      console.log(`   ✅ Protocolo: ${res.socket.getProtocol()}`)
      console.log(`   ✅ Cipher: ${res.socket.getCipher()}`)
      console.log(`   ✅ Certificado: ${res.socket.getPeerCertificate().subject.CN}`)
    })
    
    req.on('error', (error) => {
      console.log(`   ❌ Erro SSL: ${error.message}`)
    })
    
    req.end()
    
  } catch (error) {
    console.log(`   ❌ Erro ao verificar SSL: ${error.message}`)
  }
}

module.exports = {
  SSL_CONFIG,
  checkCertificates,
  createCertificateStructure,
  createSSLAgent,
  createSupabaseClientWithCertificates,
  showCertificateInstructions,
  checkCurrentSSL
} 