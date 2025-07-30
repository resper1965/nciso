"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"

export function LanguageToggle() {
  const { i18n, t } = useTranslation("common")

  const languages = [
    { code: 'pt-BR', name: t('languages.pt-BR') },
    { code: 'en-US', name: t('languages.en-US') },
    { code: 'es', name: t('languages.es') }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="ml-2 hidden sm:inline-block">{currentLanguage.name}</span>
          <span className="sr-only">{t('layout.header.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? "bg-accent" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 