/**
 * 🛡️ n.CISO - Exemplo de Uso da Conexão
 * 
 * Demonstra como usar os diferentes clientes Supabase
 */

const { supabaseAnon, supabaseService, TenantSupabaseClient } = require('../config/supabase')

/**
 * 🔐 Exemplo: API de Autenticação (Frontend)
 */
async function handleUserLogin(email, password) {
  try {
    // Usar cliente anônimo para autenticação
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return {
      user: data.user,
      session: data.session
    }
  } catch (error) {
    throw new Error(`Erro no login: ${error.message}`)
  }
}

/**
 * 🏢 Exemplo: API de Políticas (Backend)
 */
async function handlePoliciesAPI(tenantId, action, data = null) {
  try {
    // Usar cliente multi-tenant
    const tenantClient = new TenantSupabaseClient(tenantId)

    switch (action) {
      case 'list':
        return await tenantClient.listPolicies(10)

      case 'create':
        return await tenantClient.createPolicy(data)

      case 'update':
        const { data: updateData, error } = await tenantClient.client
          .from('policies')
          .update(data)
          .eq('id', data.id)
          .select()
        
        if (error) throw error
        return updateData[0]

      case 'delete':
        const { error: deleteError } = await tenantClient.client
          .from('policies')
          .delete()
          .eq('id', data.id)
        
        if (deleteError) throw deleteError
        return { success: true }

      default:
        throw new Error('Ação não reconhecida')
    }
  } catch (error) {
    throw new Error(`Erro na API de políticas: ${error.message}`)
  }
}

/**
 * 📊 Exemplo: API de Relatórios (Backend)
 */
async function handleReportsAPI(tenantId, reportType) {
  try {
    const tenantClient = new TenantSupabaseClient(tenantId)

    switch (reportType) {
      case 'effectiveness':
        return await tenantClient.generateEffectivenessReport()

      case 'controls':
        return await tenantClient.listControls(50)

      case 'domains':
        return await tenantClient.listDomains(50)

      default:
        throw new Error('Tipo de relatório não reconhecido')
    }
  } catch (error) {
    throw new Error(`Erro na API de relatórios: ${error.message}`)
  }
}

/**
 * 🔑 Exemplo: Operações Administrativas (Backend)
 */
async function handleAdminOperations(operation, data = null) {
  try {
    // Usar cliente de serviço para operações administrativas
    switch (operation) {
      case 'list_all_users':
        const { data: users, error: usersError } = await supabaseService
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (usersError) throw usersError
        return users

      case 'create_user':
        const { data: newUser, error: createError } = await supabaseService
          .from('users')
          .insert(data)
          .select()

        if (createError) throw createError
        return newUser[0]

      case 'system_stats':
        const { data: stats, error: statsError } = await supabaseService
          .from('users')
          .select('count')

        if (statsError) throw statsError
        return { totalUsers: stats[0].count }

      default:
        throw new Error('Operação administrativa não reconhecida')
    }
  } catch (error) {
    throw new Error(`Erro em operação administrativa: ${error.message}`)
  }
}

/**
 * 🔄 Exemplo: Middleware de Autenticação
 */
function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  // Verificar token com Supabase
  supabaseAnon.auth.getUser(token)
    .then(({ data: { user }, error }) => {
      if (error || !user) {
        return res.status(401).json({ error: 'Token inválido' })
      }

      req.user = user
      next()
    })
    .catch(error => {
      res.status(401).json({ error: 'Erro na autenticação' })
    })
}

/**
 * 🏢 Exemplo: Middleware de Tenant
 */
function validateTenant(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || req.user?.user_metadata?.tenant_id

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID não fornecido' })
  }

  req.tenantId = tenantId
  req.tenantClient = new TenantSupabaseClient(tenantId)
  next()
}

module.exports = {
  handleUserLogin,
  handlePoliciesAPI,
  handleReportsAPI,
  handleAdminOperations,
  authenticateUser,
  validateTenant
} 