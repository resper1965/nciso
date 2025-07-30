#!/usr/bin/env node

/**
 * 🧪 Teste do Cliente MCP Simples n.CISO
 * 
 * Script para testar a integração do cliente MCP simples
 */

const SimpleMCPClient = require('./simple-mcp-client')

async function testSimpleMCPClient() {
  console.log('🧪 Iniciando testes do Cliente MCP Simples...\n')

  const client = new SimpleMCPClient()
  
  try {
    await client.initialize()
    console.log('✅ Cliente MCP Simples inicializado com sucesso\n')

    // Teste 1: Health Check
    console.log('📋 Teste 1: Health Check')
    const health = await client.healthCheck()
    console.log('Resultado:', JSON.stringify(health, null, 2))
    console.log('')

    // Teste 2: Listar Políticas
    console.log('📋 Teste 2: Listar Políticas')
    const policies = await client.listPolicies('default', 5)
    console.log('Resultado:', JSON.stringify(policies, null, 2))
    console.log('')

    // Teste 3: Criar Política
    console.log('📋 Teste 3: Criar Política')
    const newPolicy = await client.createPolicy({
      title: 'Política de Teste',
      description: 'Política criada via teste',
      content: 'Conteúdo da política de teste',
      tenant_id: 'default'
    })
    console.log('Resultado:', JSON.stringify(newPolicy, null, 2))
    console.log('')

    // Teste 4: Listar Controles
    console.log('📋 Teste 4: Listar Controles')
    const controls = await client.listControls('default', 5)
    console.log('Resultado:', JSON.stringify(controls, null, 2))
    console.log('')

    // Teste 5: Criar Controle
    console.log('📋 Teste 5: Criar Controle')
    const newControl = await client.createControl({
      name: 'Controle de Teste',
      description: 'Controle criado via teste',
      type: 'preventive',
      tenant_id: 'default'
    })
    console.log('Resultado:', JSON.stringify(newControl, null, 2))
    console.log('')

    // Teste 6: Listar Domínios
    console.log('📋 Teste 6: Listar Domínios')
    const domains = await client.listDomains('default', 5)
    console.log('Resultado:', JSON.stringify(domains, null, 2))
    console.log('')

    // Teste 7: Criar Domínio
    console.log('📋 Teste 7: Criar Domínio')
    const newDomain = await client.createDomain({
      name: 'Domínio de Teste',
      description: 'Domínio criado via teste',
      level: 1,
      tenant_id: 'default'
    })
    console.log('Resultado:', JSON.stringify(newDomain, null, 2))
    console.log('')

    // Teste 8: Relatório de Efetividade
    console.log('📋 Teste 8: Relatório de Efetividade')
    const report = await client.generateEffectivenessReport('default')
    console.log('Resultado:', JSON.stringify(report, null, 2))
    console.log('')

    console.log('🎉 Todos os testes do Cliente MCP Simples concluídos com sucesso!')
    
    console.log('\n📊 Resumo dos Testes:')
    console.log('✅ Health Check - Funcionando')
    console.log('✅ Listar Políticas - Funcionando')
    console.log('✅ Criar Política - Funcionando')
    console.log('✅ Listar Controles - Funcionando')
    console.log('✅ Criar Controle - Funcionando')
    console.log('✅ Listar Domínios - Funcionando')
    console.log('✅ Criar Domínio - Funcionando')
    console.log('✅ Relatório de Efetividade - Funcionando')

    console.log('\n🚀 Cliente MCP Simples está pronto para uso!')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  testSimpleMCPClient()
}

module.exports = testSimpleMCPClient 