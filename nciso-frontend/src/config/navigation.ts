import {
  Shield,
  FileText,
  Settings,
  BarChart3,
  AlertTriangle,
  Users,
  BookOpen,
  CheckCircle,
  TrendingUp,
  ClipboardList,
  Eye,
  Lock,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Code,
  ClipboardCheck,
  Monitor,
  Ticket
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  description: string
  icon: any // LucideIcon
  href: string
  section: 'governance' | 'monitoring' | 'internal'
}

export const NAV_ITEMS: NavItem[] = [
  // Governança
  { 
    id: 'isms', 
    label: 'n.ISMS', 
    description: 'Sistema de Gestão',
    icon: Shield, 
    href: '/isms', 
    section: 'governance' 
  },
  { 
    id: 'controls', 
    label: 'n.Controls', 
    description: 'Catálogo de Controles',
    icon: ShieldCheck, 
    href: '/controls', 
    section: 'governance' 
  },
  { 
    id: 'audit', 
    label: 'n.Audit', 
    description: 'Auditorias',
    icon: CheckCircle, 
    href: '/audit', 
    section: 'governance' 
  },
  { 
    id: 'risk', 
    label: 'n.Risk', 
    description: 'Gestão de Riscos',
    icon: AlertTriangle, 
    href: '/risk', 
    section: 'governance' 
  },
  { 
    id: 'privacy', 
    label: 'n.Privacy', 
    description: 'Proteção de Dados',
    icon: Eye, 
    href: '/privacy', 
    section: 'governance' 
  },
  
  // Monitoramento
  { 
    id: 'cirt', 
    label: 'n.CIRT', 
    description: 'Resposta a Incidentes',
    icon: AlertCircle, 
    href: '/cirt', 
    section: 'monitoring' 
  },
  { 
    id: 'secdevops', 
    label: 'n.SecDevOps', 
    description: 'Testes de Segurança',
    icon: Code, 
    href: '/secdevops', 
    section: 'monitoring' 
  },
  { 
    id: 'assessments', 
    label: 'n.Assessments', 
    description: 'Avaliações',
    icon: ClipboardCheck, 
    href: '/assessments', 
    section: 'monitoring' 
  },
  
  // Internos
  { 
    id: 'platform', 
    label: 'n.Platform', 
    description: 'Usuários e Permissões',
    icon: Monitor, 
    href: '/platform', 
    section: 'internal' 
  },
  { 
    id: 'tickets', 
    label: 'n.Tickets', 
    description: 'Suporte Interno',
    icon: Ticket, 
    href: '/tickets', 
    section: 'internal' 
  }
]

export const NAV_SECTIONS = {
  governance: {
    title: 'Governança',
    items: NAV_ITEMS.filter(item => item.section === 'governance')
  },
  monitoring: {
    title: 'Monitoramento',
    items: NAV_ITEMS.filter(item => item.section === 'monitoring')
  },
  internal: {
    title: 'Internos',
    items: NAV_ITEMS.filter(item => item.section === 'internal')
  }
} 