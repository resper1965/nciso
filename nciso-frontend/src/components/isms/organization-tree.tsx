'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronDown, Building2, GitBranch, Users, Eye, Edit, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { organizationService } from '@/lib/services/isms'
import type { Organization } from '@/lib/types/isms'

interface OrganizationTreeProps {
  onSelectOrganization?: (org: Organization) => void
  onEditOrganization?: (org: Organization) => void
  onAddChild?: (parentId: string) => void
  selectedId?: string
}

interface TreeNode {
  organization: Organization
  children: TreeNode[]
  level: number
  expanded: boolean
}

export function OrganizationTree({ 
  onSelectOrganization, 
  onEditOrganization, 
  onAddChild, 
  selectedId 
}: OrganizationTreeProps) {
  const { t } = useTranslation()
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar organizações
  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const data = await organizationService.getHierarchy()
      setOrganizations(data)
      buildTree(data)
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  // Construir árvore hierárquica
  const buildTree = (orgs: Organization[]) => {
    const orgMap = new Map<string, Organization>()
    const childrenMap = new Map<string, Organization[]>()

    // Mapear organizações
    orgs.forEach(org => {
      orgMap.set(org.id, org)
      if (!childrenMap.has(org.id)) {
        childrenMap.set(org.id, [])
      }
    })

    // Construir relacionamentos pai-filho
    orgs.forEach(org => {
      if (org.parent_id && orgMap.has(org.parent_id)) {
        const parent = childrenMap.get(org.parent_id) || []
        parent.push(org)
        childrenMap.set(org.parent_id, parent)
      }
    })

    // Construir nós da árvore
    const buildTreeNode = (org: Organization, level: number): TreeNode => {
      const children = childrenMap.get(org.id) || []
      return {
        organization: org,
        children: children.map(child => buildTreeNode(child, level + 1)),
        level,
        expanded: level === 0 // Expandir apenas o nível raiz por padrão
      }
    }

    // Encontrar raízes (organizações sem pai)
    const roots = orgs.filter(org => !org.parent_id)
    const tree = roots.map(org => buildTreeNode(org, 0))
    
    setTreeData(tree)
  }

  // Toggle expandir/colapsar nó
  const toggleNode = (node: TreeNode) => {
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(n => {
        if (n.organization.id === node.organization.id) {
          return { ...n, expanded: !n.expanded }
        }
        return {
          ...n,
          children: updateNode(n.children)
        }
      })
    }
    setTreeData(updateNode(treeData))
  }

  // Obter ícone baseado no tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building2 className="h-4 w-4" />
      case 'department':
        return <GitBranch className="h-4 w-4" />
      case 'unit':
      case 'division':
        return <Users className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  // Renderizar nó da árvore
  const renderTreeNode = (node: TreeNode) => {
    const isSelected = selectedId === node.organization.id
    const hasChildren = node.children.length > 0

    return (
      <div key={node.organization.id}>
        <div 
          className={`
            flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
            ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}
            ${node.level > 0 ? 'ml-6' : ''}
          `}
          onClick={() => onSelectOrganization?.(node.organization)}
        >
          <div className="flex items-center gap-2 flex-1">
            {/* Ícone expandir/colapsar */}
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(node)
                }}
              >
                {node.expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}

            {/* Ícone do tipo */}
            {getTypeIcon(node.organization.type)}

            {/* Nome da organização */}
            <div className="flex-1">
              <div className="font-medium">{node.organization.name}</div>
              <div className="text-sm text-muted-foreground">
                {t(`isms.organizations.types.${node.organization.type}`)}
              </div>
            </div>

            {/* Status */}
            <Badge variant={node.organization.is_active ? 'default' : 'secondary'} className="text-xs">
              {node.organization.is_active ? t('common.active') : t('common.inactive')}
            </Badge>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1">
            {onEditOrganization && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditOrganization(node.organization)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onAddChild && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddChild(node.organization.id)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filhos */}
        {node.expanded && hasChildren && (
          <div className="mt-1">
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">{t('isms.organizations.messages.loading')}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {t('isms.organizations.hierarchy.title')}
        </CardTitle>
        <CardDescription>
          {t('isms.organizations.hierarchy.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {treeData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('isms.organizations.messages.no_organizations')}
          </div>
        ) : (
          <div className="space-y-1">
            {treeData.map(node => renderTreeNode(node))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 