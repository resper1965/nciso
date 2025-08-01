'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Shield, User, Calendar, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { PrivilegedAccessService } from '@/lib/services/privileged-access'
import { PrivilegedAccess, PrivilegedAccessFormData } from '@/lib/types/isms'

interface PrivilegedAccessFormProps {
  privilegedAccess?: PrivilegedAccess | null
  onClose: () => void
  onSuccess: () => void
}

export function PrivilegedAccessForm({ privilegedAccess, onClose, onSuccess }: PrivilegedAccessFormProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PrivilegedAccessFormData>({
    user_id: '',
    scope_type: 'system',
    scope_id: '',
    access_level: 'read',
    justification: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  })
  
  const [users, setUsers] = useState<any[]>([])
  const [scopes, setScopes] = useState<any[]>([])

  const isEditing = !!privilegedAccess

  useEffect(() => {
    loadInitialData()
    if (privilegedAccess) {
      setFormData({
        user_id: privilegedAccess.user_id,
        scope_type: privilegedAccess.scope_type,
        scope_id: privilegedAccess.scope_id,
        access_level: privilegedAccess.access_level,
        justification: privilegedAccess.justification,
        valid_from: privilegedAccess.valid_from.split('T')[0],
        valid_until: privilegedAccess.valid_until.split('T')[0],
        is_active: privilegedAccess.is_active
      })
    }
  }, [privilegedAccess])

  const loadInitialData = async () => {
    try {
      // TODO: Load users and scopes when available
      setUsers([])
      setScopes([])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id || !formData.scope_type || !formData.scope_id || !formData.justification || !formData.valid_from || !formData.valid_until) {
      toast({
        title: t('privilegedAccess.validationError'),
        description: t('privilegedAccess.requiredFields'),
        variant: 'destructive'
      })
      return
    }

    if (new Date(formData.valid_until) <= new Date(formData.valid_from)) {
      toast({
        title: t('privilegedAccess.invalidDates'),
        description: t('privilegedAccess.invalidDatesDesc'),
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      if (isEditing) {
        await PrivilegedAccessService.update(privilegedAccess!.id, formData)
        toast({
          title: t('privilegedAccess.updateSuccess'),
          description: t('privilegedAccess.updateSuccessDesc')
        })
      } else {
        await PrivilegedAccessService.create(formData)
        toast({
          title: t('privilegedAccess.createSuccess'),
          description: t('privilegedAccess.createSuccessDesc')
        })
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving privileged access:', error)
      toast({
        title: t('privilegedAccess.saveError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getScopeTypeLabel = (scopeType: string) => {
    return PrivilegedAccessService.getScopeTypeLabel(scopeType)
  }

  const getScopeTypeColor = (scopeType: string) => {
    return PrivilegedAccessService.getScopeTypeColor(scopeType)
  }

  const getAccessLevelLabel = (accessLevel: string) => {
    return PrivilegedAccessService.getAccessLevelLabel(accessLevel)
  }

  const getAccessLevelColor = (accessLevel: string) => {
    return PrivilegedAccessService.getAccessLevelColor(accessLevel)
  }

  const getDaysUntilExpiry = () => {
    if (!formData.valid_until) return 0
    return PrivilegedAccessService.getDaysUntilExpiry(formData.valid_until)
  }

  const isExpiringSoon = () => {
    if (!formData.valid_until) return false
    return PrivilegedAccessService.isExpiringSoon(formData.valid_until)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? t('privilegedAccess.edit') : t('privilegedAccess.create')}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('privilegedAccess.userSelection')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">{t('privilegedAccess.user')} *</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('privilegedAccess.selectUser')} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Scope Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('privilegedAccess.scopeConfiguration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scope_type">{t('privilegedAccess.scopeType')} *</Label>
                  <Select
                    value={formData.scope_type}
                    onValueChange={(value) => setFormData({ ...formData, scope_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">
                        <span className="flex items-center gap-2">
                          <Badge className={getScopeTypeColor('system')}>
                            {getScopeTypeLabel('system')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.scopeTypes.systemDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="database">
                        <span className="flex items-center gap-2">
                          <Badge className={getScopeTypeColor('database')}>
                            {getScopeTypeLabel('database')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.scopeTypes.databaseDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="network">
                        <span className="flex items-center gap-2">
                          <Badge className={getScopeTypeColor('network')}>
                            {getScopeTypeLabel('network')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.scopeTypes.networkDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="application">
                        <span className="flex items-center gap-2">
                          <Badge className={getScopeTypeColor('application')}>
                            {getScopeTypeLabel('application')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.scopeTypes.applicationDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="infrastructure">
                        <span className="flex items-center gap-2">
                          <Badge className={getScopeTypeColor('infrastructure')}>
                            {getScopeTypeLabel('infrastructure')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.scopeTypes.infrastructureDesc')}
                          </span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope_id">{t('privilegedAccess.scopeId')} *</Label>
                  <Input
                    id="scope_id"
                    value={formData.scope_id}
                    onChange={(e) => setFormData({ ...formData, scope_id: e.target.value })}
                    placeholder={t('privilegedAccess.scopeIdPlaceholder')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('privilegedAccess.accessConfiguration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="access_level">{t('privilegedAccess.accessLevel')} *</Label>
                  <Select
                    value={formData.access_level}
                    onValueChange={(value) => setFormData({ ...formData, access_level: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">
                        <span className="flex items-center gap-2">
                          <Badge className={getAccessLevelColor('read')}>
                            {getAccessLevelLabel('read')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.accessLevels.readDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="write">
                        <span className="flex items-center gap-2">
                          <Badge className={getAccessLevelColor('write')}>
                            {getAccessLevelLabel('write')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.accessLevels.writeDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="admin">
                        <span className="flex items-center gap-2">
                          <Badge className={getAccessLevelColor('admin')}>
                            {getAccessLevelLabel('admin')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.accessLevels.adminDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="super_admin">
                        <span className="flex items-center gap-2">
                          <Badge className={getAccessLevelColor('super_admin')}>
                            {getAccessLevelLabel('super_admin')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('privilegedAccess.accessLevels.superAdminDesc')}
                          </span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('privilegedAccess.status')}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">
                      {formData.is_active ? t('privilegedAccess.active') : t('privilegedAccess.inactive')}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">{t('privilegedAccess.justification')} *</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder={t('privilegedAccess.justificationPlaceholder')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('privilegedAccess.validityPeriod')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">{t('privilegedAccess.validFrom')} *</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">{t('privilegedAccess.validUntil')} *</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              {formData.valid_until && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  {isExpiringSoon() ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Calendar className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm">
                    {isExpiringSoon() 
                      ? t('privilegedAccess.expiresIn', { days: getDaysUntilExpiry() })
                      : t('privilegedAccess.validFor', { days: getDaysUntilExpiry() })
                    }
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? t('common.saving') : (isEditing ? t('common.update') : t('common.create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 