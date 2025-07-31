import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase'
import { useMcpServer } from '@/lib/mcp'

export interface ISMSMetrics {
  totalPolicies: number
  totalControls: number
  effectiveness: number
  frameworks: number
  domains: number
  complianceScore: number
}

export interface Policy {
  id: string
  title: string
  description: string
  status: 'active' | 'draft' | 'review' | 'archived'
  version: string
  lastUpdated: string
  owner: string
  tenant_id: string
  created_at: string
  updated_at: string
  content?: string
  tags?: string[]
}

export interface Control {
  id: string
  name: string
  description: string
  category: string
  effectiveness: number
  status: 'implemented' | 'partial' | 'not_implemented' | 'planned'
  lastAssessment: string
  tenant_id: string
  created_at: string
  updated_at: string
  policy_ids?: string[]
  domain_id?: string
  framework_mappings?: Record<string, string>
}

export interface Domain {
  id: string
  name: string
  description: string
  parent_id?: string
  tenant_id: string
  created_at: string
  updated_at: string
  controls_count?: number
}

export interface Framework {
  id: string
  name: string
  description: string
  version: string
  tenant_id: string
  created_at: string
  updated_at: string
  controls_mapped?: number
}

export interface Assessment {
  id: string
  control_id: string
  effectiveness: number
  notes: string
  assessor: string
  assessment_date: string
  tenant_id: string
  created_at: string
}

export function useISMSMetrics() {
  const { user } = useAuth()
  const { mcpServer } = useMcpServer()
  const [metrics, setMetrics] = useState<ISMSMetrics>({
    totalPolicies: 0,
    totalControls: 0,
    effectiveness: 0,
    frameworks: 0,
    domains: 0,
    complianceScore: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchMetrics = async () => {
      try {
        setLoading(true)
        
        // Buscar métricas via MCP
        const response = await mcpServer.call('list_resources', {
          resource: 'isms_metrics',
          filter: { tenant_id: user.tenant_id }
        })

        if (response.resources) {
          const data = response.resources[0] || {}
          setMetrics({
            totalPolicies: data.total_policies || 0,
            totalControls: data.total_controls || 0,
            effectiveness: data.average_effectiveness || 0,
            frameworks: data.frameworks_count || 0,
            domains: data.domains_count || 0,
            complianceScore: data.compliance_score || 0
          })
        }
      } catch (error) {
        console.error('Erro ao buscar métricas ISMS:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [user, mcpServer])

  return { metrics, loading }
}

export function usePolicies() {
  const { user } = useAuth()
  const { mcpServer } = useMcpServer()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchPolicies = async () => {
      try {
        setLoading(true)
        
        const response = await mcpServer.call('list_resources', {
          resource: 'isms_policies',
          filter: { tenant_id: user.tenant_id }
        })

        if (response.resources) {
          setPolicies(response.resources.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            status: p.status,
            version: p.version,
            lastUpdated: p.updated_at,
            owner: p.owner,
            tenant_id: p.tenant_id,
            created_at: p.created_at,
            updated_at: p.updated_at,
            content: p.content,
            tags: p.tags
          })))
        }
      } catch (error) {
        console.error('Erro ao buscar políticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicies()
  }, [user, mcpServer])

  const createPolicy = async (policy: Omit<Policy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await mcpServer.call('create_resource', {
        resource: 'isms_policies',
        data: {
          ...policy,
          tenant_id: user?.tenant_id
        }
      })
      
      if (response.resource) {
        setPolicies(prev => [...prev, response.resource])
        return response.resource
      }
    } catch (error) {
      console.error('Erro ao criar política:', error)
      throw error
    }
  }

  const updatePolicy = async (id: string, updates: Partial<Policy>) => {
    try {
      const response = await mcpServer.call('update_resource', {
        resource: 'isms_policies',
        id,
        data: updates
      })
      
      if (response.resource) {
        setPolicies(prev => prev.map(p => p.id === id ? response.resource : p))
        return response.resource
      }
    } catch (error) {
      console.error('Erro ao atualizar política:', error)
      throw error
    }
  }

  const deletePolicy = async (id: string) => {
    try {
      await mcpServer.call('delete_resource', {
        resource: 'isms_policies',
        id
      })
      
      setPolicies(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erro ao deletar política:', error)
      throw error
    }
  }

  return { policies, loading, createPolicy, updatePolicy, deletePolicy }
}

export function useControls() {
  const { user } = useAuth()
  const { mcpServer } = useMcpServer()
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchControls = async () => {
      try {
        setLoading(true)
        
        const response = await mcpServer.call('list_resources', {
          resource: 'isms_controls',
          filter: { tenant_id: user.tenant_id }
        })

        if (response.resources) {
          setControls(response.resources.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            category: c.category,
            effectiveness: c.effectiveness || 0,
            status: c.status,
            lastAssessment: c.last_assessment,
            tenant_id: c.tenant_id,
            created_at: c.created_at,
            updated_at: c.updated_at,
            policy_ids: c.policy_ids,
            domain_id: c.domain_id,
            framework_mappings: c.framework_mappings
          })))
        }
      } catch (error) {
        console.error('Erro ao buscar controles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchControls()
  }, [user, mcpServer])

  const createControl = async (control: Omit<Control, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await mcpServer.call('create_resource', {
        resource: 'isms_controls',
        data: {
          ...control,
          tenant_id: user?.tenant_id
        }
      })
      
      if (response.resource) {
        setControls(prev => [...prev, response.resource])
        return response.resource
      }
    } catch (error) {
      console.error('Erro ao criar controle:', error)
      throw error
    }
  }

  const updateControl = async (id: string, updates: Partial<Control>) => {
    try {
      const response = await mcpServer.call('update_resource', {
        resource: 'isms_controls',
        id,
        data: updates
      })
      
      if (response.resource) {
        setControls(prev => prev.map(c => c.id === id ? response.resource : c))
        return response.resource
      }
    } catch (error) {
      console.error('Erro ao atualizar controle:', error)
      throw error
    }
  }

  const deleteControl = async (id: string) => {
    try {
      await mcpServer.call('delete_resource', {
        resource: 'isms_controls',
        id
      })
      
      setControls(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Erro ao deletar controle:', error)
      throw error
    }
  }

  return { controls, loading, createControl, updateControl, deleteControl }
}

export function useDomains() {
  const { user } = useAuth()
  const { mcpServer } = useMcpServer()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchDomains = async () => {
      try {
        setLoading(true)
        
        const response = await mcpServer.call('list_resources', {
          resource: 'isms_domains',
          filter: { tenant_id: user.tenant_id }
        })

        if (response.resources) {
          setDomains(response.resources.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            parent_id: d.parent_id,
            tenant_id: d.tenant_id,
            created_at: d.created_at,
            updated_at: d.updated_at,
            controls_count: d.controls_count
          })))
        }
      } catch (error) {
        console.error('Erro ao buscar domínios:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDomains()
  }, [user, mcpServer])

  return { domains, loading }
}

export function useFrameworks() {
  const { user } = useAuth()
  const { mcpServer } = useMcpServer()
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchFrameworks = async () => {
      try {
        setLoading(true)
        
        const response = await mcpServer.call('list_resources', {
          resource: 'isms_frameworks',
          filter: { tenant_id: user.tenant_id }
        })

        if (response.resources) {
          setFrameworks(response.resources.map((f: any) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            version: f.version,
            tenant_id: f.tenant_id,
            created_at: f.created_at,
            updated_at: f.updated_at,
            controls_mapped: f.controls_mapped
          })))
        }
      } catch (error) {
        console.error('Erro ao buscar frameworks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFrameworks()
  }, [user, mcpServer])

  return { frameworks, loading }
}

export function useAssessments() {
  const { user } = useAuth()
  const { mcpServer } = useMcpServer()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchAssessments = async () => {
      try {
        setLoading(true)
        
        const response = await mcpServer.call('list_resources', {
          resource: 'isms_assessments',
          filter: { tenant_id: user.tenant_id }
        })

        if (response.resources) {
          setAssessments(response.resources.map((a: any) => ({
            id: a.id,
            control_id: a.control_id,
            effectiveness: a.effectiveness,
            notes: a.notes,
            assessor: a.assessor,
            assessment_date: a.assessment_date,
            tenant_id: a.tenant_id,
            created_at: a.created_at
          })))
        }
      } catch (error) {
        console.error('Erro ao buscar avaliações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [user, mcpServer])

  const createAssessment = async (assessment: Omit<Assessment, 'id' | 'created_at'>) => {
    try {
      const response = await mcpServer.call('create_resource', {
        resource: 'isms_assessments',
        data: {
          ...assessment,
          tenant_id: user?.tenant_id
        }
      })
      
      if (response.resource) {
        setAssessments(prev => [...prev, response.resource])
        return response.resource
      }
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
      throw error
    }
  }

  return { assessments, loading, createAssessment }
} 