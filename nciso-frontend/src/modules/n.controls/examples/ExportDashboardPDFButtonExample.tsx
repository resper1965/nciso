'use client'

import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExportDashboardPDFButton } from '@/modules/n.controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Activity, TrendingUp, Users, Shield } from 'lucide-react'

export function ExportDashboardPDFButtonExample() {
  const { t } = useTranslation()
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState({
    framework: 'iso27001',
    type: 'preventive',
    status: 'active',
    domain: 'access_control',
    priority: 'high'
  })

  const [tenantId] = useState('550e8400-e29b-41d4-a716-446655440000')

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      framework: '',
      type: '',
      status: '',
      domain: '',
      priority: ''
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Export Dashboard PDF Button</h2>
        <p className="text-muted-foreground">
          Exemplo de uso do componente ExportDashboardPDFButton para exportar dashboard como PDF
        </p>
      </div>

      {/* Controles de Demonstração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurar Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Framework</label>
              <select
                value={filters.framework}
                onChange={(e) => handleFilterChange('framework', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Todos</option>
                <option value="iso27001">ISO 27001</option>
                <option value="nist">NIST</option>
                <option value="cobit">COBIT</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Todos</option>
                <option value="preventive">Preventivo</option>
                <option value="corrective">Corretivo</option>
                <option value="detective">Detectivo</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>
          <Button onClick={clearFilters} variant="outline" size="sm">
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Dashboard Simulado */}
      <div ref={dashboardRef} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dashboard de Conformidade</span>
              <ExportDashboardPDFButton
                dashboardRef={dashboardRef}
                tenantId={tenantId}
                filters={filters}
                variant="outline"
                size="sm"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Frameworks</p>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Controles</p>
                  <p className="text-2xl font-bold text-green-600">156</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Mapeados</p>
                  <p className="text-2xl font-bold text-orange-600">142</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Cobertura</p>
                  <p className="text-2xl font-bold text-purple-600">91%</p>
                </div>
              </div>
            </div>

            {/* Filtros Ativos */}
            {Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Filtros Ativos:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => 
                    value && (
                      <Badge key={key} variant="secondary">
                        {key}: {value}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Gráfico Simulado */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cobertura por Framework</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ISO 27001</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">NIST CSF</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">COBIT</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Top Frameworks</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded">
                    <span className="text-sm">ISO 27001</span>
                    <Badge variant="default">95%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <span className="text-sm">NIST CSF</span>
                    <Badge variant="secondary">88%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
                    <span className="text-sm">COBIT</span>
                    <Badge variant="outline">72%</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Frameworks com Menor Cobertura</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950 rounded">
                    <span className="text-sm">PCI DSS</span>
                    <Badge variant="destructive">45%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                    <span className="text-sm">SOC 2</span>
                    <Badge variant="outline">58%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-950 rounded">
                    <span className="text-sm">GDPR</span>
                    <Badge variant="secondary">62%</Badge>
                  </div>
                </div>
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
              <li>Exportação de dashboard como PDF com alta qualidade</li>
              <li>Captura automática do conteúdo visual</li>
              <li>Inclusão de metadados (título, data, tenant, filtros)</li>
              <li>Preview antes da exportação</li>
              <li>Suporte a filtros aplicados</li>
              <li>Nomenclatura automática de arquivos</li>
              <li>Feedback visual durante exportação</li>
              <li>Tratamento de erros robusto</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Props:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code>dashboardRef</code>: Referência ao elemento do dashboard (obrigatório)</li>
              <li><code>tenantId</code>: ID do tenant (obrigatório)</li>
              <li><code>filters</code>: Filtros aplicados (opcional)</li>
              <li><code>className</code>: Classes CSS adicionais (opcional)</li>
              <li><code>variant</code>: Variante do botão (default, outline, ghost)</li>
              <li><code>size</code>: Tamanho do botão (sm, md, lg)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Código:</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { ExportDashboardPDFButton } from '@/modules/n.controls'

const dashboardRef = useRef<HTMLDivElement>(null)

<ExportDashboardPDFButton
  dashboardRef={dashboardRef}
  tenantId="tenant-id"
  filters={{
    framework: 'iso27001',
    type: 'preventive'
  }}
  variant="outline"
  size="md"
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Conteúdo do PDF:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Cabeçalho</strong>: Título, data, tenant</li>
              <li><strong>Filtros</strong>: Filtros aplicados no dashboard</li>
              <li><strong>Estatísticas</strong>: KPIs resumidos</li>
              <li><strong>Dashboard</strong>: Captura visual completa</li>
              <li><strong>Rodapé</strong>: Informações de geração</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">Dica</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              O componente usa <code>html2canvas</code> para capturar o dashboard 
              e <code>jsPDF</code> para gerar o PDF. Certifique-se de que o 
              elemento referenciado está visível na tela durante a exportação.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 