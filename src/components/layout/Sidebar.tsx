'use client'

import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/supabase'
import { NAV_SECTIONS } from '@/config/navigation'
import { SidebarItem } from './SidebarItem'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { t } = useTranslation('isms')
  const { user } = useAuth()

  return (
    <div className="flex h-full flex-col bg-slate-900 border-r border-slate-700">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-[#00ade8] flex items-center justify-center">
            <span className="text-white font-bold text-sm">n</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-white font-semibold text-lg">n</span>
            <span className="text-[#00ade8] font-semibold text-lg">.</span>
            <span className="text-white font-semibold text-lg">CISO</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="space-y-8">
          {Object.entries(NAV_SECTIONS).map(([sectionKey, section]) => (
            <div key={sectionKey} className="px-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t(`navigation.sections.${sectionKey}`)}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    id={item.id}
                    label={t(`navigation.items.${item.id}`)}
                    icon={item.icon}
                    href={item.href}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User Footer */}
      {user && (
        <div className="border-t border-slate-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-[#00ade8] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.email}
              </p>
              <p className="text-xs text-slate-400">
                Chief Information Security Officer
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 