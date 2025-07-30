/**
 * 🛡️ n.CISO - API de Convites
 * 
 * Endpoints para gerenciamento de convites e controle de acesso
 */

const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const { validateToken } = require('../../middleware/auth')
const { validateTenantAccess } = require('../../middleware/tenant')
const router = express.Router()

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * 📧 POST /api/v1/platform/invite
 * Criar convite para usuário
 */
router.post('/invite', validateToken, validateTenantAccess, async (req, res) => {
  try {
    const { email, role } = req.body
    const { user } = req

    // Validar campos obrigatórios
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email e role são obrigatórios'
      })
    }

    // Validar role
    const validRoles = ['user', 'org_admin', 'auditor']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role inválida'
      })
    }

    // Verificar permissões
    if (user.role !== 'platform_admin' && user.role !== 'org_admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para criar convites'
      })
    }

    // Se org_admin, verificar se é da mesma tenant
    if (user.role === 'org_admin' && user.tenant_id !== req.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para convidar usuários de outras organizações'
      })
    }

    // Validar domínio do e-mail
    const emailDomain = email.split('@')[1]
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('email_domain')
      .eq('id', user.tenant_id)
      .single()

    if (tenantError || !tenant) {
      return res.status(404).json({
        success: false,
        message: 'Organização não encontrada'
      })
    }

    if (emailDomain !== tenant.email_domain) {
      return res.status(400).json({
        success: false,
        message: `E-mail deve pertencer ao domínio: ${tenant.email_domain}`
      })
    }

    // Verificar se já existe convite pendente
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id, accepted, expires_at')
      .eq('email', email)
      .eq('tenant_id', user.tenant_id)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvite) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um convite pendente para este e-mail'
      })
    }

    // Gerar token único
    const token = require('crypto').randomBytes(32).toString('hex')
    
    // Definir expiração (7 dias)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Criar convite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        email,
        role,
        tenant_id: user.tenant_id,
        token,
        expires_at: expiresAt.toISOString(),
        created_by: user.id
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Erro ao criar convite:', inviteError)
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao criar convite'
      })
    }

    // TODO: Enviar e-mail com link de convite
    // Por enquanto, retornar o token para desenvolvimento
    const inviteUrl = `${process.env.FRONTEND_URL}/invite?token=${token}`

    res.status(201).json({
      success: true,
      message: 'Convite criado com sucesso',
      data: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expires_at: invite.expires_at,
        invite_url: inviteUrl // Remover em produção
      }
    })

  } catch (error) {
    console.error('Erro na criação de convite:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

/**
 * 📋 GET /api/v1/platform/invites
 * Listar convites da organização
 */
router.get('/invites', validateToken, validateTenantAccess, async (req, res) => {
  try {
    const { user } = req
    const { page = 1, limit = 10, status } = req.query

    // Verificar permissões
    if (user.role !== 'platform_admin' && user.role !== 'org_admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para visualizar convites'
      })
    }

    // Construir query
    let query = supabase
      .from('invites')
      .select(`
        id,
        email,
        role,
        expires_at,
        accepted,
        created_at,
        created_by,
        tenants!inner(name, email_domain)
      `)
      .eq('tenant_id', user.tenant_id)

    // Filtrar por status
    if (status === 'pending') {
      query = query.eq('accepted', false).gt('expires_at', new Date().toISOString())
    } else if (status === 'accepted') {
      query = query.eq('accepted', true)
    } else if (status === 'expired') {
      query = query.eq('accepted', false).lt('expires_at', new Date().toISOString())
    }

    // Paginação
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

    const { data: invites, error, count } = await query

    if (error) {
      console.error('Erro ao buscar convites:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao buscar convites'
      })
    }

    res.json({
      success: true,
      data: invites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || invites.length
      }
    })

  } catch (error) {
    console.error('Erro ao listar convites:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

/**
 * ✅ POST /api/v1/platform/invite/accept
 * Aceitar convite
 */
router.post('/invite/accept', async (req, res) => {
  try {
    const { token, password, name } = req.body

    if (!token || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Token, senha e nome são obrigatórios'
      })
    }

    // Buscar convite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select(`
        id,
        email,
        role,
        tenant_id,
        expires_at,
        accepted,
        tenants!inner(name, email_domain)
      `)
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return res.status(404).json({
        success: false,
        message: 'Convite não encontrado'
      })
    }

    // Verificar se já foi aceito
    if (invite.accepted) {
      return res.status(400).json({
        success: false,
        message: 'Convite já foi aceito'
      })
    }

    // Verificar se expirou
    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Convite expirado'
      })
    }

    // Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: invite.role,
        tenant_id: invite.tenant_id
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar conta de usuário'
      })
    }

    // Inserir na tabela users
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: invite.email,
        name,
        role: invite.role,
        tenant_id: invite.tenant_id
      })

    if (userError) {
      console.error('Erro ao inserir usuário:', userError)
      // Rollback: deletar usuário do auth
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar perfil de usuário'
      })
    }

    // Marcar convite como aceito
    const { error: updateError } = await supabase
      .from('invites')
      .update({ accepted: true })
      .eq('id', invite.id)

    if (updateError) {
      console.error('Erro ao atualizar convite:', updateError)
    }

    res.json({
      success: true,
      message: 'Convite aceito com sucesso',
      data: {
        user_id: authUser.user.id,
        email: invite.email,
        role: invite.role,
        tenant_name: invite.tenants.name
      }
    })

  } catch (error) {
    console.error('Erro ao aceitar convite:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

/**
 * ❌ DELETE /api/v1/platform/invite/:id
 * Cancelar convite
 */
router.delete('/invite/:id', validateToken, validateTenantAccess, async (req, res) => {
  try {
    const { id } = req.params
    const { user } = req

    // Verificar permissões
    if (user.role !== 'platform_admin' && user.role !== 'org_admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para cancelar convites'
      })
    }

    // Buscar convite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('id, tenant_id, created_by')
      .eq('id', id)
      .single()

    if (inviteError || !invite) {
      return res.status(404).json({
        success: false,
        message: 'Convite não encontrado'
      })
    }

    // Verificar se pertence à mesma tenant
    if (invite.tenant_id !== user.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para cancelar convite de outra organização'
      })
    }

    // Se org_admin, verificar se criou o convite
    if (user.role === 'org_admin' && invite.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Só pode cancelar convites criados por você'
      })
    }

    // Deletar convite
    const { error: deleteError } = await supabase
      .from('invites')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao deletar convite:', deleteError)
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao cancelar convite'
      })
    }

    res.json({
      success: true,
      message: 'Convite cancelado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao cancelar convite:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

module.exports = router 