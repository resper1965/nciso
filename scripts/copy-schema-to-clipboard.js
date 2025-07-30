#!/usr/bin/env node

/**
 * 📋 Copiar Schema para Clipboard
 * 
 * Exibe o schema formatado para copiar no Supabase
 */

const fs = require('fs')
const path = require('path')

function copySchemaToClipboard() {
  console.log('📋 Schema BÁSICO para Supabase SQL Editor:\n')
  console.log('='.repeat(80))
  console.log('COPIAR TUDO ABAIXO E COLAR NO SQL EDITOR DO SUPABASE:')
  console.log('='.repeat(80))
  console.log('')
  
  const schemaPath = path.join(__dirname, 'apply-tenants-basic.sql')
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8')
    console.log(schema)
  } else {
    console.log('❌ Arquivo de schema não encontrado')
    return
  }
  
  console.log('')
  console.log('='.repeat(80))
  console.log('INSTRUÇÕES:')
  console.log('1. Copie todo o conteúdo acima (sem comentários)')
  console.log('2. Acesse: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig')
  console.log('3. Vá em: SQL Editor')
  console.log('4. Clique em: New query')
  console.log('5. Cole o conteúdo')
  console.log('6. Clique em: Run')
  console.log('7. Execute: npm run test:tenants')
  console.log('='.repeat(80))
}

if (require.main === module) {
  copySchemaToClipboard()
}

module.exports = { copySchemaToClipboard } 