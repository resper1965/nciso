import React from 'react'
import { ThemeProvider } from "@/lib/theme-provider"
import "@/styles/globals.css"
import "@/i18n/i18n"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="nciso-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 