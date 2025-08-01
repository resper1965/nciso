'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Loader2, Shield, Database, User, Monitor, Server, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { assetService } from '@/lib/services/isms'
import type { Asset, AssetFormData, Organization, AssetClassification } from '@/lib/types/isms'

interface AssetFormProps {
  asset?: Asset | null
  organizations: Organization[]
  onSuccess: () => void
  onCancel: () => void
}

export function AssetForm({ asset, organizations, onSuccess, onCancel }: AssetFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    type: 'digital',
    owner_id: '',
    classification: {
      confidentiality: 'low',
      integrity: 'low',
      availability: 'low'
    },
    description: '',
    location: '',
    value: undefined,
    organization_id: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        type: asset.type,
        owner_id: asset.owner_id,
        classification: asset.classification,
        description: asset.description || '',
        location: asset.location || '',
        value: asset.value,
        organization_id: asset.organization_id,
        is_active: asset.is_active
      })
    }
  }, [asset])

  // Validação
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('isms.assets.validation.name_required')
    }

    if (!formData.owner_id) {
      newErrors.owner_id = t('isms.assets.validation.owner_required')
    }

    if (!formData.organization_id) {
      newErrors.organization_id = t('isms.assets.validation.organization_required')
    }

    if (formData.value !== undefined && formData.value < 0) {
      newErrors.value = t('isms.assets.validation.value_positive')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handlers
  const handleInputChange = (field: keyof AssetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleClassificationChange = (aspect: keyof AssetClassification, value: string) => {
    setFormData(prev => ({
      ...prev,
      classification: {
        ...prev.classification,
        [aspect]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      if (asset) {
        await assetService.update(asset.id, formData)
        toast({
          title: t('common.success'),
          description: t('isms.assets.messages.updated')
        })
      } else {
        await assetService.create(formData)
        toast({
          title: t('common.success'),
          description: t('isms.assets.messages.created')
        })
      }
      
      onSuccess()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: asset 
          ? t('isms.assets.messages.error_updating')
          : t('isms.assets.messages.error_creating'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Obter ícone baseado no tipo
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

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asset ? t('isms.assets.actions.edit') : t('isms.assets.actions.create')}
          </DialogTitle>
          <DialogDescription>
            {t('isms.assets.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('isms.assets.fields.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('isms.assets.fields.name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">{t('isms.assets.fields.type')} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('isms.assets.fields.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      {t('isms.assets.types.physical')}
                    </div>
                  </SelectItem>
                  <SelectItem value="digital">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      {t('isms.assets.types.digital')}
                    </div>
                  </SelectItem>
                  <SelectItem value="person">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('isms.assets.types.person')}
                    </div>
                  </SelectItem>
                  <SelectItem value="software">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {t('isms.assets.types.software')}
                    </div>
                  </SelectItem>
                  <SelectItem value="infrastructure">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t('isms.assets.types.infrastructure')}
                    </div>
                  </SelectItem>
                  <SelectItem value="data">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('isms.assets.types.data')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('isms.assets.fields.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('isms.assets.fields.description')}
              rows={3}
            />
          </div>

          {/* Organização e Localização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organização */}
            <div className="space-y-2">
              <Label htmlFor="organization">{t('isms.assets.fields.organization')} *</Label>
              <Select
                value={formData.organization_id}
                onValueChange={(value) => handleInputChange('organization_id', value)}
              >
                <SelectTrigger className={errors.organization_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('isms.assets.fields.organization')} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organization_id && (
                <p className="text-sm text-red-500">{errors.organization_id}</p>
              )}
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="location">{t('isms.assets.fields.location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t('isms.assets.fields.location')}
              />
            </div>
          </div>

          {/* Proprietário e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proprietário */}
            <div className="space-y-2">
              <Label htmlFor="owner">{t('isms.assets.fields.owner')} *</Label>
              <Input
                id="owner"
                value={formData.owner_id}
                onChange={(e) => handleInputChange('owner_id', e.target.value)}
                placeholder={t('isms.assets.fields.owner')}
                className={errors.owner_id ? 'border-red-500' : ''}
              />
              {errors.owner_id && (
                <p className="text-sm text-red-500">{errors.owner_id}</p>
              )}
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="value">{t('isms.assets.fields.value')}</Label>
              <Input
                id="value"
                type="number"
                value={formData.value || ''}
                onChange={(e) => handleInputChange('value', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                className={errors.value ? 'border-red-500' : ''}
              />
              {errors.value && (
                <p className="text-sm text-red-500">{errors.value}</p>
              )}
            </div>
          </div>

          {/* Classificação CIA */}
          <div className="space-y-4">
            <Label>{t('isms.assets.fields.classification')} *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Confidencialidade */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('isms.assets.classification.confidentiality')}
                </Label>
                <Select
                  value={formData.classification.confidentiality}
                  onValueChange={(value) => handleClassificationChange('confidentiality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('isms.assets.classification.low')}</SelectItem>
                    <SelectItem value="medium">{t('isms.assets.classification.medium')}</SelectItem>
                    <SelectItem value="high">{t('isms.assets.classification.high')}</SelectItem>
                    <SelectItem value="critical">{t('isms.assets.classification.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Integridade */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('isms.assets.classification.integrity')}
                </Label>
                <Select
                  value={formData.classification.integrity}
                  onValueChange={(value) => handleClassificationChange('integrity', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('isms.assets.classification.low')}</SelectItem>
                    <SelectItem value="medium">{t('isms.assets.classification.medium')}</SelectItem>
                    <SelectItem value="high">{t('isms.assets.classification.high')}</SelectItem>
                    <SelectItem value="critical">{t('isms.assets.classification.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Disponibilidade */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('isms.assets.classification.availability')}
                </Label>
                <Select
                  value={formData.classification.availability}
                  onValueChange={(value) => handleClassificationChange('availability', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('isms.assets.classification.low')}</SelectItem>
                    <SelectItem value="medium">{t('isms.assets.classification.medium')}</SelectItem>
                    <SelectItem value="high">{t('isms.assets.classification.high')}</SelectItem>
                    <SelectItem value="critical">{t('isms.assets.classification.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resumo da Classificação */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{t('isms.assets.classification.summary')}</h4>
              <div className="text-sm text-muted-foreground">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <strong>{t('isms.assets.classification.confidentiality')}:</strong> {t(`isms.assets.classification.${formData.classification.confidentiality}`)}
                  </div>
                  <div>
                    <strong>{t('isms.assets.classification.integrity')}:</strong> {t(`isms.assets.classification.${formData.classification.integrity}`)}
                  </div>
                  <div>
                    <strong>{t('isms.assets.classification.availability')}:</strong> {t(`isms.assets.classification.${formData.classification.availability}`)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ativo */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active">{t('isms.assets.fields.is_active')}</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {asset ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 