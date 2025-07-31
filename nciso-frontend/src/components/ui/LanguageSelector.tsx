'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES[0])

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng')
    if (savedLanguage) {
      const lang = LANGUAGES.find(l => l.code === savedLanguage) || LANGUAGES[0]
      setCurrentLanguage(lang)
    }
  }, [])

  const handleLanguageChange = async (language: typeof LANGUAGES[0]) => {
    try {
      await i18n.changeLanguage(language.code)
      setCurrentLanguage(language)
      localStorage.setItem('i18nextLng', language.code)
      setIsOpen(false)
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden md:block">{currentLanguage.flag}</span>
        <span className="hidden lg:block">{currentLanguage.name}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-lg z-50">
          <div className="p-1">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={cn(
                  "flex w-full items-center space-x-3 rounded px-3 py-2 text-sm transition-colors",
                  currentLanguage.code === language.code
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {currentLanguage.code === language.code && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-[#00ade8]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 