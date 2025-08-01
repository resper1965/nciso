'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, Eye, Edit, Trash2, Download, FileText, Upload, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { TechnicalDocumentsService } from '@/lib/services/technical-docs'
import { TechnicalDocument, TechnicalDocumentFilters } from '@/lib/types/isms'
import { TechnicalDocumentForm } from './technical-doc-form'
import { TechnicalDocumentDetail } from './technical-doc-detail'

interface TechnicalDocsListProps {
  className?: string
}

export function TechnicalDocsList({ className }: TechnicalDocsListProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [documents, setDocuments] = useState<TechnicalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<TechnicalDocumentFilters>({
    page: 1,
    limit: 10
  })
  
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<TechnicalDocument | null>(null)
  const [editingDocument, setEditingDocument] = useState<TechnicalDocument | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [filters])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await TechnicalDocumentsService.list(filters)
      setDocuments(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
      setPage(response.page)
    } catch (error) {
      console.error('Error loading documents:', error)
      toast({
        title: t('technicalDocs.loadError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (document: TechnicalDocument) => {
    if (!confirm(t('technicalDocs.deleteConfirm'))) return

    try {
      await TechnicalDocumentsService.delete(document.id)
      toast({
        title: t('technicalDocs.deleteSuccess'),
        description: t('technicalDocs.deleteSuccessDesc')
      })
      loadDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: t('technicalDocs.deleteError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleDownload = async (document: TechnicalDocument) => {
    try {
      const blob = await TechnicalDocumentsService.downloadFile(document.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = document.file_name
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
    return isPublic ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('technicalDocs.title')}</h2>
          <p className="text-muted-foreground">{t('technicalDocs.description')}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('technicalDocs.create')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('technicalDocs.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('technicalDocs.searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.document_type || ''}
              onValueChange={(value) => setFilters({ ...filters, document_type: value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('technicalDocs.typeFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('technicalDocs.allTypes')}</SelectItem>
                <SelectItem value="infrastructure">{t('technicalDocs.types.infrastructure')}</SelectItem>
                <SelectItem value="application">{t('technicalDocs.types.application')}</SelectItem>
                <SelectItem value="engineering">{t('technicalDocs.types.engineering')}</SelectItem>
                <SelectItem value="security">{t('technicalDocs.types.security')}</SelectItem>
                <SelectItem value="architecture">{t('technicalDocs.types.architecture')}</SelectItem>
                <SelectItem value="procedure">{t('technicalDocs.types.procedure')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.is_public?.toString() || ''}
              onValueChange={(value) => setFilters({ ...filters, is_public: value === 'true', page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('technicalDocs.visibilityFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('technicalDocs.allVisibility')}</SelectItem>
                <SelectItem value="true">{t('technicalDocs.public')}</SelectItem>
                <SelectItem value="false">{t('technicalDocs.private')}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, limit: 10 })}
            >
              {t('technicalDocs.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('technicalDocs.title')}</TableHead>
                <TableHead>{t('technicalDocs.type')}</TableHead>
                <TableHead>{t('technicalDocs.size')}</TableHead>
                <TableHead>{t('technicalDocs.visibility')}</TableHead>
                <TableHead>{t('technicalDocs.version')}</TableHead>
                <TableHead>{t('technicalDocs.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t('technicalDocs.noDocuments')}
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {document.description}
                        </div>
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {document.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {document.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{document.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{TechnicalDocumentsService.getDocumentTypeIcon(document.document_type)}</span>
                        {getDocumentTypeBadge(document.document_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{TechnicalDocumentsService.formatFileSize(document.file_size)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(document.is_public)}
                        <span className="text-sm">
                          {document.is_public ? t('technicalDocs.public') : t('technicalDocs.private')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(document)
                            setShowDetail(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingDocument(document)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(document)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setFilters({ ...filters, page: newPage })}
          />
        </div>
      )}

      {/* Forms */}
      {showForm && (
        <TechnicalDocumentForm
          document={editingDocument}
          onClose={() => {
            setShowForm(false)
            setEditingDocument(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingDocument(null)
            loadDocuments()
          }}
        />
      )}

      {showDetail && selectedDocument && (
        <TechnicalDocumentDetail
          documentId={selectedDocument.id}
          onClose={() => {
            setShowDetail(false)
            setSelectedDocument(null)
          }}
          onUpdate={loadDocuments}
        />
      )}
    </div>
  )
} 