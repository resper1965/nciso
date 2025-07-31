'use client'

import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { UserMenu } from './UserMenu'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname()

  const getPageTitle = () => {
    const path = pathname.split('/')[1] || 'dashboard'
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      isms: 'n.ISMS',
      controls: 'n.Controls',
      audit: 'n.Audit',
      risk: 'n.Risk',
      privacy: 'n.Privacy',
      cirt: 'n.CIRT',
      secdevops: 'n.SecDevOps',
      assessments: 'n.Assessments',
      platform: 'n.Platform',
      tickets: 'n.Tickets'
    }
    return titles[path] || 'Dashboard'
  }

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-white">
            {getPageTitle()}
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
          <UserMenu />
        </div>
      </div>
    </header>
  )
} 