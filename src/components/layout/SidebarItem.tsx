'use client'

import { useRouter, usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  id: string
  label: string
  icon: LucideIcon
  href: string
  isActive?: boolean
}

export function SidebarItem({ id, label, icon: Icon, href, isActive }: SidebarItemProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isCurrentActive = isActive || pathname === href

  const handleClick = () => {
    router.push(href)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group relative flex w-full items-center rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-nciso-surface-300 hover:text-white',
        isCurrentActive 
          ? 'bg-nciso-surface-300 text-white' 
          : 'text-slate-400 hover:text-white'
      )}
      aria-label={`Navigate to ${label}`}
      role="menuitem"
    >
      {/* Active indicator dot */}
      {isCurrentActive && (
        <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-[#00ade8]" />
      )}
      
      {/* Icon */}
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
      
      {/* Label */}
      <span className="truncate">{label}</span>
    </button>
  )
} 