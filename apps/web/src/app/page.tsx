import Link from 'next/link'
import ProductsDisplay from '@/components/ProductsDisplay'

function getHostAndPort(urlStr: string): string {
  const url = new URL(urlStr)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return url.hostname + ':' + (url.port || '80')
  }
  return url.hostname
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <h1 className="text-xl font-bold text-gray-900">Interview Web App</h1>
            </Link>
            <div className="space-x-6">
              <Link href="/" className="text-blue-600 hover:text-blue-900 font-medium transition-colors">Home</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                📚 文档
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
            现代化全栈开发
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            基于 Next.js、TypeScript 和 Monorepo 架构构建的高性能 Web 应用
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              开始学习
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5v6" />
              </svg>
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003'}/docs-editor`}
              target="_blank"
              rel="noopener noreferrer"
              title="文档编辑器（需要登录）"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow hover:shadow-lg"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              管理后台
              <svg className="ml-2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 1 1 0 002 0zm-1 8a1 1 0 102 0 1 1 0 01-2zm0-4a1 1 0 102 0 1 1 0 01-2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🏗️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Monorepo 架构
            </h3>
            <p className="text-gray-600 leading-relaxed">
              统一管理多个应用和共享包，代码复用率高，开发效率翻倍
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Next.js 14
            </h3>
            <p className="text-gray-600 leading-relaxed">
              最新 App Router、Server Components 和 RSC 技术，极致性能体验
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              开发者体验
            </h3>
            <p className="text-gray-600 leading-relaxed">
              TypeScript + ESLint + Prettier + Turbo，现代化开发工作流
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🛍️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              商品展示
            </h3>
            <p className="text-gray-600 leading-relaxed">
              集成 FastAPI 后端，完整的 CRUD 操作和购物车功能
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              面试知识库
            </h3>
            <p className="text-gray-600 leading-relaxed">
              系统化的前端面试资料，MDX 渲染，支持代码高亮
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              安全认证
            </h3>
            <p className="text-gray-600 leading-relaxed">
              NextAuth 认证系统，完整的登录、注册和权限管理
            </p>
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
            Built with ❤️ using Next.js, TypeScript, and FastAPI
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>Web App: <a href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'} className="text-blue-600 hover:underline">{getHostAndPort(process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000')}</a></span>
            <span>|</span>
            <span>Admin App: <a href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003'} className="text-blue-600 hover:underline">{getHostAndPort(process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003')}</a></span>
            <span>|</span>
            <span>FastAPI: <a href={process.env.FASTAPI_URL || 'http://localhost:8081'} className="text-blue-600 hover:underline">{getHostAndPort(process.env.FASTAPI_URL || 'http://localhost:8081')}</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}