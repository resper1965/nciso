'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FrameworksService } from '@/lib/services/frameworks'
import { DEFAULT_FRAMEWORKS } from '@/lib/types/frameworks'
import { useToast } from '@/hooks/use-toast'

interface FrameworkImportDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function FrameworkImportDialog({ onClose, onSuccess }: FrameworkImportDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('default')
  const [importing, setImporting] = useState(false)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any>(null)

  const handleImportDefaultFramework = async (frameworkKey: 'iso27001' | 'nist' | 'cobit') => {
    setImporting(true)
    setSelectedFramework(frameworkKey)

    try {
      const result = await FrameworksService.importDefaultFramework(frameworkKey)
      setImportResult(result)

      if (result.success) {
        toast({
          title: t('common.success'),
          description: t('frameworks.import.import_success')
        })
        onSuccess()
      } else {
        toast({
          title: t('common.error'),
          description: result.errors.join(', '),
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error importing framework:', error)
      toast({
        title: t('common.error'),
        description: t('frameworks.import.import_error'),
        variant: 'destructive'
      })
    } finally {
      setImporting(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)

    try {
      const text = await file.text()
      const frameworkData = JSON.parse(text)

      const result = await FrameworksService.importCustomFramework(frameworkData)
      setImportResult(result)

      if (result.success) {
        toast({
          title: t('common.success'),
          description: t('frameworks.import.import_success')
        })
        onSuccess()
      } else {
        toast({
          title: t('common.error'),
          description: result.errors.join(', '),
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error importing custom framework:', error)
      toast({
        title: t('common.error'),
        description: t('frameworks.import.import_error'),
        variant: 'destructive'
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            {t('frameworks.import.title')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="default">
                {t('frameworks.import.default_frameworks')}
              </TabsTrigger>
              <TabsTrigger value="custom">
                {t('frameworks.import.custom_framework')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="default" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(DEFAULT_FRAMEWORKS).map(([key, framework]) => (
                  <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{framework.name}</h3>
                          <p className="text-sm text-muted-foreground">v{framework.version}</p>
                        </div>
                        <Badge variant="outline">
                          {framework.controls_count} {t('controls.title')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {framework.description}
                      </p>

                      <Button
                        className="w-full"
                        onClick={() => handleImportDefaultFramework(key as any)}
                        disabled={importing && selectedFramework === key}
                      >
                        {importing && selectedFramework === key ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            {t('frameworks.messages.importing')}
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            {t('frameworks.actions.import')}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {importResult && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {importResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <h4 className="font-semibold">
                        {importResult.success ? 'Importação Concluída' : 'Erro na Importação'}
                      </h4>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Controles importados:</strong> {importResult.imported_controls}
                      </p>
                      
                      {importResult.errors.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-red-600">Erros:</p>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {importResult.errors.map((error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {importResult.warnings.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-yellow-600">Avisos:</p>
                          <ul className="text-sm text-yellow-600 list-disc list-inside">
                            {importResult.warnings.map((warning: string, index: number) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t('frameworks.import.upload_file')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('frameworks.import.drag_drop')}
                    </p>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="framework-file-upload"
                        disabled={importing}
                      />
                      <label
                        htmlFor="framework-file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          {t('frameworks.import.or_click')}
                        </span>
                      </label>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {t('frameworks.import.supported_formats')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {importing && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      <span>{t('frameworks.import.import_progress')}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 