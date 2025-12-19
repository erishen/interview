'use client'

import { useState, useEffect } from 'react'

/**
 * CSRF Token Hook for Web Project
 * 用于在客户端组件中获取和管理 CSRF Token
 */
export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCSRFToken()
  }, [])

  const fetchCSRFToken = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include', // 确保包含 cookies
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`)
      }
      
      const data = await response.json()
      setCsrfToken(data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CSRF token')
      console.error('CSRF token fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = () => {
    fetchCSRFToken()
  }

  return {
    csrfToken,
    loading,
    error,
    refreshToken,
  }
}

/**
 * 创建包含 CSRF Token 的请求头
 */
export function createCSRFHeaders(csrfToken: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  }
}

/**
 * 安全的 fetch 包装器，自动包含 CSRF Token
 */
export async function secureRequest(
  url: string, 
  options: RequestInit = {}, 
  csrfToken: string
): Promise<Response> {
  const headers = {
    ...createCSRFHeaders(csrfToken),
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}