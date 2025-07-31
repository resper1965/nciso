import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { I18N_CONFIG } from './constants'

// Traduções
const resources = {
  'pt-BR': {
    common: {
      loading: 'Carregando...',
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
        }
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
        }
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
        }
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