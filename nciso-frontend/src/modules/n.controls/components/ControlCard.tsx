'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Copy, Eye, Shield, Target, Zap } from 'lucide-react'
import { Control } from '../types'

interface ControlCardProps {
  control: Control
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onSelect?: () => void
}

export function ControlCard({ 
  control, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onSelect 
}: ControlCardProps) {
  const { t } = useTranslation()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Shield className="h-4 w-4" />
      case 'corrective': return <Target className="h-4 w-4" />
      case 'detective': return <Zap className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 80) return 'bg-green-600'
    if (effectiveness >= 60) return 'bg-yellow-600'
    if (effectiveness >= 40) return 'bg-orange-600'
    return 'bg-red-600'
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {control.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>
                <Eye className="h-4 w-4 mr-2" />
                {t('controls.actions.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                {t('controls.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                {t('controls.actions.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('controls.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {control.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getTypeIcon(control.type)}
              {t(`controls.types.${control.type}`)}
            </Badge>
            
            <Badge className={getStatusColor(control.status)}>
              {t(`controls.status.${control.status}`)}
            </Badge>
            
            {control.priority && (
              <Badge className={getPriorityColor(control.priority)}>
                {t(`controls.priorities.${control.priority}`)}
              </Badge>
            )}
          </div>

          {control.frameworks && control.frameworks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {control.frameworks.map((framework, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {t(`controls.frameworks.${framework}`)}
                </Badge>
              ))}
            </div>
          )}

          {control.domain && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{t('controls.fields.domain')}:</span>{' '}
              {t(`controls.domains.${control.domain}`)}
            </div>
          )}

          {control.effectiveness !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{t('controls.fields.effectiveness')}</span>
                <span>{control.effectiveness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getEffectivenessColor(control.effectiveness)}`}
                  style={{ width: `${control.effectiveness}%` }}
                />
              </div>
            </div>
          )}

          {control.owner && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{t('controls.fields.owner')}:</span>{' '}
              {control.owner}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 