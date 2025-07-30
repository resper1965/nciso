import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Download, 
  Filter,
  BarChart3
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/components/layout/main-layout'
import { 
  MCPFormPageTemplate,
  MCPComponentFactory
} from '@/components/mcp'
import { EffectivenessTable } from '@/components/isms/effectiveness-table'
import { EffectivenessDashboard } from '@/components/isms/effectiveness-dashboard'
import { EffectivenessBadge, CriticalEffectivenessBadge } from '@/components/isms/effectiveness-badge'
import { 
  mockAssessments, 
  mockControls,
  calculateEffectivenessSummary,
  isImprovementNeeded
} from '@/models/control-assessment'

// =====================================================
// EFFECTIVENESS PAGE
// =====================================================

export const EffectivenessPage: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const summary = calculateEffectivenessSummary(mockAssessments)
  const criticalControls = mockAssessments.filter(a => a.score < 30)
  const improvementNeeded = mockAssessments.filter(a => isImprovementNeeded(a.score))

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleCreateAssessment = () => {
    setSelectedAssessment(null)
    setShowAssessmentForm(true)
  }

  const handleEditAssessment = (assessment: any) => {
    setSelectedAssessment(assessment)
    setShowAssessmentForm(true)
  }

  const handleViewAssessment = (assessment: any) => {
    setSelectedAssessment(assessment)
    // Implementar visualização detalhada
    console.log('View assessment:', assessment)
  }

  const handleDeleteAssessment = (assessment: any) => {
    // Implementar confirmação e exclusão
    console.log('Delete assessment:', assessment)
  }

  const handleViewHistory = (controlId: string) => {
    // Implementar visualização do histórico
    console.log('View history for control:', controlId)
  }

  const handleViewCritical = () => {
    setActiveTab('table')
    // Implementar filtro para controles críticos
  }

  const handleViewImprovements = () => {
    setActiveTab('table')
    // Implementar filtro para controles que precisam de melhoria
  }

  const handleExportData = () => {
    // Implementar exportação de dados
    console.log('Export effectiveness data')
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('pages.effectiveness.title')}
            </h1>
            <p className="text-gray-600">
              {t('pages.effectiveness.description')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {criticalControls.length > 0 && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                {criticalControls.length} {t('pages.effectiveness.critical')}
              </Badge>
            )}
            
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
            
            <Dialog open={showAssessmentForm} onOpenChange={setShowAssessmentForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('assessment.actions.create')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedAssessment 
                      ? t('assessment.actions.edit')
                      : t('assessment.actions.create')
                    }
                  </DialogTitle>
                </DialogHeader>
                
                <MCPFormPageTemplate
                  type="control_assessment"
                  user={{ role: 'admin' }}
                  data={selectedAssessment}
                  onSubmit={(data) => {
                    console.log('Assessment submitted:', data)
                    setShowAssessmentForm(false)
                  }}
                  onCancel={() => setShowAssessmentForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('dashboard.overall_effectiveness')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.average_score}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('dashboard.total_controls')}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.total_controls}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('dashboard.high_effectiveness')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.high_effectiveness}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('dashboard.improvement_needed')}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summary.improvement_needed}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">
              📊 {t('pages.effectiveness.dashboard')}
            </TabsTrigger>
            <TabsTrigger value="table">
              📋 {t('pages.effectiveness.table')}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              📈 {t('pages.effectiveness.analytics')}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <EffectivenessDashboard
              assessments={mockAssessments}
              controls={mockControls}
              onViewCritical={handleViewCritical}
              onViewImprovements={handleViewImprovements}
              onViewHistory={handleViewHistory}
            />
          </TabsContent>

          {/* Table Tab */}
          <TabsContent value="table" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('pages.effectiveness.assessments_table')}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {mockAssessments.length} {t('common.assessments')}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EffectivenessTable
                  assessments={mockAssessments}
                  controls={mockControls}
                  onViewAssessment={handleViewAssessment}
                  onEditAssessment={handleEditAssessment}
                  onDeleteAssessment={handleDeleteAssessment}
                  onViewHistory={handleViewHistory}
                  user={{ role: 'admin' }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Effectiveness Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('pages.effectiveness.trends')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>{t('pages.effectiveness.trends_coming_soon')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Domain Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('pages.effectiveness.domain_analysis')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <Filter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>{t('pages.effectiveness.domain_analysis_coming_soon')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Critical Controls Alert */}
        {criticalControls.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {t('pages.effectiveness.critical_alert_title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  {t('pages.effectiveness.critical_alert_description', { 
                    count: criticalControls.length 
                  })}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {criticalControls.slice(0, 4).map((assessment) => {
                    const control = mockControls.find(c => c.id === assessment.control_id)
                    
                    return (
                      <div key={assessment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {control?.name || 'Unknown Control'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Score: {assessment.score}%
                          </div>
                        </div>
                        
                        <EffectivenessBadge
                          score={assessment.score}
                          size="sm"
                        />
                      </div>
                    )
                  })}
                </div>
                
                {criticalControls.length > 4 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={handleViewCritical}>
                      {t('pages.effectiveness.view_all_critical')} ({criticalControls.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

export default EffectivenessPage 