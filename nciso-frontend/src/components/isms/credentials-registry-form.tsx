'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Shield, User, Users, Calendar, AlertTriangle } from 'lucide-react'
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
import { CredentialsRegistryService } from '@/lib/services/credentials-registry'
import { CredentialsRegistry, CredentialsRegistryFormData } from '@/lib/types/isms'
import { assetService } from '@/lib/services/isms'

interface CredentialsRegistryFormProps {
  credential?: CredentialsRegistry | null
  onClose: () => void
  onSuccess: () => void
}

export function CredentialsRegistryForm({ credential, onClose, onSuccess }: CredentialsRegistryFormProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CredentialsRegistryFormData>({
    asset_id: '',
    user_id: '',
    team_id: '',
    access_type: 'read',
    justification: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  })
  
  const [assets, setAssets] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [holderType, setHolderType] = useState<'user' | 'team'>('user')

  const isEditing = !!credential

  useEffect(() => {
    loadInitialData()
    if (credential) {
      setFormData({
        asset_id: credential.asset_id,
        user_id: credential.user_id || '',
        team_id: credential.team_id || '',
        access_type: credential.access_type,
        justification: credential.justification,
        valid_from: credential.valid_from.split('T')[0],
        valid_until: credential.valid_until.split('T')[0],
        is_active: credential.is_active
      })
      setHolderType(credential.user_id ? 'user' : 'team')
    }
  }, [credential])

  const loadInitialData = async () => {
    try {
      const [assetsData] = await Promise.all([
        assetService.list()
      ])
      
      setAssets(assetsData.data || [])
      // TODO: Load users and teams when available
      setUsers([])
      setTeams([])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.asset_id || !formData.justification || !formData.valid_from || !formData.valid_until) {
      toast({
        title: t('credentialsRegistry.validationError'),
        description: t('credentialsRegistry.requiredFields'),
        variant: 'destructive'
      })
      return
    }

    if (holderType === 'user' && !formData.user_id) {
      toast({
        title: t('credentialsRegistry.userRequired'),
        description: t('credentialsRegistry.userRequiredDesc'),
        variant: 'destructive'
      })
      return
    }

    if (holderType === 'team' && !formData.team_id) {
      toast({
        title: t('credentialsRegistry.teamRequired'),
        description: t('credentialsRegistry.teamRequiredDesc'),
        variant: 'destructive'
      })
      return
    }

    if (new Date(formData.valid_until) <= new Date(formData.valid_from)) {
      toast({
        title: t('credentialsRegistry.invalidDates'),
        description: t('credentialsRegistry.invalidDatesDesc'),
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      const submitData = {
        ...formData,
        user_id: holderType === 'user' ? formData.user_id : undefined,
        team_id: holderType === 'team' ? formData.team_id : undefined
      }
      
      if (isEditing) {
        await CredentialsRegistryService.update(credential!.id, submitData)
        toast({
          title: t('credentialsRegistry.updateSuccess'),
          description: t('credentialsRegistry.updateSuccessDesc')
        })
      } else {
        await CredentialsRegistryService.create(submitData)
        toast({
          title: t('credentialsRegistry.createSuccess'),
          description: t('credentialsRegistry.createSuccessDesc')
        })
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving credential:', error)
      toast({
        title: t('credentialsRegistry.saveError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getAccessTypeLabel = (accessType: string) => {
    return CredentialsRegistryService.getAccessTypeLabel(accessType)
  }

  const getAccessTypeColor = (accessType: string) => {
    return CredentialsRegistryService.getAccessTypeColor(accessType)
  }

  const getDaysUntilExpiry = () => {
    if (!formData.valid_until) return 0
    return CredentialsRegistryService.getDaysUntilExpiry(formData.valid_until)
  }

  const isExpiringSoon = () => {
    if (!formData.valid_until) return false
    return CredentialsRegistryService.isExpiringSoon(formData.valid_until)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? t('credentialsRegistry.edit') : t('credentialsRegistry.create')}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asset Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('credentialsRegistry.assetSelection')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset_id">{t('credentialsRegistry.asset')} *</Label>
                <Select
                  value={formData.asset_id}
                  onValueChange={(value) => setFormData({ ...formData, asset_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('credentialsRegistry.selectAsset')} />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        <div className="flex items-center gap-2">
                          <span>{asset.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {asset.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Holder Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {holderType === 'user' ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                {t('credentialsRegistry.holderSelection')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('credentialsRegistry.holderType')}</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="user-type"
                      checked={holderType === 'user'}
                      onCheckedChange={(checked) => {
                        setHolderType(checked ? 'user' : 'team')
                        setFormData({ ...formData, user_id: '', team_id: '' })
                      }}
                    />
                    <Label htmlFor="user-type" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('credentialsRegistry.individual')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="team-type"
                      checked={holderType === 'team'}
                      onCheckedChange={(checked) => {
                        setHolderType(checked ? 'team' : 'user')
                        setFormData({ ...formData, user_id: '', team_id: '' })
                      }}
                    />
                    <Label htmlFor="team-type" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t('credentialsRegistry.team')}
                    </Label>
                  </div>
                </div>
              </div>

              {holderType === 'user' ? (
                <div className="space-y-2">
                  <Label htmlFor="user_id">{t('credentialsRegistry.user')} *</Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('credentialsRegistry.selectUser')} />
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="team_id">{t('credentialsRegistry.team')} *</Label>
                  <Select
                    value={formData.team_id}
                    onValueChange={(value) => setFormData({ ...formData, team_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('credentialsRegistry.selectTeam')} />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('credentialsRegistry.accessConfiguration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="access_type">{t('credentialsRegistry.accessType')} *</Label>
                  <Select
                    value={formData.access_type}
                    onValueChange={(value) => setFormData({ ...formData, access_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">
                        <span className="flex items-center gap-2">
                          <Badge className={getAccessTypeColor('read')}>
                            {getAccessTypeLabel('read')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('credentialsRegistry.accessTypes.readDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="write">
                        <span className="flex items-center gap-2">
                          <Badge className={getAccessTypeColor('write')}>
                            {getAccessTypeLabel('write')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('credentialsRegistry.accessTypes.writeDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="admin">
                        <span className="flex items-center gap-2">
                          <Badge className={getAccessTypeColor('admin')}>
                            {getAccessTypeLabel('admin')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('credentialsRegistry.accessTypes.adminDesc')}
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="full">
                        <span className="flex items-center gap-2">
                          <Badge className={getAccessTypeColor('full')}>
                            {getAccessTypeLabel('full')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {t('credentialsRegistry.accessTypes.fullDesc')}
                          </span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('credentialsRegistry.status')}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">
                      {formData.is_active ? t('credentialsRegistry.active') : t('credentialsRegistry.inactive')}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">{t('credentialsRegistry.justification')} *</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder={t('credentialsRegistry.justificationPlaceholder')}
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
                {t('credentialsRegistry.validityPeriod')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">{t('credentialsRegistry.validFrom')} *</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">{t('credentialsRegistry.validUntil')} *</Label>
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
                      ? t('credentialsRegistry.expiresIn', { days: getDaysUntilExpiry() })
                      : t('credentialsRegistry.validFor', { days: getDaysUntilExpiry() })
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