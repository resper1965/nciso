import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface Framework {
  id: string
  name: string
  version: string
  description: string
  is_active: boolean
}

interface FrameworkMapping {
  id: string
  control_id: string
  framework_id: string
  tenant_id: string
  created_at: string
}

interface UseFrameworkMappingProps {
  controlId: string
}

export function useFrameworkMapping({ controlId }: UseFrameworkMappingProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [mappedFrameworks, setMappedFrameworks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Carregar frameworks disponíveis
  const loadFrameworks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setFrameworks(data || [])
    } catch (error) {
      console.error('Error loading frameworks:', error)
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_loading_frameworks'),
        variant: 'destructive'
      })
    }
  }, [t, toast])

  // Carregar mapeamentos existentes
  const loadMappings = useCallback(async () => {
    if (!controlId) return

    try {
      const { data, error } = await supabase
        .from('control_frameworks')
        .select('framework_id')
        .eq('control_id', controlId)

      if (error) throw error
      
      const mappedIds = data?.map(mapping => mapping.framework_id) || []
      setMappedFrameworks(mappedIds)
    } catch (error) {
      console.error('Error loading framework mappings:', error)
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_loading_mappings'),
        variant: 'destructive'
      })
    }
  }, [controlId, t, toast])

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadFrameworks(), loadMappings()])
      setLoading(false)
    }

    loadData()
  }, [loadFrameworks, loadMappings])

  // Atualizar mapeamento quando controlId mudar
  useEffect(() => {
    if (controlId) {
      loadMappings()
    }
  }, [controlId, loadMappings])

  // Adicionar mapeamento
  const addMapping = useCallback(async (frameworkId: string) => {
    if (!controlId) return

    try {
      setUpdating(true)
      
      const { error } = await supabase
        .from('control_frameworks')
        .insert({
          control_id: controlId,
          framework_id: frameworkId
        })

      if (error) throw error

      setMappedFrameworks(prev => [...prev, frameworkId])
      
      toast({
        title: t('common.success'),
        description: t('controls.messages.framework_mapping_added'),
      })
    } catch (error) {
      console.error('Error adding framework mapping:', error)
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_adding_mapping'),
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }, [controlId, t, toast])

  // Remover mapeamento
  const removeMapping = useCallback(async (frameworkId: string) => {
    if (!controlId) return

    try {
      setUpdating(true)
      
      const { error } = await supabase
        .from('control_frameworks')
        .delete()
        .eq('control_id', controlId)
        .eq('framework_id', frameworkId)

      if (error) throw error

      setMappedFrameworks(prev => prev.filter(id => id !== frameworkId))
      
      toast({
        title: t('common.success'),
        description: t('controls.messages.framework_mapping_removed'),
      })
    } catch (error) {
      console.error('Error removing framework mapping:', error)
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_removing_mapping'),
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }, [controlId, t, toast])

  // Toggle mapeamento
  const toggleMapping = useCallback(async (frameworkId: string) => {
    const isMapped = mappedFrameworks.includes(frameworkId)
    
    if (isMapped) {
      await removeMapping(frameworkId)
    } else {
      await addMapping(frameworkId)
    }
  }, [mappedFrameworks, addMapping, removeMapping])

  // Verificar se um framework está mapeado
  const isFrameworkMapped = useCallback((frameworkId: string) => {
    return mappedFrameworks.includes(frameworkId)
  }, [mappedFrameworks])

  // Obter estatísticas
  const getStats = useCallback(() => {
    return {
      totalFrameworks: frameworks.length,
      mappedFrameworks: mappedFrameworks.length,
      unmappedFrameworks: frameworks.length - mappedFrameworks.length
    }
  }, [frameworks.length, mappedFrameworks.length])

  return {
    frameworks,
    mappedFrameworks,
    loading,
    updating,
    toggleMapping,
    isFrameworkMapped,
    getStats,
    refresh: loadMappings
  }
} 