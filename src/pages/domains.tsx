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
import { Plus, Edit, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown, Users, Shield, Network, Database } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { useTranslation } from "react-i18next"

// MCP Imports
import { 
  Domain, 
  DomainTree, 
  domainMeta, 
  domainPermissions, 
  createDomainSchema, 
  getDomainLevelInfo,
  getDomainCategoryInfo,
  buildDomainTree,
  mockDomains
} from '@/models/domain'

// Schema de validação com i18n usando MCP
const domainSchema = (t: any) => createDomainSchema(t)

type DomainFormData = z.infer<ReturnType<typeof domainSchema>>

// Componente principal
export default function DomainsPage() {
  const { t } = useTranslation("common")
  const [domains, setDomains] = useState<Domain[]>([])
  const [domainTree, setDomainTree] = useState<DomainTree[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Schema dinâmico com i18n usando MCP
  const domainSchema = createDomainSchema(t)

  // Form setup
  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: "",
    }
  })

  // Carregar domínios
  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/isms/domains/tree', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': 'dev-tenant'
        }
      })
      const data = await response.json()
      setDomains(data.tree || [])
      setDomainTree(data.tree || [])
    } catch (error) {
      console.error('Erro ao carregar domínios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: DomainFormData) => {
    setIsLoading(true)
    try {
      const url = editingDomain 
        ? `/api/v1/isms/domains/${editingDomain.id}`
        : '/api/v1/isms/domains'
      
      const method = editingDomain ? 'PUT' : 'POST'
      
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
        setEditingDomain(null)
        form.reset()
        fetchDomains()
      } else {
        const errorData = await response.json()
        console.error('Erro:', errorData.error)
      }
    } catch (error) {
      console.error('Erro ao salvar domínio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDomain = async (id: string) => {
    if (!confirm(t('messages.confirm.delete'))) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/isms/domains/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': 'dev-tenant'
        }
      })

      if (response.ok) {
        fetchDomains()
      } else {
        const errorData = await response.json()
        console.error('Erro:', errorData.error)
      }
    } catch (error) {
      console.error('Erro ao excluir domínio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const editDomain = (domain: Domain) => {
    setEditingDomain(domain)
    form.reset({
      name: domain.name,
      description: domain.description,
      parent_id: domain.parent_id || "",
    })
    setIsDialogOpen(true)
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  // Acessibilidade: Navegação por teclado
  const handleKeyDown = (event: React.KeyboardEvent, nodeId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleNode(nodeId)
    }
  }

  const renderTreeItem = (domain: DomainTree, level: number = 0) => {
    const isExpanded = expandedNodes.has(domain.id)
    const hasChildren = domain.children && domain.children.length > 0

    return (
      <div key={domain.id}>
        <div 
          className={`
            flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors
            ${level > 0 ? 'ml-6' : ''}
          `}
        >
          <div className="flex items-center space-x-3">
                         {hasChildren && (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => toggleNode(domain.id)}
                 onKeyDown={(e) => handleKeyDown(e, domain.id)}
                 aria-label={isExpanded ? t('domains.collapse_node') : t('domains.expand_node')}
                 className="p-1 h-6 w-6"
               >
                 {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
               </Button>
             )}
            {!hasChildren && <div className="w-6" />}
            
                         <div className="flex items-center space-x-2">
               {(() => {
                 const levelInfo = getDomainLevelInfo(domain.level)
                 const Icon = levelInfo.icon
                 return <Icon className={`w-5 h-5 ${levelInfo.color}`} />
               })()}
              <div>
                <div className="font-medium text-foreground">{domain.name}</div>
                <div className="text-sm text-muted-foreground">{domain.description}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {domain.controls_count} {t('domains.controls_count')}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {t('domains.level')} {domain.level}
            </Badge>
            <div className="flex space-x-1">
                             <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => editDomain(domain as Domain)}
                 aria-label={t('domains.accessibility.edit_domain')}
                 className="h-8 w-8 p-0"
               >
                 <Edit className="w-4 h-4" />
               </Button>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => deleteDomain(domain.id)}
                 aria-label={t('domains.accessibility.delete_domain')}
                 className="h-8 w-8 p-0 text-destructive hover:text-destructive"
               >
                 <Trash2 className="w-4 h-4" />
               </Button>
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-6 border-l border-border">
            {domain.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderListView = () => (
    <div className="nciso-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('forms.name')}</TableHead>
            <TableHead>{t('forms.description')}</TableHead>
            <TableHead>{t('domains.level')}</TableHead>
            <TableHead>{t('domains.controls_count')}</TableHead>
            <TableHead>{t('domains.parent_domain')}</TableHead>
            <TableHead>{t('common.actions.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domains.map((domain) => (
            <TableRow key={domain.id}>
                             <TableCell>
                 <div className="flex items-center space-x-2">
                   {(() => {
                     const levelInfo = getDomainLevelInfo(domain.level)
                     const Icon = levelInfo.icon
                     return <Icon className={`w-4 h-4 ${levelInfo.color}`} />
                   })()}
                   <span className="font-medium">{domain.name}</span>
                 </div>
               </TableCell>
              <TableCell className="text-muted-foreground">{domain.description}</TableCell>
              <TableCell>
                <Badge variant="secondary">{domain.level}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{domain.controls_count}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {domain.parent_id || t('domains.no_parent')}
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editDomain(domain)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDomain(domain.id)}
                    className="text-destructive hover:text-destructive"
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
  )

  return (
    <MainLayout
      title={t('domains.title')}
      subtitle={t('domains.subtitle')}
      showAddButton={true}
      onAddClick={() => setIsDialogOpen(true)}
    >
      <div className="space-y-6">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              <Folder className="w-4 h-4 mr-2" />
              {t('domains.tree_view')}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Database className="w-4 h-4 mr-2" />
              {t('domains.list_view')}
            </Button>
          </div>
        </div>

        {/* Domain Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-nciso-cyan hover:bg-nciso-blue">
              <Plus className="w-4 h-4 mr-2" />
              {t('domains.new_domain')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingDomain ? t('domains.edit_domain') : t('domains.new_domain')}
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
                          <Input placeholder={t('domains.validation.name_required')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parent_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('domains.parent_domain')}</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">{t('domains.no_parent')}</option>
                            {domains.map((domain) => (
                              <option key={domain.id} value={domain.id}>
                                {domain.name}
                              </option>
                            ))}
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
                          placeholder={t('domains.validation.description_min')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingDomain(null)
                      form.reset()
                    }}
                  >
                    {t('actions.cancel')}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t('forms.saving') : (editingDomain ? t('actions.save') : t('actions.create'))}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">{t('forms.loading')}</div>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="nciso-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{t('domains.hierarchy')}</h2>
              <Badge variant="outline">{domainTree.length} {t('domains.title')}</Badge>
            </div>
                       <div 
             className="space-y-1"
             role="tree"
             aria-label={t('domains.accessibility.tree_navigation')}
           >
             {domainTree.map(domain => renderTreeItem(domain))}
           </div>
          </div>
        ) : (
          renderListView()
        )}
      </div>
    </MainLayout>
  )
} 