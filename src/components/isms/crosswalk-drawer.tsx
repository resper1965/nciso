import React from 'react'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Link, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Sparkles,
  Brain,
  Eye,
  Edit
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { 
  FrameworkCrosswalk, 
  CrosswalkRelationType,
  getRelationTypeLabel,
  getRelationTypeColor,
  getRelationTypeIcon,
  getConfidenceColor,
  getConfidenceLabel,
  generateCrosswalkSuggestions,
  CrosswalkAISuggestion
} from '@/models/framework-crosswalk'

interface CrosswalkDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  crosswalk?: FrameworkCrosswalk
  sourceControl?: any
  targetFramework?: any
  targetControls?: any[]
  onSave?: (crosswalk: Partial<FrameworkCrosswalk>) => void
  onGenerateSuggestions?: () => void
  user?: any
  className?: string
}

export const CrosswalkDrawer: React.FC<CrosswalkDrawerProps> = ({
  isOpen,
  onOpenChange,
  crosswalk,
  sourceControl,
  targetFramework,
  targetControls = [],
  onSave,
  onGenerateSuggestions,
  user,
  className
}) => {
  const { t } = useTranslation("common")
  const [formData, setFormData] = React.useState<Partial<FrameworkCrosswalk>>({
    relation_type: 'suggested',
    confidence_score: 0.5,
    is_public: true,
    is_ai_generated: false,
    notes: ''
  })
  const [suggestions, setSuggestions] = React.useState<CrosswalkAISuggestion[]>([])
  const [isGenerating, setIsGenerating] = React.useState(false)

  React.useEffect(() => {
    if (crosswalk) {
      setFormData(crosswalk)
    } else {
      setFormData({
        relation_type: 'suggested',
        confidence_score: 0.5,
        is_public: true,
        is_ai_generated: false,
        notes: ''
      })
    }
  }, [crosswalk])

  const handleGenerateSuggestions = async () => {
    if (!sourceControl || !targetFramework || !targetControls.length) return

    setIsGenerating(true)
    try {
      const aiSuggestions = await generateCrosswalkSuggestions(
        sourceControl,
        targetFramework,
        targetControls
      )
      setSuggestions(aiSuggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSuggestionSelect = (suggestion: CrosswalkAISuggestion) => {
    setFormData({
      ...formData,
      target_control_id: suggestion.target_control.id,
      relation_type: suggestion.relation_type,
      confidence_score: suggestion.confidence_score,
      notes: suggestion.suggested_notes,
      is_ai_generated: true
    })
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
      onOpenChange(false)
    }
  }

  const renderRelationTypeOptions = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('forms.crosswalk.relation_type')}</label>
      <Select
        value={formData.relation_type}
        onValueChange={(value) => setFormData({ ...formData, relation_type: value as CrosswalkRelationType })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equivalent">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('relation_type.equivalent')}</span>
            </div>
          </SelectItem>
          <SelectItem value="partial_overlap">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span>{t('relation_type.partial_overlap')}</span>
            </div>
          </SelectItem>
          <SelectItem value="related">
            <div className="flex items-center space-x-2">
              <Link className="h-4 w-4 text-blue-600" />
              <span>{t('relation_type.related')}</span>
            </div>
          </SelectItem>
          <SelectItem value="suggested">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-gray-600" />
              <span>{t('relation_type.suggested')}</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  const renderConfidenceSlider = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('forms.crosswalk.confidence_score')}</label>
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={formData.confidence_score}
          onChange={(e) => setFormData({ ...formData, confidence_score: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">0%</span>
          <Badge className={getConfidenceColor(formData.confidence_score || 0)}>
            {Math.round((formData.confidence_score || 0) * 100)}%
          </Badge>
          <span className="text-muted-foreground">100%</span>
        </div>
      </div>
    </div>
  )

  const renderSourceControl = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{t('crosswalk.source_control')}</CardTitle>
      </CardHeader>
      <CardContent>
        {sourceControl ? (
          <div className="space-y-2">
            <div className="font-medium">{sourceControl.name}</div>
            <div className="text-sm text-muted-foreground">{sourceControl.description}</div>
            <Badge variant="outline">{sourceControl.framework}</Badge>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {t('crosswalk.select_source_control')}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderTargetControl = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{t('crosswalk.target_control')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={formData.target_control_id}
          onValueChange={(value) => setFormData({ ...formData, target_control_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('crosswalk.select_target_control')} />
          </SelectTrigger>
          <SelectContent>
            {targetControls.map((control) => (
              <SelectItem key={control.id} value={control.id}>
                <div className="space-y-1">
                  <div className="font-medium">{control.name}</div>
                  <div className="text-xs text-muted-foreground">{control.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )

  const renderAISuggestions = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{t('crosswalk.ai_suggestions')}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
          >
            <Brain className="mr-2 h-4 w-4" />
            {isGenerating ? t('common.generating') : t('crosswalk.generate_suggestions')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{suggestion.target_control.name}</span>
                  </div>
                  <Badge className={getConfidenceColor(suggestion.confidence_score)}>
                    {Math.round(suggestion.confidence_score * 100)}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {suggestion.target_control.description}
                </div>
                <div className="text-xs text-muted-foreground">
                  {suggestion.reasoning}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            {t('crosswalk.no_suggestions')}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>
              {crosswalk ? t('crosswalk.edit_title') : t('crosswalk.create_title')}
            </DrawerTitle>
            <DrawerDescription>
              {t('crosswalk.description')}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSourceControl()}
              {renderTargetControl()}
            </div>

            <Separator />

            {renderAISuggestions()}

            <Separator />

            <div className="space-y-4">
              {renderRelationTypeOptions()}
              {renderConfidenceSlider()}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('forms.crosswalk.notes')}</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('forms.crosswalk.notes_placeholder')}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                />
                <label htmlFor="is_public" className="text-sm">
                  {t('forms.crosswalk.is_public')}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('actions.cancel')}
              </Button>
              <Button onClick={handleSave}>
                {crosswalk ? t('actions.save') : t('actions.create')}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Hook para usar CrosswalkDrawer
export const useCrosswalkDrawer = () => {
  const { t } = useTranslation("common")
  
  return {
    t
  }
}

// Componente de exemplo de uso
export const CrosswalkDrawerExample: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [crosswalk, setCrosswalk] = React.useState<FrameworkCrosswalk | undefined>()

  const handleSave = (data: Partial<FrameworkCrosswalk>) => {
    console.log('Save crosswalk:', data)
    setIsOpen(false)
  }

  const mockSourceControl = {
    id: 'iso-a-5-1',
    name: 'Políticas de Segurança da Informação',
    description: 'Estabelecer políticas de segurança da informação',
    framework: 'ISO 27001'
  }

  const mockTargetControls = [
    {
      id: 'nist-ac-1',
      name: 'Access Control Policy and Procedures',
      description: 'Develop, document, and disseminate access control policy',
      framework: 'NIST'
    },
    {
      id: 'nist-ac-2',
      name: 'Account Management',
      description: 'Manage information system accounts',
      framework: 'NIST'
    }
  ]

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        {t('crosswalk.create_new')}
      </Button>

      <CrosswalkDrawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        crosswalk={crosswalk}
        sourceControl={mockSourceControl}
        targetControls={mockTargetControls}
        onSave={handleSave}
        user={{ role: 'admin' }}
      />
    </div>
  )
} 