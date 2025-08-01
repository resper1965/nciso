#!/usr/bin/env node

/**
 * 🧪 Teste Automatizado para MCP list_controls
 * 
 * Testa o comando list_controls do MCP Server com validação de segurança
 * multi-tenant e schema JSON.
 */

const SupabaseMCPServer = require('../src/mcp/supabase-server');

// Mock data para testes
const mockControls = {
  'tenant-a': [
    {
      id: 'control-1-a',
      name: 'Controle de Acesso Tenant A',
      type: 'preventive',
      status: 'active',
      frameworks: ['iso27001', 'nist'],
      tenant_id: 'tenant-a',
      effectiveness: 85,
      priority: 'high',
      created_at: new Date().toISOString()
    },
    {
      id: 'control-2-a',
      name: 'Controle de Criptografia Tenant A',
      type: 'corrective',
      status: 'implemented',
      frameworks: ['iso27001'],
      tenant_id: 'tenant-a',
      effectiveness: 90,
      priority: 'critical',
      created_at: new Date().toISOString()
    }
  ],
  'tenant-b': [
    {
      id: 'control-1-b',
      name: 'Controle de Backup Tenant B',
      type: 'detective',
      status: 'active',
      frameworks: ['cobit'],
      tenant_id: 'tenant-b',
      effectiveness: 75,
      priority: 'medium',
      created_at: new Date().toISOString()
    }
  ]
};

// JSON Schema para validação da resposta
const controlSchema = {
  type: 'object',
  required: ['success', 'data', 'count'],
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'type', 'status', 'frameworks', 'tenant_id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['preventive', 'corrective', 'detective', 'deterrent'] },
          status: { type: 'string', enum: ['active', 'inactive', 'draft', 'archived'] },
          frameworks: { type: 'array', items: { type: 'string' } },
          tenant_id: { type: 'string' },
          effectiveness: { type: 'number', minimum: 0, maximum: 100 },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          created_at: { type: 'string', format: 'date-time' }
        }
      }
    },
    count: { type: 'number' },
    error: { type: 'string' }
  }
};

// Função para validar schema JSON
function validateSchema(data, schema) {
  // Validação básica do schema
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Data deve ser um objeto' };
  }

  // Validar campos obrigatórios
  for (const requiredField of schema.required || []) {
    if (!(requiredField in data)) {
      return { valid: false, error: `Campo obrigatório ausente: ${requiredField}` };
    }
  }

  // Validar tipos
  for (const [field, value] of Object.entries(data)) {
    const fieldSchema = schema.properties[field];
    if (fieldSchema) {
      if (fieldSchema.type === 'boolean' && typeof value !== 'boolean') {
        return { valid: false, error: `Campo ${field} deve ser boolean` };
      }
      if (fieldSchema.type === 'number' && typeof value !== 'number') {
        return { valid: false, error: `Campo ${field} deve ser number` };
      }
      if (fieldSchema.type === 'string' && typeof value !== 'string') {
        return { valid: false, error: `Campo ${field} deve ser string` };
      }
      if (fieldSchema.type === 'array' && !Array.isArray(value)) {
        return { valid: false, error: `Campo ${field} deve ser array` };
      }
    }
  }

  return { valid: true };
}

// Função para validar isolamento de tenant
function validateTenantIsolation(data, expectedTenantId) {
  if (!data.success || !Array.isArray(data.data)) {
    return { valid: false, error: 'Resposta inválida' };
  }

  for (const control of data.data) {
    if (control.tenant_id !== expectedTenantId) {
      return { 
        valid: false, 
        error: `Controle ${control.id} pertence ao tenant ${control.tenant_id}, esperado ${expectedTenantId}` 
      };
    }
  }

  return { valid: true };
}

// Mock do Supabase client
class MockSupabaseClient {
  constructor(mockData = {}) {
    this.mockData = mockData;
  }

  from(table) {
    return {
      select: () => this,
      eq: (field, value) => {
        this.filterField = field;
        this.filterValue = value;
        return this;
      },
      limit: (limit) => {
        this.limitValue = limit;
        return this;
      },
      then: async (callback) => {
        // Simular resposta baseada no tenant_id
        const tenantId = this.filterValue;
        const data = this.mockData[tenantId] || [];
        const limitedData = data.slice(0, this.limitValue || 50);
        
        return callback({
          data: limitedData,
          error: null,
          count: limitedData.length
        });
      }
    };
  }
}

// Testes
async function runListControlsTests() {
  console.log('🧪 Iniciando testes automatizados para MCP list_controls...\n');

  const testResults = [];

  // Teste 1: Sucesso com tenant válido
  console.log('📋 Teste 1: Sucesso com tenant válido');
  try {
    const server = new SupabaseMCPServer();
    server.supabase = new MockSupabaseClient(mockControls);

    const result = await server.listControls({
      tenant_id: 'tenant-a',
      limit: 10
    });

    const schemaValidation = validateSchema(result, controlSchema);
    const isolationValidation = validateTenantIsolation(result, 'tenant-a');

    const testPassed = schemaValidation.valid && isolationValidation.valid;
    testResults.push({
      test: 'Sucesso com tenant válido',
      passed: testPassed,
      schemaValid: schemaValidation.valid,
      isolationValid: isolationValidation.valid,
      dataCount: result.data?.length || 0
    });

    console.log(`✅ ${testPassed ? 'PASSOU' : 'FALHOU'}`);
    console.log(`   Schema válido: ${schemaValidation.valid ? '✅' : '❌'}`);
    console.log(`   Isolamento válido: ${isolationValidation.valid ? '✅' : '❌'}`);
    console.log(`   Controles retornados: ${result.data?.length || 0}`);

  } catch (error) {
    testResults.push({
      test: 'Sucesso com tenant válido',
      passed: false,
      error: error.message
    });
    console.log(`❌ FALHOU: ${error.message}`);
  }

  // Teste 2: Isolamento entre tenants
  console.log('\n📋 Teste 2: Isolamento entre tenants');
  try {
    const server = new SupabaseMCPServer();
    server.supabase = new MockSupabaseClient(mockControls);

    const resultA = await server.listControls({
      tenant_id: 'tenant-a',
      limit: 10
    });

    const resultB = await server.listControls({
      tenant_id: 'tenant-b',
      limit: 10
    });

    const isolationA = validateTenantIsolation(resultA, 'tenant-a');
    const isolationB = validateTenantIsolation(resultB, 'tenant-b');

    const testPassed = isolationA.valid && isolationB.valid;
    testResults.push({
      test: 'Isolamento entre tenants',
      passed: testPassed,
      tenantAValid: isolationA.valid,
      tenantBValid: isolationB.valid,
      tenantACount: resultA.data?.length || 0,
      tenantBCount: resultB.data?.length || 0
    });

    console.log(`✅ ${testPassed ? 'PASSOU' : 'FALHOU'}`);
    console.log(`   Tenant A isolado: ${isolationA.valid ? '✅' : '❌'}`);
    console.log(`   Tenant B isolado: ${isolationB.valid ? '✅' : '❌'}`);
    console.log(`   Controles Tenant A: ${resultA.data?.length || 0}`);
    console.log(`   Controles Tenant B: ${resultB.data?.length || 0}`);

  } catch (error) {
    testResults.push({
      test: 'Isolamento entre tenants',
      passed: false,
      error: error.message
    });
    console.log(`❌ FALHOU: ${error.message}`);
  }

  // Teste 3: Filtro por tipo de controle
  console.log('\n📋 Teste 3: Filtro por tipo de controle');
  try {
    const server = new SupabaseMCPServer();
    server.supabase = new MockSupabaseClient(mockControls);

    const result = await server.listControls({
      tenant_id: 'tenant-a',
      control_type: 'preventive',
      limit: 10
    });

    const schemaValidation = validateSchema(result, controlSchema);
    const allPreventive = result.data?.every(control => control.type === 'preventive') || false;

    const testPassed = schemaValidation.valid && allPreventive;
    testResults.push({
      test: 'Filtro por tipo de controle',
      passed: testPassed,
      schemaValid: schemaValidation.valid,
      allPreventive,
      dataCount: result.data?.length || 0
    });

    console.log(`✅ ${testPassed ? 'PASSOU' : 'FALHOU'}`);
    console.log(`   Schema válido: ${schemaValidation.valid ? '✅' : '❌'}`);
    console.log(`   Todos preventive: ${allPreventive ? '✅' : '❌'}`);
    console.log(`   Controles retornados: ${result.data?.length || 0}`);

  } catch (error) {
    testResults.push({
      test: 'Filtro por tipo de controle',
      passed: false,
      error: error.message
    });
    console.log(`❌ FALHOU: ${error.message}`);
  }

  // Teste 4: Limite de resultados
  console.log('\n📋 Teste 4: Limite de resultados');
  try {
    const server = new SupabaseMCPServer();
    server.supabase = new MockSupabaseClient(mockControls);

    const result = await server.listControls({
      tenant_id: 'tenant-a',
      limit: 1
    });

    const schemaValidation = validateSchema(result, controlSchema);
    const limitRespected = (result.data?.length || 0) <= 1;

    const testPassed = schemaValidation.valid && limitRespected;
    testResults.push({
      test: 'Limite de resultados',
      passed: testPassed,
      schemaValid: schemaValidation.valid,
      limitRespected,
      dataCount: result.data?.length || 0
    });

    console.log(`✅ ${testPassed ? 'PASSOU' : 'FALHOU'}`);
    console.log(`   Schema válido: ${schemaValidation.valid ? '✅' : '❌'}`);
    console.log(`   Limite respeitado: ${limitRespected ? '✅' : '❌'}`);
    console.log(`   Controles retornados: ${result.data?.length || 0}`);

  } catch (error) {
    testResults.push({
      test: 'Limite de resultados',
      passed: false,
      error: error.message
    });
    console.log(`❌ FALHOU: ${error.message}`);
  }

  // Teste 5: Supabase não configurado
  console.log('\n📋 Teste 5: Supabase não configurado');
  try {
    const server = new SupabaseMCPServer();
    server.supabase = null; // Simular Supabase não configurado

    const result = await server.listControls({
      tenant_id: 'tenant-a',
      limit: 10
    });

    const expectedError = !result.success && result.error === 'Supabase não configurado';
    const emptyData = Array.isArray(result.data) && result.data.length === 0;

    const testPassed = expectedError && emptyData;
    testResults.push({
      test: 'Supabase não configurado',
      passed: testPassed,
      expectedError,
      emptyData,
      error: result.error
    });

    console.log(`✅ ${testPassed ? 'PASSOU' : 'FALHOU'}`);
    console.log(`   Erro esperado: ${expectedError ? '✅' : '❌'}`);
    console.log(`   Dados vazios: ${emptyData ? '✅' : '❌'}`);
    console.log(`   Mensagem: ${result.error}`);

  } catch (error) {
    testResults.push({
      test: 'Supabase não configurado',
      passed: false,
      error: error.message
    });
    console.log(`❌ FALHOU: ${error.message}`);
  }

  // Teste 6: Validação de argumentos
  console.log('\n📋 Teste 6: Validação de argumentos');
  try {
    const server = new SupabaseMCPServer();
    server.supabase = new MockSupabaseClient(mockControls);

    // Teste sem tenant_id
    const resultWithoutTenant = await server.listControls({
      limit: 10
    });

    const testPassed = !resultWithoutTenant.success;
    testResults.push({
      test: 'Validação de argumentos',
      passed: testPassed,
      success: resultWithoutTenant.success,
      error: resultWithoutTenant.error
    });

    console.log(`✅ ${testPassed ? 'PASSOU' : 'FALHOU'}`);
    console.log(`   Sucesso: ${resultWithoutTenant.success ? '❌' : '✅'}`);
    console.log(`   Erro: ${resultWithoutTenant.error || 'Nenhum'}`);

  } catch (error) {
    testResults.push({
      test: 'Validação de argumentos',
      passed: false,
      error: error.message
    });
    console.log(`❌ FALHOU: ${error.message}`);
  }

  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('=' .repeat(50));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total de testes: ${totalTests}`);
  console.log(`Testes aprovados: ${passedTests} ✅`);
  console.log(`Testes reprovados: ${failedTests} ❌`);
  console.log(`Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  console.log('\n📋 DETALHES DOS TESTES:');
  testResults.forEach((result, index) => {
    const status = result.passed ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${index + 1}. ${result.test}: ${status}`);
    if (!result.passed && result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  });

  // Retornar resultado final
  const allTestsPassed = testResults.every(r => r.passed);
  console.log(`\n🎯 RESULTADO FINAL: ${allTestsPassed ? 'TODOS OS TESTES APROVADOS ✅' : 'ALGUNS TESTES REPROVADOS ❌'}`);
  
  return {
    allTestsPassed,
    totalTests,
    passedTests,
    failedTests,
    results: testResults
  };
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runListControlsTests()
    .then(result => {
      process.exit(result.allTestsPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro ao executar testes:', error);
      process.exit(1);
    });
}

module.exports = {
  runListControlsTests,
  validateSchema,
  validateTenantIsolation,
  MockSupabaseClient
}; 