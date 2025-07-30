import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Download } from "lucide-react"
import { useTranslation } from "react-i18next"
import { MCPModelType, getMCPModelMeta, MCPPermissions } from '@/models'
import { formatDate, getStatusColor, getStatusIcon } from '@/models/base'

interface MCPTableProps {
  type: MCPModelType
  data: any[]
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  onExport?: (item: any) => void
  onAction?: (action: string, item: any) => void
  user?: any
  className?: string
  showActions?: boolean
  showPagination?: boolean
  pageSize?: number
}

export const MCPTable: React.FC<MCPTableProps> = ({
  type,
  data,
  onEdit,
  onDelete,
  onView,
  onExport,
  onAction,
  user,
  className,
  showActions = true,
  showPagination = false,
  pageSize = 10
}) => {
  const { t } = useTranslation("common")
  const meta = getMCPModelMeta(type)
  const permissions = MCPPermissions[type]
  
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // Paginação
  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = showPagination ? data.slice(startIndex, endIndex) : data

  const renderCell = (item: any, fieldKey: string, field: any) => {
    const value = item[fieldKey]
    
    switch (field.type) {
      case 'date':
        return formatDate(value)
        
      case 'select':
        return t(field.options?.find((opt: any) => opt.value === value)?.label || value)
        
      case 'boolean':
        return value ? t('common.yes') : t('common.no')
        
      case 'number':
        return value?.toLocaleString()
        
      case 'tags':
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {value.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 3}
              </Badge>
            )}
          </div>
        ) : null
        
      case 'status':
        const statusInfo = getStatusColor(value)
        return (
          <Badge className={statusInfo}>
            {t(`status.${value}`)}
          </Badge>
        )
        
      case 'relation':
        return value ? (
          <span className="text-sm text-muted-foreground">
            {value}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {t('common.none')}
          </span>
        )
        
      default:
        return value || '-'
    }
  }

  const canPerformAction = (action: string, item: any) => {
    if (!user) return true
    
    switch (action) {
      case 'edit':
        return permissions.canUpdate(user, item)
      case 'delete':
        return permissions.canDelete(user, item)
      case 'view':
        return permissions.canRead(user, item)
      case 'export':
        return permissions.canExport(user, item)
      default:
        return true
    }
  }

  const renderActions = (item: any) => {
    if (!showActions) return null

    const actions = []
    
    if (onView && canPerformAction('view', item)) {
      actions.push({
        label: t('actions.view'),
        icon: Eye,
        action: 'view',
        variant: 'ghost' as const
      })
    }
    
    if (onEdit && canPerformAction('edit', item)) {
      actions.push({
        label: t('actions.edit'),
        icon: Edit,
        action: 'edit',
        variant: 'ghost' as const
      })
    }
    
    if (onExport && canPerformAction('export', item)) {
      actions.push({
        label: t('actions.export'),
        icon: Download,
        action: 'export',
        variant: 'ghost' as const
      })
    }
    
    if (onDelete && canPerformAction('delete', item)) {
      actions.push({
        label: t('actions.delete'),
        icon: Trash2,
        action: 'delete',
        variant: 'ghost' as const,
        className: 'text-destructive hover:text-destructive'
      })
    }

    if (actions.length === 0) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.action}
              onClick={() => {
                onAction?.(action.action, item)
                switch (action.action) {
                  case 'view':
                    onView?.(item)
                    break
                  case 'edit':
                    onEdit?.(item)
                    break
                  case 'delete':
                    onDelete?.(item)
                    break
                  case 'export':
                    onExport?.(item)
                    break
                }
              }}
              className={action.className}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {Object.entries(meta.fields).map(([key, field]) => (
              <TableHead key={key}>
                {t(field.label)}
              </TableHead>
            ))}
            {showActions && (
              <TableHead className="w-[50px]">
                {t('common.actions.actions')}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((item, index) => (
            <TableRow key={item.id || index}>
              {Object.entries(meta.fields).map(([key, field]) => (
                <TableCell key={key}>
                  {renderCell(item, key, field)}
                </TableCell>
              ))}
              {showActions && (
                <TableCell>
                  {renderActions(item)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {t('table.showing', { 
              from: startIndex + 1, 
              to: Math.min(endIndex, data.length), 
              total: data.length 
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {t('table.previous')}
            </Button>
            <div className="text-sm">
              {t('table.page', { current: currentPage, total: totalPages })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t('table.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook para usar MCPTable
export const useMCPTable = (type: MCPModelType) => {
  const { t } = useTranslation("common")
  const meta = getMCPModelMeta(type)
  const permissions = MCPPermissions[type]
  
  return {
    meta,
    permissions,
    t
  }
}

// Componente de exemplo de uso
export const MCPTableExample: React.FC<{ type: MCPModelType; data: any[] }> = ({ type, data }) => {
  const handleEdit = (item: any) => {
    console.log('Edit item:', item)
  }

  const handleDelete = (item: any) => {
    console.log('Delete item:', item)
  }

  const handleView = (item: any) => {
    console.log('View item:', item)
  }

  const handleExport = (item: any) => {
    console.log('Export item:', item)
  }

  return (
    <MCPTable
      type={type}
      data={data}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      onExport={handleExport}
      showPagination={true}
      pageSize={5}
    />
  )
} 