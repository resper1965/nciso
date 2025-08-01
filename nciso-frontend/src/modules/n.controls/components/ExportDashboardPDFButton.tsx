'use client'

import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportDashboardPDFButtonProps {
  dashboardRef: React.RefObject<HTMLDivElement>
  tenantId: string
  filters?: {
    framework?: string
    type?: string
    status?: string
    domain?: string
    priority?: string
  }
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

interface PDFMetadata {
  title: string
  date: string
  tenant: string
  filters: Record<string, string>
  totalFrameworks: number
  totalControls: number
  averageCoverage: number
}

export function ExportDashboardPDFButton({
  dashboardRef,
  tenantId,
  filters = {},
  className = '',
  variant = 'outline',
  size = 'md'
}: ExportDashboardPDFButtonProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Função para gerar nome do arquivo
  const generateFileName = (): string => {
    const date = new Date().toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).replace(':', '-')
    
    const filterSuffix = Object.keys(filters).length > 0 
      ? `_${Object.keys(filters).join('-')}` 
      : ''
    
    return `dashboard_conformidade_${date}_${time}${filterSuffix}.pdf`
  }

  // Função para extrair metadados do dashboard
  const extractDashboardMetadata = (): PDFMetadata => {
    const now = new Date()
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value && value !== 'all')
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {} as Record<string, string>)

    return {
      title: t('controls.export.dashboard_title'),
      date: now.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      tenant: tenantId,
      filters: activeFilters,
      totalFrameworks: 0, // Será extraído do dashboard
      totalControls: 0, // Será extraído do dashboard
      averageCoverage: 0 // Será extraído do dashboard
    }
  }

  // Função para criar cabeçalho do PDF
  const createPDFHeader = (metadata: PDFMetadata): string => {
    const header = `
      <div style="
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        margin-bottom: 20px;
        font-family: 'Montserrat', sans-serif;
      ">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">
          ${metadata.title}
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
          ${t('controls.export.generated_on')}: ${metadata.date}
        </p>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">
          ${t('controls.export.tenant')}: ${metadata.tenant}
        </p>
      </div>
    `
    return header
  }

  // Função para criar seção de filtros
  const createFiltersSection = (filters: Record<string, string>): string => {
    if (Object.keys(filters).length === 0) {
      return `
        <div style="margin-bottom: 20px;">
          <p style="font-size: 14px; color: #666; font-style: italic;">
            ${t('controls.export.no_filters_applied')}
          </p>
        </div>
      `
    }

    const filterItems = Object.entries(filters)
      .map(([key, value]) => `
        <span style="
          display: inline-block;
          background: #f3f4f6;
          color: #374151;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 2px;
        ">
          ${t(`controls.export.filters.${key}`)}: ${value}
        </span>
      `).join('')

    return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; margin-bottom: 8px; color: #374151;">
          ${t('controls.export.filters_applied')}:
        </h3>
        <div style="margin-bottom: 8px;">
          ${filterItems}
        </div>
      </div>
    `
  }

  // Função para criar estatísticas
  const createStatsSection = (metadata: PDFMetadata): string => {
    return `
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      ">
        <div style="
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        ">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
            ${t('controls.export.stats.frameworks')}
          </h4>
          <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">
            ${metadata.totalFrameworks}
          </p>
        </div>
        <div style="
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
        ">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
            ${t('controls.export.stats.controls')}
          </h4>
          <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">
            ${metadata.totalControls}
          </p>
        </div>
        <div style="
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        ">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
            ${t('controls.export.stats.coverage')}
          </h4>
          <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">
            ${metadata.averageCoverage}%
          </p>
        </div>
      </div>
    `
  }

  // Função para capturar dashboard como imagem
  const captureDashboardAsImage = async (): Promise<string> => {
    if (!dashboardRef.current) {
      throw new Error('Dashboard element not found')
    }

    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2, // Alta qualidade
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: dashboardRef.current.scrollWidth,
      height: dashboardRef.current.scrollHeight,
      scrollX: 0,
      scrollY: 0
    })

    return canvas.toDataURL('image/png')
  }

  // Função principal de exportação
  const exportDashboardAsPDF = async () => {
    try {
      setIsExporting(true)
      setIsDialogOpen(false)

      // Extrair metadados
      const metadata = extractDashboardMetadata()

      // Capturar dashboard como imagem
      const dashboardImage = await captureDashboardAsImage()

      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20

      // Adicionar cabeçalho
      const headerHtml = createPDFHeader(metadata)
      pdf.html(headerHtml, {
        x: margin,
        y: margin,
        width: pageWidth - (margin * 2)
      })

      // Adicionar seção de filtros
      const filtersHtml = createFiltersSection(metadata.filters)
      pdf.html(filtersHtml, {
        x: margin,
        y: margin + 60,
        width: pageWidth - (margin * 2)
      })

      // Adicionar estatísticas
      const statsHtml = createStatsSection(metadata)
      pdf.html(statsHtml, {
        x: margin,
        y: margin + 120,
        width: pageWidth - (margin * 2)
      })

      // Adicionar dashboard como imagem
      const imageWidth = pageWidth - (margin * 2)
      const imageHeight = (dashboardImage.height * imageWidth) / dashboardImage.width
      
      pdf.addImage(
        dashboardImage,
        'PNG',
        margin,
        margin + 200,
        imageWidth,
        imageHeight
      )

      // Adicionar rodapé
      const footerText = `${t('controls.export.generated_by')} n.CISO - ${new Date().toLocaleDateString('pt-BR')}`
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(
        footerText,
        margin,
        pageHeight - 10
      )

      // Salvar PDF
      const fileName = generateFileName()
      pdf.save(fileName)

      toast({
        title: t('controls.export.success.title'),
        description: t('controls.export.success.description', { fileName }),
        variant: 'default'
      })

    } catch (error) {
      console.error('❌ Erro ao exportar PDF:', error)
      
      toast({
        title: t('controls.export.error.title'),
        description: t('controls.export.error.description'),
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Função para preview do PDF
  const handlePreview = () => {
    setIsDialogOpen(true)
  }

  return (
    <>
      <Button
        onClick={handlePreview}
        variant={variant}
        size={size}
        className={className}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? t('controls.export.exporting') : t('controls.export.title')}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('controls.export.preview.title')}
            </DialogTitle>
            <DialogDescription>
              {t('controls.export.preview.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informações do arquivo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {t('controls.export.preview.file_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t('controls.export.preview.filename')}:
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {generateFileName()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t('controls.export.preview.format')}:
                  </span>
                  <Badge variant="outline" className="text-xs">
                    PDF
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Filtros aplicados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {t('controls.export.preview.filters')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(filters).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(filters).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {t(`controls.export.filters.${key}`)}:
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t('controls.export.preview.no_filters')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Conteúdo incluído */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {t('controls.export.preview.content')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t('controls.export.preview.content_header')}</li>
                  <li>• {t('controls.export.preview.content_filters')}</li>
                  <li>• {t('controls.export.preview.content_stats')}</li>
                  <li>• {t('controls.export.preview.content_charts')}</li>
                  <li>• {t('controls.export.preview.content_footer')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Botões de ação */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isExporting}
            >
              {t('controls.export.preview.cancel')}
            </Button>
            <Button
              onClick={exportDashboardAsPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? t('controls.export.exporting') : t('controls.export.preview.export')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 