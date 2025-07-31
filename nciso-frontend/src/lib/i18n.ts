import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { I18N_CONFIG } from './constants'

// Traduções
const resources = {
  'pt-BR': {
    common: {
      loading: 'Carregando...',
      saving: 'Salvando...',
      error: 'Erro',
      success: 'Sucesso',
      cancel: 'Cancelar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      create: 'Criar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      actions: 'Ações',
      status: 'Status',
      date: 'Data',
      name: 'Nome',
      description: 'Descrição'
    },
    auth: {
      login: 'Entrar',
      logout: 'Sair',
      email: 'E-mail',
      password: 'Senha',
      forgotPassword: 'Esqueci minha senha',
      signUp: 'Criar conta',
      loginTitle: 'Entrar no n.CISO',
      loginSubtitle: 'Plataforma de Gestão de Segurança da Informação',
      loginError: 'E-mail ou senha inválidos',
      loginSuccess: 'Login realizado com sucesso'
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Bem-vindo ao n.CISO',
      overview: 'Visão Geral',
      policies: 'Políticas',
      controls: 'Controles',
      risks: 'Riscos',
      audits: 'Auditorias',
      reports: 'Relatórios',
      settings: 'Configurações'
    },
    policies: {
      title: 'Políticas de Segurança',
      create: 'Criar Política',
      edit: 'Editar Política',
      delete: 'Excluir Política',
      status: {
        draft: 'Rascunho',
        active: 'Ativa',
        inactive: 'Inativa',
        archived: 'Arquivada'
      },
      fields: {
        title: 'Título',
        description: 'Descrição',
        content: 'Conteúdo',
        version: 'Versão',
        status: 'Status',
        createdBy: 'Criado por',
        createdAt: 'Criado em',
        updatedAt: 'Atualizado em'
      }
    },
    isms: {
      title: 'Sistema de Gestão de Segurança da Informação',
      description: 'Gerencie políticas, controles e domínios para garantir conformidade e segurança organizacional.',
      overview: 'Visão Geral',
      policies: 'Políticas',
      procedures: 'Procedimentos',
      controls: 'Controles',
      risks: 'Riscos',
      audits: 'Auditorias',
      compliance: 'Conformidade',
      incidents: 'Incidentes',
      training: 'Treinamento',
      documentation: 'Documentação',
      comingSoon: 'Em breve...',
      navigation: {
        sections: {
          governance: 'Governança',
          monitoring: 'Monitoramento',
          internal: 'Internos'
        },
        items: {
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
        },
        descriptions: {
          isms: 'Sistema de Gestão',
          controls: 'Catálogo de Controles',
          audit: 'Auditorias',
          risk: 'Gestão de Riscos',
          privacy: 'Proteção de Dados',
          cirt: 'Resposta a Incidentes',
          secdevops: 'Testes de Segurança',
          assessments: 'Avaliações',
          platform: 'Usuários e Permissões',
          tickets: 'Suporte Interno'
        }
      },
      sections: {
        overview: 'Visão Geral',
        policies: 'Políticas',
        controls: 'Controles',
        domains: 'Domínios',
        frameworks: 'Frameworks',
        assessments: 'Avaliações',
        documents: 'Documentos'
      },
      metrics: {
        totalPolicies: 'Total de Políticas',
        totalControls: 'Total de Controles',
        effectiveness: 'Efetividade Média',
        frameworks: 'Frameworks Mapeados',
        domains: 'Domínios Cadastrados',
        complianceScore: 'Score de Conformidade',
        policiesActive: 'políticas ativas',
        controlsImplemented: 'controles implementados',
        averageEffectiveness: 'efetividade média',
        frameworksMapped: 'frameworks mapeados',
        domainsRegistered: 'domínios registrados',
        overallCompliance: 'conformidade geral'
      },
      actions: {
        createPolicy: 'Criar Política',
        exportReport: 'Exportar Relatório',
        addControl: 'Adicionar Controle',
        edit: 'Editar',
        assess: 'Avaliar',
        mapFramework: 'Mapear Framework'
      },

      search: {
        placeholder: 'Buscar políticas, controles...'
      },
      filter: {
        all: 'Todos'
      },
      overview: {
        recentPolicies: 'Políticas Recentes',
        controlEffectiveness: 'Efetividade dos Controles'
      },
      policy: {
        title: 'Título',
        description: 'Descrição',
        content: 'Conteúdo',
        version: 'Versão',
        lastUpdated: 'Última Atualização',
        titlePlaceholder: 'Digite o título da política',
        descriptionPlaceholder: 'Digite uma descrição da política',
        contentPlaceholder: 'Digite o conteúdo da política...',
        status: {
          active: 'Ativa',
          draft: 'Rascunho',
          review: 'Em Revisão',
          archived: 'Arquivada'
        }
      },
      control: {
        name: 'Nome',
        description: 'Descrição',
        category: 'Categoria',
        effectiveness: 'Efetividade',
        namePlaceholder: 'Digite o nome do controle',
        descriptionPlaceholder: 'Digite uma descrição do controle',
        status: {
          implemented: 'Implementado',
          partial: 'Parcial',
          not_implemented: 'Não Implementado',
          planned: 'Planejado'
        }
      },
      moduleDescription: {
        isms: 'Sistema de Gestão da Segurança da Informação',
        controls: 'Catálogo centralizado de controles de segurança',
        audit: 'Sistema de auditoria e conformidade',
        risk: 'Gestão de riscos de segurança',
        privacy: 'Proteção de dados e privacidade',
        cirt: 'Centro de Incidentes e Resposta',
        secdevops: 'Segurança em desenvolvimento e operações',
        assessments: 'Avaliações de segurança',
        platform: 'Plataforma e infraestrutura',
        tickets: 'Sistema de tickets e suporte'
      }
    }
  },
  'en-US': {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      name: 'Name',
      description: 'Description'
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password',
      signUp: 'Sign up',
      loginTitle: 'Login to n.CISO',
      loginSubtitle: 'Information Security Management Platform',
      loginError: 'Invalid email or password',
      loginSuccess: 'Login successful'
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome to n.CISO',
      overview: 'Overview',
      policies: 'Policies',
      controls: 'Controls',
      risks: 'Risks',
      audits: 'Audits',
      reports: 'Reports',
      settings: 'Settings'
    },
    policies: {
      title: 'Security Policies',
      create: 'Create Policy',
      edit: 'Edit Policy',
      delete: 'Delete Policy',
      status: {
        draft: 'Draft',
        active: 'Active',
        inactive: 'Inactive',
        archived: 'Archived'
      },
      fields: {
        title: 'Title',
        description: 'Description',
        content: 'Content',
        version: 'Version',
        status: 'Status',
        createdBy: 'Created by',
        createdAt: 'Created at',
        updatedAt: 'Updated at'
      }
    },
    isms: {
      title: 'Information Security Management System',
      description: 'Manage policies, controls and domains to ensure organizational compliance and security.',
      overview: 'Overview',
      policies: 'Policies',
      procedures: 'Procedures',
      controls: 'Controls',
      risks: 'Risks',
      audits: 'Audits',
      compliance: 'Compliance',
      incidents: 'Incidents',
      training: 'Training',
      documentation: 'Documentation',
      comingSoon: 'Coming soon...',
      navigation: {
        sections: {
          governance: 'Governance',
          monitoring: 'Monitoring',
          internal: 'Internal'
        },
        items: {
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
        },
        descriptions: {
          isms: 'Information Security Management',
          controls: 'Security Controls Catalog',
          audit: 'Audits',
          risk: 'Security Risk Management',
          privacy: 'Data Protection',
          cirt: 'Incident Response',
          secdevops: 'Security Testing',
          assessments: 'Security Assessments',
          platform: 'Users and Permissions',
          tickets: 'Internal Support'
        }
      },
      sections: {
        overview: 'Overview',
        policies: 'Policies',
        controls: 'Controls',
        domains: 'Domains',
        frameworks: 'Frameworks',
        assessments: 'Assessments',
        documents: 'Documents'
      },
      metrics: {
        totalPolicies: 'Total Policies',
        totalControls: 'Total Controls',
        effectiveness: 'Average Effectiveness',
        frameworks: 'Mapped Frameworks',
        domains: 'Registered Domains',
        complianceScore: 'Compliance Score',
        policiesActive: 'active policies',
        controlsImplemented: 'implemented controls',
        averageEffectiveness: 'average effectiveness',
        frameworksMapped: 'mapped frameworks',
        domainsRegistered: 'registered domains',
        overallCompliance: 'overall compliance'
      },
      actions: {
        createPolicy: 'Create Policy',
        exportReport: 'Export Report',
        addControl: 'Add Control',
        edit: 'Edit',
        assess: 'Assess',
        mapFramework: 'Map Framework'
      },
      search: {
        placeholder: 'Search policies, controls...'
      },
      filter: {
        all: 'All statuses'
      },
      search: {
        placeholder: 'Search policies, controls...'
      },
      filter: {
        all: 'All'
      },
      overview: {
        recentPolicies: 'Recent Policies',
        controlEffectiveness: 'Control Effectiveness'
      },
      policy: {
        title: 'Title',
        description: 'Description',
        content: 'Content',
        version: 'Version',
        lastUpdated: 'Last Updated',
        titlePlaceholder: 'Enter policy title',
        descriptionPlaceholder: 'Enter policy description',
        contentPlaceholder: 'Enter policy content...',
        status: {
          active: 'Active',
          draft: 'Draft',
          review: 'Under Review',
          archived: 'Archived'
        }
      },
      control: {
        status: {
          implemented: 'Implemented',
          partial: 'Partial',
          not_implemented: 'Not Implemented'
        }
      },
      moduleDescription: {
        isms: 'Information Security Management System',
        controls: 'Centralized security controls catalog',
        audit: 'Audit and compliance system',
        risk: 'Security risk management',
        privacy: 'Data protection and privacy',
        cirt: 'Incident Response Center',
        secdevops: 'Security in development and operations',
        assessments: 'Security assessments',
        platform: 'Platform and infrastructure',
        tickets: 'Ticket and support system'
      }
    }
  },
  'es': {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      actions: 'Acciones',
      status: 'Estado',
      date: 'Fecha',
      name: 'Nombre',
      description: 'Descripción'
    },
    auth: {
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      forgotPassword: 'Olvidé mi contraseña',
      signUp: 'Registrarse',
      loginTitle: 'Iniciar sesión en n.CISO',
      loginSubtitle: 'Plataforma de Gestión de Seguridad de la Información',
      loginError: 'Correo electrónico o contraseña inválidos',
      loginSuccess: 'Inicio de sesión exitoso'
    },
    dashboard: {
      title: 'Panel de control',
      welcome: 'Bienvenido a n.CISO',
      overview: 'Resumen',
      policies: 'Políticas',
      controls: 'Controles',
      risks: 'Riesgos',
      audits: 'Auditorías',
      reports: 'Informes',
      settings: 'Configuración'
    },
    policies: {
      title: 'Políticas de Seguridad',
      create: 'Crear Política',
      edit: 'Editar Política',
      delete: 'Eliminar Política',
      status: {
        draft: 'Borrador',
        active: 'Activa',
        inactive: 'Inactiva',
        archived: 'Archivada'
      },
      fields: {
        title: 'Título',
        description: 'Descripción',
        content: 'Contenido',
        version: 'Versión',
        status: 'Estado',
        createdBy: 'Creado por',
        createdAt: 'Creado en',
        updatedAt: 'Actualizado en'
      }
    },
    isms: {
      title: 'Sistema de Gestión de Seguridad de la Información',
      description: 'Gestione políticas, controles y dominios para garantizar el cumplimiento y la seguridad organizacional.',
      overview: 'Resumen',
      policies: 'Políticas',
      procedures: 'Procedimientos',
      controls: 'Controles',
      risks: 'Riesgos',
      audits: 'Auditorías',
      compliance: 'Cumplimiento',
      incidents: 'Incidentes',
      training: 'Capacitación',
      documentation: 'Documentación',
      comingSoon: 'Próximamente...',
      navigation: {
        sections: {
          governance: 'Gobernanza',
          monitoring: 'Monitoreo',
          internal: 'Internos'
        },
        items: {
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
        },
        descriptions: {
          isms: 'Sistema de Gestión de Seguridad de la Información',
          controls: 'Catálogo centralizado de controles de seguridad',
          audit: 'Sistema de auditoría y cumplimiento',
          risk: 'Gestión de riesgos de seguridad',
          privacy: 'Protección de datos y privacidad',
          cirt: 'Centro de Respuesta a Incidentes',
          secdevops: 'Seguridad en desarrollo y operaciones',
          assessments: 'Evaluaciones de seguridad',
          platform: 'Plataforma e infraestructura',
          tickets: 'Sistema de tickets y soporte'
        }
      },
      sections: {
        overview: 'Resumen',
        policies: 'Políticas',
        controls: 'Controles',
        domains: 'Dominios',
        frameworks: 'Frameworks',
        assessments: 'Evaluaciones',
        documents: 'Documentos'
      },
      metrics: {
        totalPolicies: 'Total de Políticas',
        totalControls: 'Total de Controles',
        effectiveness: 'Efectividad Promedio',
        frameworks: 'Frameworks Mapeados',
        domains: 'Dominios Registrados',
        complianceScore: 'Puntuación de Cumplimiento',
        policiesActive: 'políticas activas',
        controlsImplemented: 'controles implementados',
        averageEffectiveness: 'efectividad promedio',
        frameworksMapped: 'frameworks mapeados',
        domainsRegistered: 'dominios registrados',
        overallCompliance: 'cumplimiento general'
      },
      actions: {
        createPolicy: 'Crear Política',
        exportReport: 'Exportar Informe',
        addControl: 'Agregar Control',
        edit: 'Editar',
        assess: 'Evaluar',
        mapFramework: 'Mapear Framework'
      },
      search: {
        placeholder: 'Buscar políticas, controles...'
      },
      filter: {
        all: 'Todos los estados'
      },
      search: {
        placeholder: 'Buscar políticas, controles...'
      },
      filter: {
        all: 'Todos'
      },
      overview: {
        recentPolicies: 'Políticas Recientes',
        controlEffectiveness: 'Efectividad de Controles'
      },
      policy: {
        title: 'Título',
        description: 'Descripción',
        content: 'Contenido',
        version: 'Versión',
        lastUpdated: 'Última Actualización',
        titlePlaceholder: 'Ingrese el título de la política',
        descriptionPlaceholder: 'Ingrese la descripción de la política',
        contentPlaceholder: 'Ingrese el contenido de la política...',
        status: {
          active: 'Activa',
          draft: 'Borrador',
          review: 'En Revisión',
          archived: 'Archivada'
        }
      },
      control: {
        status: {
          implemented: 'Implementado',
          partial: 'Parcial',
          not_implemented: 'No Implementado'
        }
      },
      moduleDescription: {
        isms: 'Sistema de Gestión de Seguridad de la Información',
        controls: 'Catálogo centralizado de controles de seguridad',
        audit: 'Sistema de auditoría y cumplimiento',
        risk: 'Gestión de riesgos de seguridad',
        privacy: 'Protección de datos y privacidad',
        cirt: 'Centro de Respuesta a Incidentes',
        secdevops: 'Seguridad en desarrollo y operaciones',
        assessments: 'Evaluaciones de seguridad',
        platform: 'Plataforma e infraestructura',
        tickets: 'Sistema de tickets y soporte'
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: I18N_CONFIG.defaultLocale,
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })

export default i18n 