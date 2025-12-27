'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { useEffect } from 'react'

// 立即拦截 console.error
const originalConsoleError = console.error
console.error = function(...args) {
  const errorMessage = Array.isArray(args) ? args.join(' ') : String(args)

  // 忽略 NextAuth session 401 错误
  if (errorMessage.includes('/api/auth/session') && errorMessage.includes('401')) {
    return
  }

  // 忽略 NextAuth CLIENT_FETCH_ERROR
  if (errorMessage.includes('[next-auth][error][CLIENT_FETCH_ERROR]')) {
    return
  }

  // 忽略 FastAPI auth/me 401 错误
  if (errorMessage.includes('/api/fastapi/auth/me') && errorMessage.includes('401')) {
    return
  }

  // 其他错误正常显示
  originalConsoleError.apply(console, args)
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 拦截全局错误
    const originalErrorHandler = window.onerror

    window.onerror = function(message, source, lineno, colno, error) {
      const errorMessage = String(message)

      // 忽略 NextAuth session 401 错误
      if (errorMessage.includes('/api/auth/session') && errorMessage.includes('401')) {
        return true
      }

      // 忽略 NextAuth CLIENT_FETCH_ERROR
      if (errorMessage.includes('[next-auth][error][CLIENT_FETCH_ERROR]')) {
        return true
      }

      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error)
      }
      return false
    }

    // 拦截未捕获的 Promise 错误
    const handleUnhandledRejection = function(event: PromiseRejectionEvent) {
      const errorMessage = String(event.reason)

      // 忽略 NextAuth session 401 错误
      if (errorMessage.includes('/api/auth/session') && errorMessage.includes('401')) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      // 忽略 NextAuth CLIENT_FETCH_ERROR
      if (errorMessage.includes('[next-auth][error][CLIENT_FETCH_ERROR]')) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.onerror = originalErrorHandler
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  )
}
