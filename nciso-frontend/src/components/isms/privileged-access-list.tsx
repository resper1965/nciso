'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, User, Shield, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { PrivilegedAccessService } from '@/lib/services/privileged-access'
import { PrivilegedAccess, PrivilegedAccessFilters } from '@/lib/types/isms'
import { PrivilegedAccessForm } from './privileged-access-form'
import { PrivilegedAccessDetail } from './privileged-access-detail'

interface PrivilegedAccessListProps {
  className?: string
}

export function PrivilegedAccessList({ className }: PrivilegedAccessListProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [privilegedAccess, setPrivilegedAccess] = useState<PrivilegedAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<PrivilegedAccessFilters>({
    page: 1,
    limit: 10
  })
  
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedPrivilegedAccess, setSelectedPrivilegedAccess] = useState<PrivilegedAccess | null>(null)
  const [editingPrivilegedAccess, setEditingPrivilegedAccess] = useState<PrivilegedAccess | null>(null)

  useEffect(() => {
    loadPrivilegedAccess()
  }, [filters])

  const loadPrivilegedAccess = async () => {
    try {
      setLoading(true)
      const response = await PrivilegedAccessService.list(filters)
      setPrivilegedAccess(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
      setPage(response.page)
    } catch (error) {
      console.error('Error loading privileged access:', error)
      toast({
        title: t('privilegedAccess.loadError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (privilegedAccess: PrivilegedAccess) => {
    if (!confirm(t('privilegedAccess.deleteConfirm'))) return

    try {
      await PrivilegedAccessService.delete(privilegedAccess.id)
      toast({
        title: t('privilegedAccess.deleteSuccess'),
        description: t('privilegedAccess.deleteSuccessDesc')
      })
      loadPrivilegedAccess()
    } catch (error) {
      console.error('Error deleting privileged access:', error)
      toast({
        title: t('privilegedAccess.deleteError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleRevoke = async (privilegedAccess: PrivilegedAccess) => {
    if (!confirm(t('privilegedAccess.revokeConfirm'))) return

    try {
      await PrivilegedAccessService.revoke(privilegedAccess.id)
      toast({
        title: t('privilegedAccess.revokeSuccess'),
        description: t('privilegedAccess.revokeSuccessDesc')
      })
      loadPrivilegedAccess()
    } catch (error) {
      console.error('Error revoking privileged access:', error)
      toast({
        title: t('privilegedAccess.revokeError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const getScopeTypeBadge = (scopeType: string) => {
    const typeMap = {
      system: { label: t('privilegedAccess.scopeTypes.system'), variant: 'destructive' as const },
      database: { label: t('privilegedAccess.scopeTypes.database'), variant: 'default' as const },
      network: { label: t('privilegedAccess.scopeTypes.network'), variant: 'secondary' as const },
      application: { label: t('privilegedAccess.scopeTypes.application'), variant: 'outline' as const },
      infrastructure: { label: t('privilegedAccess.scopeTypes.infrastructure'), variant: 'default' as const }
    }

    const typeInfo = typeMap[scopeType as keyof typeof typeMap] || typeMap.system
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
  }

  const getAccessLevelBadge = (accessLevel: string) => {
    const levelMap = {
      read: { label: t('privilegedAccess.accessLevels.read'), variant: 'default' as const },
      write: { label: t('privilegedAccess.accessLevels.write'), variant: 'secondary' as const },
      admin: { label: t('privilegedAccess.accessLevels.admin'), variant: 'outline' as const },
      super_admin: { label: t('privilegedAccess.accessLevels.superAdmin'), variant: 'destructive' as const }
    }

    const levelInfo = levelMap[accessLevel as keyof typeof levelMap] || levelMap.read
    return <Badge variant={levelInfo.variant}>{levelInfo.label}</Badge>
  }

  const getStatusIcon = (privilegedAccess: PrivilegedAccess) => {
    if (!privilegedAccess.is_active) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    
    if (PrivilegedAccessService.isExpired(privilegedAccess.valid_until)) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    
    if (PrivilegedAccessService.isExpiringSoon(privilegedAccess.valid_until)) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    
    if (PrivilegedAccessService.needsAudit(privilegedAccess.last_audit_date)) {
      return <ClipboardCheck className="h-4 w-4 text-orange-500" />
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = (privilegedAccess: PrivilegedAccess) => {
    if (!privilegedAccess.is_active) {
      return t('privilegedAccess.status.revoked')
    }
    
    if (PrivilegedAccessService.isExpired(privilegedAccess.valid_until)) {
      return t('privilegedAccess.status.expired')
    }
    
    if (PrivilegedAccessService.isExpiringSoon(privilegedAccess.valid_until)) {
      return t('privilegedAccess.status.expiringSoon')
    }
    
    if (PrivilegedAccessService.needsAudit(privilegedAccess.last_audit_date)) {
      return t('privilegedAccess.status.needsAudit')
    }
    
    return t('privilegedAccess.status.active')
  }

  const getDaysUntilExpiry = (validUntil: string) => {
    return PrivilegedAccessService.getDaysUntilExpiry(validUntil)
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('privilegedAccess.title')}</h2>
          <p className="text-muted-foreground">{t('privilegedAccess.description')}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('privilegedAccess.create')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('privilegedAccess.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('privilegedAccess.searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.scope_type || ''}
              onValueChange={(value) => setFilters({ ...filters, scope_type: value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('privilegedAccess.scopeTypeFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('privilegedAccess.allScopeTypes')}</SelectItem>
                <SelectItem value="system">{t('privilegedAccess.scopeTypes.system')}</SelectItem>
                <SelectItem value="database">{t('privilegedAccess.scopeTypes.database')}</SelectItem>
                <SelectItem value="network">{t('privilegedAccess.scopeTypes.network')}</SelectItem>
                <SelectItem value="application">{t('privilegedAccess.scopeTypes.application')}</SelectItem>
                <SelectItem value="infrastructure">{t('privilegedAccess.scopeTypes.infrastructure')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.access_level || ''}
              onValueChange={(value) => setFilters({ ...filters, access_level: value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('privilegedAccess.accessLevelFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('privilegedAccess.allAccessLevels')}</SelectItem>
                <SelectItem value="read">{t('privilegedAccess.accessLevels.read')}</SelectItem>
                <SelectItem value="write">{t('privilegedAccess.accessLevels.write')}</SelectItem>
                <SelectItem value="admin">{t('privilegedAccess.accessLevels.admin')}</SelectItem>
                <SelectItem value="super_admin">{t('privilegedAccess.accessLevels.superAdmin')}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, limit: 10 })}
            >
              {t('privilegedAccess.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privileged Access Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('privilegedAccess.user')}</TableHead>
                <TableHead>{t('privilegedAccess.scope')}</TableHead>
                <TableHead>{t('privilegedAccess.accessLevel')}</TableHead>
                <TableHead>{t('privilegedAccess.validity')}</TableHead>
                <TableHead>{t('privilegedAccess.audit')}</TableHead>
                <TableHead>{t('privilegedAccess.status')}</TableHead>
                <TableHead>{t('privilegedAccess.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : privilegedAccess.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t('privilegedAccess.noPrivilegedAccess')}
                  </TableCell>
                </TableRow>
              ) : (
                privilegedAccess.map((pa) => (
                  <TableRow key={pa.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{pa.users?.full_name || pa.user_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pa.scope_id}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {getScopeTypeBadge(pa.scope_type)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getAccessLevelBadge(pa.access_level)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {new Date(pa.valid_from).toLocaleDateString()} - {new Date(pa.valid_until).toLocaleDateString()}
                        </div>
                        {PrivilegedAccessService.isExpiringSoon(pa.valid_until) && (
                          <div className="text-xs text-yellow-600">
                            {t('privilegedAccess.expiresIn', { days: getDaysUntilExpiry(pa.valid_until) })}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {pa.last_audit_date 
                            ? new Date(pa.last_audit_date).toLocaleDateString()
                            : t('privilegedAccess.noAudit')
                          }
                        </div>
                        {PrivilegedAccessService.needsAudit(pa.last_audit_date) && (
                          <div className="text-xs text-orange-600">
                            {t('privilegedAccess.needsAudit')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(pa)}
                        <span className="text-sm">{getStatusText(pa)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPrivilegedAccess(pa)
                            setShowDetail(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPrivilegedAccess(pa)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {pa.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(pa)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pa)}
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
        <PrivilegedAccessForm
          privilegedAccess={editingPrivilegedAccess}
          onClose={() => {
            setShowForm(false)
            setEditingPrivilegedAccess(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingPrivilegedAccess(null)
            loadPrivilegedAccess()
          }}
        />
      )}

      {showDetail && selectedPrivilegedAccess && (
        <PrivilegedAccessDetail
          privilegedAccessId={selectedPrivilegedAccess.id}
          onClose={() => {
            setShowDetail(false)
            setSelectedPrivilegedAccess(null)
          }}
          onUpdate={loadPrivilegedAccess}
        />
      )}
    </div>
  )
} 