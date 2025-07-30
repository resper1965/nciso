import React, { useState, useCallback } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { Domain } from '@/models/domain'

// =====================================================
// TYPES
// =====================================================

export interface TreeNode {
  id: string
  name: string
  description: string
  level: number
  path: string
  controls_count: number
  children: TreeNode[]
  category?: string
  owner?: string
  isExpanded?: boolean
  isSelected?: boolean
}

export interface TreeViewPanelProps {
  data: TreeNode[]
  onNodeSelect?: (node: TreeNode) => void
  onNodeExpand?: (node: TreeNode) => void
  onNodeCollapse?: (node: TreeNode) => void
  selectedNodeId?: string
  showControls?: boolean
  showCategories?: boolean
  className?: string
}

// =====================================================
// UTILITIES
// =====================================================

export const buildTreeFromDomains = (domains: Domain[]): TreeNode[] => {
  const domainMap = new Map<string, Domain>()
  const rootNodes: TreeNode[] = []

  // Create map for quick lookup
  domains.forEach(domain => {
    domainMap.set(domain.id, domain)
  })

  // Build tree structure
  domains.forEach(domain => {
    const treeNode: TreeNode = {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      level: domain.level,
      path: domain.path,
      controls_count: domain.controls_count,
      children: [],
      category: domain.category,
      owner: domain.owner,
      isExpanded: false,
      isSelected: false
    }

    if (domain.parent_id) {
      const parent = domainMap.get(domain.parent_id)
      if (parent) {
        const parentTreeNode = findTreeNode(rootNodes, domain.parent_id)
        if (parentTreeNode) {
          parentTreeNode.children.push(treeNode)
        }
      }
    } else {
      rootNodes.push(treeNode)
    }
  })

  return rootNodes
}

const findTreeNode = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findTreeNode(node.children, id)
    if (found) return found
  }
  return null
}

export const flattenTree = (nodes: TreeNode[]): TreeNode[] => {
  const result: TreeNode[] = []
  
  const traverse = (nodeList: TreeNode[], level: number = 0) => {
    nodeList.forEach(node => {
      result.push({ ...node, level })
      if (node.children.length > 0 && node.isExpanded) {
        traverse(node.children, level + 1)
      }
    })
  }
  
  traverse(nodes)
  return result
}

// =====================================================
// TREE NODE COMPONENT
// =====================================================

interface TreeNodeProps {
  node: TreeNode
  level: number
  onSelect: (node: TreeNode) => void
  onToggle: (node: TreeNode) => void
  isSelected: boolean
  showControls?: boolean
  showCategories?: boolean
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  level,
  onSelect,
  onToggle,
  isSelected,
  showControls = true,
  showCategories = true
}) => {
  const { t } = useTranslation()
  const hasChildren = node.children.length > 0
  const isExpanded = node.isExpanded

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle(node)
  }

  const handleSelect = () => {
    onSelect(node)
  }

  const getCategoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
      governance: 'bg-blue-100 text-blue-800',
      access_control: 'bg-green-100 text-green-800',
      network_security: 'bg-purple-100 text-purple-800',
      identity_management: 'bg-orange-100 text-orange-800',
      physical_security: 'bg-red-100 text-red-800',
      application_security: 'bg-indigo-100 text-indigo-800',
      data_protection: 'bg-pink-100 text-pink-800',
      incident_response: 'bg-yellow-100 text-yellow-800'
    }
    return colors[category || ''] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="w-full">
      <div
        className={`
          flex items-center space-x-2 p-2 rounded-lg cursor-pointer
          transition-colors duration-200
          ${isSelected ? 'bg-nciso-cyan/10 border border-nciso-cyan/20' : 'hover:bg-gray-50'}
        `}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-6 w-6 p-0 hover:bg-gray-200"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-6" />}

        {/* Node Icon */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-nciso-cyan" />
          ) : (
            <Folder className="h-4 w-4 text-gray-400" />
          )}
        </div>

        {/* Node Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 truncate">
              {node.name}
            </span>
            
            {showCategories && node.category && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getCategoryColor(node.category)}`}
              >
                {t(`domain.categories.${node.category}`)}
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-500 truncate">
            {node.description}
          </p>
        </div>

        {/* Controls Count */}
        {showControls && node.controls_count > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            {node.controls_count}
          </Badge>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6">
          {node.children.map(child => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              isSelected={child.isSelected || false}
              showControls={showControls}
              showCategories={showCategories}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const TreeViewPanel: React.FC<TreeViewPanelProps> = ({
  data,
  onNodeSelect,
  onNodeExpand,
  onNodeCollapse,
  selectedNodeId,
  showControls = true,
  showCategories = true,
  className = ''
}) => {
  const { t } = useTranslation()
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const handleNodeSelect = useCallback((node: TreeNode) => {
    onNodeSelect?.(node)
  }, [onNodeSelect])

  const handleNodeToggle = useCallback((node: TreeNode) => {
    const newExpandedNodes = new Set(expandedNodes)
    
    if (node.isExpanded) {
      newExpandedNodes.delete(node.id)
      onNodeCollapse?.(node)
    } else {
      newExpandedNodes.add(node.id)
      onNodeExpand?.(node)
    }
    
    setExpandedNodes(newExpandedNodes)
  }, [expandedNodes, onNodeExpand, onNodeCollapse])

  const updateNodeExpandedState = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => ({
      ...node,
      isExpanded: expandedNodes.has(node.id),
      isSelected: node.id === selectedNodeId,
      children: updateNodeExpandedState(node.children)
    }))
  }

  const processedData = updateNodeExpandedState(data)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {t('domain.tree_view.title')}
        </CardTitle>
        <p className="text-sm text-gray-500">
          {t('domain.tree_view.description')}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          {processedData.map(node => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              level={0}
              onSelect={handleNodeSelect}
              onToggle={handleNodeToggle}
              isSelected={node.isSelected || false}
              showControls={showControls}
              showCategories={showCategories}
            />
          ))}
        </div>

        {processedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Folder className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>{t('domain.tree_view.no_domains')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =====================================================
// COMPACT VERSION
// =====================================================

export const CompactTreeView: React.FC<{
  data: TreeNode[]
  onNodeSelect?: (node: TreeNode) => void
  selectedNodeId?: string
  className?: string
}> = ({ data, onNodeSelect, selectedNodeId, className = '' }) => {
  const { t } = useTranslation()

  const handleNodeSelect = (node: TreeNode) => {
    onNodeSelect?.(node)
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {data.map(node => (
        <div
          key={node.id}
          className={`
            flex items-center space-x-2 p-2 rounded cursor-pointer
            transition-colors duration-200
            ${node.id === selectedNodeId ? 'bg-nciso-cyan/10' : 'hover:bg-gray-50'}
          `}
          onClick={() => handleNodeSelect(node)}
        >
          <Folder className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 truncate">
            {node.name}
          </span>
          {node.controls_count > 0 && (
            <Badge variant="secondary" className="text-xs ml-auto">
              {node.controls_count}
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}

// =====================================================
// HOOK
// =====================================================

export const useTreeViewPanel = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const handleNodeSelect = useCallback((node: TreeNode) => {
    setSelectedNode(node)
  }, [])

  const handleNodeExpand = useCallback((node: TreeNode) => {
    setExpandedNodes(prev => new Set([...prev, node.id]))
  }, [])

  const handleNodeCollapse = useCallback((node: TreeNode) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      newSet.delete(node.id)
      return newSet
    })
  }, [])

  const expandAll = useCallback((nodes: TreeNode[]) => {
    const allNodeIds = new Set<string>()
    
    const collectIds = (nodeList: TreeNode[]) => {
      nodeList.forEach(node => {
        allNodeIds.add(node.id)
        if (node.children.length > 0) {
          collectIds(node.children)
        }
      })
    }
    
    collectIds(nodes)
    setExpandedNodes(allNodeIds)
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set())
  }, [])

  return {
    selectedNode,
    expandedNodes,
    handleNodeSelect,
    handleNodeExpand,
    handleNodeCollapse,
    expandAll,
    collapseAll
  }
} 