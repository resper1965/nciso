'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Shield, User, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, ClipboardCheck, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { PrivilegedAccessService } from '@/lib/services/privileged-access'
import { PrivilegedAccess } from '@/lib/types/isms'

interface PrivilegedAccessDetailProps {
  privilegedAccessId: string
  onClose: () => void
  onUpdate: () => void
}

export function PrivilegedAccessDetail({ privilegedAccessId, onClose, onUpdate }: PrivilegedAccessDetailProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [privilegedAccess, setPrivilegedAccess] = useState<PrivilegedAccess | null>(null)
  const [auditNotes, setAuditNotes] = useState('')
  const [showAuditForm, setShowAuditForm] = useState(false)

  useEffect(() => {
    loadPrivilegedAccess()
  }, [privilegedAccessId])

  const loadPrivilegedAccess = async () => {
    try {
      setLoading(true)
      const data = await PrivilegedAccessService.get(privilegedAccessId)
      setPrivilegedAccess(data)
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

  const handleRevoke = async () => {
    if (!privilegedAccess) return

    if (!confirm(t('privilegedAccess.revokeConfirm'))) return

    try {
      await PrivilegedAccessService.revoke(privilegedAccess.id)
      toast({
        title: t('privilegedAccess.revokeSuccess'),
        description: t('privilegedAccess.revokeSuccessDesc')
      })
      loadPrivilegedAccess()
      onUpdate()
    } catch (error) {
      console.error('Error revoking privileged access:', error)
      toast({
        title: t('privilegedAccess.revokeError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateAudit = async () => {
    if (!privilegedAccess) return

    try {
      await PrivilegedAccessService.updateAudit(privilegedAccess.id, auditNotes)
      toast({
        title: t('privilegedAccess.auditUpdateSuccess'),
        description: t('privilegedAccess.auditUpdateSuccessDesc')
      })
      setShowAuditForm(false)
      setAuditNotes('')
      loadPrivilegedAccess()
      onUpdate()
    } catch (error) {
      console.error('Error updating audit:', error)
      toast({
        title: t('privilegedAccess.auditUpdateError'),
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
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    
    if (PrivilegedAccessService.isExpired(privilegedAccess.valid_until)) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
    
    if (PrivilegedAccessService.isExpiringSoon(privilegedAccess.valid_until)) {
      return <Clock className="h-5 w-5 text-yellow-500" />
    }
    
    if (PrivilegedAccessService.needsAudit(privilegedAccess.last_audit_date)) {
      return <ClipboardCheck className="h-5 w-5 text-orange-500" />
    }
    
    return <CheckCircle className="h-5 w-5 text-green-500" />
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

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('common.loading')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!privilegedAccess) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('privilegedAccess.notFound')}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('privilegedAccess.notFoundDesc')}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('privilegedAccess.privilegedAccessDetails')}</span>
            <div className="flex items-center gap-2">
              {privilegedAccess.is_active && (
                <Button variant="outline" size="sm" onClick={() => setShowAuditForm(true)}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  {t('privilegedAccess.updateAudit')}
                </Button>
              )}
              {privilegedAccess.is_active && (
                <Button variant="outline" size="sm" onClick={handleRevoke}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('privilegedAccess.revoke')}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privileged Access Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('privilegedAccess.privilegedAccessInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.user')}</p>
                  <p className="text-sm text-muted-foreground">{privilegedAccess.users?.full_name || privilegedAccess.user_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.scopeType')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getScopeTypeBadge(privilegedAccess.scope_type)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.scopeId')}</p>
                  <p className="text-sm text-muted-foreground">{privilegedAccess.scope_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.accessLevel')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getAccessLevelBadge(privilegedAccess.access_level)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.status')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(privilegedAccess)}
                    <span className="text-sm">{getStatusText(privilegedAccess)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.justification')}</p>
                  <p className="text-sm text-muted-foreground">{privilegedAccess.justification}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('privilegedAccess.validityInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.validFrom')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(privilegedAccess.valid_from).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.validUntil')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(privilegedAccess.valid_until).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.daysRemaining')}</p>
                  <p className="text-sm text-muted-foreground">
                    {getDaysUntilExpiry(privilegedAccess.valid_until)} {t('privilegedAccess.days')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.status')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(privilegedAccess)}
                    <span className="text-sm">{getStatusText(privilegedAccess)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t('privilegedAccess.approvalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.approvedBy')}</p>
                  <p className="text-sm text-muted-foreground">
                    {privilegedAccess.approvers?.full_name || privilegedAccess.approved_by}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.approvedAt')}</p>
                  <p className="text-sm text-muted-foreground">
                    {privilegedAccess.approved_at ? new Date(privilegedAccess.approved_at).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                {t('privilegedAccess.auditInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.lastAuditDate')}</p>
                  <p className="text-sm text-muted-foreground">
                    {privilegedAccess.last_audit_date 
                      ? new Date(privilegedAccess.last_audit_date).toLocaleDateString()
                      : t('privilegedAccess.noAudit')
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.auditStatus')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {PrivilegedAccessService.needsAudit(privilegedAccess.last_audit_date) ? (
                      <Badge variant="destructive">{t('privilegedAccess.needsAudit')}</Badge>
                    ) : (
                      <Badge variant="default">{t('privilegedAccess.auditUpToDate')}</Badge>
                    )}
                  </div>
                </div>
                {privilegedAccess.audit_notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">{t('privilegedAccess.auditNotes')}</p>
                    <p className="text-sm text-muted-foreground">{privilegedAccess.audit_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('privilegedAccess.metadata')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.createdAt')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(privilegedAccess.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.updatedAt')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(privilegedAccess.updated_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.tenant')}</p>
                  <p className="text-sm text-muted-foreground">{privilegedAccess.tenant_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('privilegedAccess.id')}</p>
                  <p className="text-sm text-muted-foreground font-mono">{privilegedAccess.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.close')}
            </Button>
            {privilegedAccess.is_active && (
              <Button variant="outline" onClick={() => setShowAuditForm(true)}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                {t('privilegedAccess.updateAudit')}
              </Button>
            )}
            {privilegedAccess.is_active && (
              <Button variant="destructive" onClick={handleRevoke}>
                <XCircle className="h-4 w-4 mr-2" />
                {t('privilegedAccess.revoke')}
              </Button>
            )}
          </div>
        </div>

        {/* Audit Form */}
        {showAuditForm && (
          <Dialog open onOpenChange={() => setShowAuditForm(false)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('privilegedAccess.updateAudit')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="audit_notes">{t('privilegedAccess.auditNotes')}</Label>
                  <Textarea
                    id="audit_notes"
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder={t('privilegedAccess.auditNotesPlaceholder')}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAuditForm(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleUpdateAudit}>
                    {t('privilegedAccess.updateAudit')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
} 