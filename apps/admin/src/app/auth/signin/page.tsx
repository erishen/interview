'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import { useCSRFContext } from '@/contexts/CSRFContext'
import { createCSRFHeaders } from '@/hooks/useCSRF'
import { Button, Input, Card } from '@interview/ui'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useNextAuth, setUseNextAuth] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const { csrfToken, loading: csrfLoading } = useCSRFContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (useNextAuth) {
        // NextAuth.js login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError(result.error)
        } else if (result?.ok) {
          router.push('/dashboard')
        }
      } else {
        // 不再等待 CSRF token，直接使用（如果加载失败会使用 fallback）
        if (!csrfToken) {
          setError('Security token not available. Please refresh the page.')
          setLoading(false)
          return
        }

        // Passport.js login with CSRF protection
        const response = await fetch('/api/auth/passport/login', {
          method: 'POST',
          headers: createCSRFHeaders(csrfToken),
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        })

        const data = await response.json()

        if (response.ok && data.success) {
          // Use AuthContext to store user info
          login(data.user)
          router.push('/dashboard')
        } else {
          setError(data.error || 'Invalid credentials')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleGitHubSignIn = () => {
    signIn('github', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useNextAuth}
                onChange={(e) => setUseNextAuth(e.target.checked)}
                className="mr-2"
              />
              Use NextAuth.js (OAuth providers)
            </label>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {csrfLoading && !useNextAuth && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded text-sm">
                Loading security token... (will use fallback if timeout)
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          {useNextAuth && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full"
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGitHubSignIn}
                  className="w-full"
                >
                  GitHub
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Demo credentials: admin@example.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}