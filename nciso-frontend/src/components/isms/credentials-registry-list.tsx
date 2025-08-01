'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, User, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { CredentialsRegistryService } from '@/lib/services/credentials-registry'
import { CredentialsRegistry, CredentialsRegistryFilters } from '@/lib/types/isms'
import { CredentialsRegistryForm } from './credentials-registry-form'
import { CredentialsRegistryDetail } from './credentials-registry-detail'

interface CredentialsRegistryListProps {
  className?: string
}

export function CredentialsRegistryList({ className }: CredentialsRegistryListProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [credentials, setCredentials] = useState<CredentialsRegistry[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<CredentialsRegistryFilters>({
    page: 1,
    limit: 10
  })
  
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedCredential, setSelectedCredential] = useState<CredentialsRegistry | null>(null)
  const [editingCredential, setEditingCredential] = useState<CredentialsRegistry | null>(null)

  useEffect(() => {
    loadCredentials()
  }, [filters])

  const loadCredentials = async () => {
    try {
      setLoading(true)
      const response = await CredentialsRegistryService.list(filters)
      setCredentials(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
      setPage(response.page)
    } catch (error) {
      console.error('Error loading credentials:', error)
      toast({
        title: t('credentialsRegistry.loadError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (credential: CredentialsRegistry) => {
    if (!confirm(t('credentialsRegistry.deleteConfirm'))) return

    try {
      await CredentialsRegistryService.delete(credential.id)
      toast({
        title: t('credentialsRegistry.deleteSuccess'),
        description: t('credentialsRegistry.deleteSuccessDesc')
      })
      loadCredentials()
    } catch (error) {
      console.error('Error deleting credential:', error)
      toast({
        title: t('credentialsRegistry.deleteError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleApprove = async (credential: CredentialsRegistry) => {
    try {
      await CredentialsRegistryService.approve(credential.id, credential.id)
      toast({
        title: t('credentialsRegistry.approveSuccess'),
        description: t('credentialsRegistry.approveSuccessDesc')
      })
      loadCredentials()
    } catch (error) {
      console.error('Error approving credential:', error)
      toast({
        title: t('credentialsRegistry.approveError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleRevoke = async (credential: CredentialsRegistry) => {
    if (!confirm(t('credentialsRegistry.revokeConfirm'))) return

    try {
      await CredentialsRegistryService.revoke(credential.id)
      toast({
        title: t('credentialsRegistry.revokeSuccess'),
        description: t('credentialsRegistry.revokeSuccessDesc')
      })
      loadCredentials()
    } catch (error) {
      console.error('Error revoking credential:', error)
      toast({
        title: t('credentialsRegistry.revokeError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const getAccessTypeBadge = (accessType: string) => {
    const typeMap = {
      read: { label: t('credentialsRegistry.accessTypes.read'), variant: 'default' as const },
      write: { label: t('credentialsRegistry.accessTypes.write'), variant: 'secondary' as const },
      admin: { label: t('credentialsRegistry.accessTypes.admin'), variant: 'outline' as const },
      full: { label: t('credentialsRegistry.accessTypes.full'), variant: 'destructive' as const }
    }

    const typeInfo = typeMap[accessType as keyof typeof typeMap] || typeMap.read
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
  }

  const getStatusIcon = (credential: CredentialsRegistry) => {
    if (!credential.is_active) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    
    if (CredentialsRegistryService.isExpired(credential.valid_until)) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    
    if (CredentialsRegistryService.isExpiringSoon(credential.valid_until)) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = (credential: CredentialsRegistry) => {
    if (!credential.is_active) {
      return t('credentialsRegistry.status.revoked')
    }
    
    if (CredentialsRegistryService.isExpired(credential.valid_until)) {
      return t('credentialsRegistry.status.expired')
    }
    
    if (CredentialsRegistryService.isExpiringSoon(credential.valid_until)) {
      return t('credentialsRegistry.status.expiringSoon')
    }
    
    return t('credentialsRegistry.status.active')
  }

  const getDaysUntilExpiry = (validUntil: string) => {
    return CredentialsRegistryService.getDaysUntilExpiry(validUntil)
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('credentialsRegistry.title')}</h2>
          <p className="text-muted-foreground">{t('credentialsRegistry.description')}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('credentialsRegistry.create')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('credentialsRegistry.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('credentialsRegistry.searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.access_type || ''}
              onValueChange={(value) => setFilters({ ...filters, access_type: value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('credentialsRegistry.accessTypeFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('credentialsRegistry.allAccessTypes')}</SelectItem>
                <SelectItem value="read">{t('credentialsRegistry.accessTypes.read')}</SelectItem>
                <SelectItem value="write">{t('credentialsRegistry.accessTypes.write')}</SelectItem>
                <SelectItem value="admin">{t('credentialsRegistry.accessTypes.admin')}</SelectItem>
                <SelectItem value="full">{t('credentialsRegistry.accessTypes.full')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.is_active?.toString() || ''}
              onValueChange={(value) => setFilters({ ...filters, is_active: value === 'true', page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('credentialsRegistry.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('credentialsRegistry.allStatuses')}</SelectItem>
                <SelectItem value="true">{t('credentialsRegistry.status.active')}</SelectItem>
                <SelectItem value="false">{t('credentialsRegistry.status.inactive')}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, limit: 10 })}
            >
              {t('credentialsRegistry.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('credentialsRegistry.asset')}</TableHead>
                <TableHead>{t('credentialsRegistry.holder')}</TableHead>
                <TableHead>{t('credentialsRegistry.accessType')}</TableHead>
                <TableHead>{t('credentialsRegistry.validity')}</TableHead>
                <TableHead>{t('credentialsRegistry.status')}</TableHead>
                <TableHead>{t('credentialsRegistry.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : credentials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t('credentialsRegistry.noCredentials')}
                  </TableCell>
                </TableRow>
              ) : (
                credentials.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{credential.assets?.name || credential.asset_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {credential.assets?.type || 'Unknown type'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {credential.user_id ? (
                          <>
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{credential.users?.full_name || credential.user_id}</span>
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{credential.teams?.name || credential.team_id}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getAccessTypeBadge(credential.access_type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {new Date(credential.valid_from).toLocaleDateString()} - {new Date(credential.valid_until).toLocaleDateString()}
                        </div>
                        {CredentialsRegistryService.isExpiringSoon(credential.valid_until) && (
                          <div className="text-xs text-yellow-600">
                            {t('credentialsRegistry.expiresIn', { days: getDaysUntilExpiry(credential.valid_until) })}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(credential)}
                        <span className="text-sm">{getStatusText(credential)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCredential(credential)
                            setShowDetail(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCredential(credential)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {credential.is_active && !credential.approved_by && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(credential)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {credential.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(credential)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(credential)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setFilters({ ...filters, page: newPage })}
          />
        </div>
      )}

      {/* Forms */}
      {showForm && (
        <CredentialsRegistryForm
          credential={editingCredential}
          onClose={() => {
            setShowForm(false)
            setEditingCredential(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingCredential(null)
            loadCredentials()
          }}
        />
      )}

      {showDetail && selectedCredential && (
        <CredentialsRegistryDetail
          credentialId={selectedCredential.id}
          onClose={() => {
            setShowDetail(false)
            setSelectedCredential(null)
          }}
          onUpdate={loadCredentials}
        />
      )}
    </div>
  )
} 