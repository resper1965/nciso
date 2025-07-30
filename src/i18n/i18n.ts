import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importar arquivos de tradução
import ptBR from './locales/pt-BR/common.json'
import enUS from './locales/en-US/common.json'
import es from './locales/es/common.json'

const resources = {
  'pt-BR': {
    common: ptBR.common
  },
  'en-US': {
    common: enUS.common
  },
  'es': {
    common: es.common
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React já escapa valores
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
    
    defaultNS: 'common',
    ns: ['common'],
  })

export default i18n 