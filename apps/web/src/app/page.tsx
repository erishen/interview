import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">Interview Web App</h1>
            <div className="space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/docs" className="text-blue-600 hover:text-blue-900 font-medium">
                📚 文档
              </Link>
              <Link href="/api-integration" className="text-gray-600 hover:text-gray-900">
                🚀 FastAPI 集成
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Interview Project
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern web application built with Next.js, TypeScript, and monorepo architecture.
            This project demonstrates best practices for scalable frontend development.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🏗️ Monorepo Architecture
              </h3>
              <p className="text-gray-600">
                Organized codebase with shared packages for UI components, utilities, and configurations.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ⚡ Next.js 14
              </h3>
              <p className="text-gray-600">
                Built with the latest Next.js features including App Router and Server Components.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔧 Developer Experience
              </h3>
              <p className="text-gray-600">
                TypeScript, ESLint, Prettier, and Turbo for optimal development workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}