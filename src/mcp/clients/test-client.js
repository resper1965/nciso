#!/usr/bin/env node

/**
 * 🧪 Teste do Cliente MCP n.CISO
 * 
 * Script para testar a integração do cliente MCP com o servidor
 */

const NCISOMCPClient = require('./nciso-mcp-client')

async function testMCPClient() {
  console.log('🧪 Iniciando testes do Cliente MCP...\n')

  const client = new NCISOMCPClient()
  
  try {
    // Inicializar cliente
    await client.initialize()
    console.log('✅ Cliente MCP inicializado com sucesso\n')

    // Teste 1: Health Check
    console.log('📋 Teste 1: Health Check')
    const health = await client.healthCheck()
    console.log('Resultado:', JSON.stringify(health, null, 2))
    console.log('')

    // Teste 2: Listar Políticas
    console.log('📋 Teste 2: Listar Políticas')
    const policies = await client.listPolicies('dev-tenant', 5)
    console.log('Resultado:', JSON.stringify(policies, null, 2))
    console.log('')

    // Teste 3: Criar Política
    console.log('📋 Teste 3: Criar Política')
    const newPolicy = await client.createPolicy({
      title: 'Política de Segurança da Informação - Teste',
      description: 'Política criada via MCP Client',
      content: 'Esta política define as diretrizes de segurança da informação para a organização.',
      status: 'draft'
    })
    console.log('Resultado:', JSON.stringify(newPolicy, null, 2))
    console.log('')

    // Teste 4: Listar Controles
    console.log('📋 Teste 4: Listar Controles')
    const controls = await client.listControls('dev-tenant', 5)
    console.log('Resultado:', JSON.stringify(controls, null, 2))
    console.log('')

    // Teste 5: Criar Controle
    console.log('📋 Teste 5: Criar Controle')
    const newControl = await client.createControl({
      title: 'Controle de Acesso - Teste',
      description: 'Controle criado via MCP Client',
      control_type: 'preventive',
      effectiveness_score: 85
    })
    console.log('Resultado:', JSON.stringify(newControl, null, 2))
    console.log('')

    // Teste 6: Listar Domínios
    console.log('📋 Teste 6: Listar Domínios')
    const domains = await client.listDomains('dev-tenant', 5)
    console.log('Resultado:', JSON.stringify(domains, null, 2))
    console.log('')

    // Teste 7: Criar Domínio
    console.log('📋 Teste 7: Criar Domínio')
    const newDomain = await client.createDomain({
      name: 'Segurança da Informação - Teste',
      description: 'Domínio criado via MCP Client',
      level: 1
    })
    console.log('Resultado:', JSON.stringify(newDomain, null, 2))
    console.log('')

    // Teste 8: Relatório de Efetividade
    console.log('📋 Teste 8: Relatório de Efetividade')
    const report = await client.generateEffectivenessReport('dev-tenant')
    console.log('Resultado:', JSON.stringify(report, null, 2))
    console.log('')

    console.log('🎉 Todos os testes do Cliente MCP concluídos com sucesso!')
    console.log('\n📊 Resumo dos Testes:')
    console.log('✅ Health Check - Funcionando')
    console.log('✅ Listar Políticas - Funcionando')
    console.log('✅ Criar Política - Funcionando')
    console.log('✅ Listar Controles - Funcionando')
    console.log('✅ Criar Controle - Funcionando')
    console.log('✅ Listar Domínios - Funcionando')
    console.log('✅ Criar Domínio - Funcionando')
    console.log('✅ Relatório de Efetividade - Funcionando')

    console.log('\n🚀 Cliente MCP está pronto para integração!')
    console.log('\n💡 Para usar com AI assistants:')
    console.log('1. Configure as variáveis de ambiente')
    console.log('2. Execute: node src/mcp/clients/nciso-mcp-client.js')
    console.log('3. Integre com Claude, GPT ou outros AI assistants')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testMCPClient()
}

module.exports = testMCPClient 