'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { ismsScopeService, organizationService } from '@/lib/services/isms'
import type { ISMSScope, ISMSScopeFilters, Organization } from '@/lib/types/isms'
import { ScopeForm } from './scope-form'

export function ScopeList() {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [scopes, setScopes] = useState<ISMSScope[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingScope, setEditingScope] = useState<ISMSScope | null>(null)
  
  const [filters, setFilters] = useState<ISMSScopeFilters>({
    search: '',
    organization_id: '',
    is_active: undefined
  })

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true)
      const [scopesResponse, orgsResponse] = await Promise.all([
        ismsScopeService.list(filters, currentPage, 10),
        organizationService.getHierarchy()
      ])
      
      setScopes(scopesResponse.data)
      setTotalPages(scopesResponse.total_pages)
      setOrganizations(orgsResponse)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.scope.messages.error_loading'),
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
    setEditingScope(null)
    setShowForm(true)
  }

  const handleEdit = (scope: ISMSScope) => {
    setEditingScope(scope)
    setShowForm(true)
  }

  const handleDelete = async (scope: ISMSScope) => {
    if (!confirm(t('isms.scope.messages.confirm_delete'))) return

    try {
      await ismsScopeService.delete(scope.id)
      toast({
        title: t('common.success'),
        description: t('isms.scope.messages.deleted')
      })
      loadData()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.scope.messages.error_deleting'),
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (scope: ISMSScope) => {
    try {
      await ismsScopeService.toggleActive(scope.id, !scope.is_active)
      toast({
        title: t('common.success'),
        description: scope.is_active 
          ? t('isms.scope.messages.deactivated')
          : t('isms.scope.messages.activated')
      })
      loadData()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.scope.messages.error_updating'),
        variant: 'destructive'
      })
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingScope(null)
    loadData()
  }

  const handleFilterChange = (key: keyof ISMSScopeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      organization_id: '',
      is_active: undefined
    })
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('isms.scope.title')}</h1>
          <p className="text-muted-foreground">{t('isms.scope.description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('isms.scope.actions.create')}
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
              value={filters.organization_id}
              onValueChange={(value) => handleFilterChange('organization_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('isms.filters.all_organizations')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('isms.filters.all_organizations')}</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
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
          <CardTitle>{t('isms.scope.subtitle')}</CardTitle>
          <CardDescription>
            {scopes.length} {t('common.items')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('isms.scope.messages.loading')}</div>
            </div>
          ) : scopes.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('isms.scope.messages.no_scopes')}</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('isms.scope.fields.name')}</TableHead>
                    <TableHead>{t('isms.scope.fields.organization')}</TableHead>
                    <TableHead>{t('isms.scope.fields.coverage')}</TableHead>
                    <TableHead>{t('isms.scope.fields.domains')}</TableHead>
                    <TableHead>{t('isms.scope.fields.is_active')}</TableHead>
                    <TableHead>{t('isms.scope.fields.created_at')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopes.map((scope) => (
                    <TableRow key={scope.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{scope.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {scope.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {scope.organizations?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {scope.coverage}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {scope.domain_ids?.slice(0, 2).map((domainId, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {domainId}
                            </Badge>
                          ))}
                          {scope.domain_ids && scope.domain_ids.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{scope.domain_ids.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={scope.is_active ? 'default' : 'secondary'}>
                          {scope.is_active ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {scope.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(scope.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => handleEdit(scope)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('isms.scope.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(scope)}>
                              {scope.is_active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {t('isms.scope.actions.deactivate')}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {t('isms.scope.actions.activate')}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(scope)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('isms.scope.actions.delete')}
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
        <ScopeForm
          scope={editingScope}
          organizations={organizations}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 