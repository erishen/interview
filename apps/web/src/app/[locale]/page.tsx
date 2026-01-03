import Link from 'next/link'
import { useTranslations } from 'next-intl'
import ProductsDisplay from '@/components/ProductsDisplay'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// 禁用静态生成，强制每次请求都动态渲染
export const dynamic = 'force-dynamic';

function getHostAndPort(urlStr: string): string {
  const url = new URL(urlStr)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return url.hostname + ':' + (url.port || '80')
  }
  return url.hostname
}

export default function HomePage() {
  const t = useTranslations('hero');
  const tFeatures = useTranslations('features');
  const tFooter = useTranslations('footer');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const tLang = useTranslations('language');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <h1 className="text-xl font-bold text-gray-900">{tNav('title')}</h1>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-blue-600 hover:text-blue-900 font-medium transition-colors">{tCommon('home')}</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                📚 {tCommon('docs')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="mr-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {t('startLearning')}
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003'}/docs-editor`}
              target="_blank"
              rel="noopener noreferrer"
              title={t('adminTooltip')}
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow hover:shadow-lg"
            >
              <svg className="mr-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('adminPanel')}
              <svg className="ml-2 w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🏗️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {tFeatures('monorepo.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {tFeatures('monorepo.description')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {tFeatures('nextjs.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {tFeatures('nextjs.description')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {tFeatures('devExperience.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {tFeatures('devExperience.description')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🛍️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {tFeatures('products.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {tFeatures('products.description')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {tFeatures('knowledge.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {tFeatures('knowledge.description')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {tFeatures('auth.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {tFeatures('auth.description')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {tFeatures('dataTable.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {tFeatures('dataTable.description')}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/data-table-demo"
                className="inline-flex items-center px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold rounded-lg transition-all duration-200"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {tCommon('viewDemo')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Products Display Section */}
      <div className="container mx-auto px-4 pb-20">
        <ProductsDisplay />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            {tFooter('builtWith')}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>{tFooter('webApp')}: <a href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'} className="text-blue-600 hover:underline">{getHostAndPort(process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000')}</a></span>
            <span>|</span>
            <span>{tFooter('adminApp')}: <a href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003'} className="text-blue-600 hover:underline">{getHostAndPort(process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003')}</a></span>
            <span>|</span>
            <span>{tFooter('fastapi')}: <a href={process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL || 'http://localhost:8081'} className="text-blue-600 hover:underline">{getHostAndPort(process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL || 'http://localhost:8081')}</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
