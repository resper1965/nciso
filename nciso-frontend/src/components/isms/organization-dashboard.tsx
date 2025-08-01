'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, GitBranch, Users, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { organizationService } from '@/lib/services/isms'
import type { Organization } from '@/lib/types/isms'

export function OrganizationDashboard() {
  const { t } = useTranslation()
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byType: {
      company: 0,
      department: 0,
      unit: 0,
      division: 0
    },
    hierarchy: {
      maxDepth: 0,
      avgChildren: 0
    }
  })

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true)
      const data = await organizationService.getHierarchy()
      setOrganizations(data)
      calculateStats(data)
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calcular estatísticas
  const calculateStats = (orgs: Organization[]) => {
    const total = orgs.length
    const active = orgs.filter(org => org.is_active).length
    
    const byType = {
      company: orgs.filter(org => org.type === 'company').length,
      department: orgs.filter(org => org.type === 'department').length,
      unit: orgs.filter(org => org.type === 'unit').length,
      division: orgs.filter(org => org.type === 'division').length
    }

    // Calcular profundidade máxima da hierarquia
    const calculateDepth = (orgId: string, visited = new Set<string>()): number => {
      if (visited.has(orgId)) return 0
      visited.add(orgId)
      
      const org = orgs.find(o => o.id === orgId)
      if (!org || !org.parent_id) return 1
      
      return 1 + calculateDepth(org.parent_id, visited)
    }

    const maxDepth = Math.max(...orgs.map(org => calculateDepth(org.id)), 0)
    
    // Calcular média de filhos por organização
    const childrenCount = new Map<string, number>()
    orgs.forEach(org => {
      if (org.parent_id) {
        childrenCount.set(org.parent_id, (childrenCount.get(org.parent_id) || 0) + 1)
      }
    })
    
    const avgChildren = childrenCount.size > 0 
      ? Array.from(childrenCount.values()).reduce((a, b) => a + b, 0) / childrenCount.size 
      : 0

    setStats({
      total,
      active,
      byType,
      hierarchy: {
        maxDepth,
        avgChildren: Math.round(avgChildren * 10) / 10
      }
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('isms.organizations.stats.total')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {t('isms.organizations.stats.total_organizations')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('isms.organizations.stats.active')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {t('isms.organizations.stats.active_organizations')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('isms.organizations.stats.max_depth')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hierarchy.maxDepth}</div>
            <p className="text-xs text-muted-foreground">
              {t('isms.organizations.stats.hierarchy_levels')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('isms.organizations.stats.avg_children')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hierarchy.avgChildren}</div>
            <p className="text-xs text-muted-foreground">
              {t('isms.organizations.stats.children_per_org')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>{t('isms.organizations.stats.by_type')}</CardTitle>
          <CardDescription>
            {t('isms.organizations.stats.type_distribution')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{t('isms.organizations.types.company')}</span>
              </div>
              <Badge variant="secondary">{stats.byType.company}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-green-500" />
                <span className="font-medium">{t('isms.organizations.types.department')}</span>
              </div>
              <Badge variant="secondary">{stats.byType.department}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="font-medium">{t('isms.organizations.types.unit')}</span>
              </div>
              <Badge variant="secondary">{stats.byType.unit}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <span className="font-medium">{t('isms.organizations.types.division')}</span>
              </div>
              <Badge variant="secondary">{stats.byType.division}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status de Atividade */}
      <Card>
        <CardHeader>
          <CardTitle>{t('isms.organizations.stats.activity_status')}</CardTitle>
          <CardDescription>
            {t('isms.organizations.stats.active_vs_inactive')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">{t('common.active')}: {stats.active}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm">{t('common.inactive')}: {stats.total - stats.active}</span>
            </div>
          </div>
          
          {stats.total > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.active / stats.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.active / stats.total) * 100)}% {t('common.active')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 