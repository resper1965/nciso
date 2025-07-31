'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/supabase'
import { MCPTable } from '@/components/ui/mcp-table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, FileText, AlertTriangle, TrendingUp } from 'lucide-react'

// Tipos para as políticas
interface Policy {
  id: string
  title: string
  description: string
  status: 'active' | 'draft' | 'inactive'
  version: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Dados mockados para demonstração
const mockPolicies: Policy[] = [
  {
    id: '1',
    title: 'Política de Senhas',
    description: 'Política para criação e gestão de senhas',
    status: 'active',
    version: '1.0',
    createdBy: 'admin@nciso.com',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    title: 'Política de Acesso Remoto',
    description: 'Política para acesso remoto à rede corporativa',
    status: 'draft',
    version: '2.1',
    createdBy: 'admin@nciso.com',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    title: 'Política de Backup',
    description: 'Política para backup e recuperação de dados',
    status: 'active',
    version: '1.5',
    createdBy: 'admin@nciso.com',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15'
  }
]

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const [policies] = useState<Policy[]>(mockPolicies)

  const columns = [
    {
      key: 'title',
      label: t('policies.fields.title'),
      sortable: true
    },
    {
      key: 'description',
      label: t('policies.fields.description'),
      sortable: true
    },
    {
      key: 'status',
      label: t('policies.fields.status'),
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : value === 'draft'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {t(`policies.status.${value}`)}
        </span>
      )
    },
    {
      key: 'version',
      label: t('policies.fields.version'),
      sortable: true
    },
    {
      key: 'createdAt',
      label: t('policies.fields.createdAt'),
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ]

  const handleSearch = (query: string) => {
    // Implementar busca
    console.log('Search:', query)
  }

  const handleAdd = () => {
    // Implementar criação
    console.log('Add policy')
  }

  const handleEdit = (row: Policy) => {
    // Implementar edição
    console.log('Edit policy:', row)
  }

  const handleDelete = (row: Policy) => {
    // Implementar exclusão
    console.log('Delete policy:', row)
  }

  const handleExport = () => {
    // Implementar exportação
    console.log('Export policies')
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary-500" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                n.CISO
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('dashboard.welcome')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard.overview')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dashboard.policies')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {policies.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dashboard.controls')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    12
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dashboard.risks')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dashboard.reports')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    8
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policies Table */}
        <MCPTable
          title={t('policies.title')}
          data={policies}
          columns={columns}
          loading={false} // Removed loading state as it's not used in mock data
          onSearch={handleSearch}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      </main>
    </div>
  )
} 