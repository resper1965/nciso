'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExportMappingButton } from '@/modules/n.controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Download, Settings, Info } from 'lucide-react'

export function ExportMappingButtonExample() {
  const { t } = useTranslation()
  const [tenantId, setTenantId] = useState('')
  const [filters, setFilters] = useState({
    domain: '',
    type: '',
    framework: '',
    status: ''
  })
  const [showExport, setShowExport] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tenantId.trim()) {
      setShowExport(true)
    }
  }

  const resetForm = () => {
    setTenantId('')
    setFilters({
      domain: '',
      type: '',
      framework: '',
      status: ''
    })
    setShowExport(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('controls.export.title')}</h2>
        <p className="text-muted-foreground">
          Exemplo de exportação de mapeamentos controle-framework
        </p>
      </div>

      {!showExport ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar Exportação
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Domínio</Label>
                  <Select value={filters.domain} onValueChange={(value) => handleFilterChange('domain', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os domínios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os domínios</SelectItem>
                      <SelectItem value="access_control">Controle de Acesso</SelectItem>
                      <SelectItem value="asset_management">Gestão de Ativos</SelectItem>
                      <SelectItem value="business_continuity">Continuidade de Negócio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="preventive">Preventivo</SelectItem>
                      <SelectItem value="corrective">Corretivo</SelectItem>
                      <SelectItem value="detective">Detectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Framework</Label>
                  <Input
                    value={filters.framework}
                    onChange={(e) => handleFilterChange('framework', e.target.value)}
                    placeholder="Nome do framework"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={!tenantId.trim()}>
                  <Download className="h-4 w-4 mr-2" />
                  Configurar Exportação
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              <span className="font-medium">
                Exportação para Tenant: {tenantId}
              </span>
            </div>
            <Button variant="outline" onClick={resetForm}>
              Nova Exportação
            </Button>
          </div>

          <div className="flex gap-2">
            <ExportMappingButton
              tenantId={tenantId}
              filters={filters}
              variant="default"
            />
            <ExportMappingButton
              tenantId={tenantId}
              filters={filters}
              variant="outline"
              size="sm"
            />
          </div>
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
              <li>Exportação em CSV e JSON</li>
              <li>Filtros dinâmicos aplicados</li>
              <li>Validação de permissões por tenant</li>
              <li>Preview com estatísticas</li>
              <li>Nomenclatura automática com timestamp</li>
              <li>Compatibilidade com Excel e ferramentas de auditoria</li>
              <li>Download automático via blob</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Props:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code>tenantId</code>: ID do tenant (obrigatório)</li>
              <li><code>filters</code>: Filtros aplicados (opcional)</li>
              <li><code>variant</code>: Variante do botão (default/outline/secondary)</li>
              <li><code>size</code>: Tamanho do botão (default/sm/lg)</li>
              <li><code>className</code>: Classes CSS customizadas (opcional)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Código:</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { ExportMappingButton } from '@/modules/n.controls'

<ExportMappingButton 
  tenantId="123-abc"
  filters={{
    domain: 'access_control',
    type: 'preventive'
  }}
  variant="outline"
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Formatos de Arquivo:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>CSV</strong>: Compatível com Excel, headers em português, dados estruturados</li>
              <li><strong>JSON</strong>: Estruturado por controle, inclui frameworks associados</li>
              <li><strong>Nomenclatura</strong>: mappings_[filtros]_YYYY-MM-DD_HH-MM-SS.[extensão]</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">Segurança</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              A exportação valida automaticamente as permissões do usuário e isola os dados por tenant. 
              Apenas usuários autenticados com acesso ao tenant podem exportar dados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 