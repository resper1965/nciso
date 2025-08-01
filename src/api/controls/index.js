const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');
const router = express.Router();

// Initialize Supabase client
let supabase = null;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('⚠️ Supabase not configured. Running in development mode.');
  }
} catch (error) {
  console.warn('⚠️ Supabase not available. Running in development mode.');
}

// Zod schemas for validation
const ControlSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  description: z.string().optional(),
  type: z.enum(['preventive', 'corrective', 'detective', 'deterrent'], {
    errorMap: () => ({ message: 'Tipo deve ser preventive, corrective, detective ou deterrent' })
  }),
  status: z.enum(['active', 'inactive', 'draft', 'archived'], {
    errorMap: () => ({ message: 'Status deve ser active, inactive, draft ou archived' })
  }),
  frameworks: z.array(z.enum(['iso27001', 'nist', 'cobit', 'custom'])).min(1, 'Pelo menos um framework é obrigatório'),
  domain: z.enum([
    'access_control', 'asset_management', 'business_continuity', 'communications',
    'compliance', 'cryptography', 'human_resources', 'incident_management',
    'operations', 'physical_security', 'risk_management', 'security_architecture',
    'supplier_relationships', 'system_development'
  ], {
    errorMap: () => ({ message: 'Domínio inválido' })
  }),
  effectiveness: z.number().min(0).max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Prioridade deve ser low, medium, high ou critical' })
  }),
  owner: z.string().optional()
});

const ControlUpdateSchema = ControlSchema.partial();

// Middleware for JWT authentication
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso obrigatório',
      code: 'AUTH_TOKEN_REQUIRED'
    });
  }

  try {
    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret');
    
    // Extract tenant_id from JWT payload
    const tenantId = decoded.app_metadata?.tenant_id || decoded.tenant_id || decoded.sub;
    
    if (!tenantId) {
      return res.status(401).json({ 
        error: 'Tenant ID não encontrado no token',
        code: 'TENANT_ID_MISSING'
      });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      tenant_id: tenantId,
      role: decoded.app_metadata?.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ 
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware for role validation
const validateRole = (allowedRoles = ['admin', 'manager']) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Permissões insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: allowedRoles
      });
    }
    
    next();
  };
};

// Helper function to log actions
const logAction = async (action, details, userId, tenantId) => {
  if (supabase) {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action,
          details,
          user_id: userId,
          tenant_id: tenantId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }
};

/**
 * GET /api/controls
 * List controls with pagination and filters
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      type, 
      status, 
      framework, 
      domain, 
      priority 
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Parâmetros de paginação inválidos',
        code: 'INVALID_PAGINATION'
      });
    }

    let query = supabase
      .from('global_controls')
      .select('*', { count: 'exact' })
      .eq('tenant_id', req.user.tenant_id);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (framework) {
      query = query.contains('frameworks', [framework]);
    }

    if (domain) {
      query = query.eq('domain', domain);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    // Apply pagination
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Log the action
    await logAction('list_controls', {
      filters: { search, type, status, framework, domain, priority },
      pagination: { page: pageNum, limit: limitNum }
    }, req.user.id, req.user.tenant_id);

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limitNum)
      }
    });

  } catch (error) {
    console.error('Error listing controls:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/controls/:id
 * Get control by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'ID do controle é obrigatório',
        code: 'CONTROL_ID_REQUIRED'
      });
    }

    const { data, error } = await supabase
      .from('global_controls')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Controle não encontrado',
          code: 'CONTROL_NOT_FOUND'
        });
      }
      throw error;
    }

    // Log the action
    await logAction('get_control', { control_id: id }, req.user.id, req.user.tenant_id);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error getting control:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/controls
 * Create new control
 */
router.post('/', authenticateToken, validateRole(['admin', 'manager']), async (req, res) => {
  try {
    // Validate input
    const validationResult = ControlSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    const controlData = {
      ...validationResult.data,
      tenant_id: req.user.tenant_id,
      created_by: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('global_controls')
      .insert(controlData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Erro ao criar controle',
        code: 'CREATE_ERROR'
      });
    }

    // Log the action
    await logAction('create_control', {
      control_id: data.id,
      control_name: data.name
    }, req.user.id, req.user.tenant_id);

    res.status(201).json({
      success: true,
      message: 'Controle criado com sucesso',
      data
    });

  } catch (error) {
    console.error('Error creating control:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/controls/:id
 * Update control
 */
router.put('/:id', authenticateToken, validateRole(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'ID do controle é obrigatório',
        code: 'CONTROL_ID_REQUIRED'
      });
    }

    // Validate input
    const validationResult = ControlUpdateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Check if control exists and belongs to tenant
    const { data: existingControl, error: fetchError } = await supabase
      .from('global_controls')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (fetchError || !existingControl) {
      return res.status(404).json({
        error: 'Controle não encontrado',
        code: 'CONTROL_NOT_FOUND'
      });
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
      updated_by: req.user.id
    };

    const { data, error } = await supabase
      .from('global_controls')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar controle',
        code: 'UPDATE_ERROR'
      });
    }

    // Log the action
    await logAction('update_control', {
      control_id: id,
      control_name: data.name
    }, req.user.id, req.user.tenant_id);

    res.json({
      success: true,
      message: 'Controle atualizado com sucesso',
      data
    });

  } catch (error) {
    console.error('Error updating control:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/controls/:id
 * Delete control
 */
router.delete('/:id', authenticateToken, validateRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'ID do controle é obrigatório',
        code: 'CONTROL_ID_REQUIRED'
      });
    }

    // Check if control exists and belongs to tenant
    const { data: existingControl, error: fetchError } = await supabase
      .from('global_controls')
      .select('id, name')
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (fetchError || !existingControl) {
      return res.status(404).json({
        error: 'Controle não encontrado',
        code: 'CONTROL_NOT_FOUND'
      });
    }

    const { error } = await supabase
      .from('global_controls')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Erro ao excluir controle',
        code: 'DELETE_ERROR'
      });
    }

    // Log the action
    await logAction('delete_control', {
      control_id: id,
      control_name: existingControl.name
    }, req.user.id, req.user.tenant_id);

    res.json({
      success: true,
      message: 'Controle excluído com sucesso'
    });

  } catch (error) {
    console.error('Error deleting control:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/controls/stats
 * Get control statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { data: controls, error } = await supabase
      .from('global_controls')
      .select('*')
      .eq('tenant_id', req.user.tenant_id);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Erro ao buscar estatísticas',
        code: 'STATS_ERROR'
      });
    }

    // Calculate statistics
    const stats = {
      total_controls: controls?.length || 0,
      active_controls: controls?.filter(c => c.status === 'active').length || 0,
      average_effectiveness: controls?.length > 0 
        ? Math.round(controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.length)
        : 0,
      controls_by_type: controls?.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {}) || {},
      controls_by_status: controls?.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {}) || {},
      controls_by_priority: controls?.reduce((acc, c) => {
        acc[c.priority] = (acc[c.priority] || 0) + 1;
        return acc;
      }, {}) || {}
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router; 