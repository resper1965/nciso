'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { ControlStatusBadge, ControlStatus } from '@/modules/n.controls'

export function ControlStatusBadgeExample() {
  const { t } = useTranslation()

  const statuses: ControlStatus[] = ['active', 'inactive', 'draft', 'archived']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('controls.title')}</h2>
        <p className="text-muted-foreground mb-6">
          Exemplos de badges de status para controles
        </p>
      </div>

      {/* Exemplos individuais */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Status Individuais:</h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <ControlStatusBadge key={status} status={status} />
          ))}
        </div>
      </div>

      {/* Exemplo em contexto de lista */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Em Contexto de Lista:</h3>
        <div className="space-y-2">
          {statuses.map((status) => (
            <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Controle {t(`controls.status.${status}`)}</h4>
                <p className="text-sm text-muted-foreground">
                  Descrição do controle com status {t(`controls.status.${status}`).toLowerCase()}
                </p>
              </div>
              <ControlStatusBadge status={status} />
            </div>
          ))}
        </div>
      </div>

      {/* Exemplo com customização */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Com Customização:</h3>
        <div className="flex flex-wrap gap-2">
          <ControlStatusBadge 
            status="active" 
            className="text-sm font-bold"
          />
          <ControlStatusBadge 
            status="draft" 
            className="border-2 border-dashed"
          />
          <ControlStatusBadge 
            status="archived" 
            className="opacity-75"
          />
        </div>
      </div>
    </div>
  )
} 