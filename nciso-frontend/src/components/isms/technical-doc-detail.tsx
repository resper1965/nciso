'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download, FileText, Globe, Lock, Calendar, User, Tag, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { TechnicalDocumentsService } from '@/lib/services/technical-docs'
import { TechnicalDocument } from '@/lib/types/isms'

interface TechnicalDocumentDetailProps {
  documentId: string
  onClose: () => void
  onUpdate: () => void
}

export function TechnicalDocumentDetail({ documentId, onClose, onUpdate }: TechnicalDocumentDetailProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [document, setDocument] = useState<TechnicalDocument | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string>('')

  useEffect(() => {
    loadDocument()
  }, [documentId])

  const loadDocument = async () => {
    try {
      setLoading(true)
      const data = await TechnicalDocumentsService.get(documentId)
      setDocument(data)
      
      // Generate download URL
      if (data.file_path) {
        const url = await TechnicalDocumentsService.getDownloadUrl(documentId)
        setDownloadUrl(url)
      }
    } catch (error) {
      console.error('Error loading document:', error)
      toast({
        title: t('technicalDocs.loadError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const blob = await TechnicalDocumentsService.downloadFile(documentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = document?.file_name || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: t('technicalDocs.downloadSuccess'),
        description: t('technicalDocs.downloadSuccessDesc')
      })
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: t('technicalDocs.downloadError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const getDocumentTypeBadge = (documentType: string) => {
    const typeMap = {
      infrastructure: { label: t('technicalDocs.types.infrastructure'), variant: 'default' as const },
      application: { label: t('technicalDocs.types.application'), variant: 'secondary' as const },
      engineering: { label: t('technicalDocs.types.engineering'), variant: 'outline' as const },
      security: { label: t('technicalDocs.types.security'), variant: 'destructive' as const },
      architecture: { label: t('technicalDocs.types.architecture'), variant: 'default' as const },
      procedure: { label: t('technicalDocs.types.procedure'), variant: 'secondary' as const }
    }

    const typeInfo = typeMap[documentType as keyof typeof typeMap] || typeMap.infrastructure
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
  }

  const getVisibilityIcon = (isPublic: boolean) => {
    return isPublic ? <Globe className="h-5 w-5 text-green-500" /> : <Lock className="h-5 w-5 text-gray-500" />
  }

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('common.loading')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!document) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('technicalDocs.notFound')}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('technicalDocs.notFoundDesc')}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{document.title}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('technicalDocs.download')}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {TechnicalDocumentsService.getDocumentTypeIcon(document.document_type)}
                {t('technicalDocs.documentInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.title')}</p>
                  <p className="text-sm text-muted-foreground">{document.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.type')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getDocumentTypeBadge(document.document_type)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.description')}</p>
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.version')}</p>
                  <p className="text-sm text-muted-foreground">{document.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.visibility')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getVisibilityIcon(document.is_public)}
                    <span className="text-sm">
                      {document.is_public ? t('technicalDocs.public') : t('technicalDocs.private')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.fileSize')}</p>
                  <p className="text-sm text-muted-foreground">
                    {TechnicalDocumentsService.formatFileSize(document.file_size)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('technicalDocs.fileInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.fileName')}</p>
                  <p className="text-sm text-muted-foreground">{document.file_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.fileType')}</p>
                  <p className="text-sm text-muted-foreground">{document.file_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.fileSize')}</p>
                  <p className="text-sm text-muted-foreground">
                    {TechnicalDocumentsService.formatFileSize(document.file_size)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.createdAt')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(document.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Relationships */}
          {(document.scope_id || document.asset_id || document.control_id) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  {t('technicalDocs.relationships')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {document.scope_id && (
                    <div>
                      <p className="text-sm font-medium">{t('technicalDocs.scope')}</p>
                      <p className="text-sm text-muted-foreground">{document.scope_id}</p>
                    </div>
                  )}
                  {document.asset_id && (
                    <div>
                      <p className="text-sm font-medium">{t('technicalDocs.asset')}</p>
                      <p className="text-sm text-muted-foreground">{document.asset_id}</p>
                    </div>
                  )}
                  {document.control_id && (
                    <div>
                      <p className="text-sm font-medium">{t('technicalDocs.control')}</p>
                      <p className="text-sm text-muted-foreground">{document.control_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {t('technicalDocs.tags')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('technicalDocs.metadata')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.createdAt')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(document.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.updatedAt')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(document.updated_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.author')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{document.author_id}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('technicalDocs.tenant')}</p>
                  <p className="text-sm text-muted-foreground">{document.tenant_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.close')}
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              {t('technicalDocs.download')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 