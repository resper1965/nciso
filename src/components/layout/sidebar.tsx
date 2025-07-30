import React from 'react'
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Home,
  FileText,
  Search,
  Bell,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
    active: true
  },
  {
    title: "Governança",
    icon: Shield,
    href: "/governance",
    children: [
      { title: "n.ISMS", href: "/isms", icon: FileText },
      { title: "n.Controls", href: "/controls", icon: Eye },
      { title: "n.Audit", href: "/audit", icon: Search },
      { title: "n.Risk", href: "/risk", icon: AlertTriangle },
      { title: "n.Privacy", href: "/privacy", icon: Shield }
    ]
  },
  {
    title: "Monitoramento",
    icon: BarChart3,
    href: "/monitoring",
    children: [
      { title: "n.CIRT", href: "/cirt", icon: AlertTriangle },
      { title: "n.SecDevOps", href: "/secdevops", icon: Shield },
      { title: "n.Assessments", href: "/assessments", icon: BarChart3 }
    ]
  },
  {
    title: "Internos",
    icon: Users,
    href: "/internal",
    children: [
      { title: "n.Platform", href: "/platform", icon: Users },
      { title: "n.Tickets", href: "/tickets", icon: Bell }
    ]
  }
]

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn(
      "w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-screen",
      className
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-nciso-cyan rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">n.CISO</h1>
            <p className="text-xs text-slate-400">Security Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.title}>
            <Button
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left",
                item.active 
                  ? "bg-nciso-cyan text-white hover:bg-nciso-blue" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              )}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.title}
            </Button>
            
            {item.children && (
              <div className="ml-6 mt-2 space-y-1">
                {item.children.map((child) => (
                  <Button
                    key={child.title}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <child.icon className="w-3 h-3 mr-2" />
                    {child.title}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-slate-400">admin@nciso.com</p>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 