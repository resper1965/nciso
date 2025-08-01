'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Shield, Database, User, Monitor, Server, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { assetService, organizationService } from '@/lib/services/isms'
import type { Asset, AssetFilters, Organization } from '@/lib/types/isms'
import { AssetForm } from './asset-form'

export function AssetList() {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [assets, setAssets] = useState<Asset[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  
  const [filters, setFilters] = useState<AssetFilters>({
    search: '',
    type: undefined,
    organization_id: '',
    classification_level: undefined,
    is_active: undefined
  })

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true)
      const [assetsResponse, orgsResponse] = await Promise.all([
        assetService.list(filters, currentPage, 10),
        organizationService.getHierarchy()
      ])
      
      setAssets(assetsResponse.data)
      setTotalPages(assetsResponse.total_pages)
      setOrganizations(orgsResponse)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.assets.messages.error_loading'),
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
    setEditingAsset(null)
    setShowForm(true)
  }

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setShowForm(true)
  }

  const handleDelete = async (asset: Asset) => {
    if (!confirm(t('isms.assets.messages.confirm_delete'))) return

    try {
      await assetService.delete(asset.id)
      toast({
        title: t('common.success'),
        description: t('isms.assets.messages.deleted')
      })
      loadData()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('isms.assets.messages.error_deleting'),
        variant: 'destructive'
      })
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingAsset(null)
    loadData()
  }

  const handleFilterChange = (key: keyof AssetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: undefined,
      organization_id: '',
      classification_level: undefined,
      is_active: undefined
    })
    setCurrentPage(1)
  }

  // Função para obter ícone baseado no tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical':
        return <Server className="h-4 w-4" />
      case 'digital':
        return <Database className="h-4 w-4" />
      case 'person':
        return <User className="h-4 w-4" />
      case 'software':
        return <Monitor className="h-4 w-4" />
      case 'infrastructure':
        return <Shield className="h-4 w-4" />
      case 'data':
        return <FileText className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  // Função para obter cor da classificação
  const getClassificationColor = (classification: any) => {
    const maxLevel = Math.max(
      classification.confidentiality === 'critical' ? 4 : 
      classification.confidentiality === 'high' ? 3 :
      classification.confidentiality === 'medium' ? 2 : 1,
      classification.integrity === 'critical' ? 4 :
      classification.integrity === 'high' ? 3 :
      classification.integrity === 'medium' ? 2 : 1,
      classification.availability === 'critical' ? 4 :
      classification.availability === 'high' ? 3 :
      classification.availability === 'medium' ? 2 : 1
    )

    switch (maxLevel) {
      case 4: return 'destructive' // critical
      case 3: return 'default' // high
      case 2: return 'secondary' // medium
      default: return 'outline' // low
    }
  }

  // Função para obter texto da classificação
  const getClassificationText = (classification: any) => {
    const maxLevel = Math.max(
      classification.confidentiality === 'critical' ? 4 : 
      classification.confidentiality === 'high' ? 3 :
      classification.confidentiality === 'medium' ? 2 : 1,
      classification.integrity === 'critical' ? 4 :
      classification.integrity === 'high' ? 3 :
      classification.integrity === 'medium' ? 2 : 1,
      classification.availability === 'critical' ? 4 :
      classification.availability === 'high' ? 3 :
      classification.availability === 'medium' ? 2 : 1
    )

    switch (maxLevel) {
      case 4: return t('isms.assets.classification.critical')
      case 3: return t('isms.assets.classification.high')
      case 2: return t('isms.assets.classification.medium')
      default: return t('isms.assets.classification.low')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('isms.assets.title')}</h1>
          <p className="text-muted-foreground">{t('isms.assets.description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('isms.assets.actions.create')}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              value={filters.type || ''}
              onValueChange={(value) => handleFilterChange('type', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('isms.filters.all_types')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('isms.filters.all_types')}</SelectItem>
                <SelectItem value="physical">{t('isms.assets.types.physical')}</SelectItem>
                <SelectItem value="digital">{t('isms.assets.types.digital')}</SelectItem>
                <SelectItem value="person">{t('isms.assets.types.person')}</SelectItem>
                <SelectItem value="software">{t('isms.assets.types.software')}</SelectItem>
                <SelectItem value="infrastructure">{t('isms.assets.types.infrastructure')}</SelectItem>
                <SelectItem value="data">{t('isms.assets.types.data')}</SelectItem>
              </SelectContent>
            </Select>

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
              value={filters.classification_level || ''}
              onValueChange={(value) => handleFilterChange('classification_level', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('isms.filters.all_classifications')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('isms.filters.all_classifications')}</SelectItem>
                <SelectItem value="critical">{t('isms.assets.classification.critical')}</SelectItem>
                <SelectItem value="high">{t('isms.assets.classification.high')}</SelectItem>
                <SelectItem value="medium">{t('isms.assets.classification.medium')}</SelectItem>
                <SelectItem value="low">{t('isms.assets.classification.low')}</SelectItem>
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
          <CardTitle>{t('isms.assets.subtitle')}</CardTitle>
          <CardDescription>
            {assets.length} {t('common.items')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('isms.assets.messages.loading')}</div>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('isms.assets.messages.no_assets')}</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('isms.assets.fields.name')}</TableHead>
                    <TableHead>{t('isms.assets.fields.type')}</TableHead>
                    <TableHead>{t('isms.assets.fields.owner')}</TableHead>
                    <TableHead>{t('isms.assets.fields.classification')}</TableHead>
                    <TableHead>{t('isms.assets.fields.organization')}</TableHead>
                    <TableHead>{t('isms.assets.fields.location')}</TableHead>
                    <TableHead>{t('isms.assets.fields.value')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(asset.type)}
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {asset.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(`isms.assets.types.${asset.type}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {asset.users?.name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getClassificationColor(asset.classification)}>
                          {getClassificationText(asset.classification)}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          C:{asset.classification.confidentiality} | 
                          I:{asset.classification.integrity} | 
                          A:{asset.classification.availability}
                        </div>
                      </TableCell>
                      <TableCell>
                        {asset.organizations?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {asset.location || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {asset.value ? `$${asset.value.toLocaleString()}` : '-'}
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
                            <DropdownMenuItem onClick={() => handleEdit(asset)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('isms.assets.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(asset)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('isms.assets.actions.delete')}
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
        <AssetForm
          asset={editingAsset}
          organizations={organizations}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 