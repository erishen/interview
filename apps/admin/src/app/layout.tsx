import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { CSRFProvider } from '@/contexts/CSRFContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Interview Admin',
  description: 'Admin dashboard for interview project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <CSRFProvider>
            {children}
          </CSRFProvider>
        </Providers>
      </body>
    </html>
  )
}