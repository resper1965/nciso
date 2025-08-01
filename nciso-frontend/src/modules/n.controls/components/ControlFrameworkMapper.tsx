'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Shield, BookOpen, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFrameworkMapping } from '../hooks/useFrameworkMapping'

interface ControlFrameworkMapperProps {
  controlId: string
  controlName?: string
  className?: string
  showStats?: boolean
}

export function ControlFrameworkMapper({ 
  controlId, 
  controlName, 
  className,
  showStats = true 
}: ControlFrameworkMapperProps) {
  const { t } = useTranslation()
  
  const {
    frameworks,
    mappedFrameworks,
    loading,
    updating,
    toggleMapping,
    isFrameworkMapped,
    getStats
  } = useFrameworkMapping({ controlId })

  const stats = getStats()

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('controls.framework_mapping.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('controls.framework_mapping.title')}
          {controlName && (
            <span className="text-sm font-normal text-muted-foreground">
              - {controlName}
            </span>
          )}
        </CardTitle>
        {showStats && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{t('controls.framework_mapping.total_frameworks')}: {stats.totalFrameworks}</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-600" />
              <span>{t('controls.framework_mapping.mapped')}: {stats.mappedFrameworks}</span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="h-4 w-4 text-yellow-600" />
              <span>{t('controls.framework_mapping.unmapped')}: {stats.unmappedFrameworks}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {frameworks.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('controls.framework_mapping.no_frameworks_available')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {frameworks.map((framework) => {
              const isMapped = isFrameworkMapped(framework.id)
              const isUpdating = updating

              return (
                <div
                  key={framework.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    isMapped 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                  }`}
                >
                  <Checkbox
                    id={`framework-${framework.id}`}
                    checked={isMapped}
                    onCheckedChange={() => toggleMapping(framework.id)}
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`framework-${framework.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {framework.name}
                          </span>
                          {framework.version && (
                            <Badge variant="outline" className="text-xs">
                              v{framework.version}
                            </Badge>
                          )}
                          {isMapped && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {t('controls.framework_mapping.mapped_badge')}
                            </Badge>
                          )}
                        </div>
                        {framework.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {framework.description}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>

                  {isUpdating && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {frameworks.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('controls.framework_mapping.instructions')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={updating}
              >
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 