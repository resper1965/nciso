import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

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
        
        // Buscar contadores
        const [policiesResult, controlsResult, frameworksResult, domainsResult] = await Promise.all([
          supabase.from('isms_policies').select('id', { count: 'exact', head: true }).eq('tenant_id', user.id),
          supabase.from('isms_controls').select('id', { count: 'exact', head: true }).eq('tenant_id', user.id),
          supabase.from('isms_frameworks').select('id', { count: 'exact', head: true }).eq('tenant_id', user.id),
          supabase.from('isms_domains').select('id', { count: 'exact', head: true }).eq('tenant_id', user.id)
        ])
        
        // Buscar efetividade média
        const effectivenessResult = await supabase
          .from('isms_controls')
          .select('effectiveness')
          .eq('tenant_id', user.id)
          .not('effectiveness', 'is', null)
        
        const averageEffectiveness = effectivenessResult.data?.length 
          ? effectivenessResult.data.reduce((sum, control) => sum + (control.effectiveness || 0), 0) / effectivenessResult.data.length
          : 0
        
        // Calcular score de conformidade (baseado em controles implementados)
        const complianceControls = await supabase
          .from('isms_controls')
          .select('status')
          .eq('tenant_id', user.id)
          .eq('status', 'implemented')
        
        const totalControls = controlsResult.count || 0
        const complianceScore = totalControls > 0 
          ? Math.round(((complianceControls.count || 0) / totalControls) * 100)
          : 0
        
        setMetrics({
          totalPolicies: policiesResult.count || 0,
          totalControls: totalControls,
          effectiveness: Math.round(averageEffectiveness),
          frameworks: frameworksResult.count || 0,
          domains: domainsResult.count || 0,
          complianceScore
        })
      } catch (error) {
        console.error('Erro ao buscar métricas ISMS:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [user])

  return { metrics, loading }
}

export function usePolicies() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchPolicies = async () => {
      try {
        console.log('fetchPolicies iniciado')
        setLoading(true)
        
        const { data, error } = await supabase
          .from('isms_policies')
          .select('*')
          .eq('tenant_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar políticas:', error)
          throw error
        }
        
        console.log('Dados brutos do Supabase:', data)
        
        const mappedPolicies = data?.map(p => ({
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
        })) || []
        
        console.log('Políticas mapeadas:', mappedPolicies)
        setPolicies(mappedPolicies)
      } catch (error) {
        console.error('Erro ao buscar políticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicies()
  }, [user])

  const createPolicy = async (policy: Omit<Policy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('isms_policies')
        .insert([{ ...policy, tenant_id: user?.id }])
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        // Mapear os dados para o formato correto
        const mappedPolicy = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          version: data.version,
          lastUpdated: data.updated_at,
          owner: data.owner,
          tenant_id: data.tenant_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          content: data.content,
          tags: data.tags
        }
        
        setPolicies(prev => [...prev, mappedPolicy])
        return mappedPolicy
      }
    } catch (error) {
      console.error('Erro ao criar política:', error)
      throw error
    }
  }

  const updatePolicy = async (id: string, updates: Partial<Policy>) => {
    try {
      const { data, error } = await supabase
        .from('isms_policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        // Mapear os dados para o formato correto
        const mappedPolicy = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          version: data.version,
          lastUpdated: data.updated_at,
          owner: data.owner,
          tenant_id: data.tenant_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          content: data.content,
          tags: data.tags
        }
        
        setPolicies(prev => prev.map(p => p.id === id ? mappedPolicy : p))
        return mappedPolicy
      }
    } catch (error) {
      console.error('Erro ao atualizar política:', error)
      throw error
    }
  }

  const deletePolicy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('isms_policies')
        .delete()
        .eq('id', id)

      if (error) throw error
      
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
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchControls = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('isms_controls')
          .select('*')
          .eq('tenant_id', user.id)
          .order('name', { ascending: true })

        if (error) throw error
        
        const mappedControls = data?.map(c => ({
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
        })) || []
        
        setControls(mappedControls)
      } catch (error) {
        console.error('Erro ao buscar controles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchControls()
  }, [user])

  const createControl = async (control: Omit<Control, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('isms_controls')
        .insert([{ ...control, tenant_id: user?.id }])
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        // Mapear os dados para o formato correto
        const mappedControl = {
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category,
          effectiveness: data.effectiveness || 0,
          status: data.status,
          lastAssessment: data.last_assessment,
          tenant_id: data.tenant_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          policy_ids: data.policy_ids,
          domain_id: data.domain_id,
          framework_mappings: data.framework_mappings
        }
        
        setControls(prev => [...prev, mappedControl])
        return mappedControl
      }
    } catch (error) {
      console.error('Erro ao criar controle:', error)
      throw error
    }
  }

  const updateControl = async (id: string, updates: Partial<Control>) => {
    try {
      const { data, error } = await supabase
        .from('isms_controls')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        // Mapear os dados para o formato correto
        const mappedControl = {
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category,
          effectiveness: data.effectiveness || 0,
          status: data.status,
          lastAssessment: data.last_assessment,
          tenant_id: data.tenant_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          policy_ids: data.policy_ids,
          domain_id: data.domain_id,
          framework_mappings: data.framework_mappings
        }
        
        setControls(prev => {
          const newState = prev.map(c => c.id === id ? mappedControl : c)
          return newState
        })
        
        return mappedControl
      }
    } catch (error) {
      console.error('Erro ao atualizar controle:', error)
      throw error
    }
  }

  const deleteControl = async (id: string) => {
    try {
      const { error } = await supabase
        .from('isms_controls')
        .delete()
        .eq('id', id)

      if (error) throw error
      
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
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchDomains = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('isms_domains')
          .select('*')
          .eq('tenant_id', user.id)
          .order('name', { ascending: true })

        if (error) throw error
        
        setDomains(data || [])
      } catch (error) {
        console.error('Erro ao buscar domínios:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDomains()
  }, [user])

  return { domains, loading }
}

export function useFrameworks() {
  const { user } = useAuth()
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchFrameworks = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('isms_frameworks')
          .select('*')
          .eq('tenant_id', user.id)
          .order('name', { ascending: true })

        if (error) throw error
        
        setFrameworks(data || [])
      } catch (error) {
        console.error('Erro ao buscar frameworks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFrameworks()
  }, [user])

  return { frameworks, loading }
}

export function useAssessments() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchAssessments = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('isms_assessments')
          .select('*')
          .eq('tenant_id', user.id)
          .order('assessment_date', { ascending: false })

        if (error) throw error
        
        setAssessments(data || [])
      } catch (error) {
        console.error('Erro ao buscar avaliações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [user])

  const createAssessment = async (assessment: Omit<Assessment, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('isms_assessments')
        .insert([{ ...assessment, tenant_id: user?.id }])
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setAssessments(prev => [...prev, data])
        return data
      }
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
      throw error
    }
  }

  return { assessments, loading, createAssessment }
} 