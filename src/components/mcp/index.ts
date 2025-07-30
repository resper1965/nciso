// =====================================================
// MCP COMPONENTS - MODEL CONTENT PROTOCOL
// =====================================================

// Field components
export * from './mcp-field'

// Form components
export * from './mcp-form'

// Table components
export * from './mcp-table'

// Card components
export * from './mcp-card'

// Actions components
export * from './mcp-actions'

// =====================================================
// MCP COMPONENT FACTORY
// =====================================================

import { MCPForm } from './mcp-form'
import { MCPTable } from './mcp-table'
import { MCPCard, MCPCardGrid } from './mcp-card'
import { MCPActions, MCPActionBar } from './mcp-actions'
import { MCPModelType } from '@/models'

export class MCPComponentFactory {
  // Criar formulário MCP
  static createForm(type: MCPModelType, props: any) {
    return <MCPForm type={type} {...props} />
  }

  // Criar tabela MCP
  static createTable(type: MCPModelType, props: any) {
    return <MCPTable type={type} {...props} />
  }

  // Criar card MCP
  static createCard(type: MCPModelType, props: any) {
    return <MCPCard type={type} {...props} />
  }

  // Criar grid de cards MCP
  static createCardGrid(type: MCPModelType, props: any) {
    return <MCPCardGrid type={type} {...props} />
  }

  // Criar ações MCP
  static createActions(type: MCPModelType, props: any) {
    return <MCPActions type={type} {...props} />
  }

  // Criar barra de ações MCP
  static createActionBar(type: MCPModelType, props: any) {
    return <MCPActionBar type={type} {...props} />
  }
}

// =====================================================
// MCP PAGE TEMPLATES
// =====================================================

import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { MCPActionBar } from './mcp-actions'
import { MCPTable } from './mcp-table'
import { MCPCardGrid } from './mcp-card'
import { MCPForm } from './mcp-form'
import { MCPModelType, getMCPMockData } from '@/models'

// Template para página de listagem com tabela
export const MCPListPageTemplate: React.FC<{
  type: MCPModelType
  title?: string
  subtitle?: string
  onCreate?: () => void
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  onExport?: (item: any) => void
  user?: any
  data?: any[]
  showPagination?: boolean
  pageSize?: number
}> = ({
  type,
  title,
  subtitle,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
  user,
  data,
  showPagination = true,
  pageSize = 10
}) => {
  const mockData = data || getMCPMockData(type)

  return (
    <MainLayout>
      <div className="space-y-6">
        <MCPActionBar
          type={type}
          title={title}
          subtitle={subtitle}
          onCreate={onCreate}
          onExport={onExport}
        />
        
        <MCPTable
          type={type}
          data={mockData}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onExport={onExport}
          user={user}
          showPagination={showPagination}
          pageSize={pageSize}
        />
      </div>
    </MainLayout>
  )
}

// Template para página de listagem com cards
export const MCPCardPageTemplate: React.FC<{
  type: MCPModelType
  title?: string
  subtitle?: string
  onCreate?: () => void
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  onExport?: (item: any) => void
  user?: any
  data?: any[]
  variant?: 'default' | 'compact' | 'detailed'
}> = ({
  type,
  title,
  subtitle,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
  user,
  data,
  variant = 'default'
}) => {
  const mockData = data || getMCPMockData(type)

  return (
    <MainLayout>
      <div className="space-y-6">
        <MCPActionBar
          type={type}
          title={title}
          subtitle={subtitle}
          onCreate={onCreate}
          onExport={onExport}
        />
        
        <MCPCardGrid
          type={type}
          data={mockData}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onExport={onExport}
          user={user}
          variant={variant}
        />
      </div>
    </MainLayout>
  )
}

// Template para página de formulário
export const MCPFormPageTemplate: React.FC<{
  type: MCPModelType
  title?: string
  data?: any
  onSubmit: (data: any) => void
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
}> = ({
  type,
  title,
  data,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel
}) => {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {title || (data ? 'Edit' : 'Create')}
          </h1>
        </div>
        
        <MCPForm
          type={type}
          data={data}
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
        />
      </div>
    </MainLayout>
  )
}

// =====================================================
// MCP UTILITIES
// =====================================================

// Hook para página MCP completa
export const useMCPPage = (type: MCPModelType) => {
  const [data, setData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<any>(null)

  const handleCreate = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: any) => {
    // Implementar lógica de exclusão
    console.log('Delete:', item)
  }

  const handleView = (item: any) => {
    // Implementar lógica de visualização
    console.log('View:', item)
  }

  const handleExport = (item: any) => {
    // Implementar lógica de exportação
    console.log('Export:', item)
  }

  const handleSubmit = (formData: any) => {
    // Implementar lógica de submissão
    console.log('Submit:', formData)
    setIsFormOpen(false)
    setEditingItem(null)
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingItem(null)
  }

  return {
    data,
    loading,
    isFormOpen,
    editingItem,
    handleCreate,
    handleEdit,
    handleDelete,
    handleView,
    handleExport,
    handleSubmit,
    handleCancel
  }
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  factory: MCPComponentFactory,
  templates: {
    ListPage: MCPListPageTemplate,
    CardPage: MCPCardPageTemplate,
    FormPage: MCPFormPageTemplate
  },
  hooks: {
    useMCPPage
  }
} 