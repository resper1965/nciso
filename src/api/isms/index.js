const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Import routers
const domainsRouter = require('./domains');
const externalDocumentsRouter = require('./external-documents');

// Initialize Supabase client (with fallback for development)
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

// Middleware for authentication
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware for tenant isolation
const validateTenant = async (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID required' });
  }

  if (req.user.tenant_id !== tenantId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied to this tenant' });
  }

  req.tenantId = tenantId;
  next();
};

// =====================================================
// POLICIES CRUD
// =====================================================

// Create Policy
router.post('/policies', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { name, description, content, organization_id, version = '1.0' } = req.body;

    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({ 
        error: 'Name and content are required' 
      });
    }

    // Check if policy with same name exists
    if (!supabase) {
      // Development mode - simulate policy creation
      const mockPolicy = {
        id: 'policy-' + Date.now(),
        name,
        description: description || '',
        content,
        organization_id,
        version,
        status: 'draft',
        tenant_id: req.tenantId,
        created_by: req.user.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.status(201).json({
        message: 'Policy created successfully (development mode)',
        policy: mockPolicy
      });
    }

    // Production mode with Supabase
    const { data: policy, error } = await supabase
      .from('policies')
      .insert({
        name,
        description,
        content,
        organization_id,
        version,
        status: 'draft',
        tenant_id: req.tenantId,
        created_by: req.user.user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Policy creation error:', error);
      return res.status(500).json({ error: 'Failed to create policy' });
    }

    res.status(201).json({
      message: 'Policy created successfully',
      policy
    });

  } catch (error) {
    console.error('Policy creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Policies
router.get('/policies', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { status, organization_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!supabase) {
      // Development mode - return mock policies
      const mockPolicies = [
        {
          id: 'policy-1',
          name: 'Política de Segurança da Informação',
          description: 'Política geral de segurança da informação',
          content: 'Esta política estabelece as diretrizes...',
          version: '1.0',
          status: 'active',
          organization_id: null,
          tenant_id: req.tenantId,
          created_by: req.user.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'policy-2',
          name: 'Política de Controle de Acesso',
          description: 'Política para controle de acesso a sistemas',
          content: 'Esta política define os controles...',
          version: '1.0',
          status: 'draft',
          organization_id: null,
          tenant_id: req.tenantId,
          created_by: req.user.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return res.json({
        policies: mockPolicies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockPolicies.length,
          total_pages: 1
        }
      });
    }

    // Production mode with Supabase
    let query = supabase
      .from('policies')
      .select('*')
      .eq('tenant_id', req.tenantId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (organization_id) {
      query = query.eq('organization_id', organization_id);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: policies, error, count } = await query;

    if (error) {
      console.error('Policies fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch policies' });
    }

    res.json({
      policies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || policies.length,
        total_pages: Math.ceil((count || policies.length) / limit)
      }
    });

  } catch (error) {
    console.error('Policies fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Policy by ID
router.get('/policies/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      // Development mode - return mock policy
      const mockPolicy = {
        id,
        name: 'Política de Segurança da Informação',
        description: 'Política geral de segurança da informação',
        content: 'Esta política estabelece as diretrizes para a proteção dos ativos de informação da organização...',
        version: '1.0',
        status: 'active',
        organization_id: null,
        tenant_id: req.tenantId,
        created_by: req.user.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.json({ policy: mockPolicy });
    }

    const { data: policy, error } = await supabase
      .from('policies')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .single();

    if (error || !policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json({ policy });

  } catch (error) {
    console.error('Policy fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Policy
router.put('/policies/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content, version, status } = req.body;

    if (!supabase) {
      // Development mode - simulate update
      const mockPolicy = {
        id,
        name: name || 'Política Atualizada',
        description: description || 'Descrição atualizada',
        content: content || 'Conteúdo atualizado...',
        version: version || '1.1',
        status: status || 'active',
        tenant_id: req.tenantId,
        updated_at: new Date().toISOString()
      };

      return res.json({
        message: 'Policy updated successfully (development mode)',
        policy: mockPolicy
      });
    }

    const { data: policy, error } = await supabase
      .from('policies')
      .update({
        name,
        description,
        content,
        version,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .select()
      .single();

    if (error || !policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json({
      message: 'Policy updated successfully',
      policy
    });

  } catch (error) {
    console.error('Policy update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Policy
router.delete('/policies/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      // Development mode - simulate deletion
      return res.json({
        message: 'Policy deleted successfully (development mode)'
      });
    }

    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.tenantId);

    if (error) {
      console.error('Policy deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete policy' });
    }

    res.json({
      message: 'Policy deleted successfully'
    });

  } catch (error) {
    console.error('Policy deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve Policy
router.post('/policies/:id/approve', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has approval permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions to approve policies' });
    }

    if (!supabase) {
      // Development mode - simulate approval
      return res.json({
        message: 'Policy approved successfully (development mode)',
        policy: {
          id,
          status: 'active',
          approved_by: req.user.user_id,
          approved_at: new Date().toISOString()
        }
      });
    }

    const { data: policy, error } = await supabase
      .from('policies')
      .update({
        status: 'active',
        approved_by: req.user.user_id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .select()
      .single();

    if (error || !policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json({
      message: 'Policy approved successfully',
      policy
    });

  } catch (error) {
    console.error('Policy approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// DOMAINS ROUTES
// =====================================================

// Mount routers
router.use('/domains', domainsRouter);
router.use('/external-documents', externalDocumentsRouter);

// =====================================================
// CONTROLS CRUD
// =====================================================

// Create Control
router.post('/controls', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      control_type, 
      implementation_status = 'planned',
      effectiveness_score = 0,
      policy_ids = [],
      domain_id = null
    } = req.body;

    // Validate required fields
    if (!name || !control_type) {
      return res.status(400).json({ 
        error: 'Name and control_type are required' 
      });
    }

    // Validate control_type
    const validTypes = ['preventive', 'detective', 'corrective'];
    if (!validTypes.includes(control_type)) {
      return res.status(400).json({ 
        error: 'control_type must be one of: preventive, detective, corrective' 
      });
    }

    // Validate implementation_status
    const validStatuses = ['planned', 'implemented', 'tested', 'operational'];
    if (!validStatuses.includes(implementation_status)) {
      return res.status(400).json({ 
        error: 'implementation_status must be one of: planned, implemented, tested, operational' 
      });
    }

    // Validate effectiveness_score
    if (effectiveness_score < 0 || effectiveness_score > 100) {
      return res.status(400).json({ 
        error: 'effectiveness_score must be between 0 and 100' 
      });
    }

    if (!supabase) {
      // Development mode - simulate control creation
      const mockControl = {
        id: 'control-' + Date.now(),
        name,
        description: description || '',
        control_type,
        implementation_status,
        effectiveness_score,
        policy_ids: policy_ids.length > 0 ? policy_ids : [],
        domain_id,
        tenant_id: req.tenantId,
        created_by: req.user.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.status(201).json({
        message: 'Control created successfully (development mode)',
        control: mockControl
      });
    }

    // Production mode with Supabase
    const { data: control, error } = await supabase
      .from('controls')
      .insert({
        name,
        description,
        control_type,
        implementation_status,
        effectiveness_score,
        policy_ids: policy_ids.length > 0 ? policy_ids : [],
        domain_id,
        tenant_id: req.tenantId,
        created_by: req.user.user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Control creation error:', error);
      return res.status(500).json({ error: 'Failed to create control' });
    }

    res.status(201).json({
      message: 'Control created successfully',
      control
    });

  } catch (error) {
    console.error('Control creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Controls
router.get('/controls', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { 
      control_type, 
      implementation_status, 
      domain_id, 
      page = 1, 
      limit = 10 
    } = req.query;
    const offset = (page - 1) * limit;

    if (!supabase) {
      // Development mode - return mock controls
      const mockControls = [
        {
          id: 'control-1',
          name: 'Controle de Acesso',
          description: 'Controle de acesso a sistemas e dados',
          control_type: 'preventive',
          implementation_status: 'implemented',
          effectiveness_score: 85,
          policy_ids: ['policy-1'],
          domain_id: 'domain-1',
          tenant_id: req.tenantId,
          created_by: req.user.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'control-2',
          name: 'Monitoramento de Logs',
          description: 'Monitoramento e análise de logs de segurança',
          control_type: 'detective',
          implementation_status: 'operational',
          effectiveness_score: 92,
          policy_ids: ['policy-1', 'policy-2'],
          domain_id: 'domain-2',
          tenant_id: req.tenantId,
          created_by: req.user.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'control-3',
          name: 'Backup Automático',
          description: 'Sistema de backup automático de dados críticos',
          control_type: 'corrective',
          implementation_status: 'tested',
          effectiveness_score: 78,
          policy_ids: ['policy-1'],
          domain_id: 'domain-2',
          tenant_id: req.tenantId,
          created_by: req.user.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Apply filters
      let filteredControls = mockControls;
      if (control_type) {
        filteredControls = filteredControls.filter(c => c.control_type === control_type);
      }
      if (implementation_status) {
        filteredControls = filteredControls.filter(c => c.implementation_status === implementation_status);
      }
      if (domain_id) {
        filteredControls = filteredControls.filter(c => c.domain_id === domain_id);
      }

      return res.json({
        controls: filteredControls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredControls.length,
          total_pages: Math.ceil(filteredControls.length / limit)
        }
      });
    }

    // Production mode with Supabase
    let query = supabase
      .from('controls')
      .select('*')
      .eq('tenant_id', req.tenantId);

    // Apply filters
    if (control_type) {
      query = query.eq('control_type', control_type);
    }
    if (implementation_status) {
      query = query.eq('implementation_status', implementation_status);
    }
    if (domain_id) {
      query = query.eq('domain_id', domain_id);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: controls, error, count } = await query;

    if (error) {
      console.error('Controls fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch controls' });
    }

    res.json({
      controls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || controls.length,
        total_pages: Math.ceil((count || controls.length) / limit)
      }
    });

  } catch (error) {
    console.error('Controls fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Control Effectiveness Report
router.get('/controls/effectiveness', authenticateToken, validateTenant, async (req, res) => {
  try {
    if (!supabase) {
      // Development mode - return mock effectiveness report
      const mockReport = {
        total_controls: 3,
        implemented_controls: 2,
        operational_controls: 1,
        average_effectiveness: 85,
        effectiveness_by_type: {
          preventive: 85,
          detective: 92,
          corrective: 78
        },
        effectiveness_by_status: {
          planned: 0,
          implemented: 85,
          tested: 78,
          operational: 92
        },
        low_effectiveness_controls: [
          {
            id: 'control-3',
            name: 'Backup Automático',
            effectiveness_score: 78,
            recommendation: 'Considerar melhorias no processo de backup'
          }
        ]
      };

      return res.json({
        message: 'Effectiveness report generated successfully (development mode)',
        report: mockReport
      });
    }

    // Production mode with Supabase
    const { data: controls, error } = await supabase
      .from('controls')
      .select('*')
      .eq('tenant_id', req.tenantId);

    if (error) {
      console.error('Controls fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch controls for report' });
    }

    // Calculate effectiveness metrics
    const totalControls = controls.length;
    const implementedControls = controls.filter(c => c.implementation_status === 'implemented').length;
    const operationalControls = controls.filter(c => c.implementation_status === 'operational').length;
    const averageEffectiveness = controls.length > 0 
      ? controls.reduce((sum, c) => sum + c.effectiveness_score, 0) / controls.length 
      : 0;

    const effectivenessByType = controls.reduce((acc, control) => {
      if (!acc[control.control_type]) {
        acc[control.control_type] = [];
      }
      acc[control.control_type].push(control.effectiveness_score);
      return acc;
    }, {});

    // Calculate average by type
    Object.keys(effectivenessByType).forEach(type => {
      const scores = effectivenessByType[type];
      effectivenessByType[type] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    const effectivenessByStatus = controls.reduce((acc, control) => {
      if (!acc[control.implementation_status]) {
        acc[control.implementation_status] = [];
      }
      acc[control.implementation_status].push(control.effectiveness_score);
      return acc;
    }, {});

    // Calculate average by status
    Object.keys(effectivenessByStatus).forEach(status => {
      const scores = effectivenessByStatus[status];
      effectivenessByStatus[status] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    const lowEffectivenessControls = controls
      .filter(c => c.effectiveness_score < 70)
      .map(c => ({
        id: c.id,
        name: c.name,
        effectiveness_score: c.effectiveness_score,
        recommendation: 'Considerar melhorias na implementação'
      }));

    const report = {
      total_controls: totalControls,
      implemented_controls: implementedControls,
      operational_controls: operationalControls,
      average_effectiveness: Math.round(averageEffectiveness * 100) / 100,
      effectiveness_by_type: effectivenessByType,
      effectiveness_by_status: effectivenessByStatus,
      low_effectiveness_controls: lowEffectivenessControls
    };

    res.json({
      message: 'Effectiveness report generated successfully',
      report
    });

  } catch (error) {
    console.error('Effectiveness report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Control by ID
router.get('/controls/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      // Development mode - return mock control
      const mockControl = {
        id,
        name: 'Controle de Acesso',
        description: 'Controle de acesso a sistemas e dados críticos da organização',
        control_type: 'preventive',
        implementation_status: 'implemented',
        effectiveness_score: 85,
        policy_ids: ['policy-1', 'policy-2'],
        domain_id: 'domain-1',
        tenant_id: req.tenantId,
        created_by: req.user.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.json({ control: mockControl });
    }

    const { data: control, error } = await supabase
      .from('controls')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .single();

    if (error || !control) {
      return res.status(404).json({ error: 'Control not found' });
    }

    res.json({ control });

  } catch (error) {
    console.error('Control fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Control
router.put('/controls/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      control_type, 
      implementation_status, 
      effectiveness_score,
      policy_ids,
      domain_id
    } = req.body;

    if (!supabase) {
      // Development mode - simulate update
      const mockControl = {
        id,
        name: name || 'Controle Atualizado',
        description: description || 'Descrição atualizada',
        control_type: control_type || 'preventive',
        implementation_status: implementation_status || 'implemented',
        effectiveness_score: effectiveness_score || 85,
        policy_ids: policy_ids || [],
        domain_id: domain_id || null,
        tenant_id: req.tenantId,
        updated_at: new Date().toISOString()
      };

      return res.json({
        message: 'Control updated successfully (development mode)',
        control: mockControl
      });
    }

    const { data: control, error } = await supabase
      .from('controls')
      .update({
        name,
        description,
        control_type,
        implementation_status,
        effectiveness_score,
        policy_ids,
        domain_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .select()
      .single();

    if (error || !control) {
      return res.status(404).json({ error: 'Control not found' });
    }

    res.json({
      message: 'Control updated successfully',
      control
    });

  } catch (error) {
    console.error('Control update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Control
router.delete('/controls/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      // Development mode - simulate deletion
      return res.json({
        message: 'Control deleted successfully (development mode)'
      });
    }

    const { error } = await supabase
      .from('controls')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.tenantId);

    if (error) {
      console.error('Control deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete control' });
    }

    res.json({
      message: 'Control deleted successfully'
    });

  } catch (error) {
    console.error('Control deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Control Effectiveness Report
router.get('/controls/effectiveness', authenticateToken, validateTenant, async (req, res) => {
  try {
    if (!supabase) {
      // Development mode - return mock effectiveness report
      const mockReport = {
        total_controls: 3,
        implemented_controls: 2,
        operational_controls: 1,
        average_effectiveness: 85,
        effectiveness_by_type: {
          preventive: 85,
          detective: 92,
          corrective: 78
        },
        effectiveness_by_status: {
          planned: 0,
          implemented: 85,
          tested: 78,
          operational: 92
        },
        low_effectiveness_controls: [
          {
            id: 'control-3',
            name: 'Backup Automático',
            effectiveness_score: 78,
            recommendation: 'Considerar melhorias no processo de backup'
          }
        ]
      };

      return res.json({
        message: 'Effectiveness report generated successfully (development mode)',
        report: mockReport
      });
    }

    // Production mode with Supabase
    const { data: controls, error } = await supabase
      .from('controls')
      .select('*')
      .eq('tenant_id', req.tenantId);

    if (error) {
      console.error('Controls fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch controls for report' });
    }

    // Calculate effectiveness metrics
    const totalControls = controls.length;
    const implementedControls = controls.filter(c => c.implementation_status === 'implemented').length;
    const operationalControls = controls.filter(c => c.implementation_status === 'operational').length;
    const averageEffectiveness = controls.length > 0 
      ? controls.reduce((sum, c) => sum + c.effectiveness_score, 0) / controls.length 
      : 0;

    const effectivenessByType = controls.reduce((acc, control) => {
      if (!acc[control.control_type]) {
        acc[control.control_type] = [];
      }
      acc[control.control_type].push(control.effectiveness_score);
      return acc;
    }, {});

    // Calculate average by type
    Object.keys(effectivenessByType).forEach(type => {
      const scores = effectivenessByType[type];
      effectivenessByType[type] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    const effectivenessByStatus = controls.reduce((acc, control) => {
      if (!acc[control.implementation_status]) {
        acc[control.implementation_status] = [];
      }
      acc[control.implementation_status].push(control.effectiveness_score);
      return acc;
    }, {});

    // Calculate average by status
    Object.keys(effectivenessByStatus).forEach(status => {
      const scores = effectivenessByStatus[status];
      effectivenessByStatus[status] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    const lowEffectivenessControls = controls
      .filter(c => c.effectiveness_score < 70)
      .map(c => ({
        id: c.id,
        name: c.name,
        effectiveness_score: c.effectiveness_score,
        recommendation: 'Considerar melhorias na implementação'
      }));

    const report = {
      total_controls: totalControls,
      implemented_controls: implementedControls,
      operational_controls: operationalControls,
      average_effectiveness: Math.round(averageEffectiveness * 100) / 100,
      effectiveness_by_type: effectivenessByType,
      effectiveness_by_status: effectivenessByStatus,
      low_effectiveness_controls: lowEffectivenessControls
    };

    res.json({
      message: 'Effectiveness report generated successfully',
      report
    });

  } catch (error) {
    console.error('Effectiveness report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// DOMAINS CRUD (Basic implementation)
// =====================================================

// Get All Domains
router.get('/domains', authenticateToken, validateTenant, async (req, res) => {
  try {
    if (!supabase) {
      // Development mode - return mock domains
      const mockDomains = [
        {
          id: 'domain-1',
          name: 'Governança',
          description: 'Domínio de governança de segurança',
          parent_id: null,
          tenant_id: req.tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'domain-2',
          name: 'Operacional',
          description: 'Domínio operacional de segurança',
          parent_id: null,
          tenant_id: req.tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return res.json({ domains: mockDomains });
    }

    const { data: domains, error } = await supabase
      .from('domains')
      .select('*')
      .eq('tenant_id', req.tenantId);

    if (error) {
      console.error('Domains fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch domains' });
    }

    res.json({ domains });

  } catch (error) {
    console.error('Domains fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// ASSESSMENTS CRUD (Basic implementation)
// =====================================================

// Get All Assessments
router.get('/assessments', authenticateToken, validateTenant, async (req, res) => {
  try {
    if (!supabase) {
      // Development mode - return mock assessments
      const mockAssessments = [
        {
          id: 'assessment-1',
          name: 'Avaliação de Conformidade ISO 27001',
          description: 'Avaliação de conformidade com ISO 27001',
          status: 'in_progress',
          tenant_id: req.tenantId,
          created_by: req.user.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return res.json({ assessments: mockAssessments });
    }

    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('tenant_id', req.tenantId);

    if (error) {
      console.error('Assessments fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch assessments' });
    }

    res.json({ assessments });

  } catch (error) {
    console.error('Assessments fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// MODULE INFO
// =====================================================

// Get module information
router.get('/', (req, res) => {
  res.json({
    message: 'n.ISMS - Sistema de Gestão de Segurança da Informação',
    version: '1.0.0',
    endpoints: {
      policies: {
        'POST /policies': 'Create policy',
        'GET /policies': 'List policies',
        'GET /policies/:id': 'Get policy',
        'PUT /policies/:id': 'Update policy',
        'DELETE /policies/:id': 'Delete policy',
        'POST /policies/:id/approve': 'Approve policy'
      },
      controls: {
        'POST /controls': 'Create control',
        'GET /controls': 'List controls',
        'GET /controls/:id': 'Get control',
        'PUT /controls/:id': 'Update control',
        'DELETE /controls/:id': 'Delete control',
        'GET /controls/effectiveness': 'Effectiveness report'
      },
      domains: {
        'GET /domains': 'List domains'
      },
      assessments: {
        'GET /assessments': 'List assessments'
      },
      external_documents: {
        'POST /external-documents/ingest': 'Ingest external document',
        'GET /external-documents': 'List external documents',
        'GET /external-documents/:id': 'Get external document',
        'GET /external-documents/:id/download': 'Download external document',
        'DELETE /external-documents/:id': 'Delete external document'
      }
    },
    features: [
      'CRUD de Políticas de Segurança',
      'Gestão de Controles Organizacionais',
      'Sistema de Domínios Hierárquicos',
      'Avaliações de Conformidade',
      'Workflow de Aprovação de Políticas',
      'Integração de Documentos Externos',
      'Sincronização com Sistemas Externos (SharePoint, OneDrive, GED)',
      'Validação de Integridade por Checksum',
      'Suporte Multi-idioma (pt-BR, en-US, es)',
      'Armazenamento Seguro no Supabase Storage'
    ]
  });
});

module.exports = router; 