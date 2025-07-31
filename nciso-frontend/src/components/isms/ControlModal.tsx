'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/supabase'
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
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    effectiveness: 0,
    status: 'not_implemented' as const,
    lastAssessment: new Date().toISOString()
  })

  useEffect(() => {
    if (control) {
      setFormData({
        name: control.name,
        description: control.description || '',
        category: control.category || '',
        effectiveness: control.effectiveness || 0,
        status: control.status,
        lastAssessment: control.lastAssessment || new Date().toISOString()
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        effectiveness: 0,
        status: 'not_implemented',
        lastAssessment: new Date().toISOString()
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
      <Card className="w-full max-w-2xl mx-4 bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Shield className="h-5 w-5 mr-2 text-green-400" />
              {control ? t('actions.edit') : t('actions.addControl')}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                {t('control.name')}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('control.namePlaceholder')}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                {t('control.description')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('control.descriptionPlaceholder')}
                rows={3}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  {t('control.category')}
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Access Control"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  {t('control.effectiveness')} (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.effectiveness}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveness: parseInt(e.target.value) || 0 }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white"
              >
                <option value="not_implemented">{t('control.status.not_implemented')}</option>
                <option value="partial">{t('control.status.partial')}</option>
                <option value="implemented">{t('control.status.implemented')}</option>
                <option value="planned">{t('control.status.planned')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Data da Última Avaliação
              </label>
              <Input
                type="datetime-local"
                value={formData.lastAssessment ? new Date(formData.lastAssessment).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  lastAssessment: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-400 hover:text-white">
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-400 hover:bg-green-500 text-slate-900" disabled={loading}>
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