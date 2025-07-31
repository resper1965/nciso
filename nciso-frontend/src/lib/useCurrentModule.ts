import { usePathname } from 'next/navigation'

export interface ModuleInfo {
  id: string
  name: string
  path: string
  description: string
}

export const MODULES: Record<string, ModuleInfo> = {
  dashboard: {
    id: 'isms',
    name: 'n.ISMS',
    path: '/dashboard',
    description: 'Sistema de Gestão da Segurança da Informação'
  },
  isms: {
    id: 'isms',
    name: 'n.ISMS',
    path: '/isms',
    description: 'Sistema de Gestão da Segurança da Informação'
  },
  controls: {
    id: 'controls',
    name: 'n.Controls',
    path: '/controls',
    description: 'Catálogo centralizado de controles de segurança'
  },
  audit: {
    id: 'audit',
    name: 'n.Audit',
    path: '/audit',
    description: 'Sistema de auditoria e conformidade'
  },
  risk: {
    id: 'risk',
    name: 'n.Risk',
    path: '/risk',
    description: 'Gestão de riscos de segurança'
  },
  privacy: {
    id: 'privacy',
    name: 'n.Privacy',
    path: '/privacy',
    description: 'Proteção de dados e privacidade'
  },
  cirt: {
    id: 'cirt',
    name: 'n.CIRT',
    path: '/cirt',
    description: 'Centro de Incidentes e Resposta'
  },
  secdevops: {
    id: 'secdevops',
    name: 'n.SecDevOps',
    path: '/secdevops',
    description: 'Segurança em desenvolvimento e operações'
  },
  assessments: {
    id: 'assessments',
    name: 'n.Assessments',
    path: '/assessments',
    description: 'Avaliações de segurança'
  },
  platform: {
    id: 'platform',
    name: 'n.Platform',
    path: '/platform',
    description: 'Plataforma e infraestrutura'
  },
  tickets: {
    id: 'tickets',
    name: 'n.Tickets',
    path: '/tickets',
    description: 'Sistema de tickets e suporte'
  }
}

export function useCurrentModule(): ModuleInfo {
  const pathname = usePathname()
  const path = pathname.split('/')[1] || 'dashboard'
  
  return MODULES[path] || MODULES.dashboard
} 