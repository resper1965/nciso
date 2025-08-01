const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const { z } = require('zod')

const router = express.Router()

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Schemas de validação
const EffectivenessSchema = z.object({
  control_id: z.string().uuid('control_id deve ser um UUID válido'),
  score: z.number().min(0).max(100, 'score deve estar entre 0 e 100'),
  comentario: z.string().optional(),
  data_avaliacao: z.string().datetime().optional()
})

const EffectivenessUpdateSchema = z.object({
  score: z.number().min(0).max(100, 'score deve estar entre 0 e 100').optional(),
  comentario: z.string().optional(),
  data_avaliacao: z.string().datetime().optional()
})

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autenticação é obrigatório' 
      })
    }

    const token = authHeader.substring(7)
    
    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido ou expirado' 
      })
    }

    // Extrair tenant_id do JWT
    const { data: { user: userData } } = await supabase.auth.getUser(token)
    const tenant_id = userData?.user_metadata?.tenant_id

    if (!tenant_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'tenant_id não encontrado no token' 
      })
    }

    req.user = user
    req.tenant_id = tenant_id
    req.avaliador_id = user.id
    next()
  } catch (error) {
    console.error('❌ Erro na autenticação:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno na autenticação' 
    })
  }
}

// Middleware de validação de role
const validateRole = (allowedRoles = ['admin', 'manager', 'auditor']) => {
  return (req, res, next) => {
    const userRole = req.user?.user_metadata?.role || 'user'
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Permissão insuficiente para esta operação' 
      })
    }
    
    next()
  }
}

// Helper para log de ações
const logAction = async (action, details, tenant_id, user_id) => {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        action,
        details,
        tenant_id,
        user_id,
        module: 'controls_effectiveness'
      })
  } catch (error) {
    console.error('❌ Erro ao registrar log:', error)
  }
}

// GET /api/controls/effectiveness - Listar avaliações
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      control_id, 
      page = 1, 
      limit = 20, 
      score_min, 
      score_max,
      data_inicio,
      data_fim,
      avaliador_id 
    } = req.query

    let query = supabase
      .from('control_effectiveness')
      .select(`
        *,
        global_controls!inner(
          id,
          name,
          type,
          status
        )
      `)
      .eq('tenant_id', req.tenant_id)

    // Filtros
    if (control_id) {
      query = query.eq('control_id', control_id)
    }
    
    if (score_min !== undefined) {
      query = query.gte('score', parseInt(score_min))
    }
    
    if (score_max !== undefined) {
      query = query.lte('score', parseInt(score_max))
    }
    
    if (data_inicio) {
      query = query.gte('data_avaliacao', data_inicio)
    }
    
    if (data_fim) {
      query = query.lte('data_avaliacao', data_fim)
    }
    
    if (avaliador_id) {
      query = query.eq('avaliador_id', avaliador_id)
    }

    // Paginação
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    
    // Ordenação
    query = query.order('data_avaliacao', { ascending: false })

    const { data: evaluations, error, count } = await query

    if (error) {
      console.error('❌ Erro ao buscar avaliações:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar avaliações' 
      })
    }

    // Buscar total de registros para paginação
    const { count: totalCount } = await supabase
      .from('control_effectiveness')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.tenant_id)

    await logAction('list_evaluations', { 
      filters: req.query, 
      total: evaluations?.length || 0 
    }, req.tenant_id, req.avaliador_id)

    res.json({
      success: true,
      data: evaluations || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('❌ Erro no endpoint GET /effectiveness:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

// GET /api/controls/effectiveness/:id - Buscar avaliação específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { data: evaluation, error } = await supabase
      .from('control_effectiveness')
      .select(`
        *,
        global_controls!inner(
          id,
          name,
          type,
          status
        )
      `)
      .eq('id', id)
      .eq('tenant_id', req.tenant_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: 'Avaliação não encontrada' 
        })
      }
      console.error('❌ Erro ao buscar avaliação:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar avaliação' 
      })
    }

    await logAction('get_evaluation', { evaluation_id: id }, req.tenant_id, req.avaliador_id)

    res.json({
      success: true,
      data: evaluation
    })

  } catch (error) {
    console.error('❌ Erro no endpoint GET /effectiveness/:id:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

// POST /api/controls/effectiveness - Criar nova avaliação
router.post('/', authenticateToken, validateRole(['admin', 'manager', 'auditor']), async (req, res) => {
  try {
    // Validar dados de entrada
    const validation = EffectivenessSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      })
    }

    const { control_id, score, comentario, data_avaliacao } = validation.data

    // Verificar se o controle existe e pertence ao tenant
    const { data: control, error: controlError } = await supabase
      .from('global_controls')
      .select('id, name')
      .eq('id', control_id)
      .eq('tenant_id', req.tenant_id)
      .single()

    if (controlError || !control) {
      return res.status(404).json({ 
        success: false, 
        error: 'Controle não encontrado ou não pertence ao tenant' 
      })
    }

    // Criar avaliação
    const evaluationData = {
      control_id,
      score,
      comentario: comentario || null,
      data_avaliacao: data_avaliacao || new Date().toISOString(),
      tenant_id: req.tenant_id,
      avaliador_id: req.avaliador_id
    }

    const { data: evaluation, error } = await supabase
      .from('control_effectiveness')
      .insert(evaluationData)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar avaliação:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar avaliação' 
      })
    }

    await logAction('create_evaluation', { 
      control_id, 
      score, 
      evaluation_id: evaluation.id 
    }, req.tenant_id, req.avaliador_id)

    res.status(201).json({
      success: true,
      data: evaluation,
      message: 'Avaliação criada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro no endpoint POST /effectiveness:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

// PUT /api/controls/effectiveness/:id - Atualizar avaliação
router.put('/:id', authenticateToken, validateRole(['admin', 'manager', 'auditor']), async (req, res) => {
  try {
    const { id } = req.params

    // Validar dados de entrada
    const validation = EffectivenessUpdateSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      })
    }

    // Verificar se a avaliação existe e pertence ao tenant
    const { data: existingEvaluation, error: checkError } = await supabase
      .from('control_effectiveness')
      .select('id, control_id, score')
      .eq('id', id)
      .eq('tenant_id', req.tenant_id)
      .single()

    if (checkError || !existingEvaluation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Avaliação não encontrada' 
      })
    }

    // Atualizar avaliação
    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString()
    }

    const { data: evaluation, error } = await supabase
      .from('control_effectiveness')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', req.tenant_id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar avaliação:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao atualizar avaliação' 
      })
    }

    await logAction('update_evaluation', { 
      evaluation_id: id, 
      changes: validation.data 
    }, req.tenant_id, req.avaliador_id)

    res.json({
      success: true,
      data: evaluation,
      message: 'Avaliação atualizada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro no endpoint PUT /effectiveness/:id:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

// DELETE /api/controls/effectiveness/:id - Deletar avaliação
router.delete('/:id', authenticateToken, validateRole(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se a avaliação existe e pertence ao tenant
    const { data: evaluation, error: checkError } = await supabase
      .from('control_effectiveness')
      .select('id, control_id, score')
      .eq('id', id)
      .eq('tenant_id', req.tenant_id)
      .single()

    if (checkError || !evaluation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Avaliação não encontrada' 
      })
    }

    // Deletar avaliação
    const { error } = await supabase
      .from('control_effectiveness')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.tenant_id)

    if (error) {
      console.error('❌ Erro ao deletar avaliação:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao deletar avaliação' 
      })
    }

    await logAction('delete_evaluation', { 
      evaluation_id: id, 
      control_id: evaluation.control_id,
      score: evaluation.score 
    }, req.tenant_id, req.avaliador_id)

    res.json({
      success: true,
      message: 'Avaliação deletada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro no endpoint DELETE /effectiveness/:id:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

// GET /api/controls/effectiveness/stats - Estatísticas de efetividade
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { control_id } = req.query

    let stats

    if (control_id) {
      // Estatísticas de um controle específico
      const { data, error } = await supabase
        .rpc('get_control_effectiveness_avg', {
          control_uuid: control_id,
          tenant_uuid: req.tenant_id
        })

      if (error) {
        console.error('❌ Erro ao buscar estatísticas do controle:', error)
        return res.status(500).json({ 
          success: false, 
          error: 'Erro ao buscar estatísticas' 
        })
      }

      stats = data[0] || null
    } else {
      // Estatísticas gerais do tenant
      const { data, error } = await supabase
        .rpc('get_effectiveness_stats', {
          tenant_uuid: req.tenant_id
        })

      if (error) {
        console.error('❌ Erro ao buscar estatísticas gerais:', error)
        return res.status(500).json({ 
          success: false, 
          error: 'Erro ao buscar estatísticas' 
        })
      }

      stats = data[0] || null
    }

    await logAction('get_effectiveness_stats', { 
      control_id: control_id || 'all' 
    }, req.tenant_id, req.avaliador_id)

    res.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('❌ Erro no endpoint GET /effectiveness/stats:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

// GET /api/controls/effectiveness/low-effectiveness - Controles com baixa efetividade
router.get('/low-effectiveness', authenticateToken, async (req, res) => {
  try {
    const { min_score = 50 } = req.query

    const { data: controls, error } = await supabase
      .rpc('get_low_effectiveness_controls', {
        tenant_uuid: req.tenant_id,
        min_score: parseInt(min_score)
      })

    if (error) {
      console.error('❌ Erro ao buscar controles com baixa efetividade:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar controles com baixa efetividade' 
      })
    }

    await logAction('get_low_effectiveness_controls', { 
      min_score: parseInt(min_score),
      count: controls?.length || 0 
    }, req.tenant_id, req.avaliador_id)

    res.json({
      success: true,
      data: controls || [],
      filters: {
        min_score: parseInt(min_score)
      }
    })

  } catch (error) {
    console.error('❌ Erro no endpoint GET /effectiveness/low-effectiveness:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

module.exports = router 