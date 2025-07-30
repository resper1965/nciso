#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Setup de Certificados SSL
 * 
 * Script para configurar certificados SSL do Supabase
 */

const {
  createCertificateStructure,
  checkCertificates,
  showCertificateInstructions,
  checkCurrentSSL
} = require('../src/config/certificates')

async function setupCertificates() {
  console.log('🔐 Configurando certificados SSL...\n')

  try {
    // 1. Criar estrutura de diretórios
    console.log('📋 1. Criando estrutura de diretórios')
    createCertificateStructure()
    console.log('')

    // 2. Verificar certificados existentes
    console.log('📋 2. Verificando certificados existentes')
    const hasCertificates = checkCertificates()
    console.log('')

    // 3. Verificar SSL atual
    console.log('📋 3. Verificando configuração SSL atual')
    await checkCurrentSSL()
    console.log('')

    // 4. Mostrar instruções
    console.log('📋 4. Instruções para configurar certificados')
    showCertificateInstructions()
    console.log('')

    if (hasCertificates) {
      console.log('✅ Certificados encontrados!')
      console.log('💡 Execute: npm run test:ssl')
    } else {
      console.log('⚠️  Certificados não encontrados')
      console.log('💡 Siga as instruções acima para configurar')
    }

  } catch (error) {
    console.error('❌ Erro no setup de certificados:', error.message)
  }
}

if (require.main === module) {
  setupCertificates()
}

module.exports = { setupCertificates } 