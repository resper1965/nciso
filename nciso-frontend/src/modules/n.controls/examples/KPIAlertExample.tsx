'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KPIAlert, KPIMetric } from '@/modules/n.controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react'

export function KPIAlertExample() {
  const { t } = useTranslation()
  const [coverageValue, setCoverageValue] = useState(45)
  const [thresholdValue, setThresholdValue] = useState(75)
  const [metricName, setMetricName] = useState('Cobertura de Controles')

  const handleCoverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverageValue(Number(e.target.value))
  }

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThresholdValue(Number(e.target.value))
  }

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetricName(e.target.value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">KPI Alert Component</h2>
        <p className="text-muted-foreground">
          Exemplo de uso do componente KPIAlert para destacar métricas críticas
        </p>
      </div>

      {/* Controles de Demonstração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Configurar Demonstração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="coverage">Valor da Cobertura (%)</Label>
              <Input
                id="coverage"
                type="number"
                value={coverageValue}
                onChange={handleCoverageChange}
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="threshold">Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                value={thresholdValue}
                onChange={handleThresholdChange}
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="metric">Nome da Métrica</Label>
              <Input
                id="metric"
                type="text"
                value={metricName}
                onChange={handleMetricChange}
                placeholder="Nome da métrica..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemplos de Uso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exemplo 1: KPIAlert Simples */}
        <Card>
          <CardHeader>
            <CardTitle>KPIAlert Simples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Cobertura:</span>
              <KPIAlert
                value={coverageValue}
                threshold={thresholdValue}
                metric={metricName}
                unit="%"
                showIcon={true}
                showBadge={true}
                showTooltip={true}
                size="md"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Alerta simples com ícone, badge e tooltip
            </p>
          </CardContent>
        </Card>

        {/* Exemplo 2: KPIMetric Wrapper */}
        <Card>
          <CardHeader>
            <CardTitle>KPIMetric Wrapper</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <KPIMetric
              value={coverageValue}
              threshold={thresholdValue}
              metric={metricName}
              unit="%"
            >
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{metricName}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {coverageValue}%
                </div>
                <div className="text-xs text-blue-600">
                  Threshold: {thresholdValue}%
                </div>
              </div>
            </KPIMetric>
            <p className="text-xs text-muted-foreground">
              Wrapper que adiciona alerta automaticamente quando valor está abaixo do threshold
            </p>
          </CardContent>
        </Card>

        {/* Exemplo 3: Diferentes Tamanhos */}
        <Card>
          <CardHeader>
            <CardTitle>Diferentes Tamanhos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Pequeno:</span>
                <KPIAlert
                  value={30}
                  threshold={75}
                  metric="Cobertura Crítica"
                  unit="%"
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Médio:</span>
                <KPIAlert
                  value={60}
                  threshold={75}
                  metric="Cobertura Média"
                  unit="%"
                  size="md"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Grande:</span>
                <KPIAlert
                  value={90}
                  threshold={75}
                  metric="Cobertura Excelente"
                  unit="%"
                  size="lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exemplo 4: Diferentes Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Variadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Apenas Ícone:</span>
                <KPIAlert
                  value={25}
                  threshold={75}
                  metric="Cobertura Baixa"
                  showIcon={true}
                  showBadge={false}
                  showTooltip={true}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Apenas Badge:</span>
                <KPIAlert
                  value={50}
                  threshold={75}
                  metric="Cobertura Média"
                  showIcon={false}
                  showBadge={true}
                  showTooltip={true}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Sem Tooltip:</span>
                <KPIAlert
                  value={80}
                  threshold={75}
                  metric="Cobertura Boa"
                  showIcon={true}
                  showBadge={true}
                  showTooltip={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre o Componente */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Funcionalidades:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Alertas visuais baseados em threshold configurável</li>
              <li>4 níveis de criticidade: critical, warning, success, info</li>
              <li>Tooltips explicativos com contexto</li>
              <li>Suporte a diferentes tamanhos (sm, md, lg)</li>
              <li>Compatível com tema dark/light</li>
              <li>Internacionalização completa</li>
              <li>Componente wrapper KPIMetric para uso automático</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Props:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code>value</code>: Valor atual da métrica (obrigatório)</li>
              <li><code>threshold</code>: Valor limite para alerta (obrigatório)</li>
              <li><code>metric</code>: Nome da métrica para tooltip (obrigatório)</li>
              <li><code>unit</code>: Unidade da métrica (padrão: '%')</li>
              <li><code>showIcon</code>: Exibir ícone (padrão: true)</li>
              <li><code>showBadge</code>: Exibir badge (padrão: true)</li>
              <li><code>showTooltip</code>: Exibir tooltip (padrão: true)</li>
              <li><code>size</code>: Tamanho do componente (sm, md, lg)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Código:</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { KPIAlert } from '@/modules/n.controls'

<KPIAlert
  value={45}
  threshold={75}
  metric="Cobertura de Controles"
  unit="%"
  showIcon={true}
  showBadge={true}
  showTooltip={true}
  size="md"
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Níveis de Alerta:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Critical</strong>: &lt; 50% do threshold (vermelho)</li>
              <li><strong>Warning</strong>: 50-80% do threshold (amarelo)</li>
              <li><strong>Success</strong>: ≥ 100% do threshold (verde)</li>
              <li><strong>Info</strong>: 80-100% do threshold (azul)</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">Dica</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Use o componente <code>KPIMetric</code> como wrapper para adicionar alertas 
              automaticamente quando o valor estiver abaixo do threshold.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 