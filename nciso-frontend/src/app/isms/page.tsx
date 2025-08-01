'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Shield, 
  FileText, 
  Users, 
  Database, 
  FolderTree, 
  ClipboardList,
  Key,
  Lock,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface ISMSStats {
  scopes: number
  organizations: number
  assets: number
  domains: number
  evaluations: number
  technicalDocs: number
  credentials: number
  privilegedAccess: number
}

export default function ISMSPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<ISMSStats>({
    scopes: 0,
    organizations: 0,
    assets: 0,
    domains: 0,
    evaluations: 0,
    technicalDocs: 0,
    credentials: 0,
    privilegedAccess: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de estatísticas
    setTimeout(() => {
      setStats({
        scopes: 12,
        organizations: 8,
        assets: 156,
        domains: 24,
        evaluations: 18,
        technicalDocs: 45,
        credentials: 89,
        privilegedAccess: 23
      })
      setLoading(false)
    }, 1000)
  }, [])

  const modules = [
    {
      title: t('isms.scope.title'),
      description: t('isms.scope.description'),
      icon: Building2,
      href: '/isms/scopes',
      stats: stats.scopes,
      color: 'bg-blue-500'
    },
    {
      title: t('isms.organizations.title'),
      description: t('isms.organizations.description'),
      icon: Users,
      href: '/isms/organizations',
      stats: stats.organizations,
      color: 'bg-green-500'
    },
    {
      title: t('isms.assets.title'),
      description: t('isms.assets.description'),
      icon: Database,
      href: '/isms/assets',
      stats: stats.assets,
      color: 'bg-purple-500'
    },
    {
      title: t('isms.domains.title'),
      description: t('isms.domains.description'),
      icon: FolderTree,
      href: '/isms/domains',
      stats: stats.domains,
      color: 'bg-orange-500'
    },
    {
      title: t('isms.evaluations.title'),
      description: t('isms.evaluations.description'),
      icon: ClipboardList,
      href: '/isms/evaluations',
      stats: stats.evaluations,
      color: 'bg-red-500'
    },
    {
      title: t('isms.technicalDocs.title'),
      description: t('isms.technicalDocs.description'),
      icon: FileText,
      href: '/isms/technical-docs',
      stats: stats.technicalDocs,
      color: 'bg-indigo-500'
    },
    {
      title: t('isms.credentialsRegistry.title'),
      description: t('isms.credentialsRegistry.description'),
      icon: Key,
      href: '/isms/credentials-registry',
      stats: stats.credentials,
      color: 'bg-yellow-500'
    },
    {
      title: t('isms.privilegedAccess.title'),
      description: t('isms.privilegedAccess.description'),
      icon: Lock,
      href: '/isms/privileged-access',
      stats: stats.privilegedAccess,
      color: 'bg-pink-500'
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t('isms.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('isms.subtitle')}
        </p>
        <p className="text-muted-foreground">
          {t('isms.description')}
        </p>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('isms.stats.overview')}
          </CardTitle>
          <CardDescription>
            {t('isms.stats.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modules.map((module) => (
                <div key={module.title} className="text-center p-4 rounded-lg border">
                  <div className={`w-12 h-12 ${module.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold">{module.stats}</div>
                  <div className="text-sm text-muted-foreground">{module.title}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-8 h-8 ${module.color} rounded-lg flex items-center justify-center`}>
                  <module.icon className="h-4 w-4 text-white" />
                </div>
                {module.title}
              </CardTitle>
              <CardDescription>
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {module.stats} {t('common.items')}
                  </Badge>
                </div>
                <Link href={module.href}>
                  <Button variant="ghost" size="sm">
                    {t('common.view')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('isms.quickActions.title')}</CardTitle>
          <CardDescription>
            {t('isms.quickActions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/isms/scopes">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                {t('isms.quickActions.createScope')}
              </Button>
            </Link>
            <Link href="/isms/assets">
              <Button className="w-full justify-start" variant="outline">
                <Database className="mr-2 h-4 w-4" />
                {t('isms.quickActions.registerAsset')}
              </Button>
            </Link>
            <Link href="/isms/evaluations">
              <Button className="w-full justify-start" variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                {t('isms.quickActions.startEvaluation')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 