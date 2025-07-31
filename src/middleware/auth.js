/**
 * 🛡️ n.CISO - Middleware de Autenticação
 * 
 * Middleware para validação de JWT tokens
 */

const jwt = require('jsonwebtoken')

// Inicializar Supabase apenas se as variáveis estiverem disponíveis
let supabase = null
try {
  const { createClient } = require('@supabase/supabase-js')
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey)
  } else {
    console.warn('⚠️ Supabase not configured. Running in development mode.')
  }
} catch (error) {
  console.warn('⚠️ Supabase not available. Running in development mode.')
}

/**
 * Middleware para validar token JWT
 */
function validateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer '
    
    // Se Supabase não estiver configurado, usar JWT local
    if (!supabase) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
        req.user = decoded
        return next()
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        })
      }
    }
    
    // Verificar token no Supabase
    supabase.auth.getUser(token)
      .then(({ data: { user }, error }) => {
        if (error || !user) {
          return res.status(401).json({
            success: false,
            message: 'Token inválido'
          })
        }
        
        // Buscar dados do usuário na tabela users
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data: userData, error: userError }) => {
            if (userError || !userData) {
              return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
              })
            }
            
            // Adicionar dados do usuário ao request
            req.user = userData
            next()
          })
          .catch(error => {
            console.error('Erro ao buscar usuário:', error)
            return res.status(500).json({
              success: false,
              message: 'Erro interno na autenticação'
            })
          })
      })
      .catch(error => {
        console.error('Erro na validação do token:', error)
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        })
      })
      
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno na autenticação'
    })
  }
}

/**
 * Middleware opcional para autenticação
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Sem token, continuar sem autenticação
      req.user = null
      return next()
    }
    
    const token = authHeader.substring(7)
    
    // Verificar token no Supabase
    supabase.auth.getUser(token)
      .then(({ data: { user }, error }) => {
        if (error || !user) {
          // Token inválido, continuar sem autenticação
          req.user = null
          return next()
        }
        
        // Buscar dados do usuário
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data: userData, error: userError }) => {
            if (userError || !userData) {
              req.user = null
            } else {
              req.user = userData
            }
            next()
          })
          .catch(() => {
            req.user = null
            next()
          })
      })
      .catch(() => {
        req.user = null
        next()
      })
      
  } catch (error) {
    console.error('Erro no middleware opcional:', error)
    req.user = null
    next()
  }
}

/**
 * Middleware para verificar roles específicos
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      })
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente'
      })
    }
    
    next()
  }
}

module.exports = {
  validateToken,
  optionalAuth,
  requireRole
} 