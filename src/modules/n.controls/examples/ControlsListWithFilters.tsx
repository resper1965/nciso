'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ControlFilters, useControlFilters } from '@/modules/n.controls'
import { ControlsService, Control, ControlFilters as ControlFiltersType } from '@/lib/types/controls'
import { useToast } from '@/hooks/use-toast'

export function ControlsListWithFilters() {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Usando o hook personalizado para filtros
  const { 
    filters, 
    updateFilter, 
    clearFilters, 
    hasActiveFilters,
    getActiveFiltersCount 
  } = useControlFilters()

  const loadControls = async () => {
    try {
      setLoading(true)
      const response = await ControlsService.list(filters, page, 20)
      setControls(response.data)
      setTotalPages(response.total_pages)
      setTotalCount(response.count)
    } catch (error) {
      console.error('Error loading controls:', error)
      toast({
        title: t('common.error'),
        description: t('controls.messages.error_loading'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadControls()
  }, [page, filters])

  const handleFilterChange = (key: keyof ControlFiltersType, value: any) => {
    updateFilter(key, value)
    setPage(1) // Reset para primeira página quando filtros mudam
  }

  const handleClearFilters = () => {
    clearFilters()
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('controls.title')}</h1>
          <p className="text-muted-foreground">{t('controls.subtitle')}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('controls.stats.total_controls')}: {totalCount}
          {hasActiveFilters && (
            <span className="ml-2 text-blue-600">
              ({getActiveFiltersCount()} {t('controls.filters.title').toLowerCase()})
            </span>
          )}
        </div>
      </div>

      {/* Componente de Filtros */}
      <ControlFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Lista de Controles */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p>{t('controls.messages.loading')}</p>
          </div>
        ) : controls.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {hasActiveFilters 
                ? t('controls.messages.no_controls_with_filters')
                : t('controls.messages.no_controls')
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {controls.map((control) => (
              <div key={control.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{control.name}</h3>
                <p className="text-sm text-muted-foreground">{control.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {t(`controls.types.${control.type}`)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    {t(`controls.status.${control.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 