// src/app/[locale]/layout.tsx  (Server Component)
import '@/styles/global.css'
import type { Metadata } from 'next'
import { getMessages } from 'next-intl/server'
import { AllLocales } from '@/utils/AppConfig'
import ClientIntlProvider from '@/components/ClientIntlProvider'

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
}

export function generateStaticParams() {
  return AllLocales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = await params

  // valida locale
  if (!AllLocales.includes(locale)) {
    // your 404 logic
  }

  // carrega mensagens do server
  const messages = await getMessages({ locale })
  const timeZone = 'America/Sao_Paulo'

  return (
    <ClientIntlProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </ClientIntlProvider>
  )
}
