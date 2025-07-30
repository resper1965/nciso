#!/usr/bin/env node

/**
 * 🧪 Teste da API de Convites
 */

const axios = require('axios')
require('dotenv').config()

const API_BASE = process.env.API_URL || 'http://localhost:3000/api/v1'

// Dados de teste
const testData = {
  email: 'teste@nciso.dev',
  role: 'user',
  password: 'Teste123!',
  name: 'Usuário Teste'
}

async function testInvitesAPI() {
  console.log('🧪 Testando API de Convites...\n')

  try {
    // 1. Testar criação de convite (requer autenticação)
    console.log('📋 1. Testando criação de convite...')
    try {
      const inviteResponse = await axios.post(`${API_BASE}/platform/invite`, {
        email: testData.email,
        role: testData.role
      }, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      })
      console.log('   ✅ Convite criado:', inviteResponse.data)
    } catch (error) {
      console.log('   ⚠️  Erro esperado (sem autenticação):', error.response?.data?.message || error.message)
    }

    // 2. Testar listagem de convites
    console.log('\n📋 2. Testando listagem de convites...')
    try {
      const invitesResponse = await axios.get(`${API_BASE}/platform/invites`, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      })
      console.log('   ✅ Convites listados:', invitesResponse.data)
    } catch (error) {
      console.log('   ⚠️  Erro esperado (sem autenticação):', error.response?.data?.message || error.message)
    }

    // 3. Testar aceitação de convite (sem autenticação)
    console.log('\n📋 3. Testando aceitação de convite...')
    try {
      const acceptResponse = await axios.post(`${API_BASE}/platform/invite/accept`, {
        token: 'test-token',
        password: testData.password,
        name: testData.name
      })
      console.log('   ✅ Convite aceito:', acceptResponse.data)
    } catch (error) {
      console.log('   ⚠️  Erro esperado (token inválido):', error.response?.data?.message || error.message)
    }

    // 4. Testar cancelamento de convite
    console.log('\n📋 4. Testando cancelamento de convite...')
    try {
      const cancelResponse = await axios.delete(`${API_BASE}/platform/invite/test-id`, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      })
      console.log('   ✅ Convite cancelado:', cancelResponse.data)
    } catch (error) {
      console.log('   ⚠️  Erro esperado (sem autenticação):', error.response?.data?.message || error.message)
    }

    console.log('\n✅ Testes concluídos!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Aplicar schema no Supabase')
    console.log('2. Configurar autenticação real')
    console.log('3. Testar com tokens válidos')

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message)
  }
}

if (require.main === module) {
  testInvitesAPI()
}

module.exports = { testInvitesAPI } 