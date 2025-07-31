'use client'

import { useState } from 'react'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        aria-label="User menu"
      >
        <div className="h-8 w-8 rounded-full bg-[#00ade8] flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="hidden md:block">{user.email}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-lg z-50">
          <div className="p-3 border-b border-slate-700">
            <p className="text-sm font-medium text-white">{user.email}</p>
            <p className="text-xs text-slate-400">Chief Information Security Officer</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => {}}
              className="flex w-full items-center space-x-2 rounded px-2 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </button>
            <button
              onClick={signOut}
              className="flex w-full items-center space-x-2 rounded px-2 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 