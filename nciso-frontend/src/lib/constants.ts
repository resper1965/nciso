// 🛡️ n.CISO - Design System Constants

export const DESIGN_SYSTEM = {
  // Cores
  colors: {
    primary: '#00ade0',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    }
  },
  
  // Tipografia
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  
  // Espaçamento
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  // Border radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem'
  }
}

// Configurações da aplicação
export const APP_CONFIG = {
  name: 'n.CISO',
  description: 'Plataforma de Gestão de Segurança da Informação',
  version: '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pszfqqmmljekibmcgmig.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX'
}

// Configurações de i18n
export const I18N_CONFIG = {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en-US', 'es'],
  namespaces: ['common', 'auth', 'dashboard', 'policies', 'isms']
} 