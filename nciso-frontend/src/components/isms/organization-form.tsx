'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { organizationService } from '@/lib/services/isms'
import type { Organization, OrganizationFormData } from '@/lib/types/isms'

interface OrganizationFormProps {
  organization?: Organization | null
  organizations: Organization[]
  onSuccess: () => void
  onCancel: () => void
}

export function OrganizationForm({ organization, organizations, onSuccess, onCancel }: OrganizationFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    type: 'department',
    parent_id: '',
    description: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        type: organization.type,
        parent_id: organization.parent_id || '',
        description: organization.description || '',
        is_active: organization.is_active
      })
    }
  }, [organization])

  // Validação
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('isms.organizations.validation.name_required')
    }

    if (!formData.type) {
      newErrors.type = t('isms.organizations.validation.type_required')
    }

    // Validação hierárquica
    if (formData.type === 'company' && formData.parent_id) {
      newErrors.parent_id = t('isms.organizations.validation.company_no_parent')
    }

    if (formData.type !== 'company' && !formData.parent_id) {
      newErrors.parent_id = t('isms.organizations.validation.parent_required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handlers
  const handleInputChange = (field: keyof OrganizationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      if (organization) {
        await organizationService.update(organization.id, formData)
        toast({
          title: t('common.success'),
          description: t('isms.organizations.messages.updated')
        })
      } else {
        await organizationService.create(formData)
        toast({
          title: t('common.success'),
          description: t('isms.organizations.messages.created')
        })
      }
      
      onSuccess()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: organization 
          ? t('isms.organizations.messages.error_updating')
          : t('isms.organizations.messages.error_creating'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar organizações disponíveis como pai baseado no tipo
  const getAvailableParents = () => {
    if (formData.type === 'company') {
      return [] // Empresas não têm pai
    }
    
    if (formData.type === 'department') {
      return organizations.filter(org => org.type === 'company' && org.is_active)
    }
    
    if (formData.type === 'unit' || formData.type === 'division') {
      return organizations.filter(org => 
        (org.type === 'department' || org.type === 'company') && 
        org.is_active &&
        org.id !== organization?.id // Não pode ser pai de si mesmo
      )
    }
    
    return organizations.filter(org => org.is_active && org.id !== organization?.id)
  }

  const availableParents = getAvailableParents()

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {organization ? t('isms.organizations.actions.edit') : t('isms.organizations.actions.create')}
          </DialogTitle>
          <DialogDescription>
            {t('isms.organizations.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('isms.organizations.fields.name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('isms.organizations.fields.name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">{t('isms.organizations.fields.type')} *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('isms.organizations.fields.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">{t('isms.organizations.types.company')}</SelectItem>
                <SelectItem value="department">{t('isms.organizations.types.department')}</SelectItem>
                <SelectItem value="unit">{t('isms.organizations.types.unit')}</SelectItem>
                <SelectItem value="division">{t('isms.organizations.types.division')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Organização Pai */}
          {formData.type !== 'company' && (
            <div className="space-y-2">
              <Label htmlFor="parent">{t('isms.organizations.fields.parent')} *</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) => handleInputChange('parent_id', value)}
              >
                <SelectTrigger className={errors.parent_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('isms.organizations.fields.parent')} />
                </SelectTrigger>
                <SelectContent>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name} ({t(`isms.organizations.types.${parent.type}`)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parent_id && (
                <p className="text-sm text-red-500">{errors.parent_id}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {formData.type === 'department' && t('isms.organizations.help.department_parent')}
                {(formData.type === 'unit' || formData.type === 'division') && t('isms.organizations.help.unit_parent')}
              </p>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('isms.organizations.fields.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('isms.organizations.fields.description')}
              rows={3}
            />
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
            <Label htmlFor="is_active">{t('isms.organizations.fields.is_active')}</Label>
          </div>

          {/* Hierarquia Visual */}
          {formData.parent_id && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{t('isms.organizations.hierarchy.title')}</h4>
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const parent = organizations.find(org => org.id === formData.parent_id)
                  if (!parent) return '-'
                  
                  let hierarchy = parent.name
                  let currentParent = parent
                  
                  // Construir hierarquia completa
                  while (currentParent.parent_id) {
                    const grandParent = organizations.find(org => org.id === currentParent.parent_id)
                    if (grandParent) {
                      hierarchy = `${grandParent.name} > ${hierarchy}`
                      currentParent = grandParent
                    } else {
                      break
                    }
                  }
                  
                  return hierarchy
                })()}
              </div>
            </div>
          )}

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
              {organization ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 