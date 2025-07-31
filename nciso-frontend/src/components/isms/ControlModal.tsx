'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Control } from '@/lib/hooks/useISMSData'
import { X, Save, Shield } from 'lucide-react'

interface ControlModalProps {
  isOpen: boolean
  onClose: () => void
  control?: Control
  onSubmit: (control: Omit<Control, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  loading?: boolean
}

export function ControlModal({ isOpen, onClose, control, onSubmit, loading }: ControlModalProps) {
  const { t } = useTranslation(['isms', 'common'])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    effectiveness: 0,
    status: 'not_implemented' as const
  })

  useEffect(() => {
    if (control) {
      setFormData({
        name: control.name,
        description: control.description || '',
        category: control.category || '',
        effectiveness: control.effectiveness || 0,
        status: control.status
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        effectiveness: 0,
        status: 'not_implemented'
      })
    }
  }, [control])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-[#00ade8]" />
              {control ? t('actions.edit') : t('actions.addControl')}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('control.name')}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('control.namePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('control.description')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('control.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('control.category')}
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Access Control"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('control.effectiveness')} (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.effectiveness}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveness: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="not_implemented">{t('control.status.not_implemented')}</option>
                <option value="partial">{t('control.status.partial')}</option>
                <option value="implemented">{t('control.status.implemented')}</option>
                <option value="planned">{t('control.status.planned')}</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#00ade8] hover:bg-[#0098cc]" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 