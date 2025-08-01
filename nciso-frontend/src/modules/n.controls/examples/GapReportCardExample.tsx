'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GapReportCard } from '@/modules/n.controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, Settings, Info } from 'lucide-react'

export function GapReportCardExample() {
  const { t } = useTranslation()
  const [tenantId, setTenantId] = useState('')
  const [frameworkId, setFrameworkId] = useState('')
  const [showReport, setShowReport] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tenantId.trim() && frameworkId.trim()) {
      setShowReport(true)
    }
  }

  const resetForm = () => {
    setTenantId('')
    setFrameworkId('')
    setShowReport(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('controls.gap_report.title')}</h2>
        <p className="text-muted-foreground">
          Exemplo de relatório de gaps de cobertura por framework
        </p>
      </div>

      {!showReport ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar Relatório de Gaps
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
                <Label htmlFor="frameworkId">ID do Framework *</Label>
                <Input
                  id="frameworkId"
                  value={frameworkId}
                  onChange={(e) => setFrameworkId(e.target.value)}
                  placeholder="Digite o ID do framework (ex: iso-framework-1)"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={!tenantId.trim() || !frameworkId.trim()}>
                  <Target className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span className="font-medium">
                Relatório para Tenant: {tenantId} | Framework: {frameworkId}
              </span>
            </div>
            <Button variant="outline" onClick={resetForm}>
              Novo Relatório
            </Button>
          </div>

          <GapReportCard
            tenantId={tenantId}
            frameworkId={frameworkId}
            showDetails={true}
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
              <li>Identificação automática de gaps de cobertura</li>
              <li>Estatísticas detalhadas de conformidade</li>
              <li>Barra de progresso visual</li>
              <li>Recomendações baseadas na análise</li>
              <li>Lista de controles não implementados</li>
              <li>Lista de controles já mapeados</li>
              <li>Priorização por criticidade</li>
              <li>Alertas visuais para gaps críticos</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Props:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code>tenantId</code>: ID do tenant (obrigatório)</li>
              <li><code>frameworkId</code>: ID do framework (obrigatório)</li>
              <li><code>showDetails</code>: Exibir detalhes (padrão: true)</li>
              <li><code>className</code>: Classes CSS customizadas (opcional)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Código:</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { GapReportCard } from '@/modules/n.controls'

<GapReportCard 
  tenantId="123-abc"
  frameworkId="iso-framework-1"
  showDetails={true}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Dados Retornados:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Framework</strong>: Informações do framework analisado</li>
              <li><strong>Summary</strong>: Estatísticas de conformidade</li>
              <li><strong>Expected Controls</strong>: Controles esperados pelo framework</li>
              <li><strong>Mapped Controls</strong>: Controles já mapeados</li>
              <li><strong>Gaps</strong>: Controles não implementados</li>
              <li><strong>Recommendations</strong>: Recomendações baseadas na análise</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">Simulação</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Este componente usa dados simulados para demonstração. Em produção, 
              os dados viriam do comando MCP <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">simulate_gap_report</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 