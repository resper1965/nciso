'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { EvaluationsService } from '@/lib/services/evaluations'
import { Evaluation, EvaluationFormData, Question, EvaluationResponseFormData } from '@/lib/types/isms'
import { ismsScopeService } from '@/lib/services/isms'
import { domainService } from '@/lib/services/isms'

interface EvaluationFormProps {
  evaluation?: Evaluation | null
  onClose: () => void
  onSuccess: () => void
}

export function EvaluationForm({ evaluation, onClose, onSuccess }: EvaluationFormProps) {
  const { t } = useTranslation('isms')
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EvaluationFormData>({
    name: '',
    description: '',
    scope_id: '',
    domain_id: '',
    control_id: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [scopes, setScopes] = useState<any[]>([])
  const [domains, setDomains] = useState<any[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Record<string, EvaluationResponseFormData>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showQuestions, setShowQuestions] = useState(false)

  const isEditing = !!evaluation

  useEffect(() => {
    loadInitialData()
    if (evaluation) {
      setFormData({
        name: evaluation.name,
        description: evaluation.description,
        scope_id: evaluation.scope_id,
        domain_id: evaluation.domain_id,
        control_id: evaluation.control_id || '',
        start_date: evaluation.start_date.split('T')[0],
        notes: evaluation.notes || ''
      })
    }
  }, [evaluation])

  const loadInitialData = async () => {
    try {
      const [scopesData, domainsData] = await Promise.all([
        ismsScopeService.list(),
        domainService.list()
      ])
      
      setScopes(scopesData.data || [])
      setDomains(domainsData.data || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadQuestions = async () => {
    if (!formData.domain_id) return

    try {
      const questionsData = await EvaluationsService.listQuestions({
        domain_id: formData.domain_id,
        active: true
      })
      setQuestions(questionsData.data || [])
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.scope_id || !formData.domain_id) {
      toast({
        title: t('evaluations.validationError'),
        description: t('evaluations.requiredFields'),
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      if (isEditing) {
        await EvaluationsService.update(evaluation!.id, formData)
        toast({
          title: t('evaluations.updateSuccess'),
          description: t('evaluations.updateSuccessDesc')
        })
      } else {
        const newEvaluation = await EvaluationsService.create(formData)
        toast({
          title: t('evaluations.createSuccess'),
          description: t('evaluations.createSuccessDesc')
        })
        
        // Load questions for the new evaluation
        await loadQuestions()
        setShowQuestions(true)
        return // Don't close the form yet, show questions
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving evaluation:', error)
      toast({
        title: t('evaluations.saveError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionResponse = async (questionId: string, response: EvaluationResponseFormData) => {
    try {
      if (!evaluation) return
      
      await EvaluationsService.saveResponse(evaluation.id, questionId, response)
      setResponses(prev => ({ ...prev, [questionId]: response }))
      
      toast({
        title: t('evaluations.responseSaved'),
        description: t('evaluations.responseSavedDesc')
      })
    } catch (error) {
      console.error('Error saving response:', error)
      toast({
        title: t('evaluations.responseError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleFileUpload = (questionId: string, files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        evidence_files: fileArray
      }
    }))
  }

  const renderQuestionInput = (question: Question) => {
    const currentResponse = responses[question.id] || {}

    switch (question.question_type) {
      case 'yes_no':
        return (
          <div className="space-y-2">
            <Label>{t('evaluations.selectAnswer')}</Label>
            <Select
              value={currentResponse.response_value?.toString() || ''}
              onValueChange={(value) => {
                const newResponse = { ...currentResponse, response_value: value === 'true' }
                setResponses(prev => ({ ...prev, [question.id]: newResponse }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('evaluations.selectYesNo')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t('evaluations.yes')}</SelectItem>
                <SelectItem value="false">{t('evaluations.no')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            <Label>{t('evaluations.selectOption')}</Label>
            <Select
              value={currentResponse.response_value?.toString() || ''}
              onValueChange={(value) => {
                const newResponse = { ...currentResponse, response_value: value }
                setResponses(prev => ({ ...prev, [question.id]: newResponse }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('evaluations.selectOption')} />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'scale':
        return (
          <div className="space-y-2">
            <Label>{t('evaluations.selectScale')}</Label>
            <Select
              value={currentResponse.response_value?.toString() || ''}
              onValueChange={(value) => {
                const newResponse = { ...currentResponse, response_value: parseInt(value) }
                setResponses(prev => ({ ...prev, [question.id]: newResponse }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('evaluations.selectScale')} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: (question.scale_max || 5) - (question.scale_min || 1) + 1 }, (_, i) => {
                  const value = (question.scale_min || 1) + i
                  const label = question.scale_labels?.[i] || value.toString()
                  return (
                    <SelectItem key={value} value={value.toString()}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-2">
            <Label>{t('evaluations.textAnswer')}</Label>
            <Textarea
              value={currentResponse.response_text || ''}
              onChange={(e) => {
                const newResponse = { ...currentResponse, response_text: e.target.value }
                setResponses(prev => ({ ...prev, [question.id]: newResponse }))
              }}
              placeholder={t('evaluations.textAnswerPlaceholder')}
              rows={4}
            />
          </div>
        )

      case 'file':
        return (
          <div className="space-y-2">
            <Label>{t('evaluations.uploadEvidence')}</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mr-2" />
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(question.id, e.target.files)}
                  className="hidden"
                  id={`file-${question.id}`}
                />
                <label htmlFor={`file-${question.id}`} className="cursor-pointer text-blue-600 hover:text-blue-800">
                  {t('evaluations.chooseFiles')}
                </label>
              </div>
              {currentResponse.evidence_files && currentResponse.evidence_files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{t('evaluations.selectedFiles')}:</p>
                  <ul className="text-sm">
                    {currentResponse.evidence_files.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getProgressPercentage = () => {
    if (questions.length === 0) return 0
    const answeredQuestions = Object.keys(responses).length
    return (answeredQuestions / questions.length) * 100
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? t('evaluations.edit') : t('evaluations.create')}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {!showQuestions ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('evaluations.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('evaluations.namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">{t('evaluations.startDate')} *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('evaluations.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('evaluations.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope_id">{t('evaluations.scope')} *</Label>
                <Select
                  value={formData.scope_id}
                  onValueChange={(value) => setFormData({ ...formData, scope_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('evaluations.selectScope')} />
                  </SelectTrigger>
                  <SelectContent>
                    {scopes.map((scope) => (
                      <SelectItem key={scope.id} value={scope.id}>
                        {scope.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain_id">{t('evaluations.domain')} *</Label>
                <Select
                  value={formData.domain_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, domain_id: value })
                    loadQuestions()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('evaluations.selectDomain')} />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('evaluations.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('evaluations.notesPlaceholder')}
                rows={3}
              />
            </div>

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
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('evaluations.questionnaire')}</span>
                  <Badge variant="outline">
                    {Object.keys(responses).length} / {questions.length} {t('evaluations.answered')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={getProgressPercentage()} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t('evaluations.progressDescription')}
                </p>
              </CardContent>
            </Card>

            {/* Questions */}
            {questions.length > 0 && (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">
                          {t('evaluations.question')} {index + 1}: {question.question_text}
                        </span>
                        {question.required && (
                          <Badge variant="destructive">{t('evaluations.required')}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {renderQuestionInput(question)}
                      
                      <div className="space-y-2">
                        <Label>{t('evaluations.additionalNotes')}</Label>
                        <Textarea
                          value={responses[question.id]?.notes || ''}
                          onChange={(e) => {
                            const newResponse = { ...responses[question.id], notes: e.target.value }
                            setResponses(prev => ({ ...prev, [question.id]: newResponse }))
                          }}
                          placeholder={t('evaluations.notesPlaceholder')}
                          rows={2}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleQuestionResponse(question.id, responses[question.id] || {})}
                          disabled={!responses[question.id]?.response_value}
                        >
                          {t('evaluations.saveResponse')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('common.close')}
              </Button>
              <Button onClick={onSuccess}>
                {t('evaluations.completeEvaluation')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 