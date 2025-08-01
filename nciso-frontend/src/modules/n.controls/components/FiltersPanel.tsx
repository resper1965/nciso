'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Settings,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DashboardFilters, useDashboardFilters } from '../hooks/useDashboardFilters'

interface FiltersPanelProps {
  className?: string
  layout?: 'sidebar' | 'popover' | 'inline'
  showClearButton?: boolean
  showFilterCount?: boolean
  collapsible?: boolean
}

export function FiltersPanel({ 
  className,
  layout = 'inline',
  showClearButton = true,
  showFilterCount = true,
  collapsible = false
}: FiltersPanelProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)
  
  const {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
    getFilterSummary,
    isFilterActive
  } = useDashboardFilters()

  // Opções para os filtros
  const frameworkOptions = [
    { value: 'iso-27001', label: 'ISO 27001' },
    { value: 'nist-csf', label: 'NIST CSF' },
    { value: 'cobit', label: 'COBIT' },
    { value: 'pci-dss', label: 'PCI DSS' },
    { value: 'sox', label: 'SOX' },
    { value: 'gdpr', label: 'GDPR' }
  ]

  const typeOptions = [
    { value: 'preventive', label: t('controls.types.preventive') },
    { value: 'detective', label: t('controls.types.detective') },
    { value: 'corrective', label: t('controls.types.corrective') },
    { value: 'deterrent', label: t('controls.types.deterrent') }
  ]

  const statusOptions = [
    { value: 'active', label: t('controls.status.active') },
    { value: 'inactive', label: t('controls.status.inactive') },
    { value: 'draft', label: t('controls.status.draft') },
    { value: 'archived', label: t('controls.status.archived') }
  ]

  const domainOptions = [
    { value: 'governance', label: t('controls.domains.governance') },
    { value: 'access_control', label: t('controls.domains.access_control') },
    { value: 'asset_management', label: t('controls.domains.asset_management') },
    { value: 'business_continuity', label: t('controls.domains.business_continuity') },
    { value: 'incident_management', label: t('controls.domains.incident_management') },
    { value: 'monitoring', label: t('controls.domains.monitoring') },
    { value: 'risk_management', label: t('controls.domains.risk_management') },
    { value: 'vendor_management', label: t('controls.domains.vendor_management') },
    { value: 'training', label: t('controls.domains.training') }
  ]

  const priorityOptions = [
    { value: 'critical', label: t('controls.priorities.critical') },
    { value: 'high', label: t('controls.priorities.high') },
    { value: 'medium', label: t('controls.priorities.medium') },
    { value: 'low', label: t('controls.priorities.low') }
  ]

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilter(key, value === 'all' ? undefined : value)
  }

  const handleClearFilter = (key: keyof DashboardFilters) => {
    clearFilter(key)
  }

  const handleClearAll = () => {
    clearAllFilters()
  }

  const renderFilterSelect = (
    key: keyof DashboardFilters,
    label: string,
    options: Array<{ value: string; label: string }>,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select
        value={filters[key] || 'all'}
        onValueChange={(value) => handleFilterChange(key, value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {t('controls.filters.all')} {label.toLowerCase()}
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isFilterActive(key) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleClearFilter(key)}
          className="h-6 px-2 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          {t('common.clear')}
        </Button>
      )}
    </div>
  )

  const renderFilterCheckboxes = (
    key: keyof DashboardFilters,
    label: string,
    options: Array<{ value: string; label: string }>
  ) => (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${key}-${option.value}`}
              checked={filters[key] === option.value}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilter(key, option.value)
                } else {
                  clearFilter(key)
                }
              }}
            />
            <label
              htmlFor={`${key}-${option.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const filterContent = (
    <div className="space-y-4">
      {/* Framework Filter */}
      {renderFilterSelect(
        'framework',
        t('controls.dashboard.filters.framework'),
        frameworkOptions,
        t('controls.dashboard.filters.framework_placeholder')
      )}

      {/* Type Filter */}
      {renderFilterSelect(
        'type',
        t('controls.dashboard.filters.type'),
        typeOptions,
        t('controls.dashboard.filters.type_placeholder')
      )}

      {/* Status Filter */}
      {renderFilterSelect(
        'status',
        t('controls.dashboard.filters.status'),
        statusOptions,
        t('controls.dashboard.filters.status_placeholder')
      )}

      {/* Domain Filter */}
      {renderFilterSelect(
        'domain',
        t('controls.dashboard.filters.domain'),
        domainOptions,
        t('controls.dashboard.filters.domain_placeholder')
      )}

      {/* Priority Filter */}
      {renderFilterSelect(
        'priority',
        t('controls.dashboard.filters.priority'),
        priorityOptions,
        t('controls.dashboard.filters.priority_placeholder')
      )}

      {/* Clear All Button */}
      {showClearButton && hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          {t('controls.filters.clear_filters')}
        </Button>
      )}
    </div>
  )

  // Render baseado no layout
  if (layout === 'sidebar') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            {t('controls.dashboard.filters.title')}
            {showFilterCount && hasActiveFilters && (
              <Badge variant="secondary" className="ml-auto">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filterContent}
        </CardContent>
      </Card>
    )
  }

  if (layout === 'popover') {
    return (
      <div className={className}>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('controls.dashboard.filters.title')}
            {showFilterCount && hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Layout inline (padrão)
  if (collapsible) {
    return (
      <Card className={className}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                {t('controls.dashboard.filters.title')}
                {showFilterCount && hasActiveFilters && (
                  <Badge variant="secondary" className="ml-auto">
                    {activeFiltersCount}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {filterContent}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" />
          {t('controls.dashboard.filters.title')}
          {showFilterCount && hasActiveFilters && (
            <Badge variant="secondary" className="ml-auto">
              {activeFiltersCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filterContent}
      </CardContent>
    </Card>
  )
} 