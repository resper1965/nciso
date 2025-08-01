'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Upload, FileText, Tag, Globe, Lock } from 'lucide-react'
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
import { TechnicalDocumentsService } from '@/lib/services/technical-docs'
import { TechnicalDocument, TechnicalDocumentFormData } from '@/lib/types/isms'
import { ismsScopeService, assetService, domainService } from '@/lib/services/isms'

interface TechnicalDocumentFormProps {
  document?: TechnicalDocument | null
  onClose: () => void
  onSuccess: () => void
}

export function TechnicalDocumentForm({ document, onClose, onSuccess }: TechnicalDocumentFormProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TechnicalDocumentFormData>({
    title: '',
    description: '',
    document_type: 'infrastructure',
    scope_id: '',
    asset_id: '',
    control_id: '',
    version: '1.0',
    tags: [],
    is_public: false,
    file: undefined
  })
  
  const [scopes, setScopes] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [domains, setDomains] = useState<any[]>([])
  const [newTag, setNewTag] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const isEditing = !!document

  useEffect(() => {
    loadInitialData()
    if (document) {
      setFormData({
        title: document.title,
        description: document.description,
        document_type: document.document_type,
        scope_id: document.scope_id || '',
        asset_id: document.asset_id || '',
        control_id: document.control_id || '',
        version: document.version,
        tags: document.tags || [],
        is_public: document.is_public,
        file: undefined
      })
    }
  }, [document])

  const loadInitialData = async () => {
    try {
      const [scopesData, assetsData, domainsData] = await Promise.all([
        ismsScopeService.list(),
        assetService.list(),
        domainService.list()
      ])
      
      setScopes(scopesData.data || [])
      setAssets(assetsData.data || [])
      setDomains(domainsData.data || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.document_type) {
      toast({
        title: t('technicalDocs.validationError'),
        description: t('technicalDocs.requiredFields'),
        variant: 'destructive'
      })
      return
    }

    if (!isEditing && !formData.file) {
      toast({
        title: t('technicalDocs.fileRequired'),
        description: t('technicalDocs.fileRequiredDesc'),
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      if (isEditing) {
        await TechnicalDocumentsService.update(document!.id, formData)
        toast({
          title: t('technicalDocs.updateSuccess'),
          description: t('technicalDocs.updateSuccessDesc')
        })
      } else {
        await TechnicalDocumentsService.create(formData)
        toast({
          title: t('technicalDocs.createSuccess'),
          description: t('technicalDocs.createSuccessDesc')
        })
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving document:', error)
      toast({
        title: t('technicalDocs.saveError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, file })
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const getDocumentTypeIcon = (documentType: string) => {
    return TechnicalDocumentsService.getDocumentTypeIcon(documentType)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? t('technicalDocs.edit') : t('technicalDocs.create')}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('technicalDocs.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('technicalDocs.title')} *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('technicalDocs.titlePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_type">{t('technicalDocs.type')} *</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(value) => setFormData({ ...formData, document_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">
                        <span className="flex items-center gap-2">
                          {getDocumentTypeIcon('infrastructure')}
                          {t('technicalDocs.types.infrastructure')}
                        </span>
                      </SelectItem>
                      <SelectItem value="application">
                        <span className="flex items-center gap-2">
                          {getDocumentTypeIcon('application')}
                          {t('technicalDocs.types.application')}
                        </span>
                      </SelectItem>
                      <SelectItem value="engineering">
                        <span className="flex items-center gap-2">
                          {getDocumentTypeIcon('engineering')}
                          {t('technicalDocs.types.engineering')}
                        </span>
                      </SelectItem>
                      <SelectItem value="security">
                        <span className="flex items-center gap-2">
                          {getDocumentTypeIcon('security')}
                          {t('technicalDocs.types.security')}
                        </span>
                      </SelectItem>
                      <SelectItem value="architecture">
                        <span className="flex items-center gap-2">
                          {getDocumentTypeIcon('architecture')}
                          {t('technicalDocs.types.architecture')}
                        </span>
                      </SelectItem>
                      <SelectItem value="procedure">
                        <span className="flex items-center gap-2">
                          {getDocumentTypeIcon('procedure')}
                          {t('technicalDocs.types.procedure')}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('technicalDocs.description')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('technicalDocs.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">{t('technicalDocs.version')}</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('technicalDocs.visibility')}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_public"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                    />
                    <Label htmlFor="is_public" className="flex items-center gap-2">
                      {formData.is_public ? (
                        <>
                          <Globe className="h-4 w-4 text-green-500" />
                          {t('technicalDocs.public')}
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-gray-500" />
                          {t('technicalDocs.private')}
                        </>
                      )}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>{t('technicalDocs.fileUpload')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mr-2" />
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.md,.html,.css,.js,.json,.xml,.yaml,.yml"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                      {t('technicalDocs.chooseFile')}
                    </label>
                  </div>
                  {formData.file && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">{formData.file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({TechnicalDocumentsService.formatFileSize(formData.file.size)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Relationships */}
          <Card>
            <CardHeader>
              <CardTitle>{t('technicalDocs.relationships')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scope_id">{t('technicalDocs.scope')}</Label>
                  <Select
                    value={formData.scope_id}
                    onValueChange={(value) => setFormData({ ...formData, scope_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('technicalDocs.selectScope')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('technicalDocs.noScope')}</SelectItem>
                      {scopes.map((scope) => (
                        <SelectItem key={scope.id} value={scope.id}>
                          {scope.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset_id">{t('technicalDocs.asset')}</Label>
                  <Select
                    value={formData.asset_id}
                    onValueChange={(value) => setFormData({ ...formData, asset_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('technicalDocs.selectAsset')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('technicalDocs.noAsset')}</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="control_id">{t('technicalDocs.control')}</Label>
                  <Select
                    value={formData.control_id}
                    onValueChange={(value) => setFormData({ ...formData, control_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('technicalDocs.selectControl')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('technicalDocs.noControl')}</SelectItem>
                      {/* Add controls when available */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>{t('technicalDocs.tags')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('technicalDocs.addTagPlaceholder')}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()}>
                  <Tag className="h-4 w-4 mr-2" />
                  {t('technicalDocs.addTag')}
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
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