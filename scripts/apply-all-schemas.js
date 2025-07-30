#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Aplicar Todos os Schemas
 * 
 * Script para aplicar todos os schemas no Supabase
 */

const fs = require('fs')
const path = require('path')

function showSchemaInstructions() {
  console.log('🔧 Aplicando Schemas no Supabase...\n')
  
  console.log('📋 1. Schema Principal (Tabelas Base):')
  console.log('   Arquivo: scripts/supabase-schema-manual.sql')
  console.log('   Conteúdo: Tabelas users, policies, controls, domains, etc.')
  console.log('')
  
  console.log('📋 2. Schema de Governança (Tenants e Convites):')
  console.log('   Arquivo: scripts/tenants-schema.sql')
  console.log('   Conteúdo: Tabelas tenants, invites, RLS policies')
  console.log('')
  
  console.log('🎯 INSTRUÇÕES:')
  console.log('')
  console.log('1. Acesse: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig')
  console.log('2. Vá em: SQL Editor')
  console.log('3. Execute os schemas na seguinte ordem:')
  console.log('')
  console.log('   a) Primeiro: scripts/supabase-schema-manual.sql')
  console.log('   b) Depois: scripts/tenants-schema.sql')
  console.log('')
  console.log('4. Após executar, teste com:')
  console.log('   npm run test:schema')
  console.log('   npm run test:invites')
  console.log('')
  
  // Mostrar conteúdo dos schemas
  console.log('📄 CONTEÚDO DOS SCHEMAS:')
  console.log('')
  
  // Schema principal
  const mainSchemaPath = path.join(__dirname, 'supabase-schema-manual.sql')
  if (fs.existsSync(mainSchemaPath)) {
    console.log('🔧 Schema Principal (scripts/supabase-schema-manual.sql):')
    console.log('='.repeat(50))
    const mainSchema = fs.readFileSync(mainSchemaPath, 'utf8')
    console.log(mainSchema.substring(0, 500) + '...')
    console.log('')
  }
  
  // Schema de tenants
  const tenantsSchemaPath = path.join(__dirname, 'tenants-schema.sql')
  if (fs.existsSync(tenantsSchemaPath)) {
    console.log('🔧 Schema de Governança (scripts/tenants-schema.sql):')
    console.log('='.repeat(50))
    const tenantsSchema = fs.readFileSync(tenantsSchemaPath, 'utf8')
    console.log(tenantsSchema.substring(0, 500) + '...')
    console.log('')
  }
  
  console.log('✅ Após aplicar os schemas, execute:')
  console.log('   npm run test:schema')
  console.log('   npm run test:invites')
  console.log('   npm run test:connection')
}

if (require.main === module) {
  showSchemaInstructions()
}

module.exports = { showSchemaInstructions } 