'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, Building2, Users, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { organizationService } from '@/lib/services/isms'
import type { Organization, OrganizationFilters } from '@/lib/types/isms'
import { OrganizationForm } from './organization-form'

export function OrganizationList() {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)
  
  const [filters, setFilters] = useState<OrganizationFilters>({
    search: '',
    type: '',
    parent_id: '',
    is_active: undefined
  })

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true)
      const response = await organizationService.list(filters, currentPage, 10)
      
      setOrganizations(response.data)
      setTotalPages(response.total_pages)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.organizations.messages.error_loading'),
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
    setEditingOrganization(null)
    setShowForm(true)
  }

  const handleEdit = (organization: Organization) => {
    setEditingOrganization(organization)
    setShowForm(true)
  }

  const handleDelete = async (organization: Organization) => {
    if (!confirm(t('isms.organizations.messages.confirm_delete'))) return

    try {
      await organizationService.delete(organization.id)
      toast({
        title: t('common.success'),
        description: t('isms.organizations.messages.deleted')
      })
      loadData()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.organizations.messages.error_deleting'),
        variant: 'destructive'
      })
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingOrganization(null)
    loadData()
  }

  const handleFilterChange = (key: keyof OrganizationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      parent_id: '',
      is_active: undefined
    })
    setCurrentPage(1)
  }

  // Função para obter ícone baseado no tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building2 className="h-4 w-4" />
      case 'department':
        return <GitBranch className="h-4 w-4" />
      case 'unit':
      case 'division':
        return <Users className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  // Função para obter nome da organização pai
  const getParentName = (parentId: string | undefined) => {
    if (!parentId) return '-'
    const parent = organizations.find(org => org.id === parentId)
    return parent?.name || '-'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('isms.organizations.title')}</h1>
          <p className="text-muted-foreground">{t('isms.organizations.description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('isms.organizations.actions.create')}
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
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('isms.filters.all_types')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('isms.filters.all_types')}</SelectItem>
                <SelectItem value="company">{t('isms.organizations.types.company')}</SelectItem>
                <SelectItem value="department">{t('isms.organizations.types.department')}</SelectItem>
                <SelectItem value="unit">{t('isms.organizations.types.unit')}</SelectItem>
                <SelectItem value="division">{t('isms.organizations.types.division')}</SelectItem>
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
          <CardTitle>{t('isms.organizations.subtitle')}</CardTitle>
          <CardDescription>
            {organizations.length} {t('common.items')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('isms.organizations.messages.loading')}</div>
            </div>
          ) : organizations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('isms.organizations.messages.no_organizations')}</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('isms.organizations.fields.name')}</TableHead>
                    <TableHead>{t('isms.organizations.fields.type')}</TableHead>
                    <TableHead>{t('isms.organizations.fields.parent')}</TableHead>
                    <TableHead>{t('isms.organizations.fields.description')}</TableHead>
                    <TableHead>{t('isms.organizations.fields.is_active')}</TableHead>
                    <TableHead>{t('common.created_at')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(org.type)}
                          <div>
                            <div className="font-medium">{org.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {org.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(`isms.organizations.types.${org.type}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getParentName(org.parent_id)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {org.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={org.is_active ? 'default' : 'secondary'}>
                          {org.is_active ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {org.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(org.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => handleEdit(org)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('isms.organizations.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(org)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('isms.organizations.actions.delete')}
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
        <OrganizationForm
          organization={editingOrganization}
          organizations={organizations}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 