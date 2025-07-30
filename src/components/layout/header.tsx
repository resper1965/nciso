import React from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Search, 
  Plus,
  Menu,
  User,
  Settings
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "@/components/ui/language-toggle"

interface HeaderProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
  showNotifications?: boolean
  showAddButton?: boolean
  onAddClick?: () => void
  className?: string
}

export function Header({ 
  title = "Dashboard",
  subtitle,
  showSearch = true,
  showNotifications = true,
  showAddButton = false,
  onAddClick,
  className 
}: HeaderProps) {
  return (
    <header className={cn(
      "bg-card border-b border-border px-6 py-4",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="w-4 h-4" />
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          )}

          {/* Add Button */}
          {showAddButton && (
            <Button 
              onClick={onAddClick}
              className="bg-nciso-cyan hover:bg-nciso-blue text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 