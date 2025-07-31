'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  Target, 
  BookOpen, 
  Plus,
  Download,
  Search,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Settings,
  Filter
} from 'lucide-react'
import { 
  useISMSMetrics, 
  usePolicies, 
  useControls, 
  useDomains, 
  useFrameworks, 
  useAssessments,
  type Policy,
  type Control,
  type Domain,
  type Framework,
  type Assessment
} from '@/lib/hooks/useISMSData'
import { PolicyModal } from '@/components/isms/PolicyModal'
import { ControlModal } from '@/components/isms/ControlModal'

export default function ISMSPage() {
  const { t } = useTranslation('isms')
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [showControlModal, setShowControlModal] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>()
  const [selectedControl, setSelectedControl] = useState<Control | undefined>()
  const [modalLoading, setModalLoading] = useState(false)

  // Hooks para dados reais
  const { metrics, loading: metricsLoading } = useISMSMetrics()
  const { policies, loading: policiesLoading, createPolicy, updatePolicy, deletePolicy } = usePolicies()
  const { controls, loading: controlsLoading, createControl, updateControl, deleteControl } = useControls()
  const { domains, loading: domainsLoading } = useDomains()
  const { frameworks, loading: frameworksLoading } = useFrameworks()
  const { assessments, loading: assessmentsLoading, createAssessment } = useAssessments()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600 dark:text-gray-400">
              {t('common.loading')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getEffectivenessColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'implemented':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'draft':
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'review':
      case 'not_implemented':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'archived':
      case 'planned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const filteredPolicies = policies?.filter(policy => 
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedStatus === 'all' || policy.status === selectedStatus)
  ) || []

  const filteredControls = controls?.filter(control => 
    control.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedStatus === 'all' || control.status === selectedStatus)
  ) || []

  const handlePolicySubmit = async (policy: Omit<Policy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Salvando política:', policy)
      setModalLoading(true)
      if (selectedPolicy) {
        console.log('Atualizando política existente:', selectedPolicy.id)
        const result = await updatePolicy(selectedPolicy.id, policy)
        console.log('Política atualizada:', result)
      } else {
        console.log('Criando nova política')
        const result = await createPolicy(policy)
        console.log('Política criada:', result)
      }
      setShowPolicyModal(false)
    } catch (error) {
      console.error('Erro ao salvar política:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleControlSubmit = async (control: Omit<Control, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Salvando controle:', control)
      setModalLoading(true)
      if (selectedControl) {
        console.log('Atualizando controle existente:', selectedControl.id)
        const result = await updateControl(selectedControl.id, control)
        console.log('Controle atualizado:', result)
      } else {
        console.log('Criando novo controle')
        const result = await createControl(control)
        console.log('Controle criado:', result)
      }
      setShowControlModal(false)
    } catch (error) {
      console.error('Erro ao salvar controle:', error)
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('description')}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="bg-[#00ade8] hover:bg-[#0098cc]"
              onClick={() => {
                setSelectedPolicy(undefined)
                setShowPolicyModal(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('actions.createPolicy')}
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('actions.exportReport')}
            </Button>
          </div>
        </div>

        {/* Bento Grid */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
            {/* Políticas - Card Grande */}
            <Card className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {t('metrics.totalPolicies')}
                </CardTitle>
                <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                  {metrics?.totalPolicies || 0}
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('metrics.policiesActive')}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((metrics?.totalPolicies || 0) * 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {Math.min((metrics?.totalPolicies || 0) * 10, 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Controles - Card Médio */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-green-900 dark:text-green-100">
                  {t('metrics.totalControls')}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {metrics?.totalControls || 0}
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('metrics.controlsImplemented')}
                </p>
              </CardContent>
            </Card>

            {/* Efetividade - Card Médio */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  {t('metrics.effectiveness')}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getEffectivenessColor(metrics?.effectiveness || 0)}`}>
                  {metrics?.effectiveness || 0}%
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t('metrics.averageEffectiveness')}
                </p>
              </CardContent>
            </Card>

            {/* Frameworks - Card Pequeno */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Frameworks
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {metrics?.frameworks || 0}
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Ativos
                </p>
              </CardContent>
            </Card>

            {/* Domínios - Card Pequeno */}
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Domínios
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {metrics?.domains || 0}
                </div>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Cobertos
                </p>
              </CardContent>
            </Card>

            {/* Score de Conformidade - Card Médio */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                  Score de Conformidade
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  {metrics?.complianceScore || 0}%
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Controles Implementados
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="all">{t('filter.all')}</option>
            <option value="active">{t('policy.status.active')}</option>
            <option value="draft">{t('policy.status.draft')}</option>
            <option value="review">{t('policy.status.review')}</option>
            <option value="implemented">{t('control.status.implemented')}</option>
            <option value="partial">{t('control.status.partial')}</option>
            <option value="not_implemented">{t('control.status.not_implemented')}</option>
          </select>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">{t('sections.overview')}</TabsTrigger>
            <TabsTrigger value="policies">{t('sections.policies')}</TabsTrigger>
            <TabsTrigger value="controls">{t('sections.controls')}</TabsTrigger>
            <TabsTrigger value="domains">{t('sections.domains')}</TabsTrigger>
            <TabsTrigger value="frameworks">{t('sections.frameworks')}</TabsTrigger>
            <TabsTrigger value="assessments">{t('sections.assessments')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-[#00ade8]" />
                    {t('overview.recentPolicies')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {policiesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {policies?.slice(0, 3).map((policy) => (
                        <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{policy.title}</p>
                            <p className="text-sm text-gray-500">v{policy.version}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                            {t(`policy.status.${policy.status}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-[#00ade8]" />
                    {t('overview.controlEffectiveness')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {controlsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {controls?.slice(0, 3).map((control) => (
                        <div key={control.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{control.name}</p>
                            <p className="text-sm text-gray-500">{control.category || 'Sem categoria'}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${getEffectivenessColor(control.effectiveness)}`}>
                              {control.effectiveness}%
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.status)}`}>
                              {t(`control.status.${control.status}`)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('sections.policies')}</span>
                  <Button 
                    size="sm" 
                    className="bg-[#00ade8] hover:bg-[#0098cc]"
                    onClick={() => {
                      setSelectedPolicy(undefined)
                      setShowPolicyModal(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('actions.createPolicy')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policiesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPolicies.map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{policy.title}</p>
                          <p className="text-sm text-gray-500">
                            {t('policy.version')}: {policy.version} • {t('policy.lastUpdated')}: {formatDate(policy.lastUpdated)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                            {t(`policy.status.${policy.status}`)}
                          </span>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('sections.controls')}</span>
                  <Button 
                    size="sm" 
                    className="bg-[#00ade8] hover:bg-[#0098cc]"
                    onClick={() => {
                      setSelectedControl(undefined)
                      setShowControlModal(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('actions.addControl')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {controlsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredControls.map((control) => (
                      <div key={control.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{control.name}</p>
                          <p className="text-sm text-gray-500">{control.category}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className={`font-medium ${getEffectivenessColor(control.effectiveness)}`}>
                            {control.effectiveness}%
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.status)}`}>
                            {t(`control.status.${control.status}`)}
                          </span>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domains" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.domains')}</CardTitle>
              </CardHeader>
              <CardContent>
                {domainsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {domains?.map((domain) => (
                      <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{domain.name}</p>
                          <p className="text-sm text-gray-500">{domain.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{domain.controls_count || 0} controles</span>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.frameworks')}</CardTitle>
              </CardHeader>
              <CardContent>
                {frameworksLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {frameworks?.map((framework) => (
                      <div key={framework.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{framework.name}</p>
                          <p className="text-sm text-gray-500">{framework.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">v{framework.version} • {framework.controls_mapped || 0} controles</span>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.assessments')}</CardTitle>
              </CardHeader>
              <CardContent>
                {assessmentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessments?.map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">Avaliação #{assessment.id}</p>
                          <p className="text-sm text-gray-500">{assessment.notes}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className={`font-medium ${getEffectivenessColor(assessment.effectiveness)}`}>
                            {assessment.effectiveness}%
                          </p>
                          <span className="text-sm text-gray-500">{formatDate(assessment.assessment_date)}</span>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais */}
      <PolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        policy={selectedPolicy}
        onSubmit={handlePolicySubmit}
        loading={modalLoading}
      />

      <ControlModal
        isOpen={showControlModal}
        onClose={() => setShowControlModal(false)}
        control={selectedControl}
        onSubmit={handleControlSubmit}
        loading={modalLoading}
      />
    </AppLayout>
  )
} 