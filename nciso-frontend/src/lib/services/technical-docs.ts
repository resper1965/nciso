import { supabase } from '@/lib/supabase'
import { 
  TechnicalDocument, 
  TechnicalDocumentFilters, 
  TechnicalDocumentFormData, 
  TechnicalDocumentListResponse,
  TechnicalDocumentStats
} from '@/lib/types/isms'

export class TechnicalDocumentsService {
  // CRUD Operations
  static async list(filters: TechnicalDocumentFilters = {}): Promise<TechnicalDocumentListResponse> {
    let query = supabase
      .from('technical_documents')
      .select('*', { count: 'exact' })

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.document_type) {
      query = query.eq('document_type', filters.document_type)
    }

    if (filters.scope_id) {
      query = query.eq('scope_id', filters.scope_id)
    }

    if (filters.asset_id) {
      query = query.eq('asset_id', filters.asset_id)
    }

    if (filters.control_id) {
      query = query.eq('control_id', filters.control_id)
    }

    if (filters.author_id) {
      query = query.eq('author_id', filters.author_id)
    }

    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public)
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

  static async get(id: string): Promise<TechnicalDocument> {
    const { data, error } = await supabase
      .from('technical_documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(data: TechnicalDocumentFormData): Promise<TechnicalDocument> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let file_path = ''
    let file_size = 0
    let file_type = ''

    if (data.file) {
      const fileExt = data.file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      file_path = `technical-docs/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(file_path, data.file)

      if (uploadError) throw uploadError

      file_size = data.file.size
      file_type = data.file.type
    }

    const { data: document, error } = await supabase
      .from('technical_documents')
      .insert({
        title: data.title,
        description: data.description,
        file_name: data.file?.name || '',
        file_path: file_path,
        file_size: file_size,
        file_type: file_type,
        document_type: data.document_type,
        scope_id: data.scope_id,
        asset_id: data.asset_id,
        control_id: data.control_id,
        version: data.version,
        author_id: user.id,
        tags: data.tags || [],
        is_public: data.is_public,
        tenant_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return document
  }

  static async update(id: string, data: Partial<TechnicalDocumentFormData>): Promise<TechnicalDocument> {
    const updateData: any = {
      title: data.title,
      description: data.description,
      document_type: data.document_type,
      scope_id: data.scope_id,
      asset_id: data.asset_id,
      control_id: data.control_id,
      version: data.version,
      tags: data.tags,
      is_public: data.is_public
    }

    if (data.file) {
      const fileExt = data.file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const file_path = `technical-docs/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(file_path, data.file)

      if (uploadError) throw uploadError

      updateData.file_name = data.file.name
      updateData.file_path = file_path
      updateData.file_size = data.file.size
      updateData.file_type = data.file.type
    }

    const { data: document, error } = await supabase
      .from('technical_documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return document
  }

  static async delete(id: string): Promise<void> {
    // Get document to delete file from storage
    const document = await this.get(id)
    
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
      }
    }

    const { error } = await supabase
      .from('technical_documents')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // File operations
  static async downloadFile(documentId: string): Promise<Blob> {
    const document = await this.get(documentId)
    
    if (!document.file_path) {
      throw new Error('No file associated with this document')
    }

    const { data, error } = await supabase.storage
      .from('documents')
      .download(document.file_path)

    if (error) throw error
    return data
  }

  static async getDownloadUrl(documentId: string): Promise<string> {
    const document = await this.get(documentId)
    
    if (!document.file_path) {
      throw new Error('No file associated with this document')
    }

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 3600) // 1 hour

    if (error) throw error
    return data.signedUrl
  }

  // Search and filtering
  static async search(query: string, filters: TechnicalDocumentFilters = {}): Promise<TechnicalDocumentListResponse> {
    const searchFilters = { ...filters, search: query }
    return this.list(searchFilters)
  }

  static async listByScope(scopeId: string, filters: TechnicalDocumentFilters = {}): Promise<TechnicalDocumentListResponse> {
    const scopeFilters = { ...filters, scope_id: scopeId }
    return this.list(scopeFilters)
  }

  static async listByAsset(assetId: string, filters: TechnicalDocumentFilters = {}): Promise<TechnicalDocumentListResponse> {
    const assetFilters = { ...filters, asset_id: assetId }
    return this.list(assetFilters)
  }

  static async listByControl(controlId: string, filters: TechnicalDocumentFilters = {}): Promise<TechnicalDocumentListResponse> {
    const controlFilters = { ...filters, control_id: controlId }
    return this.list(controlFilters)
  }

  // Statistics
  static async getStats(): Promise<TechnicalDocumentStats> {
    const { data: documents, error } = await supabase
      .from('technical_documents')
      .select('*')

    if (error) throw error

    const totalDocuments = documents?.length || 0
    const totalSize = documents?.reduce((acc, doc) => acc + (doc.file_size || 0), 0) || 0

    const documentsByType = documents?.reduce((acc, doc) => {
      acc[doc.document_type] = (acc[doc.document_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const recentDocuments = documents?.slice(0, 5) || []

    return {
      total_documents: totalDocuments,
      documents_by_type: documentsByType,
      total_size: totalSize,
      recent_documents: recentDocuments
    }
  }

  // MCP Methods
  static async mcpList(filters: TechnicalDocumentFilters = {}): Promise<TechnicalDocumentListResponse> {
    return this.list(filters)
  }

  static async mcpGet(id: string): Promise<TechnicalDocument> {
    return this.get(id)
  }

  static async mcpCreate(data: TechnicalDocumentFormData): Promise<TechnicalDocument> {
    return this.create(data)
  }

  static async mcpUpdate(id: string, data: Partial<TechnicalDocumentFormData>): Promise<TechnicalDocument> {
    return this.update(id, data)
  }

  static async mcpDelete(id: string): Promise<void> {
    return this.delete(id)
  }

  static async mcpUpload(data: TechnicalDocumentFormData): Promise<TechnicalDocument> {
    return this.create(data)
  }

  static async mcpSearch(query: string, filters: TechnicalDocumentFilters = {}): Promise<TechnicalDocumentListResponse> {
    return this.search(query, filters)
  }

  static async mcpListByScope(scopeId: string, filters: TechnicalDocumentFilters = {}): Promise<TechnicalDocumentListResponse> {
    return this.listByScope(scopeId, filters)
  }

  // Helper methods
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getDocumentTypeIcon(documentType: string): string {
    const iconMap: Record<string, string> = {
      infrastructure: '🏗️',
      application: '💻',
      engineering: '⚙️',
      security: '🔒',
      architecture: '📐',
      procedure: '📋'
    }
    return iconMap[documentType] || '📄'
  }

  static getDocumentTypeColor(documentType: string): string {
    const colorMap: Record<string, string> = {
      infrastructure: 'bg-blue-100 text-blue-800',
      application: 'bg-green-100 text-green-800',
      engineering: 'bg-purple-100 text-purple-800',
      security: 'bg-red-100 text-red-800',
      architecture: 'bg-yellow-100 text-yellow-800',
      procedure: 'bg-gray-100 text-gray-800'
    }
    return colorMap[documentType] || 'bg-gray-100 text-gray-800'
  }
} 