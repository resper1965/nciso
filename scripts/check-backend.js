#!/usr/bin/env node

/**
 * 🔍 Verificar Status do Backend
 * 
 * Verifica se o backend está rodando e funcionando
 */

const axios = require('axios')
require('dotenv').config()

const API_BASE = process.env.API_URL || 'http://localhost:3000'

async function checkBackend() {
  console.log('🔍 Verificando Status do Backend...\n')
  
  try {
    // 1. Testar health check
    console.log('🏥 1. Testando health check...')
    try {
      const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 })
      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   📊 Health: ${response.data.status}`)
      console.log(`   🕒 Uptime: ${response.data.uptime}`)
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
      console.log('   💡 Backend não está rodando. Execute: npm run dev')
      return
    }
    
    // 2. Testar API de policies
    console.log('\n📋 2. Testando API de policies...')
    try {
      const response = await axios.get(`${API_BASE}/api/v1/isms/policies`, { timeout: 5000 })
      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   📊 Policies: ${response.data.length || 0}`)
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    }
    
    // 3. Testar API de invites
    console.log('\n📧 3. Testando API de invites...')
    try {
      const response = await axios.get(`${API_BASE}/api/v1/platform/invites`, { timeout: 5000 })
      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   📊 Invites: ${response.data.length || 0}`)
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    }
    
    // 4. Verificar variáveis de ambiente
    console.log('\n🔧 4. Verificando configurações...')
    console.log(`   📍 API_URL: ${process.env.API_URL || 'http://localhost:3000'}`)
    console.log(`   🗄️  SUPABASE_URL: ${process.env.SUPABASE_URL ? 'Configurado' : 'Não configurado'}`)
    console.log(`   🔑 SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'}`)
    
    console.log('\n🎉 Backend verificado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message)
  }
}

if (require.main === module) {
  checkBackend()
}

module.exports = { checkBackend } 