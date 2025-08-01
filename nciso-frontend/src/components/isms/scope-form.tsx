'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { ismsScopeService, domainService } from '@/lib/services/isms'
import type { ISMSScope, ISMSScopeFormData, Organization, Domain } from '@/lib/types/isms'

interface ScopeFormProps {
  scope?: ISMSScope | null
  organizations: Organization[]
  onSuccess: () => void
  onCancel: () => void
}

export function ScopeForm({ scope, organizations, onSuccess, onCancel }: ScopeFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [formData, setFormData] = useState<ISMSScopeFormData>({
    name: '',
    description: '',
    coverage: '',
    applicable_units: [],
    organization_id: '',
    domain_ids: [],
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar domínios
  useEffect(() => {
    const loadDomains = async () => {
      try {
        const domainsData = await domainService.getHierarchy()
        setDomains(domainsData)
      } catch (error) {
        console.error('Error loading domains:', error)
      }
    }
    loadDomains()
  }, [])

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (scope) {
      setFormData({
        name: scope.name,
        description: scope.description,
        coverage: scope.coverage,
        applicable_units: scope.applicable_units || [],
        organization_id: scope.organization_id,
        domain_ids: scope.domain_ids || [],
        is_active: scope.is_active
      })
    }
  }, [scope])

  // Validação
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('isms.scope.validation.name_required')
    }

    if (!formData.description.trim()) {
      newErrors.description = t('isms.scope.validation.description_required')
    }

    if (!formData.coverage.trim()) {
      newErrors.coverage = t('isms.scope.validation.coverage_required')
    }

    if (!formData.organization_id) {
      newErrors.organization_id = t('isms.scope.validation.organization_required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handlers
  const handleInputChange = (field: keyof ISMSScopeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleApplicableUnitsChange = (unit: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      applicable_units: checked
        ? [...prev.applicable_units, unit]
        : prev.applicable_units.filter(u => u !== unit)
    }))
  }

  const handleDomainChange = (domainId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      domain_ids: checked
        ? [...prev.domain_ids, domainId]
        : prev.domain_ids.filter(id => id !== domainId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      if (scope) {
        await ismsScopeService.update(scope.id, formData)
        toast({
          title: t('common.success'),
          description: t('isms.scope.messages.updated')
        })
      } else {
        await ismsScopeService.create(formData)
        toast({
          title: t('common.success'),
          description: t('isms.scope.messages.created')
        })
      }
      
      onSuccess()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: scope 
          ? t('isms.scope.messages.error_updating')
          : t('isms.scope.messages.error_creating'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {scope ? t('isms.scope.actions.edit') : t('isms.scope.actions.create')}
          </DialogTitle>
          <DialogDescription>
            {scope ? t('isms.scope.description') : t('isms.scope.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('isms.scope.fields.name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('isms.scope.fields.name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('isms.scope.fields.description')} *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('isms.scope.fields.description')}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Abrangência */}
          <div className="space-y-2">
            <Label htmlFor="coverage">{t('isms.scope.fields.coverage')} *</Label>
            <Textarea
              id="coverage"
              value={formData.coverage}
              onChange={(e) => handleInputChange('coverage', e.target.value)}
              placeholder={t('isms.scope.fields.coverage')}
              rows={2}
              className={errors.coverage ? 'border-red-500' : ''}
            />
            {errors.coverage && (
              <p className="text-sm text-red-500">{errors.coverage}</p>
            )}
          </div>

          {/* Organização */}
          <div className="space-y-2">
            <Label htmlFor="organization">{t('isms.scope.fields.organization')} *</Label>
            <Select
              value={formData.organization_id}
              onValueChange={(value) => handleInputChange('organization_id', value)}
            >
              <SelectTrigger className={errors.organization_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('isms.scope.fields.organization')} />
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

          {/* Unidades Aplicáveis */}
          <div className="space-y-2">
            <Label>{t('isms.scope.fields.applicable_units')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {organizations
                .filter(org => org.type !== 'company')
                .map((org) => (
                  <div key={org.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unit-${org.id}`}
                      checked={formData.applicable_units.includes(org.id)}
                      onCheckedChange={(checked) => 
                        handleApplicableUnitsChange(org.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`unit-${org.id}`} className="text-sm">
                      {org.name}
                    </Label>
                  </div>
                ))}
            </div>
          </div>

          {/* Domínios */}
          <div className="space-y-2">
            <Label>{t('isms.scope.fields.domains')}</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3">
              {domains.map((domain) => (
                <div key={domain.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`domain-${domain.id}`}
                    checked={formData.domain_ids.includes(domain.id)}
                    onCheckedChange={(checked) => 
                      handleDomainChange(domain.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={`domain-${domain.id}`} className="text-sm">
                    {domain.path}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Ativo */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">{t('isms.scope.fields.is_active')}</Label>
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
              {scope ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 