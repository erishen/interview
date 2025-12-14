export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
    </main>
  );
}