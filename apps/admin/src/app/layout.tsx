import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { CSRFProvider } from '@/contexts/CSRFContext'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/config'

export const metadata: Metadata = {
  title: 'Interview Admin',
  description: 'Admin dashboard for interview project',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <CSRFProvider>
              {children}
            </CSRFProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
