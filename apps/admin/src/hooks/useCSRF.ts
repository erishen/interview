'use client'

import { useState, useEffect } from 'react'

/**
 * CSRF Token Hook
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
      
      // 创建带超时的 fetch 请求（5秒）
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`)
      }
      
      const data = await response.json()
      setCsrfToken(data.token)
    } catch (err) {
      // 超时或其他错误时，生成本地 token 作为 fallback
      const fallbackToken = generateLocalCSRFToken()
      setCsrfToken(fallbackToken)
      
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch CSRF token'
      setError(errorMsg)
      console.warn('CSRF token fetch error, using fallback:', errorMsg)
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
 * 生成本地 CSRF Token（当服务器无响应时使用）
 */
function generateLocalCSRFToken(): string {
  return 'local_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
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