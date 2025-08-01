import { useState, useCallback } from 'react'
import { ControlFilters } from '../types'

export function useControlFilters(initialFilters: ControlFilters = {}) {
  const [filters, setFilters] = useState<ControlFilters>(initialFilters)

  const updateFilter = useCallback((key: keyof ControlFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' || value === null ? undefined : value
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  )

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length
  }

  const getFilterSummary = () => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== '' && value !== null
    )
    
    return activeFilters.map(([key, value]) => ({
      key,
      value,
      label: `${key}: ${value}`
    }))
  }

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    getActiveFiltersCount,
    getFilterSummary
  }
} 