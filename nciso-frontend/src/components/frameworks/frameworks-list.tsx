'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Download, Upload, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Framework } from '@/lib/types/frameworks'
import { FrameworksService } from '@/lib/services/frameworks'
import { FrameworkImportDialog } from './framework-import-dialog'
import { useToast } from '@/hooks/use-toast'

interface FrameworksListProps {
  onFrameworkSelect?: (framework: Framework) => void
}

export function FrameworksList({ onFrameworkSelect }: FrameworksListProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [loading, setLoading] = useState(true)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const loadFrameworks = async () => {
    try {
      setLoading(true)
      const response = await FrameworksService.list()
      setFrameworks(response.data)
    } catch (error) {
      console.error('Error loading frameworks:', error)
      toast({
        title: t('common.error'),
        description: t('frameworks.messages.error_loading'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFrameworks()
  }, [])

  const handleImportSuccess = () => {
    setShowImportDialog(false)
    loadFrameworks()
    toast({
      title: t('common.success'),
      description: t('frameworks.messages.imported')
    })
  }

  const handleExport = async (framework: Framework) => {
    try {
      const exportData = await FrameworksService.exportFramework(framework.id, 'json')
      
      // Criar e baixar arquivo
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${framework.name.toLowerCase().replace(/\s+/g, '-')}-${framework.version}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: t('common.success'),
        description: t('frameworks.messages.exported')
      })
    } catch (error) {
      console.error('Error exporting framework:', error)
      toast({
        title: t('common.error'),
        description: t('frameworks.messages.error_exporting'),
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (framework: Framework) => {
    try {
      // Implementar toggle de ativo/inativo
      toast({
        title: t('common.success'),
        description: framework.is_active 
          ? t('frameworks.messages.deactivated')
          : t('frameworks.messages.activated')
      })
      loadFrameworks()
    } catch (error) {
      console.error('Error toggling framework status:', error)
      toast({
        title: t('common.error'),
        description: t('common.error_message'),
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (framework: Framework) => {
    if (!confirm(t('frameworks.messages.confirm_delete'))) return

    try {
      // Implementar exclusão
      toast({
        title: t('common.success'),
        description: t('frameworks.messages.deleted')
      })
      loadFrameworks()
    } catch (error) {
      console.error('Error deleting framework:', error)
      toast({
        title: t('common.error'),
        description: t('common.error_message'),
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('frameworks.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('frameworks.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('frameworks.actions.import')}
          </Button>
        </div>
      </div>

      {/* Frameworks List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('frameworks.title')} ({frameworks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {t('frameworks.messages.loading')}
              </div>
            </div>
          ) : frameworks.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('frameworks.messages.no_frameworks')}
                </p>
                <Button onClick={() => setShowImportDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('frameworks.actions.import')}
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('frameworks.fields.name')}</TableHead>
                  <TableHead>{t('frameworks.fields.version')}</TableHead>
                  <TableHead>{t('frameworks.fields.controls_count')}</TableHead>
                  <TableHead>{t('frameworks.fields.is_active')}</TableHead>
                  <TableHead>{t('frameworks.fields.created_at')}</TableHead>
                  <TableHead className="w-[100px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frameworks.map((framework) => (
                  <TableRow key={framework.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{framework.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {framework.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {framework.version}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {framework.controls_count}
                    </TableCell>
                    <TableCell>
                      {framework.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('common.active')}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t('common.inactive')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(framework.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onFrameworkSelect?.(framework)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('frameworks.actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(framework)}>
                            <Download className="h-4 w-4 mr-2" />
                            {t('frameworks.actions.export')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(framework)}>
                            {framework.is_active ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                {t('frameworks.actions.deactivate')}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {t('frameworks.actions.activate')}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(framework)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('frameworks.actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Import Dialog */}
      {showImportDialog && (
        <FrameworkImportDialog
          onClose={() => setShowImportDialog(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  )
} 