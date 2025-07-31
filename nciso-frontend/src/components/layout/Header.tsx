'use client'

import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { UserMenu } from './UserMenu'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useCurrentModule } from '@/lib/useCurrentModule'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t } = useTranslation('isms')
  const currentModule = useCurrentModule()

  return (
    <header className="bg-slate-900 border-b border-slate-700">
      {/* Main Header */}
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-white">
            {currentModule.name}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
          </button>
          <LanguageSelector />
          <UserMenu />
        </div>
      </div>

      {/* Module Description */}
      <div className="px-6 py-2 bg-slate-800 border-b border-slate-700">
        <p className="text-sm text-slate-300">
          {t(`moduleDescription.${currentModule.id}`, currentModule.description)}
        </p>
      </div>
    </header>
  )
} 