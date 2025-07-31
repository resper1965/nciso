'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('isms')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    status: 'draft' as const,
    version: '1.0',
    tags: [] as string[]
  })

  useEffect(() => {
    if (policy) {
      setFormData({
        title: policy.title,
        description: policy.description || '',
        content: policy.content || '',
        status: policy.status,
        version: policy.version,
        tags: policy.tags || []
      })
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        status: 'draft',
        version: '1.0',
        tags: []
      })
    }
  }, [policy])

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
              <FileText className="h-5 w-5 mr-2 text-[#00ade8]" />
              {policy ? t('actions.edit') : t('actions.createPolicy')}
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
                {t('policy.title')}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('policy.titlePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('policy.description')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('policy.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('policy.version')}
                </label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0"
                />
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
                  <option value="draft">{t('policy.status.draft')}</option>
                  <option value="review">{t('policy.status.review')}</option>
                  <option value="active">{t('policy.status.active')}</option>
                  <option value="archived">{t('policy.status.archived')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('policy.content')}
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={t('policy.contentPlaceholder')}
                rows={8}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-[#00ade8] hover:bg-[#0098cc]" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 