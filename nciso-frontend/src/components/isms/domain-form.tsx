'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Loader2, FolderTree, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { domainService } from '@/lib/services/isms'
import type { Domain, DomainFormData } from '@/lib/types/isms'

interface DomainFormProps {
  domain?: Domain | null
  domains: Domain[]
  onSuccess: () => void
  onCancel: () => void
}

export function DomainForm({ domain, domains, onSuccess, onCancel }: DomainFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<DomainFormData>({
    name: '',
    description: '',
    parent_id: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (domain) {
      setFormData({
        name: domain.name,
        description: domain.description,
        parent_id: domain.parent_id || '',
        is_active: domain.is_active
      })
    }
  }, [domain])

  // Validação
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('isms.domains.validation.name_required')
    }

    if (!formData.description.trim()) {
      newErrors.description = t('isms.domains.validation.description_required')
    }

    // Validação de hierarquia (máximo 3 níveis)
    if (formData.parent_id) {
      const parent = domains.find(d => d.id === formData.parent_id)
      if (parent && parent.level >= 3) {
        newErrors.parent_id = t('isms.domains.validation.max_level_reached')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handlers
  const handleInputChange = (field: keyof DomainFormData, value: any) => {
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
      
      if (domain) {
        await domainService.update(domain.id, formData)
        toast({
          title: t('common.success'),
          description: t('isms.domains.messages.updated')
        })
      } else {
        await domainService.create(formData)
        toast({
          title: t('common.success'),
          description: t('isms.domains.messages.created')
        })
      }
      
      onSuccess()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: domain 
          ? t('isms.domains.messages.error_updating')
          : t('isms.domains.messages.error_creating'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar domínios disponíveis como pai
  const getAvailableParents = () => {
    return domains.filter(d => 
      d.is_active && 
      d.id !== domain?.id && // Não pode ser pai de si mesmo
      d.level < 3 // Máximo 3 níveis
    )
  }

  const availableParents = getAvailableParents()

  // Calcular nível do novo domínio
  const calculateNewLevel = () => {
    if (!formData.parent_id) return 1
    const parent = domains.find(d => d.id === formData.parent_id)
    return parent ? parent.level + 1 : 1
  }

  const newLevel = calculateNewLevel()

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {domain ? t('isms.domains.actions.edit') : t('isms.domains.actions.create')}
          </DialogTitle>
          <DialogDescription>
            {t('isms.domains.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('isms.domains.fields.name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('isms.domains.fields.name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('isms.domains.fields.description')} *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('isms.domains.fields.description')}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Domínio Pai */}
          <div className="space-y-2">
            <Label htmlFor="parent">{t('isms.domains.fields.parent')}</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => handleInputChange('parent_id', value)}
            >
              <SelectTrigger className={errors.parent_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('isms.domains.fields.parent_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('isms.domains.fields.no_parent')}</SelectItem>
                {availableParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4" />
                      <span>{parent.name}</span>
                      <span className="text-muted-foreground">({t('isms.domains.filters.level')} {parent.level})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.parent_id && (
              <p className="text-sm text-red-500">{errors.parent_id}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {t('isms.domains.help.parent_selection')}
            </p>
          </div>

          {/* Informações da Hierarquia */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{t('isms.domains.hierarchy.info')}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <strong>{t('isms.domains.fields.level')}:</strong> {newLevel}
              </div>
              {formData.parent_id && (
                <div>
                  <strong>{t('isms.domains.fields.path')}:</strong> {(() => {
                    const parent = domains.find(d => d.id === formData.parent_id)
                    return parent ? `${parent.path} > ${formData.name}` : formData.name
                  })()}
                </div>
              )}
              {newLevel >= 3 && (
                <div className="text-amber-600">
                  ⚠️ {t('isms.domains.hierarchy.max_level_warning')}
                </div>
              )}
            </div>
          </div>

          {/* Visualização da Hierarquia */}
          {formData.parent_id && (
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{t('isms.domains.hierarchy.preview')}</h4>
              <div className="text-sm">
                {(() => {
                  const parent = domains.find(d => d.id === formData.parent_id)
                  if (!parent) return formData.name
                  
                  const parts = parent.path.split(' > ')
                  return (
                    <div className="space-y-1">
                      {parts.map((part, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-4 h-4 border-l border-b border-muted-foreground/30"></div>
                          <span className="ml-2">{part}</span>
                        </div>
                      ))}
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-l border-b border-muted-foreground/30"></div>
                        <span className="ml-2 font-medium text-primary">{formData.name}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Ativo */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active">{t('isms.domains.fields.is_active')}</Label>
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
              {domain ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 