import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Download, Calendar, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { MCPModelType, getMCPModelMeta, MCPPermissions } from '@/models'
import { formatDate, getStatusColor, getStatusIcon } from '@/models/base'

interface MCPCardProps {
  type: MCPModelType
  item: any
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  onExport?: (item: any) => void
  onAction?: (action: string, item: any) => void
  user?: any
  className?: string
  showActions?: boolean
  showFooter?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

export const MCPCard: React.FC<MCPCardProps> = ({
  type,
  item,
  onEdit,
  onDelete,
  onView,
  onExport,
  onAction,
  user,
  className,
  showActions = true,
  showFooter = true,
  variant = 'default'
}) => {
  const { t } = useTranslation("common")
  const meta = getMCPModelMeta(type)
  const permissions = MCPPermissions[type]
  
  const Icon = meta.icon

  const renderField = (fieldKey: string, field: any) => {
    const value = item[fieldKey]
    
    switch (field.type) {
      case 'date':
        return (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(value)}</span>
          </div>
        )
        
      case 'select':
        return (
          <Badge variant="outline" className="text-xs">
            {t(field.options?.find((opt: any) => opt.value === value)?.label || value)}
          </Badge>
        )
        
      case 'boolean':
        return value ? (
          <Badge variant="default" className="text-xs">
            {t('common.yes')}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            {t('common.no')}
          </Badge>
        )
        
      case 'number':
        return (
          <span className="text-sm font-medium">
            {value?.toLocaleString()}
          </span>
        )
        
      case 'tags':
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {value.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 2}
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
        return (
          <span className="text-sm text-muted-foreground">
            {value || '-'}
          </span>
        )
    }
  }

  const canPerformAction = (action: string) => {
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

  const renderActions = () => {
    if (!showActions) return null

    const actions = []
    
    if (onView && canPerformAction('view')) {
      actions.push({
        label: t('actions.view'),
        icon: Eye,
        action: 'view',
        variant: 'ghost' as const
      })
    }
    
    if (onEdit && canPerformAction('edit')) {
      actions.push({
        label: t('actions.edit'),
        icon: Edit,
        action: 'edit',
        variant: 'ghost' as const
      })
    }
    
    if (onExport && canPerformAction('export')) {
      actions.push({
        label: t('actions.export'),
        icon: Download,
        action: 'export',
        variant: 'ghost' as const
      })
    }
    
    if (onDelete && canPerformAction('delete')) {
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

  const renderCompactCard = () => (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{item.name}</CardTitle>
          </div>
          {renderActions()}
        </div>
        <CardDescription className="text-xs line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          {Object.entries(meta.fields)
            .filter(([key, field]) => field.type === 'status' || field.type === 'select')
            .slice(0, 2)
            .map(([key, field]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t(field.label)}:
                </span>
                {renderField(key, field)}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderDetailedCard = () => (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{item.name}</CardTitle>
          </div>
          {renderActions()}
        </div>
        <CardDescription className="line-clamp-3">
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(meta.fields)
            .filter(([key, field]) => !['name', 'description'].includes(key))
            .slice(0, 6)
            .map(([key, field]) => (
              <div key={key} className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {t(field.label)}
                </span>
                <div className="text-sm">
                  {renderField(key, field)}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
      {showFooter && (
        <CardFooter className="pt-3">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{item.created_by || t('common.unknown')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(item.created_at)}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )

  const renderDefaultCard = () => (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{item.name}</CardTitle>
          </div>
          {renderActions()}
        </div>
        <CardDescription className="text-sm line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          {Object.entries(meta.fields)
            .filter(([key, field]) => field.type === 'status' || field.type === 'select')
            .slice(0, 3)
            .map(([key, field]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t(field.label)}
                </span>
                {renderField(key, field)}
              </div>
            ))}
        </div>
      </CardContent>
      {showFooter && (
        <CardFooter className="pt-3">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>{formatDate(item.created_at)}</span>
            <span>{item.created_by || t('common.unknown')}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  )

  switch (variant) {
    case 'compact':
      return renderCompactCard()
    case 'detailed':
      return renderDetailedCard()
    default:
      return renderDefaultCard()
  }
}

// Componente para grid de cards
export const MCPCardGrid: React.FC<{
  type: MCPModelType
  data: any[]
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  onExport?: (item: any) => void
  user?: any
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}> = ({ 
  type, 
  data, 
  onEdit, 
  onDelete, 
  onView, 
  onExport, 
  user, 
  variant = 'default',
  className 
}) => {
  const gridCols = variant === 'compact' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
                   variant === 'detailed' ? 'grid-cols-1 lg:grid-cols-2' :
                   'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid gap-4 ${gridCols} ${className}`}>
      {data.map((item, index) => (
        <MCPCard
          key={item.id || index}
          type={type}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onExport={onExport}
          user={user}
          variant={variant}
        />
      ))}
    </div>
  )
}

// Hook para usar MCPCard
export const useMCPCard = (type: MCPModelType) => {
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
export const MCPCardExample: React.FC<{ type: MCPModelType; data: any[] }> = ({ type, data }) => {
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Cards</h3>
        <MCPCardGrid
          type={type}
          data={data.slice(0, 4)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onExport={handleExport}
          variant="compact"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Cards</h3>
        <MCPCardGrid
          type={type}
          data={data.slice(0, 3)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onExport={handleExport}
          variant="default"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed Cards</h3>
        <MCPCardGrid
          type={type}
          data={data.slice(0, 2)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onExport={handleExport}
          variant="detailed"
        />
      </div>
    </div>
  )
} 