'use client'

import { createContext, useContext, useState } from 'react'

interface SheetContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = createContext<SheetContextType | undefined>(undefined)

export function Sheet({ 
  children, 
  open, 
  onOpenChange 
}: { 
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

export function SheetTrigger({ 
  children, 
  asChild = false 
}: { 
  children: React.ReactNode
  asChild?: boolean
}) {
  const context = useContext(SheetContext)
  if (!context) throw new Error('SheetTrigger must be used within Sheet')

  if (asChild) {
    return (
      <div onClick={() => context.onOpenChange(true)}>
        {children}
      </div>
    )
  }

  return (
    <button onClick={() => context.onOpenChange(true)}>
      {children}
    </button>
  )
}

export function SheetContent({ 
  children, 
  side = 'right',
  className = ''
}: { 
  children: React.ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
}) {
  const context = useContext(SheetContext)
  if (!context) throw new Error('SheetContent must be used within Sheet')

  if (!context.open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => context.onOpenChange(false)}
      />
      <div className={`absolute ${side === 'left' ? 'left-0 top-0 h-full' : ''} ${className}`}>
        {children}
      </div>
    </div>
  )
} 