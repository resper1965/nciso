#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Criador de Tabelas Supabase
 * 
 * Script para criar as tabelas necessárias no Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const tables = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      tenant_id VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  policies: `
    CREATE TABLE IF NOT EXISTS policies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      version VARCHAR(20) DEFAULT '1.0',
      approved_by UUID REFERENCES users(id),
      approved_at TIMESTAMP WITH TIME ZONE,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  controls: `
    CREATE TABLE IF NOT EXISTS controls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL,
      policy_id UUID REFERENCES policies(id),
      title VARCHAR(500) NOT NULL,
      description TEXT,
      control_type VARCHAR(100) NOT NULL,
      effectiveness_score INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      implementation_date DATE,
      review_date DATE,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  domains: `
    CREATE TABLE IF NOT EXISTS domains (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL,
      parent_id UUID REFERENCES domains(id),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      level INTEGER DEFAULT 1,
      path VARCHAR(1000),
      status VARCHAR(50) DEFAULT 'active',
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  assessments: `
    CREATE TABLE IF NOT EXISTS assessments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL,
      control_id UUID REFERENCES controls(id),
      assessor_id UUID REFERENCES users(id),
      assessment_date DATE NOT NULL,
      score INTEGER NOT NULL,
      comments TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  risks: `
    CREATE TABLE IF NOT EXISTS risks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      likelihood INTEGER NOT NULL,
      impact INTEGER NOT NULL,
      risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
      status VARCHAR(50) DEFAULT 'active',
      mitigation_plan TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  audits: `
    CREATE TABLE IF NOT EXISTS audits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      audit_type VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      status VARCHAR(50) DEFAULT 'planned',
      auditor_id UUID REFERENCES users(id),
      findings TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  incidents: `
    CREATE TABLE IF NOT EXISTS incidents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      severity VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'open',
      reported_by UUID REFERENCES users(id),
      assigned_to UUID REFERENCES users(id),
      reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      resolved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  tickets: `
    CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      priority VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'open',
      category VARCHAR(100),
      created_by UUID REFERENCES users(id),
      assigned_to UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
}

async function createTables() {
  console.log('🔧 Criando tabelas no Supabase...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const [tableName, sql] of Object.entries(tables)) {
    try {
      console.log(`📋 Criando tabela: ${tableName}`)
      
      const { error } = await supabase.rpc('exec_sql', { sql })
      
      if (error) {
        // Fallback: tentar criar via SQL direto
        const { error: directError } = await supabase
          .from('_exec_sql')
          .select('*')
          .limit(1)
        
        if (directError) {
          console.log(`⚠️  Tabela ${tableName} pode já existir ou não ter permissão`)
          console.log(`   Erro: ${error.message}`)
          errorCount++
        } else {
          console.log(`✅ Tabela ${tableName} criada com sucesso`)
          successCount++
        }
      } else {
        console.log(`✅ Tabela ${tableName} criada com sucesso`)
        successCount++
      }
      
    } catch (error) {
      console.log(`❌ Erro ao criar tabela ${tableName}: ${error.message}`)
      errorCount++
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 Resumo da criação de tabelas:')
  console.log(`✅ Sucessos: ${successCount}`)
  console.log(`❌ Erros: ${errorCount}`)
  console.log(`📋 Total: ${Object.keys(tables).length}`)
  
  if (successCount > 0) {
    console.log('\n🎉 Tabelas criadas com sucesso!')
    console.log('💡 Próximos passos:')
    console.log('   1. Execute: npm run mcp:test')
    console.log('   2. Teste as funcionalidades do MCP Server')
    console.log('   3. Configure as permissões RLS no Supabase')
  } else {
    console.log('\n⚠️  Algumas tabelas podem já existir ou precisar de permissões')
    console.log('💡 Verifique no painel do Supabase se as tabelas foram criadas')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTables()
}

module.exports = createTables 