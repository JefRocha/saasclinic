// src/components/ClientIntlProvider.tsx  (Client Component)
'use client'
import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'

interface Props {
  locale: string
  messages: Record<string, string>
  timeZone: string
  children: ReactNode
}

export default function ClientIntlProvider({
  locale,
  messages,
  timeZone,
  children,
}: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  )
}
