'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Control, ControlFormData, ControlValidationErrors } from '@/lib/types/controls'
import { ControlsService } from '@/lib/services/controls'
import { useToast } from '@/hooks/use-toast'

interface ControlFormProps {
  control?: Control | null
  onClose: () => void
  onSubmit: () => void
}

export function ControlForm({ control, onClose, onSubmit }: ControlFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<ControlFormData>({
    name: '',
    description: '',
    type: 'preventive',
    domain: 'access_control',
    framework: 'iso27001',
    status: 'draft',
    effectiveness: 50,
    priority: 'medium',
    owner: ''
  })
  
  const [errors, setErrors] = useState<ControlValidationErrors>({})
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (control) {
      setIsEditing(true)
      setFormData({
        name: control.name,
        description: control.description,
        type: control.type,
        domain: control.domain,
        framework: control.framework,
        status: control.status,
        effectiveness: control.effectiveness,
        priority: control.priority,
        owner: control.owner || ''
      })
    }
  }, [control])

  const validateForm = (): boolean => {
    const newErrors: ControlValidationErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('controls.validation.name_required')
    }

    if (!formData.description.trim()) {
      newErrors.description = t('controls.validation.description_required')
    }

    if (!formData.type) {
      newErrors.type = t('controls.validation.type_required')
    }

    if (!formData.domain) {
      newErrors.domain = t('controls.validation.domain_required')
    }

    if (!formData.framework) {
      newErrors.framework = t('controls.validation.framework_required')
    }

    if (formData.effectiveness < 0 || formData.effectiveness > 100) {
      newErrors.effectiveness = t('controls.validation.effectiveness_range')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (isEditing && control) {
        await ControlsService.update(control.id, formData)
        toast({
          title: t('common.success'),
          description: t('controls.messages.updated')
        })
      } else {
        await ControlsService.create(formData)
        toast({
          title: t('common.success'),
          description: t('controls.messages.created')
        })
      }
      
      onSubmit()
    } catch (error) {
      console.error('Error saving control:', error)
      toast({
        title: t('common.error'),
        description: isEditing 
          ? t('controls.messages.error_updating')
          : t('controls.messages.error_creating'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ControlFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof ControlValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            {isEditing ? t('controls.actions.edit') : t('controls.actions.create')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('controls.fields.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('controls.fields.name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('controls.fields.description')} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('controls.fields.description')}
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t('controls.fields.type')} *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">{t('controls.types.preventive')}</SelectItem>
                    <SelectItem value="corrective">{t('controls.types.corrective')}</SelectItem>
                    <SelectItem value="detective">{t('controls.types.detective')}</SelectItem>
                    <SelectItem value="deterrent">{t('controls.types.deterrent')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('controls.fields.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('controls.status.draft')}</SelectItem>
                    <SelectItem value="active">{t('controls.status.active')}</SelectItem>
                    <SelectItem value="inactive">{t('controls.status.inactive')}</SelectItem>
                    <SelectItem value="archived">{t('controls.status.archived')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Domain and Framework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">{t('controls.fields.domain')} *</Label>
                <Select
                  value={formData.domain}
                  onValueChange={(value) => handleInputChange('domain', value)}
                >
                  <SelectTrigger className={errors.domain ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="access_control">{t('controls.domains.access_control')}</SelectItem>
                    <SelectItem value="asset_management">{t('controls.domains.asset_management')}</SelectItem>
                    <SelectItem value="business_continuity">{t('controls.domains.business_continuity')}</SelectItem>
                    <SelectItem value="communications">{t('controls.domains.communications')}</SelectItem>
                    <SelectItem value="compliance">{t('controls.domains.compliance')}</SelectItem>
                    <SelectItem value="cryptography">{t('controls.domains.cryptography')}</SelectItem>
                    <SelectItem value="human_resources">{t('controls.domains.human_resources')}</SelectItem>
                    <SelectItem value="incident_management">{t('controls.domains.incident_management')}</SelectItem>
                    <SelectItem value="operations">{t('controls.domains.operations')}</SelectItem>
                    <SelectItem value="physical_security">{t('controls.domains.physical_security')}</SelectItem>
                    <SelectItem value="risk_management">{t('controls.domains.risk_management')}</SelectItem>
                    <SelectItem value="security_architecture">{t('controls.domains.security_architecture')}</SelectItem>
                    <SelectItem value="supplier_relationships">{t('controls.domains.supplier_relationships')}</SelectItem>
                    <SelectItem value="system_development">{t('controls.domains.system_development')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.domain && (
                  <p className="text-sm text-red-500">{errors.domain}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="framework">{t('controls.fields.framework')} *</Label>
                <Select
                  value={formData.framework}
                  onValueChange={(value) => handleInputChange('framework', value)}
                >
                  <SelectTrigger className={errors.framework ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso27001">{t('controls.frameworks.iso27001')}</SelectItem>
                    <SelectItem value="nist">{t('controls.frameworks.nist')}</SelectItem>
                    <SelectItem value="cobit">{t('controls.frameworks.cobit')}</SelectItem>
                    <SelectItem value="custom">{t('controls.frameworks.custom')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.framework && (
                  <p className="text-sm text-red-500">{errors.framework}</p>
                )}
              </div>
            </div>

            {/* Priority and Owner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">{t('controls.fields.priority')}</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('controls.priorities.low')}</SelectItem>
                    <SelectItem value="medium">{t('controls.priorities.medium')}</SelectItem>
                    <SelectItem value="high">{t('controls.priorities.high')}</SelectItem>
                    <SelectItem value="critical">{t('controls.priorities.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">{t('controls.fields.owner')}</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => handleInputChange('owner', e.target.value)}
                  placeholder={t('controls.fields.owner')}
                />
              </div>
            </div>

            {/* Effectiveness */}
            <div className="space-y-4">
              <Label>{t('controls.fields.effectiveness')}: {formData.effectiveness}%</Label>
              <Slider
                value={[formData.effectiveness]}
                onValueChange={(value) => handleInputChange('effectiveness', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              {errors.effectiveness && (
                <p className="text-sm text-red-500">{errors.effectiveness}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 