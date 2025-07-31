'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block bg-slate-900 border-r border-slate-700 flex-shrink-0 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-20" : "w-[270px]"
      )}>
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </aside>



      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Desktop Toggle Button */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className={cn(
          "hidden md:flex fixed z-40 p-1.5 rounded-r-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-lg border-l border-slate-600",
          isSidebarCollapsed ? "left-20" : "left-[270px]"
        )}
        style={{ 
          top: '50%', 
          transform: 'translateY(-50%)'
        }}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </div>
  )
} 