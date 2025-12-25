'use client'

import { useSession, signOut } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Card } from '@interview/ui'
import { Link } from '@/i18n/config'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { user: passportUser, logout: passportLogout } = useAuth()
  const router = useRouter()
  const [authMethod, setAuthMethod] = useState<'nextauth' | 'passport'>('nextauth')
  const t = useTranslations('dashboard')
  const locale = useLocale()

  // Determine which auth method is being used
  useEffect(() => {
    if (session) {
      setAuthMethod('nextauth')
    } else if (passportUser) {
      setAuthMethod('passport')
    }
  }, [session, passportUser])

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session && !passportUser) {
      router.push(`/${locale}/auth/signin`)
    }
  }, [session, passportUser, status, router, locale])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session && !passportUser) {
    return null
  }

  const currentUser = session?.user || passportUser
  const handleSignOut = () => {
    if (authMethod === 'nextauth') {
      signOut({ callbackUrl: `/${locale}/auth/signin` })
    } else {
      passportLogout()
      router.push(`/${locale}/auth/signin`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${
                authMethod === 'nextauth' 
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30'
              }`}>
                {authMethod === 'nextauth' ? t('authMethod.nextauth') : t('authMethod.passport')}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/api-integration">
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                  {t('quickActions.apiIntegration')}
                </Button>
              </Link>
              <LanguageSwitcher />
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{currentUser?.name || ''}</p>
                  <p className="text-xs text-gray-300">{currentUser?.email || ''}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                {t('header.signOut')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {t('welcome', { name: currentUser?.name || '' })}
            </h2>
            <p className="text-gray-300 text-lg">
              {t('subtitle')}
            </p>
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {t('authenticatedVia')}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                authMethod === 'nextauth' 
                  ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30' 
                  : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30'
              }`}>
                {authMethod === 'nextauth' ? t('authMethod.nextauth') : t('authMethod.passport')}
              </span>
            </div>
          </div>

          {/* Auth Method Info */}
          <div className="mb-8">
            <Card className={`p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300 ${
              authMethod === 'nextauth' ? 'border-blue-500/30' : 'border-purple-500/30'
            }`}>
              <h3 className={`text-lg font-medium mb-2 ${authMethod === 'nextauth' ? 'text-blue-300' : 'text-purple-300'}`}>
                {t('authInfo.title', { method: authMethod === 'nextauth' ? t('authMethod.nextauth') : t('authMethod.passport') })}
              </h3>
              <p className="text-gray-300">
                {authMethod === 'nextauth' ? t('authInfo.nextauth') : t('authInfo.passport')}
              </p>
              <div className="mt-4 text-sm text-gray-400">
                <p><strong className="text-white">{t('authInfo.features')}</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {(authMethod === 'nextauth' ? t.raw('authInfo.nextauthFeatures') : t.raw('authInfo.passportFeatures')).map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-shadow duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">{t('stats.totalUsers')}</dt>
                    <dd className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">1,234</dd>
                  </dl>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-shadow duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">{t('stats.revenue')}</dt>
                    <dd className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">$12,345</dd>
                  </dl>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/50 transition-shadow duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">{t('stats.performance')}</dt>
                    <dd className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">98.5%</dd>
                  </dl>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-shadow duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 10h6m-6 4h6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">{t('stats.orders')}</dt>
                    <dd className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">567</dd>
                  </dl>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
                {t('activity.title')}
              </h3>
              <div className="space-y-4">
                {[
                  { action: t('activity.actions.userRegistered'), user: 'john@example.com', time: '2 minutes ago', color: 'from-blue-400 to-blue-600' },
                  { action: t('activity.actions.orderCompleted'), user: 'jane@example.com', time: '5 minutes ago', color: 'from-green-400 to-green-600' },
                  { action: t('activity.actions.paymentProcessed'), user: 'bob@example.com', time: '10 minutes ago', color: 'from-yellow-400 to-yellow-600' },
                  { action: t('activity.actions.userUpdatedProfile'), user: 'alice@example.com', time: '15 minutes ago', color: 'from-purple-400 to-purple-600' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200 group">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 bg-gradient-to-br ${activity.color} rounded-full group-hover:scale-125 transition-transform duration-200`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium text-blue-400">{activity.action}</span> by <span className="text-gray-300">{activity.user}</span>
                      </p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-4">{t('quickActions.title')}</h3>
              <div className="space-y-4">
                <Link href="/doc-logs" className="block">
                  <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-blue-300 hover:border-blue-500/50 transition-all duration-300" variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2zm0 0h6v-1a1 1 0 110 1v1a1 1 0 01-1 1h-2a1 1 0 00-1-1V5a1 1 0 011-1h2a1 1 0 011-1v5a1 1 0 011-1z" />
                    </svg>
                    {t('quickActions.docLogs')}
                  </Button>
                </Link>
                <Link href="/docs-editor" className="block">
                  <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-blue-300 hover:border-blue-500/50 transition-all duration-300" variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('quickActions.docsEditor')}
                  </Button>
                </Link>
                <Link href="/api-integration" className="block">
                  <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-green-300 hover:border-green-500/50 transition-all duration-300" variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('quickActions.apiIntegration')}
                  </Button>
                </Link>
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-purple-300 hover:border-purple-500/50 transition-all duration-300" variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('quickActions.addNewUser')}
                </Button>
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-yellow-300 hover:border-yellow-500/50 transition-all duration-300" variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('quickActions.generateReport')}
                </Button>
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-pink-300 hover:border-pink-500/50 transition-all duration-300" variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('quickActions.systemSettings')}
                </Button>
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-cyan-300 hover:border-cyan-500/50 transition-all duration-300" variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {t('quickActions.supportCenter')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
