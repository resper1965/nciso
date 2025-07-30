import React from 'react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Download, Filter, Search, Settings } from "lucide-react"
import { useTranslation } from "react-i18next"
import { MCPModelType, getMCPModelMeta, MCPPermissions } from '@/models'

interface MCPActionsProps {
  type: MCPModelType
  onCreate?: () => void
  onExport?: () => void
  onFilter?: () => void
  onSearch?: () => void
  onSettings?: () => void
  onAction?: (action: string) => void
  user?: any
  className?: string
  showCreate?: boolean
  showExport?: boolean
  showFilter?: boolean
  showSearch?: boolean
  showSettings?: boolean
  variant?: 'default' | 'compact' | 'minimal'
}

export const MCPActions: React.FC<MCPActionsProps> = ({
  type,
  onCreate,
  onExport,
  onFilter,
  onSearch,
  onSettings,
  onAction,
  user,
  className,
  showCreate = true,
  showExport = true,
  showFilter = true,
  showSearch = true,
  showSettings = false,
  variant = 'default'
}) => {
  const { t } = useTranslation("common")
  const meta = getMCPModelMeta(type)
  const permissions = MCPPermissions[type]
  
  const canCreate = user ? permissions.canCreate(user, 'dev-tenant') : true
  const canExport = user ? true : true // Export geralmente disponível para todos

  const renderCreateButton = () => {
    if (!showCreate || !canCreate) return null

    return (
      <Button onClick={() => {
        onAction?.('create')
        onCreate?.()
      }}>
        <Plus className="mr-2 h-4 w-4" />
        {t(`${type}.actions.create`)}
      </Button>
    )
  }

  const renderSearchButton = () => {
    if (!showSearch) return null

    return (
      <Button variant="outline" onClick={() => {
        onAction?.('search')
        onSearch?.()
      }}>
        <Search className="mr-2 h-4 w-4" />
        {t('actions.search')}
      </Button>
    )
  }

  const renderFilterButton = () => {
    if (!showFilter) return null

    return (
      <Button variant="outline" onClick={() => {
        onAction?.('filter')
        onFilter?.()
      }}>
        <Filter className="mr-2 h-4 w-4" />
        {t('actions.filter')}
      </Button>
    )
  }

  const renderExportButton = () => {
    if (!showExport || !canExport) return null

    return (
      <Button variant="outline" onClick={() => {
        onAction?.('export')
        onExport?.()
      }}>
        <Download className="mr-2 h-4 w-4" />
        {t('actions.export')}
      </Button>
    )
  }

  const renderSettingsButton = () => {
    if (!showSettings) return null

    return (
      <Button variant="ghost" onClick={() => {
        onAction?.('settings')
        onSettings?.()
      }}>
        <Settings className="mr-2 h-4 w-4" />
        {t('actions.settings')}
      </Button>
    )
  }

  const renderDropdownActions = () => {
    const actions = []
    
    if (showSearch) {
      actions.push({
        label: t('actions.search'),
        icon: Search,
        action: 'search'
      })
    }
    
    if (showFilter) {
      actions.push({
        label: t('actions.filter'),
        icon: Filter,
        action: 'filter'
      })
    }
    
    if (showExport && canExport) {
      actions.push({
        label: t('actions.export'),
        icon: Download,
        action: 'export'
      })
    }
    
    if (showSettings) {
      actions.push({
        label: t('actions.settings'),
        icon: Settings,
        action: 'settings'
      })
    }

    if (actions.length === 0) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="mr-2 h-4 w-4" />
            {t('actions.more')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.action}
              onClick={() => {
                onAction?.(action.action)
                switch (action.action) {
                  case 'search':
                    onSearch?.()
                    break
                  case 'filter':
                    onFilter?.()
                    break
                  case 'export':
                    onExport?.()
                    break
                  case 'settings':
                    onSettings?.()
                    break
                }
              }}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const renderMinimalActions = () => (
    <div className="flex items-center space-x-2">
      {renderCreateButton()}
      {renderDropdownActions()}
    </div>
  )

  const renderCompactActions = () => (
    <div className="flex items-center space-x-2">
      {renderCreateButton()}
      {renderSearchButton()}
      {renderFilterButton()}
      {renderDropdownActions()}
    </div>
  )

  const renderDefaultActions = () => (
    <div className="flex items-center space-x-2">
      {renderCreateButton()}
      {renderSearchButton()}
      {renderFilterButton()}
      {renderExportButton()}
      {renderSettingsButton()}
    </div>
  )

  switch (variant) {
    case 'minimal':
      return renderMinimalActions()
    case 'compact':
      return renderCompactActions()
    default:
      return renderDefaultActions()
  }
}

// Componente para barra de ações completa
export const MCPActionBar: React.FC<{
  type: MCPModelType
  onCreate?: () => void
  onExport?: () => void
  onFilter?: () => void
  onSearch?: () => void
  onSettings?: () => void
  onAction?: (action: string) => void
  user?: any
  className?: string
  title?: string
  subtitle?: string
  variant?: 'default' | 'compact' | 'minimal'
}> = ({
  type,
  onCreate,
  onExport,
  onFilter,
  onSearch,
  onSettings,
  onAction,
  user,
  className,
  title,
  subtitle,
  variant = 'default'
}) => {
  const { t } = useTranslation("common")
  const meta = getMCPModelMeta(type)

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {title || t(`${type}.title`)}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      
      <MCPActions
        type={type}
        onCreate={onCreate}
        onExport={onExport}
        onFilter={onFilter}
        onSearch={onSearch}
        onSettings={onSettings}
        onAction={onAction}
        user={user}
        variant={variant}
      />
    </div>
  )
}

// Hook para usar MCPActions
export const useMCPActions = (type: MCPModelType) => {
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
export const MCPActionsExample: React.FC<{ type: MCPModelType }> = ({ type }) => {
  const handleCreate = () => {
    console.log('Create new item')
  }

  const handleExport = () => {
    console.log('Export data')
  }

  const handleFilter = () => {
    console.log('Open filter')
  }

  const handleSearch = () => {
    console.log('Open search')
  }

  const handleSettings = () => {
    console.log('Open settings')
  }

  const handleAction = (action: string) => {
    console.log('Action:', action)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Actions</h3>
        <MCPActions
          type={type}
          onCreate={handleCreate}
          onExport={handleExport}
          onFilter={handleFilter}
          onSearch={handleSearch}
          onSettings={handleSettings}
          onAction={handleAction}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Actions</h3>
        <MCPActions
          type={type}
          onCreate={handleCreate}
          onExport={handleExport}
          onFilter={handleFilter}
          onSearch={handleSearch}
          onAction={handleAction}
          variant="compact"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Minimal Actions</h3>
        <MCPActions
          type={type}
          onCreate={handleCreate}
          onAction={handleAction}
          variant="minimal"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Action Bar</h3>
        <MCPActionBar
          type={type}
          onCreate={handleCreate}
          onExport={handleExport}
          onFilter={handleFilter}
          onSearch={handleSearch}
          onSettings={handleSettings}
          onAction={handleAction}
        />
      </div>
    </div>
  )
} 