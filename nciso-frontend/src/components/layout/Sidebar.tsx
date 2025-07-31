'use client'

import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/supabase'
import { NAV_SECTIONS } from '@/config/navigation'
import { SidebarItem } from './SidebarItem'
import { useCurrentModule } from '@/lib/useCurrentModule'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'

interface SidebarProps {
  isCollapsed?: boolean
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const { t } = useTranslation('isms')
  const { user } = useAuth()
  const currentModule = useCurrentModule()

  return (
    <div className={cn(
      "flex h-full flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-[270px]"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-700">
        <div className="flex items-center">
          <Logo size={isCollapsed ? "sm" : "lg"} className="flex-shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="space-y-8">
          {Object.entries(NAV_SECTIONS).map(([sectionKey, section]) => (
            <div key={sectionKey} className={cn("px-6", isCollapsed && "px-2")}>
              {!isCollapsed && (
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-200">
                  {t(`navigation.sections.${sectionKey}`)}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    id={item.id}
                    label={t(`navigation.items.${item.id}`)}
                    description={t(`navigation.descriptions.${item.id}`)}
                    icon={item.icon}
                    href={item.href}
                    isCollapsed={isCollapsed}
                    isActive={currentModule.id === item.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
} 