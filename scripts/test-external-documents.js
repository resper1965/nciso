#!/usr/bin/env node

/**
 * 🧪 Teste de Documentos Externos - n.CISO
 * 
 * Script para testar a funcionalidade de ingestão de documentos externos
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuração
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_TENANT_ID = 'test-tenant-123';
const TEST_TOKEN = 'test-token-123';

// Dados de teste
const testDocument = {
  tenant_id: TEST_TENANT_ID,
  source: 'sharepoint',
  external_id: 'POL-001',
  title: 'Política de Segurança da Informação',
  version: '1.0',
  document_url: 'https://httpbin.org/pdf',
  checksum: null, // Será calculado
  lang: 'pt-BR',
  description: 'Política de segurança da informação da empresa',
  tags: ['segurança', 'política', 'compliance']
};

/**
 * Gerar token de teste
 */
function generateTestToken() {
  const payload = {
    user_id: 'test-user-123',
    email: 'test@nciso.com',
    role: 'admin',
    tenant_id: TEST_TENANT_ID,
    permissions: {
      role: 'admin'
    }
  };

  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret');
}

/**
 * Testar ingestão de documento
 */
async function testDocumentIngestion() {
  console.log('🧪 Testando ingestão de documento...');

  try {
    const token = generateTestToken();
    
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/isms/external-documents/ingest`,
      testDocument,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Ingestão bem-sucedida:', response.data);
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Erro na ingestão:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Testar listagem de documentos
 */
async function testListDocuments() {
  console.log('🧪 Testando listagem de documentos...');

  try {
    const token = generateTestToken();
    
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/isms/external-documents`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          tenant_id: TEST_TENANT_ID
        }
      }
    );

    console.log('✅ Listagem bem-sucedida:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Erro na listagem:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Testar download de documento
 */
async function testDocumentDownload(documentId) {
  console.log('🧪 Testando download de documento...');

  try {
    const token = generateTestToken();
    
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/isms/external-documents/${documentId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          tenant_id: TEST_TENANT_ID
        }
      }
    );

    console.log('✅ Download bem-sucedido:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Erro no download:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Testar MCP Server
 */
async function testMCPServer() {
  console.log('🧪 Testando MCP Server...');

  try {
    const { SupabaseMCPServer } = require('../src/mcp/supabase-server');
    const server = new SupabaseMCPServer();

    // Testar ingestão via MCP
    const ingestResult = await server.ingestExternalDocument({
      tenant_id: TEST_TENANT_ID,
      source: 'sharepoint',
      external_id: 'POL-002',
      title: 'Política de Acesso Remoto',
      version: '1.0',
      document_url: 'https://httpbin.org/pdf',
      lang: 'pt-BR'
    });

    console.log('✅ MCP Ingestão:', ingestResult);

    // Testar listagem via MCP
    const listResult = await server.listExternalDocumentsByPolicy({
      policy_id: 'test-policy-123',
      tenant_id: TEST_TENANT_ID
    });

    console.log('✅ MCP Listagem:', listResult);

    // Testar download via MCP
    if (ingestResult.success && ingestResult.data.id) {
      const downloadResult = await server.downloadDocument({
        id: ingestResult.data.id,
        tenant_id: TEST_TENANT_ID
      });

      console.log('✅ MCP Download:', downloadResult);
    }

    // Testar geração de embeddings
    if (ingestResult.success && ingestResult.data.id) {
      const embeddingsResult = await server.generateEmbeddings({
        id: ingestResult.data.id,
        tenant_id: TEST_TENANT_ID
      });

      console.log('✅ MCP Embeddings:', embeddingsResult);
    }

  } catch (error) {
    console.error('❌ Erro no MCP Server:', error.message);
  }
}

/**
 * Testar validações
 */
async function testValidations() {
  console.log('🧪 Testando validações...');

  const token = generateTestToken();
  const invalidDocuments = [
    {
      // Sem tenant_id
      source: 'sharepoint',
      external_id: 'POL-003',
      title: 'Política Inválida',
      document_url: 'https://httpbin.org/pdf'
    },
    {
      // Idioma inválido
      tenant_id: TEST_TENANT_ID,
      source: 'sharepoint',
      external_id: 'POL-004',
      title: 'Política Idioma Inválido',
      document_url: 'https://httpbin.org/pdf',
      lang: 'invalid-lang'
    },
    {
      // Fonte inválida
      tenant_id: TEST_TENANT_ID,
      source: 'invalid-source',
      external_id: 'POL-005',
      title: 'Política Fonte Inválida',
      document_url: 'https://httpbin.org/pdf'
    }
  ];

  for (const doc of invalidDocuments) {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/isms/external-documents/ingest`,
        doc,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('❌ Validação falhou para:', doc);
    } catch (error) {
      console.log('✅ Validação funcionou para:', doc.title, '-', error.response?.data?.error);
    }
  }
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log('🚀 Iniciando testes de documentos externos...\n');

  // Testar validações
  await testValidations();
  console.log('');

  // Testar ingestão
  const documentId = await testDocumentIngestion();
  console.log('');

  // Testar listagem
  await testListDocuments();
  console.log('');

  // Testar download
  if (documentId) {
    await testDocumentDownload(documentId);
    console.log('');
  }

  // Testar MCP Server
  await testMCPServer();
  console.log('');

  console.log('✅ Todos os testes concluídos!');
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDocumentIngestion,
  testListDocuments,
  testDocumentDownload,
  testMCPServer,
  testValidations,
  runAllTests
}; 