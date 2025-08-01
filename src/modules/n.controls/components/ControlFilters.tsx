'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { ControlFilters as ControlFiltersType } from '../types'

interface ControlFiltersProps {
  filters: ControlFiltersType
  onFilterChange: (key: keyof ControlFiltersType, value: any) => void
  onClearFilters: () => void
}

export function ControlFilters({ filters, onFilterChange, onClearFilters }: ControlFiltersProps) {
  const { t } = useTranslation()

  const handleSearch = (value: string) => {
    onFilterChange('search', value)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('controls.filters.title')}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              {t('controls.filters.clear_filters')}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('common.search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('controls.filters.search_placeholder')}
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('controls.fields.type')}
            </label>
            <Select
              value={filters.type || ''}
              onValueChange={(value) => onFilterChange('type', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('controls.filters.all_types')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('controls.filters.all_types')}</SelectItem>
                <SelectItem value="preventive">{t('controls.types.preventive')}</SelectItem>
                <SelectItem value="corrective">{t('controls.types.corrective')}</SelectItem>
                <SelectItem value="detective">{t('controls.types.detective')}</SelectItem>
                <SelectItem value="deterrent">{t('controls.types.deterrent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('controls.fields.status')}
            </label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => onFilterChange('status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('controls.filters.all_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('controls.filters.all_status')}</SelectItem>
                <SelectItem value="active">{t('controls.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('controls.status.inactive')}</SelectItem>
                <SelectItem value="draft">{t('controls.status.draft')}</SelectItem>
                <SelectItem value="archived">{t('controls.status.archived')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Framework Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('controls.fields.framework')}
            </label>
            <Select
              value={filters.framework || ''}
              onValueChange={(value) => onFilterChange('framework', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('controls.filters.all_frameworks')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('controls.filters.all_frameworks')}</SelectItem>
                <SelectItem value="iso27001">{t('controls.frameworks.iso27001')}</SelectItem>
                <SelectItem value="nist">{t('controls.frameworks.nist')}</SelectItem>
                <SelectItem value="cobit">{t('controls.frameworks.cobit')}</SelectItem>
                <SelectItem value="custom">{t('controls.frameworks.custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Domain Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('controls.fields.domain')}
            </label>
            <Select
              value={filters.domain || ''}
              onValueChange={(value) => onFilterChange('domain', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('controls.filters.all_domains')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('controls.filters.all_domains')}</SelectItem>
                <SelectItem value="access_control">{t('controls.domains.access_control')}</SelectItem>
                <SelectItem value="asset_management">{t('controls.domains.asset_management')}</SelectItem>
                <SelectItem value="business_continuity">{t('controls.domains.business_continuity')}</SelectItem>
                <SelectItem value="communications">{t('controls.domains.communications')}</SelectItem>
                <SelectItem value="compliance">{t('controls.domains.compliance')}</SelectItem>
                <SelectItem value="cryptography">{t('controls.domains.cryptography')}</SelectItem>
                <SelectItem value="human_resources">{t('controls.domains.human_resources')}</SelectItem>
                <SelectItem value="incident_management">{t('controls.domains.incident_management')}</SelectItem>
                <SelectItem value="operations">{t('controls.domains.operations')}</SelectItem>
                <SelectItem value="physical_security">{t('controls.domains.physical_security')}</SelectItem>
                <SelectItem value="risk_management">{t('controls.domains.risk_management')}</SelectItem>
                <SelectItem value="security_architecture">{t('controls.domains.security_architecture')}</SelectItem>
                <SelectItem value="supplier_relationships">{t('controls.domains.supplier_relationships')}</SelectItem>
                <SelectItem value="system_development">{t('controls.domains.system_development')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('controls.fields.priority')}
            </label>
            <Select
              value={filters.priority || ''}
              onValueChange={(value) => onFilterChange('priority', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('controls.filters.all_priorities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('controls.filters.all_priorities')}</SelectItem>
                <SelectItem value="low">{t('controls.priorities.low')}</SelectItem>
                <SelectItem value="medium">{t('controls.priorities.medium')}</SelectItem>
                <SelectItem value="high">{t('controls.priorities.high')}</SelectItem>
                <SelectItem value="critical">{t('controls.priorities.critical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 