import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/components/i18n-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'n.CISO - Plataforma de Gestão de Segurança da Informação',
  description: 'Plataforma completa para gestão de segurança da informação, políticas, controles e auditorias.',
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <I18nProvider>
              {children}
            </I18nProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
