import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Edit, Trash2, BarChart3, Shield, Eye, AlertTriangle } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { useTranslation } from "react-i18next"

// Schema de validação com i18n
const createControlSchema = (t: any) => z.object({
  name: z.string().min(2, t('forms.validation.name_min')),
  description: z.string().min(10, t('forms.validation.description_min')),
  control_type: z.enum(["preventive", "detective", "corrective"], {
    required_error: t('forms.validation.control_type_required')
  }),
  implementation_status: z.enum(["planned", "implemented", "tested", "operational"], {
    required_error: t('forms.validation.implementation_status_required')
  }),
  effectiveness_score: z.number().min(0).max(100, t('forms.validation.effectiveness_range')),
  policy_ids: z.array(z.string()).optional(),
  domain_id: z.string().optional(),
})

type ControlFormData = z.infer<typeof controlSchema>

// Tipos
interface Control {
  id: string
  name: string
  description: string
  control_type: 'preventive' | 'detective' | 'corrective'
  implementation_status: 'planned' | 'implemented' | 'tested' | 'operational'
  effectiveness_score: number
  policy_ids?: string[]
  domain_id?: string
  tenant_id: string
  created_by: string
  created_at: string
  updated_at: string
}

interface EffectivenessReport {
  total_controls: number
  implemented_controls: number
  operational_controls: number
  average_effectiveness: number
  effectiveness_by_type: Record<string, number>
  effectiveness_by_status: Record<string, number>
  low_effectiveness_controls: Control[]
}

// Componente principal
export default function ControlsPage() {
  const { t } = useTranslation("common")
  const [controls, setControls] = useState<Control[]>([])
  const [effectivenessReport, setEffectivenessReport] = useState<EffectivenessReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingControl, setEditingControl] = useState<Control | null>(null)

  // Schema dinâmico com i18n
  const controlSchema = createControlSchema(t)

  // Form setup
  const form = useForm<ControlFormData>({
    resolver: zodResolver(controlSchema),
    defaultValues: {
      name: "",
      description: "",
      control_type: "preventive",
      implementation_status: "planned",
      effectiveness_score: 0,
      policy_ids: [],
      domain_id: "",
    }
  })

  // Carregar controles
  useEffect(() => {
    fetchControls()
    fetchEffectivenessReport()
  }, [])

  const fetchControls = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/isms/controls', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': 'dev-tenant'
        }
      })
      const data = await response.json()
      setControls(data.controls || [])
    } catch (error) {
      console.error('Erro ao carregar controles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEffectivenessReport = async () => {
    try {
      const response = await fetch('/api/v1/isms/controls/effectiveness', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': 'dev-tenant'
        }
      })
      const data = await response.json()
      setEffectivenessReport(data.report)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    }
  }

  // Criar/Editar controle
  const onSubmit = async (data: ControlFormData) => {
    setIsLoading(true)
    try {
      const url = editingControl 
        ? `/api/v1/isms/controls/${editingControl.id}`
        : '/api/v1/isms/controls'
      
      const method = editingControl ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': 'dev-tenant'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingControl(null)
        form.reset()
        fetchControls()
        fetchEffectivenessReport()
      }
    } catch (error) {
      console.error('Erro ao salvar controle:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Deletar controle
  const deleteControl = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este controle?')) return
    
    try {
      const response = await fetch(`/api/v1/isms/controls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': 'dev-tenant'
        }
      })

      if (response.ok) {
        fetchControls()
        fetchEffectivenessReport()
      }
    } catch (error) {
      console.error('Erro ao deletar controle:', error)
    }
  }

  // Editar controle
  const editControl = (control: Control) => {
    setEditingControl(control)
    form.reset({
      name: control.name,
      description: control.description,
      control_type: control.control_type,
      implementation_status: control.implementation_status,
      effectiveness_score: control.effectiveness_score,
      policy_ids: control.policy_ids || [],
      domain_id: control.domain_id || "",
    })
    setIsDialogOpen(true)
  }

  // Variantes de badge
  const getControlTypeVariant = (type: string) => {
    switch (type) {
      case 'preventive': return 'default'
      case 'detective': return 'secondary'
      case 'corrective': return 'outline'
      default: return 'default'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'operational': return 'default'
      case 'implemented': return 'secondary'
      case 'tested': return 'outline'
      case 'planned': return 'outline'
      default: return 'default'
    }
  }

  const getControlTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Shield className="w-4 h-4" />
      case 'detective': return <Eye className="w-4 h-4" />
      case 'corrective': return <AlertTriangle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  return (
    <MainLayout
      title={t('controls.title')}
      subtitle={t('controls.subtitle')}
      showAddButton={true}
      onAddClick={() => setIsDialogOpen(true)}
    >
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-nciso-cyan hover:bg-nciso-blue">
            <Plus className="w-4 h-4 mr-2" />
            {t('controls.new_control')}
          </Button>
        </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingControl ? t('controls.edit_control') : t('controls.new_control')}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('forms.name')}</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Controle de Acesso" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="control_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('forms.type')}</FormLabel>
                            <FormControl>
                              <select 
                                {...field}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="preventive">{t('controls.control_types.preventive')}</option>
                                <option value="detective">{t('controls.control_types.detective')}</option>
                                <option value="corrective">{t('controls.control_types.corrective')}</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                                                      <FormLabel>{t('forms.description')}</FormLabel>
                          <FormControl>
                            <textarea 
                              {...field}
                              rows={3}
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Descreva o controle de segurança..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="implementation_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('forms.status')}</FormLabel>
                            <FormControl>
                              <select 
                                {...field}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="planned">{t('controls.implementation_status.planned')}</option>
                                <option value="implemented">{t('controls.implementation_status.implemented')}</option>
                                <option value="tested">{t('controls.implementation_status.tested')}</option>
                                <option value="operational">{t('controls.implementation_status.operational')}</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="effectiveness_score"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Efetividade (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="100" 
                                placeholder="0-100"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingControl(null)
                          form.reset()
                        }}
                      >
                        {t('actions.cancel')}
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? t('forms.saving') : (editingControl ? t('actions.save') : t('actions.create'))}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Effectiveness Report */}
      {effectivenessReport && (
        <div className="mb-8">
          <div className="nciso-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{t('controls.effectiveness.title')}</h2>
              <BarChart3 className="w-5 h-5 text-nciso-cyan" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-nciso-cyan">{effectivenessReport.total_controls}</div>
                <div className="text-sm text-muted-foreground">{t('controls.effectiveness.total_controls')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{effectivenessReport.implemented_controls}</div>
                <div className="text-sm text-muted-foreground">{t('controls.effectiveness.implemented_controls')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{effectivenessReport.operational_controls}</div>
                <div className="text-sm text-muted-foreground">Operacionais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{effectivenessReport.average_effectiveness}%</div>
                <div className="text-sm text-muted-foreground">Efetividade Média</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Table */}
      <div className="nciso-card">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Lista de Controles</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Efetividade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((control) => (
                <TableRow key={control.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{control.name}</div>
                      <div className="text-sm text-muted-foreground">{control.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getControlTypeIcon(control.control_type)}
                      <Badge variant={getControlTypeVariant(control.control_type)}>
                        {control.control_type === 'preventive' && 'Preventivo'}
                        {control.control_type === 'detective' && 'Detetivo'}
                        {control.control_type === 'corrective' && 'Corretivo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(control.implementation_status)}>
                      {control.implementation_status === 'planned' && 'Planejado'}
                      {control.implementation_status === 'implemented' && 'Implementado'}
                      {control.implementation_status === 'tested' && 'Testado'}
                      {control.implementation_status === 'operational' && 'Operacional'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-nciso-cyan h-2 rounded-full" 
                          style={{ width: `${control.effectiveness_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{control.effectiveness_score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => editControl(control)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteControl(control.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  )
} 