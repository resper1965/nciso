import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Download, BarChart3 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Framework, getFrameworkTypeLabel, getFrameworkTypeColor, getCoverageColor, getCoverageStatus } from '@/models/framework'

interface FrameworkTableProps {
  frameworks: Framework[]
  onEdit?: (framework: Framework) => void
  onDelete?: (framework: Framework) => void
  onView?: (framework: Framework) => void
  onExport?: (framework: Framework) => void
  onAnalyze?: (framework: Framework) => void
  user?: any
  className?: string
  showActions?: boolean
}

export const FrameworkTable: React.FC<FrameworkTableProps> = ({
  frameworks,
  onEdit,
  onDelete,
  onView,
  onExport,
  onAnalyze,
  user,
  className,
  showActions = true
}) => {
  const { t } = useTranslation("common")

  const renderStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      deprecated: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {t(`status.${status}`)}
      </Badge>
    )
  }

  const renderCoverageProgress = (percentage: number) => {
    const status = getCoverageStatus(percentage)
    const color = getCoverageColor(percentage)
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{percentage}%</span>
          <Badge className={color}>
            {t(`coverage.${status}`)}
          </Badge>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    )
  }

  const renderActions = (framework: Framework) => {
    if (!showActions) return null

    const actions = []
    
    if (onView) {
      actions.push({
        label: t('actions.view'),
        icon: Eye,
        action: 'view',
        variant: 'ghost' as const
      })
    }
    
    if (onAnalyze) {
      actions.push({
        label: t('actions.analyze'),
        icon: BarChart3,
        action: 'analyze',
        variant: 'ghost' as const
      })
    }
    
    if (onEdit && user?.role === 'admin') {
      actions.push({
        label: t('actions.edit'),
        icon: Edit,
        action: 'edit',
        variant: 'ghost' as const
      })
    }
    
    if (onExport && (user?.role === 'admin' || user?.role === 'auditor')) {
      actions.push({
        label: t('actions.export'),
        icon: Download,
        action: 'export',
        variant: 'ghost' as const
      })
    }
    
    if (onDelete && user?.role === 'admin') {
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
                switch (action.action) {
                  case 'view':
                    onView?.(framework)
                    break
                  case 'analyze':
                    onAnalyze?.(framework)
                    break
                  case 'edit':
                    onEdit?.(framework)
                    break
                  case 'delete':
                    onDelete?.(framework)
                    break
                  case 'export':
                    onExport?.(framework)
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
            <TableHead>{t('table.framework.name')}</TableHead>
            <TableHead>{t('table.framework.type')}</TableHead>
            <TableHead>{t('table.framework.version')}</TableHead>
            <TableHead>{t('table.framework.status')}</TableHead>
            <TableHead>{t('table.framework.coverage')}</TableHead>
            <TableHead>{t('table.framework.controls')}</TableHead>
            {showActions && (
              <TableHead className="w-[50px]">
                {t('common.actions.actions')}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {frameworks.map((framework) => (
            <TableRow key={framework.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{framework.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {framework.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getFrameworkTypeColor(framework.type)}>
                  {getFrameworkTypeLabel(framework.type)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">{framework.version}</span>
              </TableCell>
              <TableCell>
                {renderStatusBadge(framework.status)}
              </TableCell>
              <TableCell className="w-[200px]">
                {renderCoverageProgress(framework.coverage_percentage)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">
                    {framework.mapped_controls}/{framework.total_controls}
                  </div>
                  <div className="text-muted-foreground">
                    {t('table.framework.mapped_controls')}
                  </div>
                </div>
              </TableCell>
              {showActions && (
                <TableCell>
                  {renderActions(framework)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Hook para usar FrameworkTable
export const useFrameworkTable = () => {
  const { t } = useTranslation("common")
  
  return {
    t
  }
} 