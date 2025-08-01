'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Shield, User, Users, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { CredentialsRegistryService } from '@/lib/services/credentials-registry'
import { CredentialsRegistry } from '@/lib/types/isms'

interface CredentialsRegistryDetailProps {
  credentialId: string
  onClose: () => void
  onUpdate: () => void
}

export function CredentialsRegistryDetail({ credentialId, onClose, onUpdate }: CredentialsRegistryDetailProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [credential, setCredential] = useState<CredentialsRegistry | null>(null)

  useEffect(() => {
    loadCredential()
  }, [credentialId])

  const loadCredential = async () => {
    try {
      setLoading(true)
      const data = await CredentialsRegistryService.get(credentialId)
      setCredential(data)
    } catch (error) {
      console.error('Error loading credential:', error)
      toast({
        title: t('credentialsRegistry.loadError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!credential) return

    try {
      await CredentialsRegistryService.approve(credential.id, credential.id)
      toast({
        title: t('credentialsRegistry.approveSuccess'),
        description: t('credentialsRegistry.approveSuccessDesc')
      })
      loadCredential()
      onUpdate()
    } catch (error) {
      console.error('Error approving credential:', error)
      toast({
        title: t('credentialsRegistry.approveError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleRevoke = async () => {
    if (!credential) return

    if (!confirm(t('credentialsRegistry.revokeConfirm'))) return

    try {
      await CredentialsRegistryService.revoke(credential.id)
      toast({
        title: t('credentialsRegistry.revokeSuccess'),
        description: t('credentialsRegistry.revokeSuccessDesc')
      })
      loadCredential()
      onUpdate()
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
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    
    if (CredentialsRegistryService.isExpired(credential.valid_until)) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
    
    if (CredentialsRegistryService.isExpiringSoon(credential.valid_until)) {
      return <Clock className="h-5 w-5 text-yellow-500" />
    }
    
    return <CheckCircle className="h-5 w-5 text-green-500" />
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

  if (!credential) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('credentialsRegistry.notFound')}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('credentialsRegistry.notFoundDesc')}</p>
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
            <span>{t('credentialsRegistry.credentialDetails')}</span>
            <div className="flex items-center gap-2">
              {credential.is_active && !credential.approved_by && (
                <Button variant="outline" size="sm" onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('credentialsRegistry.approve')}
                </Button>
              )}
              {credential.is_active && (
                <Button variant="outline" size="sm" onClick={handleRevoke}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('credentialsRegistry.revoke')}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credential Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('credentialsRegistry.credentialInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.asset')}</p>
                  <p className="text-sm text-muted-foreground">{credential.assets?.name || credential.asset_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.accessType')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getAccessTypeBadge(credential.access_type)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.status')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(credential)}
                    <span className="text-sm">{getStatusText(credential)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.justification')}</p>
                  <p className="text-sm text-muted-foreground">{credential.justification}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holder Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {credential.user_id ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                {t('credentialsRegistry.holderInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.holderType')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {credential.user_id ? (
                      <>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{t('credentialsRegistry.individual')}</span>
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{t('credentialsRegistry.team')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.holder')}</p>
                  <p className="text-sm text-muted-foreground">
                    {credential.user_id 
                      ? (credential.users?.full_name || credential.user_id)
                      : (credential.teams?.name || credential.team_id)
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('credentialsRegistry.validityInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.validFrom')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(credential.valid_from).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.validUntil')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(credential.valid_until).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.daysRemaining')}</p>
                  <p className="text-sm text-muted-foreground">
                    {getDaysUntilExpiry(credential.valid_until)} {t('credentialsRegistry.days')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.status')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(credential)}
                    <span className="text-sm">{getStatusText(credential)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Information */}
          {credential.approved_by && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t('credentialsRegistry.approvalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">{t('credentialsRegistry.approvedBy')}</p>
                    <p className="text-sm text-muted-foreground">{credential.approved_by}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('credentialsRegistry.approvedAt')}</p>
                    <p className="text-sm text-muted-foreground">
                      {credential.approved_at ? new Date(credential.approved_at).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Asset Information */}
          {credential.assets && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('credentialsRegistry.assetInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">{t('credentialsRegistry.assetName')}</p>
                    <p className="text-sm text-muted-foreground">{credential.assets.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('credentialsRegistry.assetType')}</p>
                    <p className="text-sm text-muted-foreground">{credential.assets.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('credentialsRegistry.assetClassification')}</p>
                    <p className="text-sm text-muted-foreground">
                      {credential.assets.classification ? JSON.stringify(credential.assets.classification) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('credentialsRegistry.metadata')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.createdAt')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(credential.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.updatedAt')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(credential.updated_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.tenant')}</p>
                  <p className="text-sm text-muted-foreground">{credential.tenant_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('credentialsRegistry.id')}</p>
                  <p className="text-sm text-muted-foreground font-mono">{credential.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.close')}
            </Button>
            {credential.is_active && !credential.approved_by && (
              <Button onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('credentialsRegistry.approve')}
              </Button>
            )}
            {credential.is_active && (
              <Button variant="destructive" onClick={handleRevoke}>
                <XCircle className="h-4 w-4 mr-2" />
                {t('credentialsRegistry.revoke')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 