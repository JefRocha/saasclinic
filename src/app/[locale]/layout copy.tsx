// src/app/[locale]/layout.tsx
import '@/styles/global.css'
import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { AllLocales } from '@/utils/AppConfig'

// Gera /pt-BR, /en, /fr…
export function generateStaticParams() {
  return AllLocales.map((locale) => ({ locale }))
}

// Metadados genéricos (favicon, etc).
export const metadata: Metadata = {
  // … seu estático …
}

// Props tipadas apenas para children e params genérico
type LocaleLayoutProps = {
  children: ReactNode
  params: unknown
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Await params e type assertion agrupada corretamente
  const { locale } = (await params) as { locale: string }

  if (!AllLocales.includes(locale)) {
    notFound()
  }

  // Ajuste: passar objeto com locale
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
