'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  Target, 
  BookOpen, 
  ClipboardList,
  Plus,
  Download,
  Map,
  BarChart3,
  FolderOpen,
  Settings,
  Users,
  Lock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

// Tipos para os dados
interface ISMSMetrics {
  totalPolicies: number
  totalControls: number
  effectiveness: number
  frameworks: number
  domains: number
  complianceScore: number
}

interface Policy {
  id: string
  title: string
  status: 'active' | 'draft' | 'review'
  version: string
  lastUpdated: string
  owner: string
}

interface Control {
  id: string
  name: string
  category: string
  effectiveness: number
  status: 'implemented' | 'partial' | 'not_implemented'
  lastAssessment: string
}

// Dados mockados
const mockMetrics: ISMSMetrics = {
  totalPolicies: 24,
  totalControls: 156,
  effectiveness: 78,
  frameworks: 4,
  domains: 12,
  complianceScore: 85
}

const mockPolicies: Policy[] = [
  { id: '1', title: 'Política de Senhas', status: 'active', version: '2.1', lastUpdated: '2024-01-15', owner: 'CISO' },
  { id: '2', title: 'Política de Acesso Remoto', status: 'active', version: '1.5', lastUpdated: '2024-01-10', owner: 'CISO' },
  { id: '3', title: 'Política de Backup', status: 'draft', version: '1.0', lastUpdated: '2024-01-05', owner: 'CISO' }
]

const mockControls: Control[] = [
  { id: '1', name: 'Controle de Acesso', category: 'Access Control', effectiveness: 85, status: 'implemented', lastAssessment: '2024-01-20' },
  { id: '2', name: 'Criptografia de Dados', category: 'Cryptography', effectiveness: 72, status: 'partial', lastAssessment: '2024-01-18' },
  { id: '3', name: 'Monitoramento de Rede', category: 'Network Security', effectiveness: 90, status: 'implemented', lastAssessment: '2024-01-22' }
]

export default function ISMSPage() {
  const { t } = useTranslation('isms')
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics] = useState<ISMSMetrics>(mockMetrics)
  const [policies] = useState<Policy[]>(mockPolicies)
  const [controls] = useState<Control[]>(mockControls)

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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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
            <Button size="sm" className="bg-[#00ade8] hover:bg-[#0098cc]">
              <Plus className="h-4 w-4 mr-2" />
              {t('actions.createPolicy')}
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('actions.exportReport')}
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.totalPolicies')}</CardTitle>
              <FileText className="h-4 w-4 text-[#00ade8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalPolicies}</div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.policiesActive')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.totalControls')}</CardTitle>
              <Shield className="h-4 w-4 text-[#00ade8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalControls}</div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.controlsImplemented')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.effectiveness')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#00ade8]" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEffectivenessColor(metrics.effectiveness)}`}>
                {metrics.effectiveness}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.averageEffectiveness')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.frameworks')}</CardTitle>
              <BookOpen className="h-4 w-4 text-[#00ade8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.frameworks}</div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.frameworksMapped')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.domains')}</CardTitle>
              <Target className="h-4 w-4 text-[#00ade8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.domains}</div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.domainsRegistered')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.complianceScore')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-[#00ade8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.complianceScore}%</div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.overallCompliance')}
              </p>
            </CardContent>
          </Card>
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
                  <div className="space-y-3">
                    {policies.slice(0, 3).map((policy) => (
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
                  <div className="space-y-3">
                    {controls.slice(0, 3).map((control) => (
                      <div key={control.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{control.name}</p>
                          <p className="text-sm text-gray-500">{control.category}</p>
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('sections.policies')}</span>
                  <Button size="sm" className="bg-[#00ade8] hover:bg-[#0098cc]">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('actions.createPolicy')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{policy.title}</p>
                        <p className="text-sm text-gray-500">
                          {t('policy.version')}: {policy.version} • {t('policy.lastUpdated')}: {policy.lastUpdated}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                          {t(`policy.status.${policy.status}`)}
                        </span>
                        <Button size="sm" variant="outline">
                          {t('actions.edit')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('sections.controls')}</span>
                  <Button size="sm" className="bg-[#00ade8] hover:bg-[#0098cc]">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('actions.addControl')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {controls.map((control) => (
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
                          {t('actions.assess')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domains" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.domains')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">{t('comingSoon')}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.frameworks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">{t('comingSoon')}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.assessments')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">{t('comingSoon')}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
} 