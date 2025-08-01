const axios = require('axios')

// Configuração
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-token'
const TEST_TENANT_ID = process.env.TEST_TENANT_ID || '550e8400-e29b-41d4-a716-446655440000'

// Mock de dados para teste
const mockEvaluations = [
  {
    control_id: '123e4567-e89b-12d3-a456-426614174000',
    score: 85,
    comentario: 'Controle implementado corretamente, funcionando bem',
    data_avaliacao: new Date().toISOString()
  },
  {
    control_id: '123e4567-e89b-12d3-a456-426614174001',
    score: 92,
    comentario: 'Excelente implementação, superou expectativas',
    data_avaliacao: new Date().toISOString()
  },
  {
    control_id: '123e4567-e89b-12d3-a456-426614174002',
    score: 78,
    comentario: 'Implementação adequada, pequenas melhorias necessárias',
    data_avaliacao: new Date().toISOString()
  }
]

// Headers padrão
const getHeaders = () => ({
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
})

// Função para simular JWT com tenant_id
const createMockJWT = () => {
  const payload = {
    sub: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {
      tenant_id: TEST_TENANT_ID,
      role: 'admin'
    }
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// Teste 1: Listar avaliações
async function testListEvaluations() {
  console.log('\n🧪 Teste 1: Listar avaliações')
  
  try {
    const response = await axios.get(`${BASE_URL}/api/controls/effectiveness`, {
      headers: getHeaders()
    })
    
    console.log('✅ Status:', response.status)
    console.log('✅ Dados:', response.data.success)
    console.log('✅ Total de avaliações:', response.data.data?.length || 0)
    
    return response.data
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message)
    return null
  }
}

// Teste 2: Criar avaliação
async function testCreateEvaluation() {
  console.log('\n🧪 Teste 2: Criar avaliação')
  
  try {
    const evaluationData = mockEvaluations[0]
    
    const response = await axios.post(`${BASE_URL}/api/controls/effectiveness`, evaluationData, {
      headers: getHeaders()
    })
    
    console.log('✅ Status:', response.status)
    console.log('✅ Dados:', response.data.success)
    console.log('✅ Avaliação criada:', response.data.data?.id)
    
    return response.data.data
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message)
    return null
  }
}

// Teste 3: Buscar avaliação específica
async function testGetEvaluation(evaluationId) {
  console.log('\n🧪 Teste 3: Buscar avaliação específica')
  
  if (!evaluationId) {
    console.log('⚠️ Pulado - nenhuma avaliação criada')
    return null
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/controls/effectiveness/${evaluationId}`, {
      headers: getHeaders()
    })
    
    console.log('✅ Status:', response.status)
    console.log('✅ Dados:', response.data.success)
    console.log('✅ Avaliação encontrada:', response.data.data?.id)
    
    return response.data.data
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message)
    return null
  }
}

// Teste 4: Atualizar avaliação
async function testUpdateEvaluation(evaluationId) {
  console.log('\n🧪 Teste 4: Atualizar avaliação')
  
  if (!evaluationId) {
    console.log('⚠️ Pulado - nenhuma avaliação criada')
    return null
  }
  
  try {
    const updateData = {
      score: 95,
      comentario: 'Avaliação atualizada - controle melhorou significativamente'
    }
    
    const response = await axios.put(`${BASE_URL}/api/controls/effectiveness/${evaluationId}`, updateData, {
      headers: getHeaders()
    })
    
    console.log('✅ Status:', response.status)
    console.log('✅ Dados:', response.data.success)
    console.log('✅ Avaliação atualizada:', response.data.data?.score)
    
    return response.data.data
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message)
    return null
  }
}

// Teste 5: Estatísticas de efetividade
async function testEffectivenessStats() {
  console.log('\n🧪 Teste 5: Estatísticas de efetividade')
  
  try {
    const response = await axios.get(`${BASE_URL}/api/controls/effectiveness/stats`, {
      headers: getHeaders()
    })
    
    console.log('✅ Status:', response.status)
    console.log('✅ Dados:', response.data.success)
    console.log('✅ Estatísticas:', response.data.data)
    
    return response.data.data
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message)
    return null
  }
}

// Teste 6: Controles com baixa efetividade
async function testLowEffectivenessControls() {
  console.log('\n🧪 Teste 6: Controles com baixa efetividade')
  
  try {
    const response = await axios.get(`${BASE_URL}/api/controls/effectiveness/low-effectiveness?min_score=70`, {
      headers: getHeaders()
    })
    
    console.log('✅ Status:', response.status)
    console.log('✅ Dados:', response.data.success)
    console.log('✅ Controles com baixa efetividade:', response.data.data?.length || 0)
    
    return response.data.data
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message)
    return null
  }
}

// Teste 7: Filtros na listagem
async function testListWithFilters() {
  console.log('\n🧪 Teste 7: Listagem com filtros')
  
  try {
    const filters = {
      score_min: 80,
      score_max: 100,
      page: 1,
      limit: 10
    }
    
    const response = await axios.get(`${BASE_URL}/api/controls/effectiveness`, {
      headers: getHeaders(),
      params: filters
    })
    
    console.log('✅ Status:', response.status)
    console.log('✅ Dados:', response.data.success)
    console.log('✅ Filtros aplicados:', filters)
    console.log('✅ Resultados:', response.data.data?.length || 0)
    
    return response.data
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message)
    return null
  }
}

// Teste 8: Validação de dados
async function testDataValidation() {
  console.log('\n🧪 Teste 8: Validação de dados')
  
  try {
    const invalidData = {
      control_id: 'invalid-uuid',
      score: 150, // Score inválido
      comentario: 'Teste de validação'
    }
    
    const response = await axios.post(`${BASE_URL}/api/controls/effectiveness`, invalidData, {
      headers: getHeaders()
    })
    
    console.log('❌ Erro esperado não ocorreu')
    return null
  } catch (error) {
    console.log('✅ Status:', error.response?.status)
    console.log('✅ Erro de validação:', error.response?.data?.error)
    console.log('✅ Detalhes:', error.response?.data?.details)
    
    return error.response?.data
  }
}

// Teste 9: Autenticação
async function testAuthentication() {
  console.log('\n🧪 Teste 9: Autenticação')
  
  try {
    const response = await axios.get(`${BASE_URL}/api/controls/effectiveness`, {
      headers: {
        'Content-Type': 'application/json'
        // Sem Authorization header
      }
    })
    
    console.log('❌ Erro de autenticação não ocorreu')
    return null
  } catch (error) {
    console.log('✅ Status:', error.response?.status)
    console.log('✅ Erro de autenticação:', error.response?.data?.error)
    
    return error.response?.data
  }
}

// Teste 10: Permissões
async function testPermissions() {
  console.log('\n🧪 Teste 10: Permissões')
  
  try {
    // Simular usuário sem permissão
    const lowPrivilegeToken = createMockJWT().replace('admin', 'user')
    
    const response = await axios.post(`${BASE_URL}/api/controls/effectiveness`, mockEvaluations[0], {
      headers: {
        'Authorization': `Bearer ${lowPrivilegeToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('❌ Erro de permissão não ocorreu')
    return null
  } catch (error) {
    console.log('✅ Status:', error.response?.status)
    console.log('✅ Erro de permissão:', error.response?.data?.error)
    
    return error.response?.data
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes da API de Efetividade')
  console.log('📍 URL Base:', BASE_URL)
  console.log('🔑 Token:', TEST_TOKEN ? 'Configurado' : 'Não configurado')
  console.log('🏢 Tenant ID:', TEST_TENANT_ID)
  
  const results = {
    listEvaluations: await testListEvaluations(),
    createEvaluation: await testCreateEvaluation(),
    getEvaluation: null,
    updateEvaluation: null,
    effectivenessStats: await testEffectivenessStats(),
    lowEffectivenessControls: await testLowEffectivenessControls(),
    listWithFilters: await testListWithFilters(),
    dataValidation: await testDataValidation(),
    authentication: await testAuthentication(),
    permissions: await testPermissions()
  }
  
  // Testes que dependem de avaliação criada
  if (results.createEvaluation) {
    results.getEvaluation = await testGetEvaluation(results.createEvaluation.id)
    results.updateEvaluation = await testUpdateEvaluation(results.createEvaluation.id)
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES')
  console.log('=====================================')
  console.log('✅ Listar avaliações:', results.listEvaluations ? 'SUCESSO' : 'FALHA')
  console.log('✅ Criar avaliação:', results.createEvaluation ? 'SUCESSO' : 'FALHA')
  console.log('✅ Buscar avaliação:', results.getEvaluation ? 'SUCESSO' : 'FALHA')
  console.log('✅ Atualizar avaliação:', results.updateEvaluation ? 'SUCESSO' : 'FALHA')
  console.log('✅ Estatísticas:', results.effectivenessStats ? 'SUCESSO' : 'FALHA')
  console.log('✅ Baixa efetividade:', results.lowEffectivenessControls ? 'SUCESSO' : 'FALHA')
  console.log('✅ Filtros:', results.listWithFilters ? 'SUCESSO' : 'FALHA')
  console.log('✅ Validação:', results.dataValidation ? 'SUCESSO' : 'FALHA')
  console.log('✅ Autenticação:', results.authentication ? 'SUCESSO' : 'FALHA')
  console.log('✅ Permissões:', results.permissions ? 'SUCESSO' : 'FALHA')
  console.log('=====================================')
  
  const successCount = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 Resultado: ${successCount}/${totalTests} testes passaram`)
  
  if (successCount === totalTests) {
    console.log('🎉 Todos os testes passaram! API funcionando corretamente.')
  } else {
    console.log('⚠️ Alguns testes falharam. Verificar configuração.')
  }
  
  return results
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  runTests,
  testListEvaluations,
  testCreateEvaluation,
  testGetEvaluation,
  testUpdateEvaluation,
  testEffectivenessStats,
  testLowEffectivenessControls,
  testListWithFilters,
  testDataValidation,
  testAuthentication,
  testPermissions
} 