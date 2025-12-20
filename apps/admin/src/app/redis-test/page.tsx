'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface RedisHealthStatus {
  connected: boolean
  testPassed: boolean
  error?: string
  timestamp: string
}

interface SimpleSession {
  authenticated: boolean
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export default function RedisTestPage() {
  const { data: session, status } = useSession()
  const [healthStatus, setHealthStatus] = useState<RedisHealthStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [cacheKey, setCacheKey] = useState('')
  const [cacheValue, setCacheValue] = useState('')
  const [cacheTtl, setCacheTtl] = useState(300)
  const [retrievedValue, setRetrievedValue] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [bypassAuth, setBypassAuth] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [simpleSession, setSimpleSession] = useState<SimpleSession | null>(null)
  const [loginEmail, setLoginEmail] = useState('admin@example.com')
  const [loginPassword, setLoginPassword] = useState('password')
  const [loginLoading, setLoginLoading] = useState(false)

  // Check Redis health on component mount
  useEffect(() => {
    checkRedisHealth()
    checkSimpleSession()
  }, [])

  // Debug session status
  useEffect(() => {
    const debug = {
      nextAuthSession: session,
      nextAuthStatus: status,
      simpleSession,
      isNextAuthValid: !!session && status === 'authenticated',
      isSimpleSessionValid: !!simpleSession?.authenticated,
      timestamp: new Date().toISOString()
    }
    setDebugInfo(debug)
    console.log('Session debug info:', debug)
  }, [session, status, simpleSession])

  const checkSimpleSession = async () => {
    try {
      const response = await fetch('/api/auth/simple-session')
      const data = await response.json()
      setSimpleSession(data)
    } catch (error) {
      console.error('Simple session check failed:', error)
      setSimpleSession({ authenticated: false })
    }
  }

  const handleSimpleLogin = async () => {
    setLoginLoading(true)
    try {
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      })

      const data = await response.json()
      if (data.success) {
        setMessage('Login successful!')
        await checkSimpleSession() // Refresh session
      } else {
        setMessage(`Login failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Login error: ${error}`)
    } finally {
      setLoginLoading(false)
    }
  }

  const checkRedisHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/redis/health')
      const data = await response.json()
      setHealthStatus(data.redis)
    } catch (error) {
      console.error('Health check failed:', error)
      setHealthStatus({
        connected: false,
        testPassed: false,
        error: 'Failed to connect to health check endpoint',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const setCache = async () => {
    if (!cacheKey || !cacheValue) {
      setMessage('Please provide both key and value')
      return
    }

    try {
      const response = await fetch('/api/redis/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: cacheKey,
          value: cacheValue,
          ttl: cacheTtl
        })
      })

      const data = await response.json()
      if (data.success) {
        setMessage(`Successfully set cache: ${cacheKey}`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const getCache = async () => {
    if (!cacheKey) {
      setMessage('Please provide a key')
      return
    }

    try {
      const response = await fetch(`/api/redis/cache?key=${encodeURIComponent(cacheKey)}`)
      const data = await response.json()
      
      if (response.ok) {
        setRetrievedValue(data.value)
        setMessage(`Retrieved value for key: ${cacheKey}`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const deleteCache = async () => {
    if (!cacheKey) {
      setMessage('Please provide a key')
      return
    }

    try {
      const response = await fetch(`/api/redis/cache?key=${encodeURIComponent(cacheKey)}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setMessage(`Successfully deleted cache: ${cacheKey}`)
        setRetrievedValue(null)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  // Enhanced session validation
  const isNextAuthValid = !!session && status === 'authenticated'
  const isSimpleSessionValid = !!simpleSession?.authenticated
  const isAnySessionValid = isNextAuthValid || isSimpleSessionValid
  
  // 如果没有登录且没有绕过认证，显示登录提示
  if (!isAnySessionValid && !bypassAuth) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Redis Integration Test</h1>
              <p className="text-gray-600 mt-1">Test Redis connectivity and cache operations</p>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold text-red-800 mb-4">Access Denied</h2>
                <p className="text-red-700 mb-4">Please sign in to access the Redis test page.</p>
                
                {/* Debug Info */}
                <div className="bg-white rounded-lg p-4 mb-4 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Session Debug Info:</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>NextAuth Status:</strong> {status}</p>
                    <p><strong>NextAuth Session:</strong> {session ? 'Available' : 'Null'}</p>
                    <p><strong>NextAuth Valid:</strong> {isNextAuthValid ? 'Yes' : 'No'}</p>
                    <p><strong>Simple Session:</strong> {simpleSession?.authenticated ? 'Authenticated' : 'Not Authenticated'}</p>
                    <p><strong>Any Session Valid:</strong> {isAnySessionValid ? 'Yes' : 'No'}</p>
                    <p><strong>Timestamp:</strong> {debugInfo?.timestamp}</p>
                  </div>
                </div>

                {/* Simple Login Form */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Login (Simple Auth):</h3>
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Email"
                    />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Password"
                    />
                    <button
                      onClick={handleSimpleLogin}
                      disabled={loginLoading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {loginLoading ? 'Logging in...' : 'Quick Login'}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Demo Credentials:</h3>
                    <p className="text-gray-700">Email: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin@example.com</span></p>
                    <p className="text-gray-700">Password: <span className="font-mono bg-gray-100 px-2 py-1 rounded">password</span></p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/auth/signin"
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                    >
                      Sign In
                    </a>
                    <button
                      onClick={() => setBypassAuth(true)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Bypass Authentication (Development Only)
                    </button>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Note: The bypass option is only for development and testing purposes.</p>
                  </div>
                </div>
              </div>

              {/* Health Check Preview */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Redis Health Status</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Checking Redis connection...</span>
                  <button
                    onClick={checkRedisHealth}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Checking...' : 'Check Now'}
                  </button>
                </div>
                
                {healthStatus && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">Connection Status</div>
                      <div className={`font-semibold ${healthStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                        {healthStatus.connected ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">Test Status</div>
                      <div className={`font-semibold ${healthStatus.testPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {healthStatus.testPassed ? 'Passed' : 'Failed'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">Last Check</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(healthStatus.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}

                {healthStatus?.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-red-800 font-medium">Error:</div>
                    <div className="text-red-700">{healthStatus.error}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Redis Integration Test</h1>
            <p className="text-gray-600 mt-1">Test Redis connectivity and cache operations</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Debug Info */}
            {!bypassAuth && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Session Status</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>NextAuth Status:</strong> {status}</p>
                  <p><strong>NextAuth Session:</strong> {session ? 'Available' : 'Null'}</p>
                  <p><strong>NextAuth Valid:</strong> {isNextAuthValid ? 'Yes' : 'No'}</p>
                  <p><strong>Simple Session:</strong> {simpleSession?.authenticated ? 'Authenticated' : 'Not Authenticated'}</p>
                  <p><strong>Any Session Valid:</strong> {isAnySessionValid ? 'Yes' : 'No'}</p>
                  <p><strong>Timestamp:</strong> {debugInfo?.timestamp}</p>
                </div>
              </div>
            )}

            {/* Health Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Redis Health Status</h2>
                <button
                  onClick={checkRedisHealth}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Checking...' : 'Refresh'}
                </button>
              </div>

              {healthStatus && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Connection Status</div>
                    <div className={`font-semibold ${healthStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                      {healthStatus.connected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Test Status</div>
                    <div className={`font-semibold ${healthStatus.testPassed ? 'text-green-600' : 'text-red-600'}`}>
                      {healthStatus.testPassed ? 'Passed' : 'Failed'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Last Check</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(healthStatus.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}

              {healthStatus?.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-red-800 font-medium">Error:</div>
                  <div className="text-red-700">{healthStatus.error}</div>
                </div>
              )}
            </div>

            {/* Cache Operations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cache Operations</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cache Key
                  </label>
                  <input
                    type="text"
                    value={cacheKey}
                    onChange={(e) => setCacheKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter cache key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TTL (seconds)
                  </label>
                  <input
                    type="number"
                    value={cacheTtl}
                    onChange={(e) => setCacheTtl(parseInt(e.target.value) || 300)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="300"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cache Value
                </label>
                <textarea
                  value={cacheValue}
                  onChange={(e) => setCacheValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter cache value (can be JSON)"
                />
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={setCache}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Set Cache
                </button>
                <button
                  onClick={getCache}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Get Cache
                </button>
                <button
                  onClick={deleteCache}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Cache
                </button>
              </div>

              {message && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-blue-800">{message}</div>
                </div>
              )}

              {retrievedValue !== null && (
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-medium text-gray-900 mb-2">Retrieved Value:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(retrievedValue, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Session Information */}
            {(session || simpleSession?.authenticated) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h2>
                <div className="bg-white p-4 rounded border">
                  <div className="space-y-4">
                    {session && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">NextAuth Session:</h3>
                        <pre className="text-sm overflow-auto bg-gray-100 p-2 rounded">
                          {JSON.stringify(session, null, 2)}
                        </pre>
                      </div>
                    )}
                    {simpleSession?.authenticated && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Simple Session:</h3>
                        <pre className="text-sm overflow-auto bg-gray-100 p-2 rounded">
                          {JSON.stringify(simpleSession, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}            {/* Development Bypass Info */}
            {(!session && !simpleSession?.authenticated) && bypassAuth && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Development Mode</h3>
                <p className="text-yellow-700">
                  You are accessing this page without authentication. This is only for development and testing purposes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}