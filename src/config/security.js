/**
 * 🛡️ n.CISO - Configurações de Segurança
 * 
 * Configurações de segurança para produção
 */

const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

/**
 * 🔒 Configurações de Segurança para Express
 */
const securityConfig = {
  // Headers de segurança
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.supabase.co"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }),

  // Rate limiting
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: {
      error: 'Muitas requisições, tente novamente em 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Rate limiting para autenticação
  authRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas de login
    message: {
      error: 'Muitas tentativas de login, tente novamente em 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Rate limiting para API
  apiRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // 1000 requisições por IP
    message: {
      error: 'Limite de API excedido, tente novamente em 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
}

/**
 * 🔐 Configurações de CORS
 */
const corsConfig = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, etc)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://nciso.com',
      'https://www.nciso.com',
      'https://app.nciso.com'
    ]
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Não permitido pelo CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-ID']
}

/**
 * 🔑 Configurações de JWT
 */
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'nciso_jwt_secret_key_2024_development_min_32_chars_long',
  options: {
    expiresIn: '24h',
    issuer: 'nciso-v1',
    audience: 'nciso-users'
  }
}

/**
 * 🏢 Configurações de Multi-tenant
 */
const tenantConfig = {
  // Headers obrigatórios para multi-tenant
  requiredHeaders: ['X-Tenant-ID'],
  
  // Validação de tenant ID
  validateTenantId: (tenantId) => {
    if (!tenantId) return false
    if (typeof tenantId !== 'string') return false
    if (tenantId.length < 3 || tenantId.length > 50) return false
    if (!/^[a-zA-Z0-9-_]+$/.test(tenantId)) return false
    return true
  },

  // Headers de segurança para tenant
  tenantHeaders: {
    'X-Tenant-ID': 'ID do tenant para isolamento de dados',
    'X-User-Role': 'Role do usuário (admin, auditor, user)',
    'X-Request-ID': 'ID único da requisição para auditoria'
  }
}

/**
 * 🔍 Configurações de Auditoria
 */
const auditConfig = {
  // Log de auditoria
  logAudit: (req, action, details) => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      tenantId: req.headers['x-tenant-id'],
      action,
      details,
      requestId: req.headers['x-request-id']
    }
    
    console.log('🔍 AUDIT:', JSON.stringify(auditLog, null, 2))
  },

  // Log de segurança
  logSecurity: (req, event, details) => {
    const securityLog = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      event,
      details,
      userAgent: req.get('User-Agent')
    }
    
    console.log('🚨 SECURITY:', JSON.stringify(securityLog, null, 2))
  }
}

/**
 * 🔒 Middleware de Segurança
 */
const securityMiddleware = {
  // Validar headers obrigatórios
  validateHeaders: (req, res, next) => {
    const requiredHeaders = ['X-Tenant-ID']
    const missingHeaders = requiredHeaders.filter(header => !req.headers[header.toLowerCase()])
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: 'Headers obrigatórios não fornecidos',
        missing: missingHeaders
      })
    }
    
    next()
  },

  // Validar tenant ID
  validateTenant: (req, res, next) => {
    const tenantId = req.headers['x-tenant-id']
    
    if (!tenantConfig.validateTenantId(tenantId)) {
      return res.status(400).json({
        error: 'Tenant ID inválido',
        tenantId
      })
    }
    
    next()
  },

  // Log de auditoria
  auditLog: (action) => {
    return (req, res, next) => {
      auditConfig.logAudit(req, action, {
        method: req.method,
        path: req.path,
        body: req.body
      })
      next()
    }
  },

  // Log de segurança
  securityLog: (event) => {
    return (req, res, next) => {
      auditConfig.logSecurity(req, event, {
        method: req.method,
        path: req.path
      })
      next()
    }
  }
}

module.exports = {
  securityConfig,
  corsConfig,
  jwtConfig,
  tenantConfig,
  auditConfig,
  securityMiddleware
} 