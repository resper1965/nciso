import React from 'react'
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showSearch?: boolean
  showNotifications?: boolean
  showAddButton?: boolean
  onAddClick?: () => void
  className?: string
}

export function MainLayout({ 
  children,
  title,
  subtitle,
  showSearch = true,
  showNotifications = true,
  showAddButton = false,
  onAddClick,
  className 
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar className="hidden lg:flex" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          showNotifications={showNotifications}
          showAddButton={showAddButton}
          onAddClick={onAddClick}
        />
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-auto bg-background",
          className
        )}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 