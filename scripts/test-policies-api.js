#!/usr/bin/env node

/**
 * 🧪 Teste da API de Policies
 * 
 * Testa a API de policies que já existe
 */

const axios = require('axios')
require('dotenv').config()

const API_BASE = process.env.API_URL || 'http://localhost:3000/api/v1'

async function testPoliciesAPI() {
  console.log('🧪 Testando API de Policies...\n')
  
  try {
    // 1. Testar GET /api/v1/isms/policies
    console.log('📋 1. Testando listagem de policies...')
    try {
      const response = await axios.get(`${API_BASE}/isms/policies`)
      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   📊 Dados: ${response.data.length || 0} policies`)
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    }
    
    // 2. Testar POST /api/v1/isms/policies
    console.log('\n📝 2. Testando criação de policy...')
    const newPolicy = {
      title: 'Test Policy',
      description: 'Test policy description',
      category: 'security',
      status: 'active',
      priority: 'medium'
    }
    
    try {
      const response = await axios.post(`${API_BASE}/isms/policies`, newPolicy)
      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   📊 Policy criada: ${response.data.id}`)
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    }
    
    // 3. Testar health check
    console.log('\n🏥 3. Testando health check...')
    try {
      const response = await axios.get(`${API_BASE.replace('/api/v1', '')}/health`)
      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   📊 Health: ${response.data.status}`)
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    }
    
    console.log('\n🎉 Teste da API de Policies concluído!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

if (require.main === module) {
  testPoliciesAPI()
}

module.exports = { testPoliciesAPI } 