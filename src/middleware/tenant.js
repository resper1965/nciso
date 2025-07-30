/**
 * 🛡️ n.CISO - Middleware de Validação de Tenant
 * 
 * Middleware para validar acesso multi-tenant
 */

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Middleware para validar acesso à tenant
 */
function validateTenantAccess(req, res, next) {
  try {
    const { user } = req

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      })
    }

    // Platform admins podem acessar qualquer tenant
    if (user.role === 'platform_admin') {
      req.tenant_id = req.body.tenant_id || req.query.tenant_id || user.tenant_id
      return next()
    }

    // Outros usuários só podem acessar sua própria tenant
    req.tenant_id = user.tenant_id

    // Verificar se a tenant existe e está ativa
    if (!req.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Usuário não possui tenant válida'
      })
    }

    next()

  } catch (error) {
    console.error('Erro na validação de tenant:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno na validação de tenant'
    })
  }
}

/**
 * Middleware para verificar se usuário pertence à tenant
 */
async function validateUserTenant(req, res, next) {
  try {
    const { user } = req
    const { tenant_id } = req.params

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      })
    }

    // Platform admins podem acessar qualquer tenant
    if (user.role === 'platform_admin') {
      return next()
    }

    // Verificar se usuário pertence à tenant
    if (user.tenant_id !== tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar esta organização'
      })
    }

    next()

  } catch (error) {
    console.error('Erro na validação de usuário/tenant:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno na validação'
    })
  }
}

/**
 * Middleware para verificar permissões de role
 */
function validateRole(allowedRoles) {
  return (req, res, next) => {
    try {
      const { user } = req

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        })
      }

      // Verificar se o role do usuário está permitido
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para esta operação'
        })
      }

      next()

    } catch (error) {
      console.error('Erro na validação de role:', error)
      res.status(500).json({
        success: false,
        message: 'Erro interno na validação de permissões'
      })
    }
  }
}

/**
 * Middleware para verificar se é owner do recurso
 */
function validateResourceOwner(resourceTable, resourceIdField = 'id') {
  return async (req, res, next) => {
    try {
      const { user } = req
      const resourceId = req.params[resourceIdField]

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        })
      }

      // Platform admins podem acessar qualquer recurso
      if (user.role === 'platform_admin') {
        return next()
      }

      // Buscar recurso e verificar ownership
      const { data: resource, error } = await supabase
        .from(resourceTable)
        .select('created_by, tenant_id')
        .eq(resourceIdField, resourceId)
        .single()

      if (error || !resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso não encontrado'
        })
      }

      // Verificar se pertence à mesma tenant
      if (resource.tenant_id !== user.tenant_id) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para acessar este recurso'
        })
      }

      // Se org_admin, verificar se criou o recurso
      if (user.role === 'org_admin' && resource.created_by !== user.id) {
        return res.status(403).json({
          success: false,
          message: 'Só pode modificar recursos criados por você'
        })
      }

      next()

    } catch (error) {
      console.error('Erro na validação de ownership:', error)
      res.status(500).json({
        success: false,
        message: 'Erro interno na validação de permissões'
      })
    }
  }
}

module.exports = {
  validateTenantAccess,
  validateUserTenant,
  validateRole,
  validateResourceOwner
} 