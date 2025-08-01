'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react'
import { Control, ControlFilters } from '@/lib/types/controls'
import { ControlsService } from '@/lib/services/controls'
import { ControlCard } from './control-card'
import { ControlForm } from './control-form'
import { useToast } from '@/hooks/use-toast'

interface ControlsListProps {
  onControlSelect?: (control: Control) => void
  showStats?: boolean
}

export function ControlsList({ onControlSelect, showStats = true }: ControlsListProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState<ControlFilters>({})
  const [showForm, setShowForm] = useState(false)
  const [editingControl, setEditingControl] = useState<Control | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const loadControls = async () => {
    try {
      setLoading(true)
      const response = await ControlsService.list(filters, page, 20)
      setControls(response.data)
      setTotalPages(response.total_pages)
      setTotalCount(response.count)
    } catch (error) {
      console.error('Error loading controls:', error)
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_loading'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadControls()
  }, [page, filters])

  const handleFilterChange = (key: keyof ControlFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearch = (value: string) => {
    handleFilterChange('search', value)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('controls.messages.confirm_delete'))) return

    try {
      await ControlsService.delete(id)
      toast({
        title: t('common.success'),
        description: t('controls.messages.deleted')
      })
      loadControls()
    } catch (error) {
      console.error('Error deleting control:', error)
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_deleting'),
        variant: 'destructive'
      })
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await ControlsService.duplicate(id)
      toast({
        title: t('common.success'),
        description: t('controls.messages.duplicated')
      })
      loadControls()
    } catch (error) {
      console.error('Error duplicating control:', error)
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_duplicating'),
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (control: Control) => {
    setEditingControl(control)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingControl(null)
  }

  const handleFormSubmit = () => {
    handleFormClose()
    loadControls()
  }

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

  if (showForm) {
    return (
      <ControlForm
        control={editingControl}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('controls.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('controls.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
          >
            {viewMode === 'table' ? 'Grid' : 'Table'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('controls.actions.create')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('controls.filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('common.search')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('controls.filters.search_placeholder')}
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('controls.fields.type')}
              </label>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => handleFilterChange('type', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('controls.filters.all_types')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('controls.filters.all_types')}</SelectItem>
                  <SelectItem value="preventive">{t('controls.types.preventive')}</SelectItem>
                  <SelectItem value="corrective">{t('controls.types.corrective')}</SelectItem>
                  <SelectItem value="detective">{t('controls.types.detective')}</SelectItem>
                  <SelectItem value="deterrent">{t('controls.types.deterrent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('controls.fields.status')}
              </label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('controls.filters.all_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('controls.filters.all_status')}</SelectItem>
                  <SelectItem value="active">{t('controls.status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('controls.status.inactive')}</SelectItem>
                  <SelectItem value="draft">{t('controls.status.draft')}</SelectItem>
                  <SelectItem value="archived">{t('controls.status.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('controls.fields.framework')}
              </label>
              <Select
                value={filters.framework || ''}
                onValueChange={(value) => handleFilterChange('framework', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('controls.filters.all_frameworks')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('controls.filters.all_frameworks')}</SelectItem>
                  <SelectItem value="iso27001">{t('controls.frameworks.iso27001')}</SelectItem>
                  <SelectItem value="nist">{t('controls.frameworks.nist')}</SelectItem>
                  <SelectItem value="cobit">{t('controls.frameworks.cobit')}</SelectItem>
                  <SelectItem value="custom">{t('controls.frameworks.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('controls.title')} ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {t('controls.messages.loading')}
              </div>
            </div>
          ) : controls.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('controls.messages.no_controls')}
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('controls.actions.create')}
                </Button>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('controls.fields.name')}</TableHead>
                  <TableHead>{t('controls.fields.type')}</TableHead>
                  <TableHead>{t('controls.fields.domain')}</TableHead>
                  <TableHead>{t('controls.fields.framework')}</TableHead>
                  <TableHead>{t('controls.fields.status')}</TableHead>
                  <TableHead>{t('controls.fields.effectiveness')}</TableHead>
                  <TableHead>{t('controls.fields.priority')}</TableHead>
                  <TableHead className="w-[100px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {controls.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{control.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {control.description.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`controls.types.${control.type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t(`controls.domains.${control.domain}`)}
                    </TableCell>
                    <TableCell>
                      {t(`controls.frameworks.${control.framework}`)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(control.status)}>
                        {t(`controls.status.${control.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${control.effectiveness}%` }}
                          />
                        </div>
                        <span className="text-sm">{control.effectiveness}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(control.priority)}>
                        {t(`controls.priorities.${control.priority}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onControlSelect?.(control)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('controls.actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(control)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('controls.actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(control.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t('controls.actions.duplicate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(control.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('controls.actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {controls.map((control) => (
                <ControlCard
                  key={control.id}
                  control={control}
                  onEdit={() => handleEdit(control)}
                  onDelete={() => handleDelete(control.id)}
                  onDuplicate={() => handleDuplicate(control.id)}
                  onSelect={() => onControlSelect?.(control)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 