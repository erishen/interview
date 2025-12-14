export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
            Admin Dashboard
          </h1>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Welcome to Admin Panel
            </h2>
            <p className="text-gray-600">
              This is the admin dashboard for the interview project.
            </p>
            <div className="mt-6">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}