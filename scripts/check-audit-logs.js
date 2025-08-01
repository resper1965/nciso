#!/usr/bin/env node

/**
 * 📊 Verificar Logs de Auditoria
 * 
 * Consulta e exibe os logs de auditoria existentes no Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAuditLogs() {
  console.log('📊 Verificando Logs de Auditoria...\n')
  
  try {
    // 1. Verificar se a tabela audit_logs existe
    console.log('📋 1. Verificando tabela audit_logs...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.log(`   ❌ Tabela audit_logs não existe: ${tableError.message}`)
      console.log('   💡 Execute: node scripts/create-audit-logs.js')
      return false
    }
    
    console.log('   ✅ Tabela audit_logs existe')
    
    // 2. Contar total de logs
    console.log('\n📋 2. Contando logs existentes...')
    const { count: totalLogs, error: countError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log(`   ❌ Erro ao contar logs: ${countError.message}`)
      return false
    }
    
    console.log(`   📊 Total de logs: ${totalLogs || 0}`)
    
    if (!totalLogs || totalLogs === 0) {
      console.log('\n💡 Nenhum log de auditoria encontrado.')
      console.log('   Isso pode significar que:')
      console.log('   - O sistema de auditoria ainda não foi ativado')
      console.log('   - Não houve operações CRUD ainda')
      console.log('   - Os triggers não estão funcionando')
      console.log('\n🔧 Para ativar:')
      console.log('   1. Execute: node scripts/create-audit-logs.js')
      console.log('   2. Faça algumas operações CRUD na aplicação')
      console.log('   3. Execute este script novamente')
      return true
    }
    
    // 3. Buscar logs recentes
    console.log('\n📋 3. Logs mais recentes:')
    const { data: recentLogs, error: recentError } = await supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        table_name,
        record_id,
        tenant_id,
        user_id,
        created_at,
        old_values,
        new_values
      `)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (recentError) {
      console.log(`   ❌ Erro ao buscar logs recentes: ${recentError.message}`)
      return false
    }
    
    if (recentLogs && recentLogs.length > 0) {
      console.log(`   📝 Últimos ${recentLogs.length} logs:`)
      recentLogs.forEach((log, index) => {
        console.log(`\n   ${index + 1}. ${log.action.toUpperCase()} em ${log.table_name}`)
        console.log(`      ID do registro: ${log.record_id}`)
        console.log(`      Tenant: ${log.tenant_id}`)
        console.log(`      Usuário: ${log.user_id}`)
        console.log(`      Data: ${new Date(log.created_at).toLocaleString('pt-BR')}`)
        
        if (log.old_values && Object.keys(log.old_values).length > 0) {
          console.log(`      Valores antigos: ${JSON.stringify(log.old_values, null, 2)}`)
        }
        
        if (log.new_values && Object.keys(log.new_values).length > 0) {
          console.log(`      Valores novos: ${JSON.stringify(log.new_values, null, 2)}`)
        }
      })
    }
    
    // 4. Estatísticas por ação
    console.log('\n📋 4. Estatísticas por ação:')
    const { data: actionStats, error: statsError } = await supabase
      .from('audit_logs')
      .select('action')
    
    if (!statsError && actionStats) {
      const stats = actionStats.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {})
      
      Object.entries(stats).forEach(([action, count]) => {
        console.log(`   ${action.toUpperCase()}: ${count} registros`)
      })
    }
    
    // 5. Estatísticas por tabela
    console.log('\n📋 5. Estatísticas por tabela:')
    const { data: tableStats, error: tableStatsError } = await supabase
      .from('audit_logs')
      .select('table_name')
    
    if (!tableStatsError && tableStats) {
      const stats = tableStats.reduce((acc, log) => {
        acc[log.table_name] = (acc[log.table_name] || 0) + 1
        return acc
      }, {})
      
      Object.entries(stats).forEach(([table, count]) => {
        console.log(`   ${table}: ${count} operações`)
      })
    }
    
    // 6. Verificar logs por período
    console.log('\n📋 6. Logs por período:')
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Logs de hoje
    const { count: todayCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().split('T')[0])
    
    // Logs de ontem
    const { count: yesterdayCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString().split('T')[0])
      .lt('created_at', today.toISOString().split('T')[0])
    
    // Logs da última semana
    const { count: weekCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeek.toISOString())
    
    console.log(`   Hoje: ${todayCount || 0} logs`)
    console.log(`   Ontem: ${yesterdayCount || 0} logs`)
    console.log(`   Última semana: ${weekCount || 0} logs`)
    
    console.log('\n✅ Verificação de logs concluída!')
    console.log('\n💡 Comandos úteis:')
    console.log('   - Para limpar logs antigos: SELECT cleanup_old_audit_logs(90)')
    console.log('   - Para ver logs de uma tabela específica:')
    console.log('     SELECT * FROM audit_logs WHERE table_name = \'policies\'')
    console.log('   - Para ver logs de um usuário específico:')
    console.log('     SELECT * FROM audit_logs WHERE user_id = \'user-uuid\'')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro ao verificar logs:', error.message)
    return false
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkAuditLogs()
    .then(success => {
      if (success) {
        console.log('\n✅ Verificação concluída com sucesso!')
        process.exit(0)
      } else {
        console.log('\n❌ Falha na verificação')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Erro inesperado:', error.message)
      process.exit(1)
    })
}

module.exports = { checkAuditLogs } 