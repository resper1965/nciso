'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ControlsDashboard } from '@/modules/n.controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { BarChart3, Settings, Info } from 'lucide-react'

export function ControlsDashboardExample() {
  const { t } = useTranslation()
  const [tenantId, setTenantId] = useState('')
  const [showDashboard, setShowDashboard] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tenantId.trim()) {
      setShowDashboard(true)
    }
  }

  const resetForm = () => {
    setTenantId('')
    setShowDashboard(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('controls.dashboard.title')}</h2>
        <p className="text-muted-foreground">
          Exemplo de dashboard conectado aos dados reais via MCP
        </p>
      </div>

      {!showDashboard ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenantId">ID do Tenant *</Label>
                <Input
                  id="tenantId"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="Digite o ID do tenant (ex: 123-abc)"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Intervalo de Atualização (segundos)</Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  min="0"
                  max="300"
                />
                <p className="text-xs text-muted-foreground">
                  0 = sem atualização automática
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="showFilters"
                  checked={showFilters}
                  onCheckedChange={setShowFilters}
                />
                <Label htmlFor="showFilters">Mostrar Filtros</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={!tenantId.trim()}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Carregar Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">
                Dashboard para Tenant: {tenantId}
              </span>
            </div>
            <Button variant="outline" onClick={resetForm}>
              Novo Dashboard
            </Button>
          </div>

          <ControlsDashboard
            tenantId={tenantId}
            showFilters={showFilters}
            refreshInterval={refreshInterval}
          />
        </div>
      )}

      {/* Informações sobre o componente */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Funcionalidades:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Conexão direta com MCP get_coverage_report</li>
              <li>Dados reais de cobertura por framework</li>
              <li>KPIs em tempo real</li>
              <li>Gráficos de progresso visual</li>
              <li>Rankings de frameworks</li>
              <li>Alertas automáticos</li>
              <li>Filtros dinâmicos</li>
              <li>Refresh automático configurável</li>
              <li>Fallback para dados simulados</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Props:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code>tenantId</code>: ID do tenant (obrigatório)</li>
              <li><code>showFilters</code>: Exibir filtros (padrão: true)</li>
              <li><code>refreshInterval</code>: Intervalo de atualização em segundos (padrão: 30)</li>
              <li><code>className</code>: Classes CSS customizadas (opcional)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Código:</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { ControlsDashboard } from '@/modules/n.controls'

<ControlsDashboard 
  tenantId="123-abc"
  showFilters={true}
  refreshInterval={30}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Dados Retornados:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>CoverageData</strong>: Dados de cobertura por framework</li>
              <li><strong>CoverageSummary</strong>: Estatísticas gerais</li>
              <li><strong>KPIs</strong>: Frameworks, controles, mapeados, cobertura</li>
              <li><strong>Rankings</strong>: Top e bottom frameworks</li>
              <li><strong>Alertas</strong>: Frameworks sem cobertura ou com cobertura completa</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">Conexão MCP</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Este dashboard se conecta diretamente ao comando MCP <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">get_coverage_report</code> 
              via Supabase RPC. Em caso de falha, usa dados simulados como fallback.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">Segurança</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Todos os dados são filtrados por <code className="bg-green-100 dark:bg-green-900 px-1 rounded">tenant_id</code> 
              para garantir isolamento entre tenants.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 