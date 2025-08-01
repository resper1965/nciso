import { supabase } from '@/lib/supabase'
import { 
  PrivilegedAccess, 
  PrivilegedAccessFilters, 
  PrivilegedAccessFormData, 
  PrivilegedAccessListResponse,
  PrivilegedAccessStats
} from '@/lib/types/isms'

export class PrivilegedAccessService {
  // CRUD Operations
  static async list(filters: PrivilegedAccessFilters = {}): Promise<PrivilegedAccessListResponse> {
    let query = supabase
      .from('privileged_access')
      .select(`
        *,
        users:user_id(email, full_name),
        approvers:approved_by(email, full_name)
      `, { count: 'exact' })

    if (filters.search) {
      query = query.or(`justification.ilike.%${filters.search}%`)
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters.scope_type) {
      query = query.eq('scope_type', filters.scope_type)
    }

    if (filters.scope_id) {
      query = query.eq('scope_id', filters.scope_id)
    }

    if (filters.access_level) {
      query = query.eq('access_level', filters.access_level)
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

  static async get(id: string): Promise<PrivilegedAccess> {
    const { data, error } = await supabase
      .from('privileged_access')
      .select(`
        *,
        users:user_id(email, full_name),
        approvers:approved_by(email, full_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(data: PrivilegedAccessFormData): Promise<PrivilegedAccess> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: privilegedAccess, error } = await supabase
      .from('privileged_access')
      .insert({
        user_id: data.user_id,
        scope_type: data.scope_type,
        scope_id: data.scope_id,
        access_level: data.access_level,
        justification: data.justification,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        is_active: data.is_active,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        tenant_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return privilegedAccess
  }

  static async update(id: string, data: Partial<PrivilegedAccessFormData>): Promise<PrivilegedAccess> {
    const updateData: any = {
      user_id: data.user_id,
      scope_type: data.scope_type,
      scope_id: data.scope_id,
      access_level: data.access_level,
      justification: data.justification,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      is_active: data.is_active
    }

    const { data: privilegedAccess, error } = await supabase
      .from('privileged_access')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return privilegedAccess
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('privileged_access')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Audit operations
  static async updateAudit(id: string, auditNotes: string): Promise<PrivilegedAccess> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: privilegedAccess, error } = await supabase
      .from('privileged_access')
      .update({
        last_audit_date: new Date().toISOString(),
        audit_notes: auditNotes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return privilegedAccess
  }

  static async revoke(id: string): Promise<PrivilegedAccess> {
    const { data: privilegedAccess, error } = await supabase
      .from('privileged_access')
      .update({
        is_active: false
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return privilegedAccess
  }

  // Search and filtering
  static async search(query: string, filters: PrivilegedAccessFilters = {}): Promise<PrivilegedAccessListResponse> {
    const searchFilters = { ...filters, search: query }
    return this.list(searchFilters)
  }

  static async listByUser(userId: string, filters: PrivilegedAccessFilters = {}): Promise<PrivilegedAccessListResponse> {
    const userFilters = { ...filters, user_id: userId }
    return this.list(userFilters)
  }

  static async listByScopeType(scopeType: string, filters: PrivilegedAccessFilters = {}): Promise<PrivilegedAccessListResponse> {
    const scopeFilters = { ...filters, scope_type: scopeType }
    return this.list(scopeFilters)
  }

  static async listByScope(scopeId: string, filters: PrivilegedAccessFilters = {}): Promise<PrivilegedAccessListResponse> {
    const scopeFilters = { ...filters, scope_id: scopeId }
    return this.list(scopeFilters)
  }

  static async listNeedsAudit(): Promise<PrivilegedAccess[]> {
    const { data, error } = await supabase
      .from('privileged_access')
      .select(`
        *,
        users:user_id(email, full_name),
        approvers:approved_by(email, full_name)
      `)
      .eq('is_active', true)
      .or('last_audit_date.is.null,last_audit_date.lt.' + new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('last_audit_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Statistics
  static async getStats(): Promise<PrivilegedAccessStats> {
    const { data: privilegedAccess, error } = await supabase
      .from('privileged_access')
      .select('*')

    if (error) throw error

    const totalPrivilegedAccess = privilegedAccess?.length || 0
    const activePrivilegedAccess = privilegedAccess?.filter(pa => pa.is_active).length || 0

    const privilegedAccessByType = privilegedAccess?.reduce((acc, pa) => {
      acc[pa.scope_type] = (acc[pa.scope_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const privilegedAccessByLevel = privilegedAccess?.reduce((acc, pa) => {
      acc[pa.access_level] = (acc[pa.access_level] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const needsAudit = await this.listNeedsAudit()

    return {
      total_privileged_access: totalPrivilegedAccess,
      active_privileged_access: activePrivilegedAccess,
      privileged_access_by_type: privilegedAccessByType,
      privileged_access_by_level: privilegedAccessByLevel,
      needs_audit: needsAudit
    }
  }

  // MCP Methods
  static async mcpList(filters: PrivilegedAccessFilters = {}): Promise<PrivilegedAccessListResponse> {
    return this.list(filters)
  }

  static async mcpGet(id: string): Promise<PrivilegedAccess> {
    return this.get(id)
  }

  static async mcpCreate(data: PrivilegedAccessFormData): Promise<PrivilegedAccess> {
    return this.create(data)
  }

  static async mcpUpdate(id: string, data: Partial<PrivilegedAccessFormData>): Promise<PrivilegedAccess> {
    return this.update(id, data)
  }

  static async mcpDelete(id: string): Promise<void> {
    return this.delete(id)
  }

  // Helper methods
  static getScopeTypeLabel(scopeType: string): string {
    const typeMap: Record<string, string> = {
      system: 'System',
      database: 'Database',
      network: 'Network',
      application: 'Application',
      infrastructure: 'Infrastructure'
    }
    return typeMap[scopeType] || scopeType
  }

  static getScopeTypeColor(scopeType: string): string {
    const colorMap: Record<string, string> = {
      system: 'bg-red-100 text-red-800',
      database: 'bg-blue-100 text-blue-800',
      network: 'bg-green-100 text-green-800',
      application: 'bg-purple-100 text-purple-800',
      infrastructure: 'bg-orange-100 text-orange-800'
    }
    return colorMap[scopeType] || 'bg-gray-100 text-gray-800'
  }

  static getAccessLevelLabel(accessLevel: string): string {
    const levelMap: Record<string, string> = {
      read: 'Read',
      write: 'Write',
      admin: 'Admin',
      super_admin: 'Super Admin'
    }
    return levelMap[accessLevel] || accessLevel
  }

  static getAccessLevelColor(accessLevel: string): string {
    const colorMap: Record<string, string> = {
      read: 'bg-blue-100 text-blue-800',
      write: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-orange-100 text-orange-800',
      super_admin: 'bg-red-100 text-red-800'
    }
    return colorMap[accessLevel] || 'bg-gray-100 text-gray-800'
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

  static needsAudit(lastAuditDate: string | null, days: number = 90): boolean {
    if (!lastAuditDate) return true
    const auditDate = new Date(lastAuditDate)
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return auditDate < cutoffDate
  }
} 