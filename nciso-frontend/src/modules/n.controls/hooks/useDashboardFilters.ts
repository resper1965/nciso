'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export interface DashboardFilters {
  framework?: string
  type?: string
  status?: string
  domain?: string
  priority?: string
}

interface UseDashboardFiltersProps {
  initialFilters?: DashboardFilters
  persistInUrl?: boolean
  debounceMs?: number
}

interface UseDashboardFiltersReturn {
  filters: DashboardFilters
  setFilter: (key: keyof DashboardFilters, value: string | undefined) => void
  clearFilter: (key: keyof DashboardFilters) => void
  clearAllFilters: () => void
  hasActiveFilters: boolean
  activeFiltersCount: number
  getFilterSummary: () => Array<{ key: string; value: string; label: string }>
  isFilterActive: (key: keyof DashboardFilters) => boolean
}

export function useDashboardFilters({
  initialFilters = {},
  persistInUrl = true,
  debounceMs = 300
}: UseDashboardFiltersProps): UseDashboardFiltersReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [filters, setFilters] = useState<DashboardFilters>(() => {
    if (persistInUrl) {
      // Carregar filtros da URL
      const urlFilters: DashboardFilters = {}
      const params = new URLSearchParams(searchParams.toString())
      
      ;(['framework', 'type', 'status', 'domain', 'priority'] as const).forEach(key => {
        const value = params.get(key)
        if (value) {
          urlFilters[key] = value
        }
      })
      
      return { ...initialFilters, ...urlFilters }
    }
    
    return initialFilters
  })

  const [debouncedFilters, setDebouncedFilters] = useState<DashboardFilters>(filters)

  // Debounce para atualizar URL
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filters)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [filters, debounceMs])

  // Atualizar URL quando filtros mudam
  useEffect(() => {
    if (!persistInUrl) return

    const params = new URLSearchParams(searchParams.toString())
    
    // Limpar filtros existentes
    ;(['framework', 'type', 'status', 'domain', 'priority'] as const).forEach(key => {
      params.delete(key)
    })
    
    // Adicionar filtros ativos
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value)
      }
    })
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [debouncedFilters, persistInUrl, router, pathname, searchParams])

  const setFilter = useCallback((key: keyof DashboardFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }, [])

  const clearFilter = useCallback((key: keyof DashboardFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({})
  }, [])

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  )

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length

  const getFilterSummary = useCallback(() => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== '' && value !== null
    )

    return activeFilters.map(([key, value]) => ({
      key,
      value: value as string,
      label: `${key}: ${value}`
    }))
  }, [filters])

  const isFilterActive = useCallback((key: keyof DashboardFilters) => {
    const value = filters[key]
    return value !== undefined && value !== '' && value !== null
  }, [filters])

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
    getFilterSummary,
    isFilterActive
  }
} 