'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, FolderTree, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { domainService } from '@/lib/services/isms'
import type { Domain, DomainFilters } from '@/lib/types/isms'
import { DomainForm } from './domain-form'

export function DomainList() {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  
  const [filters, setFilters] = useState<DomainFilters>({
    search: '',
    parent_id: '',
    level: undefined,
    is_active: undefined
  })

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true)
      const response = await domainService.list(filters, currentPage, 10)
      
      setDomains(response.data)
      setTotalPages(response.total_pages)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.domains.messages.error_loading'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters, currentPage])

  // Handlers
  const handleCreate = () => {
    setEditingDomain(null)
    setShowForm(true)
  }

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain)
    setShowForm(true)
  }

  const handleDelete = async (domain: Domain) => {
    if (!confirm(t('isms.domains.messages.confirm_delete'))) return

    try {
      await domainService.delete(domain.id)
      toast({
        title: t('common.success'),
        description: t('isms.domains.messages.deleted')
      })
      loadData()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.domains.messages.error_deleting'),
        variant: 'destructive'
      })
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingDomain(null)
    loadData()
  }

  const handleFilterChange = (key: keyof DomainFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      parent_id: '',
      level: undefined,
      is_active: undefined
    })
    setCurrentPage(1)
  }

  // Função para renderizar breadcrumb
  const renderBreadcrumb = (path: string) => {
    const parts = path.split(' > ')
    return (
      <div className="flex items-center gap-1 text-sm">
        {parts.map((part, index) => (
          <div key={index} className="flex items-center">
            <span className="text-muted-foreground">{part}</span>
            {index < parts.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
            )}
          </div>
        ))}
      </div>
    )
  }

  // Função para obter cor do nível
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'default'
      case 2: return 'secondary'
      case 3: return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('isms.domains.title')}</h1>
          <p className="text-muted-foreground">{t('isms.domains.description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('isms.domains.actions.create')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('isms.filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('isms.filters.search_placeholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.level?.toString() || ''}
              onValueChange={(value) => handleFilterChange('level', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('isms.domains.filters.all_levels')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('isms.domains.filters.all_levels')}</SelectItem>
                <SelectItem value="1">{t('isms.domains.filters.level_1')}</SelectItem>
                <SelectItem value="2">{t('isms.domains.filters.level_2')}</SelectItem>
                <SelectItem value="3">{t('isms.domains.filters.level_3')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.is_active?.toString() || ''}
              onValueChange={(value) => handleFilterChange('is_active', value === '' ? undefined : value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('isms.filters.all_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('isms.filters.all_status')}</SelectItem>
                <SelectItem value="true">{t('common.active')}</SelectItem>
                <SelectItem value="false">{t('common.inactive')}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              {t('isms.filters.clear_filters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('isms.domains.subtitle')}</CardTitle>
          <CardDescription>
            {domains.length} {t('common.items')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('isms.domains.messages.loading')}</div>
            </div>
          ) : domains.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('isms.domains.messages.no_domains')}</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('isms.domains.fields.name')}</TableHead>
                    <TableHead>{t('isms.domains.fields.path')}</TableHead>
                    <TableHead>{t('isms.domains.fields.level')}</TableHead>
                    <TableHead>{t('isms.domains.fields.description')}</TableHead>
                    <TableHead>{t('isms.domains.fields.is_active')}</TableHead>
                    <TableHead>{t('common.created_at')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{domain.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {domain.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          {renderBreadcrumb(domain.path)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLevelColor(domain.level)}>
                          {t('isms.domains.filters.level')} {domain.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {domain.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={domain.is_active ? 'default' : 'secondary'}>
                          {domain.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(domain.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(domain)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('isms.domains.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(domain)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('isms.domains.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <DomainForm
          domain={editingDomain}
          domains={domains}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 