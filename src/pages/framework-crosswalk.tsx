import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { CrosswalkMatrix } from '@/components/isms/crosswalk-matrix'
import { CrosswalkDrawer } from '@/components/isms/crosswalk-drawer'
import { FrameworkTable } from '@/components/isms/framework-table'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Link, 
  Plus, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle 
} from "lucide-react"
import { useTranslation } from 'react-i18next'
import { 
  getFrameworkCrosswalkMockData, 
  getCrosswalkAnalysisMockData,
  getFrameworkMockData 
} from '@/models/framework-crosswalk'
import { Framework } from '@/models/framework'

const FrameworkCrosswalkPage: React.FC = () => {
  const { t } = useTranslation("common")
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [selectedCrosswalk, setSelectedCrosswalk] = React.useState<any>(null)
  const [activeTab, setActiveTab] = React.useState('matrix')

  const crosswalks = getFrameworkCrosswalkMockData()
  const analysis = getCrosswalkAnalysisMockData()
  const frameworks = getFrameworkMockData()

  const handleCreateCrosswalk = () => {
    setSelectedCrosswalk(null)
    setIsDrawerOpen(true)
  }

  const handleEditCrosswalk = (crosswalk: any) => {
    setSelectedCrosswalk(crosswalk)
    setIsDrawerOpen(true)
  }

  const handleViewCrosswalk = (crosswalk: any) => {
    console.log('View crosswalk:', crosswalk)
  }

  const handleAnalyzeFramework = (frameworkId: string) => {
    console.log('Analyze framework:', frameworkId)
  }

  const handleSaveCrosswalk = (data: any) => {
    console.log('Save crosswalk:', data)
    setIsDrawerOpen(false)
  }

  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{frameworks.length}</div>
          <p className="text-xs text-muted-foreground">
            Frameworks ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Crosswalks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{crosswalks.length}</div>
          <p className="text-xs text-muted-foreground">
            Correlações criadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cobertura Média</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(analysis.reduce((sum, a) => sum + a.coverage_percentage, 0) / analysis.length)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Cobertura entre frameworks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(analysis.reduce((sum, a) => sum + a.average_confidence, 0) / analysis.length * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Score de confiança
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderRelationTypes = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Tipos de Relação</CardTitle>
        <CardDescription>
          Entenda os diferentes tipos de correlação entre frameworks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium">Equivalent</div>
              <div className="text-sm text-muted-foreground">
                Controles com mesmo objetivo e abordagem
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium">Partial Overlap</div>
              <div className="text-sm text-muted-foreground">
                Controles com objetivos relacionados
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Link className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">Related</div>
              <div className="text-sm text-muted-foreground">
                Controles complementares
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderAIFeatures = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>IA para Sugestões</span>
        </CardTitle>
        <CardDescription>
          Sistema de IA que gera sugestões automáticas de correlações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Funcionalidades</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Análise semântica de controles</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Sugestões baseadas em similaridade</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Score de confiança automático</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Aprendizado contínuo</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Benefícios</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Redução de 80% no tempo manual</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Maior precisão nas correlações</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Cobertura completa de frameworks</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Revisão manual simplificada</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Framework Crosswalk</h1>
          <p className="text-muted-foreground">
            Correlações entre frameworks de segurança da informação
          </p>
        </div>

        {renderStatistics()}
        {renderRelationTypes()}
        {renderAIFeatures()}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Análise de Correlações</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie correlações entre frameworks
            </p>
          </div>
          <Button onClick={handleCreateCrosswalk}>
            <Plus className="mr-2 h-4 w-4" />
            {t('crosswalk.create_new')}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="matrix">Matrix View</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix" className="space-y-4">
            <CrosswalkMatrix
              crosswalks={crosswalks}
              analysis={analysis}
              onViewCrosswalk={handleViewCrosswalk}
              onEditCrosswalk={handleEditCrosswalk}
              onAnalyzeFramework={handleAnalyzeFramework}
              user={{ role: 'admin' }}
            />
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4">
            <FrameworkTable
              frameworks={frameworks}
              onEdit={(framework) => console.log('Edit framework:', framework)}
              onDelete={(framework) => console.log('Delete framework:', framework)}
              onView={(framework) => console.log('View framework:', framework)}
              onExport={(framework) => console.log('Export framework:', framework)}
              onAnalyze={(framework) => console.log('Analyze framework:', framework)}
              user={{ role: 'admin' }}
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.map((framework) => (
                <Card key={framework.framework_id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{framework.framework_name}</CardTitle>
                    <CardDescription>
                      Análise detalhada de cobertura
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cobertura Geral</span>
                        <span className="font-medium">{framework.coverage_percentage}%</span>
                      </div>
                      <Progress value={framework.coverage_percentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Controles</div>
                        <div className="font-medium">{framework.total_controls}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Mapeados</div>
                        <div className="font-medium">{framework.mapped_controls}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Domínios</div>
                      <div className="space-y-1">
                        {framework.domains.map((domain, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="truncate">{domain.domain}</span>
                            <span className="font-medium">{domain.coverage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <CrosswalkDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          crosswalk={selectedCrosswalk}
          sourceControl={{
            id: 'iso-a-5-1',
            name: 'Políticas de Segurança da Informação',
            description: 'Estabelecer políticas de segurança da informação',
            framework: 'ISO 27001'
          }}
          targetControls={[
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
          ]}
          onSave={handleSaveCrosswalk}
          user={{ role: 'admin' }}
        />
      </div>
    </MainLayout>
  )
}

export default FrameworkCrosswalkPage 