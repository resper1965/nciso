'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Policy } from '@/lib/hooks/useISMSData'
import { X, Save, FileText } from 'lucide-react'

interface PolicyModalProps {
  isOpen: boolean
  onClose: () => void
  policy?: Policy
  onSubmit: (policy: Omit<Policy, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  loading?: boolean
}

export function PolicyModal({ isOpen, onClose, policy, onSubmit, loading }: PolicyModalProps) {
  const { t } = useTranslation(['isms', 'common'])
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    status: 'draft' as const,
    version: '1.0',
    tags: [] as string[],
    owner: ''
  })

  useEffect(() => {
    if (policy) {
      setFormData({
        title: policy.title,
        description: policy.description || '',
        content: policy.content || '',
        status: policy.status,
        version: policy.version,
        tags: policy.tags || [],
        owner: policy.owner || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        status: 'draft',
        version: '1.0',
        tags: [],
        owner: user?.name || user?.email || 'CISO'
      })
    }
  }, [policy, user])

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
              <FileText className="h-5 w-5 mr-2 text-blue-400" />
              {policy ? t('actions.edit') : t('actions.createPolicy')}
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
                {t('policy.title')}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('policy.titlePlaceholder')}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                {t('policy.description')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('policy.descriptionPlaceholder')}
                rows={3}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Proprietário
              </label>
              <Input
                value={formData.owner}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="Nome do proprietário"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  {t('policy.version')}
                </label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
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
                  <option value="draft">{t('policy.status.draft')}</option>
                  <option value="review">{t('policy.status.review')}</option>
                  <option value="active">{t('policy.status.active')}</option>
                  <option value="archived">{t('policy.status.archived')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                {t('policy.content')}
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={t('policy.contentPlaceholder')}
                rows={8}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-400 hover:text-white">
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-400 hover:bg-blue-500 text-slate-900" disabled={loading}>
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