'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FrameworkCoverageChart } from '@/modules/n.controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart3, Settings, Info } from 'lucide-react'

export function FrameworkCoverageChartExample() {
  const { t } = useTranslation()
  const [tenantId, setTenantId] = useState('')
  const [showChart, setShowChart] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tenantId.trim()) {
      setShowChart(true)
    }
  }

  const resetForm = () => {
    setTenantId('')
    setShowChart(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('controls.coverage.title')}</h2>
        <p className="text-muted-foreground">
          Exemplo de relatório visual de cobertura de controles por framework
        </p>
      </div>

      {!showChart ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar Relatório
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
              
              <div className="flex gap-2">
                <Button type="submit" disabled={!tenantId.trim()}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Carregar Relatório
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
                Relatório para Tenant: {tenantId}
              </span>
            </div>
            <Button variant="outline" onClick={resetForm}>
              Novo Relatório
            </Button>
          </div>

          <FrameworkCoverageChart
            tenantId={tenantId}
            showFilters={true}
            chartType="bar"
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
              <li>Gráficos interativos com Recharts</li>
              <li>Múltiplos tipos de gráfico (barras, pizza, linha)</li>
              <li>Estatísticas em tempo real</li>
              <li>Filtros por domínio, tipo e framework</li>
              <li>Insights automáticos baseados nos dados</li>
              <li>Top e bottom frameworks</li>
              <li>Tooltips informativos</li>
              <li>Responsivo e mobile-friendly</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Props:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code>tenantId</code>: ID do tenant (obrigatório)</li>
              <li><code>showFilters</code>: Exibir filtros (padrão: true)</li>
              <li><code>chartType</code>: Tipo inicial do gráfico (bar/pie/line)</li>
              <li><code>className</code>: Classes CSS customizadas (opcional)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Código:</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { FrameworkCoverageChart } from '@/modules/n.controls'

<FrameworkCoverageChart 
  tenantId="123-abc"
  showFilters={true}
  chartType="bar"
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Dados Retornados:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Estatísticas Gerais</strong>: Total de frameworks, controles, mapeados, cobertura média</li>
              <li><strong>Dados por Framework</strong>: Nome, versão, total de controles, mapeados, percentual</li>
              <li><strong>Insights</strong>: Análises automáticas de cobertura</li>
              <li><strong>Rankings</strong>: Top e bottom frameworks</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">Nota Importante</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Este componente depende das funções SQL criadas no Supabase. Certifique-se de executar o script 
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">create-coverage-function.sql</code> 
              antes de usar o componente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 