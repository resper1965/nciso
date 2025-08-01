import { supabase } from '@/lib/supabase'
import { 
  CredentialsRegistry, 
  CredentialsRegistryFilters, 
  CredentialsRegistryFormData, 
  CredentialsRegistryListResponse,
  CredentialsRegistryStats
} from '@/lib/types/isms'

export class CredentialsRegistryService {
  // CRUD Operations
  static async list(filters: CredentialsRegistryFilters = {}): Promise<CredentialsRegistryListResponse> {
    let query = supabase
      .from('credentials_registry')
      .select(`
        *,
        assets:asset_id(name, type, classification),
        users:user_id(email, full_name),
        teams:team_id(name, description)
      `, { count: 'exact' })

    if (filters.search) {
      query = query.or(`justification.ilike.%${filters.search}%`)
    }

    if (filters.asset_id) {
      query = query.eq('asset_id', filters.asset_id)
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters.team_id) {
      query = query.eq('team_id', filters.team_id)
    }

    if (filters.access_type) {
      query = query.eq('access_type', filters.access_type)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  static async get(id: string): Promise<CredentialsRegistry> {
    const { data, error } = await supabase
      .from('credentials_registry')
      .select(`
        *,
        assets:asset_id(name, type, classification),
        users:user_id(email, full_name),
        teams:team_id(name, description)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(data: CredentialsRegistryFormData): Promise<CredentialsRegistry> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: credential, error } = await supabase
      .from('credentials_registry')
      .insert({
        asset_id: data.asset_id,
        user_id: data.user_id,
        team_id: data.team_id,
        access_type: data.access_type,
        justification: data.justification,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        is_active: data.is_active,
        tenant_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return credential
  }

  static async update(id: string, data: Partial<CredentialsRegistryFormData>): Promise<CredentialsRegistry> {
    const updateData: any = {
      asset_id: data.asset_id,
      user_id: data.user_id,
      team_id: data.team_id,
      access_type: data.access_type,
      justification: data.justification,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      is_active: data.is_active
    }

    const { data: credential, error } = await supabase
      .from('credentials_registry')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return credential
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('credentials_registry')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Approval operations
  static async approve(id: string, approvedBy: string): Promise<CredentialsRegistry> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: credential, error } = await supabase
      .from('credentials_registry')
      .update({
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return credential
  }

  static async revoke(id: string): Promise<CredentialsRegistry> {
    const { data: credential, error } = await supabase
      .from('credentials_registry')
      .update({
        is_active: false
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return credential
  }

  // Search and filtering
  static async search(query: string, filters: CredentialsRegistryFilters = {}): Promise<CredentialsRegistryListResponse> {
    const searchFilters = { ...filters, search: query }
    return this.list(searchFilters)
  }

  static async listByAsset(assetId: string, filters: CredentialsRegistryFilters = {}): Promise<CredentialsRegistryListResponse> {
    const assetFilters = { ...filters, asset_id: assetId }
    return this.list(assetFilters)
  }

  static async listByUser(userId: string, filters: CredentialsRegistryFilters = {}): Promise<CredentialsRegistryListResponse> {
    const userFilters = { ...filters, user_id: userId }
    return this.list(userFilters)
  }

  static async listByTeam(teamId: string, filters: CredentialsRegistryFilters = {}): Promise<CredentialsRegistryListResponse> {
    const teamFilters = { ...filters, team_id: teamId }
    return this.list(teamFilters)
  }

  static async listExpiringSoon(days: number = 30): Promise<CredentialsRegistry[]> {
    const { data, error } = await supabase
      .from('credentials_registry')
      .select(`
        *,
        assets:asset_id(name, type, classification),
        users:user_id(email, full_name),
        teams:team_id(name, description)
      `)
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .lte('valid_until', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString())
      .order('valid_until', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Statistics
  static async getStats(): Promise<CredentialsRegistryStats> {
    const { data: credentials, error } = await supabase
      .from('credentials_registry')
      .select('*')

    if (error) throw error

    const totalCredentials = credentials?.length || 0
    const activeCredentials = credentials?.filter(c => c.is_active).length || 0

    const credentialsByAsset = credentials?.reduce((acc, cred) => {
      acc[cred.asset_id] = (acc[cred.asset_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const credentialsByType = credentials?.reduce((acc, cred) => {
      acc[cred.access_type] = (acc[cred.access_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const expiringSoon = await this.listExpiringSoon(30)

    return {
      total_credentials: totalCredentials,
      active_credentials: activeCredentials,
      credentials_by_asset: credentialsByAsset,
      credentials_by_type: credentialsByType,
      expiring_soon: expiringSoon
    }
  }

  // MCP Methods
  static async mcpList(filters: CredentialsRegistryFilters = {}): Promise<CredentialsRegistryListResponse> {
    return this.list(filters)
  }

  static async mcpGet(id: string): Promise<CredentialsRegistry> {
    return this.get(id)
  }

  static async mcpCreate(data: CredentialsRegistryFormData): Promise<CredentialsRegistry> {
    return this.create(data)
  }

  static async mcpUpdate(id: string, data: Partial<CredentialsRegistryFormData>): Promise<CredentialsRegistry> {
    return this.update(id, data)
  }

  static async mcpDelete(id: string): Promise<void> {
    return this.delete(id)
  }

  static async mcpCreateCredentialHolder(data: CredentialsRegistryFormData): Promise<CredentialsRegistry> {
    return this.create(data)
  }

  // Helper methods
  static getAccessTypeLabel(accessType: string): string {
    const typeMap: Record<string, string> = {
      read: 'Read',
      write: 'Write',
      admin: 'Admin',
      full: 'Full Access'
    }
    return typeMap[accessType] || accessType
  }

  static getAccessTypeColor(accessType: string): string {
    const colorMap: Record<string, string> = {
      read: 'bg-blue-100 text-blue-800',
      write: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-orange-100 text-orange-800',
      full: 'bg-red-100 text-red-800'
    }
    return colorMap[accessType] || 'bg-gray-100 text-gray-800'
  }

  static isExpired(validUntil: string): boolean {
    return new Date(validUntil) < new Date()
  }

  static isExpiringSoon(validUntil: string, days: number = 30): boolean {
    const expiryDate = new Date(validUntil)
    const warningDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    return expiryDate <= warningDate && expiryDate > new Date()
  }

  static getDaysUntilExpiry(validUntil: string): number {
    const expiryDate = new Date(validUntil)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
} 