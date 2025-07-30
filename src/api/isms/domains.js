const express = require('express')
const router = express.Router()

// Mock data para desenvolvimento
const mockDomains = [
  {
    id: '1',
    name: 'Governança de Segurança',
    description: 'Estruturas e processos de governança de segurança da informação',
    parent_id: null,
    level: 1,
    path: '/1',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    controls_count: 12
  },
  {
    id: '2',
    name: 'Controle de Acesso',
    description: 'Controles de acesso físico e lógico',
    parent_id: '1',
    level: 2,
    path: '/1/2',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    controls_count: 8
  },
  {
    id: '3',
    name: 'Gestão de Identidade',
    description: 'Processos de gestão de identidades e acessos',
    parent_id: '2',
    level: 3,
    path: '/1/2/3',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    controls_count: 5
  },
  {
    id: '4',
    name: 'Segurança de Redes',
    description: 'Controles de segurança de infraestrutura de rede',
    parent_id: '1',
    level: 2,
    path: '/1/4',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    controls_count: 15
  },
  {
    id: '5',
    name: 'Firewall e IDS/IPS',
    description: 'Sistemas de proteção perimetral',
    parent_id: '4',
    level: 3,
    path: '/1/4/5',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    controls_count: 6
  }
]

// Middleware de autenticação (simulado)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' })
  }

  // Simulação de validação de token
  req.user = { user_id: 'admin', role: 'admin' }
  next()
}

// Middleware de validação de tenant
const validateTenant = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id']
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID é obrigatório' })
  }
  req.tenantId = tenantId
  next()
}

// GET /domains - Listar todos os domínios
router.get('/', authenticateToken, validateTenant, async (req, res) => {
  try {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300))

    const domains = mockDomains.filter(domain => domain.tenant_id === req.tenantId)
    
    res.json({
      message: 'Domínios carregados com sucesso',
      domains: domains,
      total: domains.length
    })
  } catch (error) {
    console.error('Erro ao carregar domínios:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /domains/tree - Listar domínios em estrutura de árvore
router.get('/tree', authenticateToken, validateTenant, async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))

    const domains = mockDomains.filter(domain => domain.tenant_id === req.tenantId)
    
    // Função para construir árvore hierárquica
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }))
    }

    const tree = buildTree(domains)
    
    res.json({
      message: 'Árvore de domínios carregada com sucesso',
      tree: tree,
      total: domains.length
    })
  } catch (error) {
    console.error('Erro ao carregar árvore de domínios:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /domains/:id - Obter domínio específico
router.get('/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params
    
    const domain = mockDomains.find(d => d.id === id && d.tenant_id === req.tenantId)
    
    if (!domain) {
      return res.status(404).json({ error: 'Domínio não encontrado' })
    }

    // Buscar domínios filhos
    const children = mockDomains.filter(d => d.parent_id === id && d.tenant_id === req.tenantId)
    
    res.json({
      message: 'Domínio carregado com sucesso',
      domain: {
        ...domain,
        children: children
      }
    })
  } catch (error) {
    console.error('Erro ao carregar domínio:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// POST /domains - Criar novo domínio
router.post('/', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { name, description, parent_id } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Nome do domínio é obrigatório' })
    }

    // Validar se o domínio pai existe
    if (parent_id) {
      const parentDomain = mockDomains.find(d => d.id === parent_id && d.tenant_id === req.tenantId)
      if (!parentDomain) {
        return res.status(400).json({ error: 'Domínio pai não encontrado' })
      }
    }

    const newDomain = {
      id: Date.now().toString(),
      name,
      description: description || '',
      parent_id: parent_id || null,
      level: parent_id ? 2 : 1, // Simplificado para demo
      path: parent_id ? `/${parent_id}/${Date.now()}` : `/${Date.now()}`,
      tenant_id: req.tenantId,
      created_by: req.user.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      controls_count: 0
    }

    // Em produção, salvar no banco
    mockDomains.push(newDomain)

    res.status(201).json({
      message: 'Domínio criado com sucesso',
      domain: newDomain
    })
  } catch (error) {
    console.error('Erro ao criar domínio:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PUT /domains/:id - Atualizar domínio
router.put('/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, parent_id } = req.body

    const domainIndex = mockDomains.findIndex(d => d.id === id && d.tenant_id === req.tenantId)
    
    if (domainIndex === -1) {
      return res.status(404).json({ error: 'Domínio não encontrado' })
    }

    // Validar se não está tentando ser pai de si mesmo
    if (parent_id === id) {
      return res.status(400).json({ error: 'Domínio não pode ser pai de si mesmo' })
    }

    // Validar se o domínio pai existe
    if (parent_id) {
      const parentDomain = mockDomains.find(d => d.id === parent_id && d.tenant_id === req.tenantId)
      if (!parentDomain) {
        return res.status(400).json({ error: 'Domínio pai não encontrado' })
      }
    }

    const updatedDomain = {
      ...mockDomains[domainIndex],
      name: name || mockDomains[domainIndex].name,
      description: description || mockDomains[domainIndex].description,
      parent_id: parent_id !== undefined ? parent_id : mockDomains[domainIndex].parent_id,
      updated_at: new Date().toISOString()
    }

    mockDomains[domainIndex] = updatedDomain

    res.json({
      message: 'Domínio atualizado com sucesso',
      domain: updatedDomain
    })
  } catch (error) {
    console.error('Erro ao atualizar domínio:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// DELETE /domains/:id - Excluir domínio
router.delete('/:id', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params

    const domainIndex = mockDomains.findIndex(d => d.id === id && d.tenant_id === req.tenantId)
    
    if (domainIndex === -1) {
      return res.status(404).json({ error: 'Domínio não encontrado' })
    }

    // Verificar se tem domínios filhos
    const hasChildren = mockDomains.some(d => d.parent_id === id && d.tenant_id === req.tenantId)
    if (hasChildren) {
      return res.status(400).json({ error: 'Não é possível excluir domínio com subdomínios' })
    }

    // Verificar se tem controles associados
    if (mockDomains[domainIndex].controls_count > 0) {
      return res.status(400).json({ error: 'Não é possível excluir domínio com controles associados' })
    }

    mockDomains.splice(domainIndex, 1)

    res.json({
      message: 'Domínio excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir domínio:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /domains/:id/controls - Listar controles de um domínio
router.get('/:id/controls', authenticateToken, validateTenant, async (req, res) => {
  try {
    const { id } = req.params

    const domain = mockDomains.find(d => d.id === id && d.tenant_id === req.tenantId)
    
    if (!domain) {
      return res.status(404).json({ error: 'Domínio não encontrado' })
    }

    // Mock de controles do domínio
    const domainControls = [
      {
        id: '1',
        name: 'Controle de Acesso por Função',
        description: 'Implementação de RBAC',
        control_type: 'preventive',
        implementation_status: 'implemented',
        effectiveness_score: 85
      },
      {
        id: '2',
        name: 'Autenticação Multi-Fator',
        description: 'MFA para todos os usuários',
        control_type: 'preventive',
        implementation_status: 'operational',
        effectiveness_score: 92
      }
    ]

    res.json({
      message: 'Controles do domínio carregados com sucesso',
      domain: domain,
      controls: domainControls,
      total: domainControls.length
    })
  } catch (error) {
    console.error('Erro ao carregar controles do domínio:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

module.exports = router 