import { z } from 'zod'
import { Shield, Users, Network, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { MCPModelType } from './index'
import { 
  BaseEntity, 
  User, 
  baseEntitySchema,
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  formatDate,
  getStatusColor,
  getStatusIcon
} from './base'

// =====================================================
// TYPES
// =====================================================

export type DomainLevel = 1 | 2 | 3

export type Domain = BaseEntity & {
  name: string
  description: string
  parent_id?: string
  level: DomainLevel
  path: string
  controls_count: number
  children?: Domain[]
  category?: string
  owner?: string
  last_updated?: string
  tags?: string[]
  notes?: string
  metadata?: {
    [key: string]: any
  }
}

export type DomainTree = Domain & {
  children: DomainTree[]
}

// =====================================================
// ZOD SCHEMAS
// =====================================================

export const domainLevelSchema = z.enum(['1', '2', '3']).transform(Number)

export const createDomainSchema = (t: any) => z.object({
  name: z.string().min(2, t('domain.validation.name_min')),
  description: z.string().min(10, t('domain.validation.description_min')),
  parent_id: z.string().uuid().optional(),
  level: domainLevelSchema.optional(),
  category: z.string().optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export const updateDomainSchema = (t: any) => createDomainSchema(t).partial()

export const domainTreeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  level: z.number(),
  path: z.string(),
  controls_count: z.number(),
  children: z.array(z.lazy(() => domainTreeSchema))
})

// =====================================================
// PERMISSIONS
// =====================================================

export const domainPermissions = {
  canCreate: (user: User, tenantId: string): boolean => {
    return canCreate(user, tenantId)
  },
  
  canRead: (user: User, domain: Domain): boolean => {
    return canRead(user, domain)
  },
  
  canUpdate: (user: User, domain: Domain): boolean => {
    return canUpdate(user, domain)
  },
  
  canDelete: (user: User, domain: Domain): boolean => {
    // Não permitir excluir domínios com controles ou filhos
    if (domain.controls_count > 0) return false
    if (domain.children && domain.children.length > 0) return false
    return canDelete(user, domain)
  },
  
  canExport: (user: User, domain: Domain): boolean => {
    return canRead(user, domain)
  }
}

// =====================================================
// METADATA
// =====================================================

export const domainMeta = {
  type: 'domain' as MCPModelType,
  icon: Shield,
  title: 'models.domain.title',
  description: 'models.domain.description',
  fields: {
    name: {
      label: 'forms.domain.name',
      type: 'text' as const,
      required: true,
      validation: { min: 2 },
      placeholder: 'forms.domain.name_placeholder'
    },
    description: {
      label: 'forms.domain.description',
      type: 'textarea' as const,
      required: true,
      validation: { min: 10 },
      placeholder: 'forms.domain.description_placeholder'
    },
    parent_id: {
      label: 'forms.domain.parent_domain',
      type: 'relation' as const,
      required: false,
      relation: 'domains'
    },
    level: {
      label: 'forms.domain.level',
      type: 'select' as const,
      required: true,
      options: [
        { value: '1', label: 'domain.levels.level_1' },
        { value: '2', label: 'domain.levels.level_2' },
        { value: '3', label: 'domain.levels.level_3' }
      ]
    },
    category: {
      label: 'forms.domain.category',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'governance', label: 'domain.categories.governance' },
        { value: 'access_control', label: 'domain.categories.access_control' },
        { value: 'network_security', label: 'domain.categories.network_security' },
        { value: 'identity_management', label: 'domain.categories.identity_management' },
        { value: 'physical_security', label: 'domain.categories.physical_security' },
        { value: 'application_security', label: 'domain.categories.application_security' },
        { value: 'data_protection', label: 'domain.categories.data_protection' },
        { value: 'incident_response', label: 'domain.categories.incident_response' }
      ]
    },
    owner: {
      label: 'forms.domain.owner',
      type: 'text' as const,
      required: false,
      placeholder: 'forms.domain.owner_placeholder'
    },
    tags: {
      label: 'forms.domain.tags',
      type: 'tags' as const,
      required: false,
      placeholder: 'forms.domain.tags_placeholder'
    },
    notes: {
      label: 'forms.domain.notes',
      type: 'textarea' as const,
      required: false,
      placeholder: 'forms.domain.notes_placeholder'
    }
  }
}
      icon: Shield,
      permission: 'export',
      variant: 'outline'
    }
  },
  views: {
    tree: {
      label: 'domain.views.tree',
      icon: Folder,
      component: 'DomainTreeView'
    },
    list: {
      label: 'domain.views.list',
      icon: FolderOpen,
      component: 'DomainListView'
    },
    hierarchy: {
      label: 'domain.views.hierarchy',
      icon: Shield,
      component: 'DomainHierarchyView'
    }
  }
}

// =====================================================
// UTILITIES
// =====================================================

export const getDomainLevelInfo = (level: DomainLevel) => {
  const levelInfo = {
    1: {
      color: 'text-nciso-cyan',
      icon: Shield,
      label: 'domain.levels.level_1'
    },
    2: {
      color: 'text-green-500',
      icon: Users,
      label: 'domain.levels.level_2'
    },
    3: {
      color: 'text-blue-500',
      icon: Network,
      label: 'domain.levels.level_3'
    }
  }
  
  return levelInfo[level] || levelInfo[1]
}

export const getDomainCategoryInfo = (category: string) => {
  const categoryInfo = {
    governance: {
      color: 'bg-purple-500',
      label: 'domain.categories.governance'
    },
    access_control: {
      color: 'bg-blue-500',
      label: 'domain.categories.access_control'
    },
    network_security: {
      color: 'bg-green-500',
      label: 'domain.categories.network_security'
    },
    identity_management: {
      color: 'bg-yellow-500',
      label: 'domain.categories.identity_management'
    },
    physical_security: {
      color: 'bg-orange-500',
      label: 'domain.categories.physical_security'
    },
    application_security: {
      color: 'bg-red-500',
      label: 'domain.categories.application_security'
    },
    data_protection: {
      color: 'bg-indigo-500',
      label: 'domain.categories.data_protection'
    },
    incident_response: {
      color: 'bg-pink-500',
      label: 'domain.categories.incident_response'
    }
  }
  
  return categoryInfo[category as keyof typeof categoryInfo] || categoryInfo.governance
}

export const buildDomainPath = (domain: Domain, parentPath?: string): string => {
  if (!parentPath) return `/${domain.id}`
  return `${parentPath}/${domain.id}`
}

export const calculateDomainLevel = (parentId?: string, parentLevel?: number): DomainLevel => {
  if (!parentId || !parentLevel) return 1
  if (parentLevel >= 3) return 3 // Máximo 3 níveis
  return (parentLevel + 1) as DomainLevel
}

export const hasDomainChildren = (domain: Domain): boolean => {
  return domain.children && domain.children.length > 0
}

export const hasDomainControls = (domain: Domain): boolean => {
  return domain.controls_count > 0
}

export const canDeleteDomain = (domain: Domain): boolean => {
  return !hasDomainChildren(domain) && !hasDomainControls(domain)
}

export const getDomainBreadcrumb = (domain: Domain, allDomains: Domain[]): Domain[] => {
  const breadcrumb: Domain[] = [domain]
  let current = domain
  
  while (current.parent_id) {
    const parent = allDomains.find(d => d.id === current.parent_id)
    if (parent) {
      breadcrumb.unshift(parent)
      current = parent
    } else {
      break
    }
  }
  
  return breadcrumb
}

export const buildDomainTree = (domains: Domain[]): DomainTree[] => {
  const domainMap = new Map<string, DomainTree>()
  const roots: DomainTree[] = []
  
  // Criar mapa de domínios
  domains.forEach(domain => {
    domainMap.set(domain.id, { ...domain, children: [] })
  })
  
  // Construir árvore
  domains.forEach(domain => {
    const treeNode = domainMap.get(domain.id)!
    
    if (domain.parent_id) {
      const parent = domainMap.get(domain.parent_id)
      if (parent) {
        parent.children.push(treeNode)
      }
    } else {
      roots.push(treeNode)
    }
  })
  
  return roots
}

export const flattenDomainTree = (tree: DomainTree[]): Domain[] => {
  const result: Domain[] = []
  
  const traverse = (nodes: DomainTree[]) => {
    nodes.forEach(node => {
      result.push(node)
      if (node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  
  traverse(tree)
  return result
}

// =====================================================
// I18N KEYS
// =====================================================

export const domainI18nKeys = {
  // Títulos
  title: 'domain.title',
  subtitle: 'domain.subtitle',
  new_domain: 'domain.new_domain',
  edit_domain: 'domain.edit_domain',
  
  // Campos
  parent_domain: 'domain.parent_domain',
  level: 'domain.level',
  path: 'domain.path',
  controls_count: 'domain.controls_count',
  category: 'domain.category',
  owner: 'domain.owner',
  tags: 'domain.tags',
  notes: 'domain.notes',
  no_parent: 'domain.no_parent',
  
  // Níveis
  levels: {
    level_1: 'domain.levels.level_1',
    level_2: 'domain.levels.level_2',
    level_3: 'domain.levels.level_3'
  },
  
  // Categorias
  categories: {
    governance: 'domain.categories.governance',
    access_control: 'domain.categories.access_control',
    network_security: 'domain.categories.network_security',
    identity_management: 'domain.categories.identity_management',
    physical_security: 'domain.categories.physical_security',
    application_security: 'domain.categories.application_security',
    data_protection: 'domain.categories.data_protection',
    incident_response: 'domain.categories.incident_response'
  },
  
  // Ações
  actions: {
    create: 'domain.actions.create',
    edit: 'domain.actions.edit',
    delete: 'domain.actions.delete',
    expand: 'domain.actions.expand',
    collapse: 'domain.actions.collapse',
    export: 'domain.actions.export',
    view: 'domain.actions.view'
  },
  
  // Visualizações
  views: {
    tree: 'domain.views.tree',
    list: 'domain.views.list',
    hierarchy: 'domain.views.hierarchy'
  },
  
  // Validação
  validation: {
    name_min: 'domain.validation.name_min',
    description_min: 'domain.validation.description_min',
    parent_not_found: 'domain.validation.parent_not_found',
    cannot_delete_with_children: 'domain.validation.cannot_delete_with_children',
    cannot_delete_with_controls: 'domain.validation.cannot_delete_with_controls',
    cannot_be_parent_of_self: 'domain.validation.cannot_be_parent_of_self',
    max_level_exceeded: 'domain.validation.max_level_exceeded'
  },
  
  // Acessibilidade
  accessibility: {
    expand_node: 'domain.accessibility.expand_node',
    collapse_node: 'domain.accessibility.collapse_node',
    edit_domain: 'domain.accessibility.edit_domain',
    delete_domain: 'domain.accessibility.delete_domain',
    tree_navigation: 'domain.accessibility.tree_navigation'
  }
}

// =====================================================
// MOCK DATA
// =====================================================

export const mockDomains: Domain[] = [
  {
    id: '1',
    name: 'Governança de Segurança',
    description: 'Estruturas e processos de governança de segurança da informação',
    parent_id: null,
    level: 1,
    path: '/1',
    controls_count: 12,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    category: 'governance',
    owner: 'admin',
    tags: ['governança', 'estrutura', 'processos']
  },
  {
    id: '2',
    name: 'Controle de Acesso',
    description: 'Controles de acesso físico e lógico',
    parent_id: '1',
    level: 2,
    path: '/1/2',
    controls_count: 8,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    category: 'access_control',
    owner: 'manager',
    tags: ['acesso', 'autenticação', 'autorização']
  },
  {
    id: '3',
    name: 'Gestão de Identidade',
    description: 'Processos de gestão de identidades e acessos',
    parent_id: '2',
    level: 3,
    path: '/1/2/3',
    controls_count: 5,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    category: 'identity_management',
    owner: 'manager',
    tags: ['identidade', 'provisionamento', 'lifecycle']
  },
  {
    id: '4',
    name: 'Segurança de Redes',
    description: 'Controles de segurança de infraestrutura de rede',
    parent_id: '1',
    level: 2,
    path: '/1/4',
    controls_count: 15,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    category: 'network_security',
    owner: 'admin',
    tags: ['rede', 'firewall', 'ids', 'ips']
  },
  {
    id: '5',
    name: 'Firewall e IDS/IPS',
    description: 'Sistemas de proteção perimetral',
    parent_id: '4',
    level: 3,
    path: '/1/4/5',
    controls_count: 6,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    category: 'network_security',
    owner: 'admin',
    tags: ['firewall', 'ids', 'ips', 'perimetral']
  }
]

export const mockDomainTree: DomainTree[] = buildDomainTree(mockDomains) 