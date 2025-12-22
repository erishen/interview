'use client'

import { useSession } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const { user: passportUser } = useAuth()
  const router = useRouter()
  const [sessionCheckTimeout, setSessionCheckTimeout] = useState(false)

  useEffect(() => {
    // 设置 10 秒超时，防止页面永远卡在 loading
    const timeoutId = setTimeout(() => {
      if (status === 'loading') {
        setSessionCheckTimeout(true)
        // 超时后假设未认证，重定向到登录页
        router.push('/auth/signin')
      }
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [status, router])

  useEffect(() => {
    if (status === 'loading' || sessionCheckTimeout) return

    // If user is authenticated, redirect to dashboard
    if (session || passportUser) {
      router.push('/dashboard')
      return
    }

    // If user is not authenticated, redirect to signin
    router.push('/auth/signin')
  }, [session, passportUser, status, router, sessionCheckTimeout])

  // Show loading while checking authentication
  if (status === 'loading' && !sessionCheckTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // This should not be reached due to redirects above, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}