import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Link, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  BarChart3,
  Eye,
  Edit
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { 
  FrameworkCrosswalk, 
  CrosswalkAnalysis,
  getRelationTypeLabel,
  getRelationTypeColor,
  getRelationTypeIcon,
  getConfidenceColor,
  getConfidenceLabel
} from '@/models/framework-crosswalk'

interface CrosswalkMatrixProps {
  crosswalks: FrameworkCrosswalk[]
  analysis: CrosswalkAnalysis[]
  onViewCrosswalk?: (crosswalk: FrameworkCrosswalk) => void
  onEditCrosswalk?: (crosswalk: FrameworkCrosswalk) => void
  onAnalyzeFramework?: (frameworkId: string) => void
  user?: any
  className?: string
}

export const CrosswalkMatrix: React.FC<CrosswalkMatrixProps> = ({
  crosswalks,
  analysis,
  onViewCrosswalk,
  onEditCrosswalk,
  onAnalyzeFramework,
  user,
  className
}) => {
  const { t } = useTranslation("common")

  const renderRelationBadge = (crosswalk: FrameworkCrosswalk) => {
    const Icon = getRelationTypeIcon(crosswalk.relation_type)
    const color = getRelationTypeColor(crosswalk.relation_type)
    const label = getRelationTypeLabel(crosswalk.relation_type)

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`cursor-pointer ${color}`}>
              <Icon className="mr-1 h-3 w-3" />
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <div className="font-medium">{label}</div>
              <div className="text-sm text-muted-foreground">
                Confidence: {Math.round(crosswalk.confidence_score * 100)}%
              </div>
              {crosswalk.notes && (
                <div className="text-sm">{crosswalk.notes}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const renderConfidenceBadge = (score: number) => {
    const color = getConfidenceColor(score)
    const label = getConfidenceLabel(score)

    return (
      <Badge className={color}>
        {Math.round(score * 100)}%
      </Badge>
    )
  }

  const renderFrameworkCard = (framework: CrosswalkAnalysis) => (
    <Card key={framework.framework_id} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{framework.framework_name}</CardTitle>
            <CardDescription>
              {framework.total_controls} {t('table.framework.controls')}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {onAnalyzeFramework && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAnalyzeFramework(framework.framework_id)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('table.framework.coverage')}</span>
            <span className="font-medium">{framework.coverage_percentage}%</span>
          </div>
          <Progress value={framework.coverage_percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">{t('table.framework.mapped')}</div>
            <div className="font-medium">{framework.mapped_controls}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('table.framework.crosswalks')}</div>
            <div className="font-medium">{framework.crosswalk_count}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{t('table.framework.average_confidence')}</div>
          {renderConfidenceBadge(framework.average_confidence)}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">{t('table.framework.domains')}</div>
          <div className="space-y-1">
            {framework.domains.slice(0, 3).map((domain, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="truncate">{domain.domain}</span>
                <span className="font-medium">{domain.coverage}%</span>
              </div>
            ))}
            {framework.domains.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{framework.domains.length - 3} {t('table.framework.more_domains')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCrosswalkTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('table.crosswalk.title')}</CardTitle>
        <CardDescription>
          {t('table.crosswalk.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {crosswalks.map((crosswalk) => (
            <div key={crosswalk.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {crosswalk.source_control_id} → {crosswalk.target_control_id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {crosswalk.source_framework_id} → {crosswalk.target_framework_id}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {renderRelationBadge(crosswalk)}
                  {renderConfidenceBadge(crosswalk.confidence_score)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {crosswalk.is_ai_generated && (
                  <Badge variant="outline" className="text-xs">
                    AI
                  </Badge>
                )}
                
                {onViewCrosswalk && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCrosswalk(crosswalk)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                
                {onEditCrosswalk && user?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditCrosswalk(crosswalk)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          {t('crosswalk.matrix.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('crosswalk.matrix.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analysis.map(renderFrameworkCard)}
      </div>

      {crosswalks.length > 0 && renderCrosswalkTable()}
    </div>
  )
}

// Hook para usar CrosswalkMatrix
export const useCrosswalkMatrix = () => {
  const { t } = useTranslation("common")
  
  return {
    t
  }
}

// Componente de exemplo de uso
export const CrosswalkMatrixExample: React.FC = () => {
  const { getFrameworkCrosswalkMockData, getCrosswalkAnalysisMockData } = require('@/models/framework-crosswalk')
  
  const crosswalks = getFrameworkCrosswalkMockData()
  const analysis = getCrosswalkAnalysisMockData()

  const handleViewCrosswalk = (crosswalk: FrameworkCrosswalk) => {
    console.log('View crosswalk:', crosswalk)
  }

  const handleEditCrosswalk = (crosswalk: FrameworkCrosswalk) => {
    console.log('Edit crosswalk:', crosswalk)
  }

  const handleAnalyzeFramework = (frameworkId: string) => {
    console.log('Analyze framework:', frameworkId)
  }

  return (
    <CrosswalkMatrix
      crosswalks={crosswalks}
      analysis={analysis}
      onViewCrosswalk={handleViewCrosswalk}
      onEditCrosswalk={handleEditCrosswalk}
      onAnalyzeFramework={handleAnalyzeFramework}
      user={{ role: 'admin' }}
    />
  )
} 