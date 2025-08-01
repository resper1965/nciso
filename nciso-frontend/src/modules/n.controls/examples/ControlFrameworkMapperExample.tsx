'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ControlFrameworkMapper } from '@/modules/n.controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, BookOpen, Settings } from 'lucide-react'

export function ControlFrameworkMapperExample() {
  const { t } = useTranslation()
  const [controlId, setControlId] = useState('')
  const [controlName, setControlName] = useState('')
  const [showMapper, setShowMapper] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (controlId.trim()) {
      setShowMapper(true)
    }
  }

  const resetForm = () => {
    setControlId('')
    setControlName('')
    setShowMapper(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('controls.framework_mapping.title')}</h2>
        <p className="text-muted-foreground">
          Exemplo de interface para associar controles a frameworks via checklist
        </p>
      </div>

      {!showMapper ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar Mapeamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="controlId">ID do Controle *</Label>
                <Input
                  id="controlId"
                  value={controlId}
                  onChange={(e) => setControlId(e.target.value)}
                  placeholder="Digite o ID do controle (ex: 123-abc)"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="controlName">Nome do Controle (Opcional)</Label>
                <Input
                  id="controlName"
                  value={controlName}
                  onChange={(e) => setControlName(e.target.value)}
                  placeholder="Nome do controle para exibição"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={!controlId.trim()}>
                  <Shield className="h-4 w-4 mr-2" />
                  Carregar Mapeamento
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">
                Mapeamento para: {controlName || controlId}
              </span>
            </div>
            <Button variant="outline" onClick={resetForm}>
              Novo Mapeamento
            </Button>
          </div>

          <ControlFrameworkMapper
            controlId={controlId}
            controlName={controlName}
            showStats={true}
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
              <li>Carrega frameworks disponíveis automaticamente</li>
              <li>Exibe estado atual de mapeamento via checkboxes</li>
              <li>Persiste alterações em tempo real no Supabase</li>
              <li>Feedback visual com toasts de sucesso/erro</li>
              <li>Estatísticas de mapeamento em tempo real</li>
              <li>Suporte a tema dark/light</li>
              <li>Internacionalização completa (pt-BR, en-US, es)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Props:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code>controlId</code>: ID do controle (obrigatório)</li>
              <li><code>controlName</code>: Nome do controle para exibição (opcional)</li>
              <li><code>showStats</code>: Exibir estatísticas (padrão: true)</li>
              <li><code>className</code>: Classes CSS customizadas (opcional)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Código:</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { ControlFrameworkMapper } from '@/modules/n.controls'

<ControlFrameworkMapper 
  controlId="123-abc"
  controlName="Controle de Acesso"
  showStats={true}
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 