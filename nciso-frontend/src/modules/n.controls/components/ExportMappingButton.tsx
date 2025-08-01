'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText, FileJson, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ExportService } from '../services/ExportService'

interface ExportMappingButtonProps {
  tenantId: string
  filters?: {
    domain?: string
    type?: string
    framework?: string
    status?: string
  }
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export function ExportMappingButton({ 
  tenantId, 
  filters = {}, 
  className,
  variant = 'outline',
  size = 'default'
}: ExportMappingButtonProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [isExporting, setIsExporting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [exportStats, setExportStats] = useState<{
    totalMappings: number
    totalControls: number
    totalFrameworks: number
    estimatedFileSize: string
  } | null>(null)

  const handleExport = async (format: 'csv' | 'json') => {
    if (!tenantId) {
      toast({
        title: t('common.error'),
        description: t('controls.export.error_no_tenant'),
        variant: 'destructive'
      })
      return
    }

    try {
      setIsExporting(true)

      // Validar permissão
      const hasPermission = await ExportService.validateExportPermission(tenantId)
      if (!hasPermission) {
        toast({
          title: t('common.error'),
          description: t('controls.export.error_permission'),
          variant: 'destructive'
        })
        return
      }

      // Executar exportação
      await ExportService.exportMappings(tenantId, {
        format,
        filters,
        includeHeaders: true
      })

      toast({
        title: t('common.success'),
        description: t('controls.export.success', { format: format.toUpperCase() }),
      })

    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: t('common.error'),
        description: t('controls.export.error_general'),
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const loadExportStats = async () => {
    try {
      const stats = await ExportService.getExportStats(tenantId, filters)
      setExportStats(stats)
    } catch (error) {
      console.error('Error loading export stats:', error)
    }
  }

  const handleDialogOpen = (open: boolean) => {
    setShowDialog(open)
    if (open && !exportStats) {
      loadExportStats()
    }
  }

  const getFilterSummary = () => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => value)
    return activeFilters.map(([key, value]) => `${key}: ${value}`).join(', ')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className={className}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? t('controls.export.exporting') : t('controls.export.title')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            {t('controls.export.format.csv')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="h-4 w-4 mr-2" />
            {t('controls.export.format.json')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDialogOpen(true)}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t('controls.export.preview')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={handleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t('controls.export.preview_title')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Estatísticas */}
            {exportStats && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t('controls.export.stats.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('controls.export.stats.mappings')}
                    </span>
                    <Badge variant="secondary">{exportStats.totalMappings}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('controls.export.stats.controls')}
                    </span>
                    <Badge variant="secondary">{exportStats.totalControls}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('controls.export.stats.frameworks')}
                    </span>
                    <Badge variant="secondary">{exportStats.totalFrameworks}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('controls.export.stats.file_size')}
                    </span>
                    <Badge variant="outline">{exportStats.estimatedFileSize}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filtros Aplicados */}
            {Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t('controls.export.filters.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {getFilterSummary()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              <Button 
                onClick={() => handleExport('csv')} 
                className="flex-1"
                disabled={isExporting}
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('controls.export.format.csv')}
              </Button>
              <Button 
                onClick={() => handleExport('json')} 
                className="flex-1"
                disabled={isExporting}
              >
                <FileJson className="h-4 w-4 mr-2" />
                {t('controls.export.format.json')}
              </Button>
            </div>

            {/* Informações */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• {t('controls.export.info.csv_excel')}</p>
              <p>• {t('controls.export.info.json_audit')}</p>
              <p>• {t('controls.export.info.timestamp')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 