import { createClient } from '@supabase/supabase-js'
import type {
  ISMSScope,
  Organization,
  Asset,
  Domain,
  Evaluation,
  ISMSScopeFilters,
  OrganizationFilters,
  AssetFilters,
  DomainFilters,
  ISMSScopeFormData,
  OrganizationFormData,
  AssetFormData,
  DomainFormData,
  ISMSScopeApiResponse,
  OrganizationApiResponse,
  AssetApiResponse,
  DomainApiResponse,
  ISMSStats
} from '@/lib/types/isms'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// ===== ISMS SCOPE OPERATIONS =====

export const ismsScopeService = {
  // Listar escopos com filtros e paginação
  async list(filters: ISMSScopeFilters = {}, page = 1, limit = 10): Promise<ISMSScopeApiResponse> {
    let query = supabase
      .from('isms_scopes')
      .select('*, organizations(name), domains(name)', { count: 'exact' })

    // Aplicar filtros
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters.organization_id) {
      query = query.eq('organization_id', filters.organization_id)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    }
  },

  // Obter escopo por ID
  async get(id: string): Promise<ISMSScope> {
    const { data, error } = await supabase
      .from('isms_scopes')
      .select('*, organizations(name), domains(name)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Criar novo escopo
  async create(scopeData: ISMSScopeFormData): Promise<ISMSScope> {
    const { data, error } = await supabase
      .from('isms_scopes')
      .insert([scopeData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar escopo
  async update(id: string, scopeData: Partial<ISMSScopeFormData>): Promise<ISMSScope> {
    const { data, error } = await supabase
      .from('isms_scopes')
      .update(scopeData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Excluir escopo
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('isms_scopes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Ativar/Desativar escopo
  async toggleActive(id: string, isActive: boolean): Promise<ISMSScope> {
    const { data, error } = await supabase
      .from('isms_scopes')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ===== ORGANIZATION OPERATIONS =====

export const organizationService = {
  // Listar organizações
  async list(filters: OrganizationFilters = {}, page = 1, limit = 10): Promise<OrganizationApiResponse> {
    let query = supabase
      .from('organizations')
      .select('*, parent_organizations(name)', { count: 'exact' })

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.parent_id) {
      query = query.eq('parent_id', filters.parent_id)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('name', { ascending: true })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    }
  },

  // Obter organização por ID
  async get(id: string): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*, parent_organizations(name)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Criar organização
  async create(orgData: OrganizationFormData): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .insert([orgData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar organização
  async update(id: string, orgData: Partial<OrganizationFormData>): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .update(orgData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Excluir organização
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Listar organizações hierárquicas
  async getHierarchy(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }
}

// ===== ASSET OPERATIONS =====

export const assetService = {
  // Listar ativos
  async list(filters: AssetFilters = {}, page = 1, limit = 10): Promise<AssetApiResponse> {
    let query = supabase
      .from('assets')
      .select('*, organizations(name), users(name)', { count: 'exact' })

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.organization_id) {
      query = query.eq('organization_id', filters.organization_id)
    }
    if (filters.classification_level) {
      query = query.or(`classification->confidentiality.eq.${filters.classification_level},classification->integrity.eq.${filters.classification_level},classification->availability.eq.${filters.classification_level}`)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    }
  },

  // Obter ativo por ID
  async get(id: string): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .select('*, organizations(name), users(name)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Criar ativo
  async create(assetData: AssetFormData): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .insert([assetData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar ativo
  async update(id: string, assetData: Partial<AssetFormData>): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .update(assetData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Excluir ativo
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Obter estatísticas de ativos
  async getStats(): Promise<{
    total: number
    byType: Record<string, number>
    byClassification: Record<string, number>
  }> {
    const { data, error } = await supabase
      .from('assets')
      .select('type, classification')
      .eq('is_active', true)

    if (error) throw error

    const byType: Record<string, number> = {}
    const byClassification: Record<string, number> = {}

    data?.forEach(asset => {
      // Contar por tipo
      byType[asset.type] = (byType[asset.type] || 0) + 1

      // Contar por classificação
      const classification = asset.classification
      const maxLevel = Math.max(
        classification.confidentiality === 'critical' ? 4 : 
        classification.confidentiality === 'high' ? 3 :
        classification.confidentiality === 'medium' ? 2 : 1,
        classification.integrity === 'critical' ? 4 :
        classification.integrity === 'high' ? 3 :
        classification.integrity === 'medium' ? 2 : 1,
        classification.availability === 'critical' ? 4 :
        classification.availability === 'high' ? 3 :
        classification.availability === 'medium' ? 2 : 1
      )

      const level = maxLevel === 4 ? 'critical' : maxLevel === 3 ? 'high' : maxLevel === 2 ? 'medium' : 'low'
      byClassification[level] = (byClassification[level] || 0) + 1
    })

    return {
      total: data?.length || 0,
      byType,
      byClassification
    }
  }
}

// ===== DOMAIN OPERATIONS =====

export const domainService = {
  // Listar domínios
  async list(filters: DomainFilters = {}, page = 1, limit = 10): Promise<DomainApiResponse> {
    let query = supabase
      .from('domains')
      .select('*, parent_domains(name)', { count: 'exact' })

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters.parent_id) {
      query = query.eq('parent_id', filters.parent_id)
    }
    if (filters.level) {
      query = query.eq('level', filters.level)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('path', { ascending: true })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    }
  },

  // Obter domínio por ID
  async get(id: string): Promise<Domain> {
    const { data, error } = await supabase
      .from('domains')
      .select('*, parent_domains(name)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Criar domínio
  async create(domainData: DomainFormData): Promise<Domain> {
    // Calcular path e level baseado no parent
    let path = domainData.name
    let level = 1

    if (domainData.parent_id) {
      const parent = await this.get(domainData.parent_id)
      path = `${parent.path} > ${domainData.name}`
      level = parent.level + 1
    }

    const { data, error } = await supabase
      .from('domains')
      .insert([{ ...domainData, path, level }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar domínio
  async update(id: string, domainData: Partial<DomainFormData>): Promise<Domain> {
    const { data, error } = await supabase
      .from('domains')
      .update(domainData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Excluir domínio
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Obter hierarquia de domínios
  async getHierarchy(): Promise<Domain[]> {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('is_active', true)
      .order('path', { ascending: true })

    if (error) throw error
    return data || []
  }
}

// ===== ISMS STATISTICS =====

export const ismsStatsService = {
  // Obter estatísticas gerais do ISMS
  async getStats(): Promise<ISMSStats> {
    const [
      scopesResult,
      organizationsResult,
      assetsResult,
      domainsResult
    ] = await Promise.all([
      supabase.from('isms_scopes').select('*', { count: 'exact' }),
      supabase.from('organizations').select('*', { count: 'exact' }),
      supabase.from('assets').select('*', { count: 'exact' }),
      supabase.from('domains').select('*', { count: 'exact' })
    ])

    const activeScopesResult = await supabase
      .from('isms_scopes')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    const assetsByTypeResult = await supabase
      .from('assets')
      .select('type')
      .eq('is_active', true)

    const domainsByLevelResult = await supabase
      .from('domains')
      .select('level')
      .eq('is_active', true)

    // Processar dados de ativos por tipo
    const assetsByType: Record<string, number> = {}
    assetsByTypeResult.data?.forEach(asset => {
      assetsByType[asset.type] = (assetsByType[asset.type] || 0) + 1
    })

    // Processar dados de domínios por nível
    const domainsByLevel: Record<number, number> = {}
    domainsByLevelResult.data?.forEach(domain => {
      domainsByLevel[domain.level] = (domainsByLevel[domain.level] || 0) + 1
    })

    return {
      total_scopes: scopesResult.count || 0,
      active_scopes: activeScopesResult.count || 0,
      total_organizations: organizationsResult.count || 0,
      total_assets: assetsResult.count || 0,
      assets_by_type: assetsByType,
      assets_by_classification: {}, // Será calculado separadamente se necessário
      total_domains: domainsResult.count || 0,
      domains_by_level: domainsByLevel
    }
  }
} 