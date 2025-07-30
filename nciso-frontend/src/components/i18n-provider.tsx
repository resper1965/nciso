'use client'

import { useEffect } from 'react'
import '../lib/i18n'

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Inicializar i18n quando o componente montar
    // O i18n já está configurado no arquivo lib/i18n.ts
  }, [])

  return <>{children}</>
} 