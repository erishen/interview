'use client'

import { useState } from 'react'
import { useCSRFContext } from '@/contexts/CSRFContext'
import { createCSRFHeaders, secureRequest } from '@/hooks/useCSRF'
import { Button, Input, Card } from '@interview/ui'

export default function CSRFTestPage() {
  const [testData, setTestData] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { csrfToken, loading: csrfLoading, error: csrfError, refreshToken } = useCSRFContext()

  // 测试 1: 使用 CSRF Token 的安全请求
  const testSecureRequest = async () => {
    if (!csrfToken) {
      setError('CSRF token not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await secureRequest('/api/csrf-test', {
        method: 'POST',
        body: JSON.stringify({ 
          message: testData || 'Hello from CSRF test',
          timestamp: new Date().toISOString()
        }),
      }, csrfToken)

      const data = await response.json()
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  // 测试 2: 不使用 CSRF Token 的请求（应该失败）
  const testUnsafeRequest = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/csrf-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: 'Unsafe request without CSRF token',
          timestamp: new Date().toISOString()
        }),
        credentials: 'include',
      })

      const data = await response.json()
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  // 测试 3: 使用手动创建的头部
  const testManualHeaders = async () => {
    if (!csrfToken) {
      setError('CSRF token not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/csrf-test', {
        method: 'POST',
        headers: createCSRFHeaders(csrfToken),
        body: JSON.stringify({ 
          message: testData || 'Manual headers test',
          timestamp: new Date().toISOString()
        }),
        credentials: 'include',
      })

      const data = await response.json()
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin CSRF Protection Test
          </h1>
          <p className="mt-2 text-gray-600">
            测试页面展示如何在新页面中正确使用 CSRF 保护
          </p>
        </div>

        {/* CSRF Token 状态 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">CSRF Token 状态</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">状态:</span>
              {csrfLoading ? (
                <span className="text-blue-600">加载中...</span>
              ) : csrfError ? (
                <span className="text-red-600">错误: {csrfError}</span>
              ) : csrfToken ? (
                <span className="text-green-600">已获取</span>
              ) : (
                <span className="text-gray-600">未获取</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Token:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">
                {csrfToken || '无'}
              </code>
            </div>
            <Button onClick={refreshToken} variant="outline" size="sm">
              刷新 Token
            </Button>
          </div>
        </Card>

        {/* 测试输入 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试数据</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试消息
              </label>
              <Input
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="输入测试消息..."
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* 测试按钮 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">CSRF 测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-green-700">✅ 安全请求 (secureRequest)</h3>
              <p className="text-sm text-gray-600">
                使用 secureRequest 函数，自动包含 CSRF token
              </p>
              <Button 
                onClick={testSecureRequest}
                disabled={loading || csrfLoading || !csrfToken}
                className="w-full"
              >
                测试安全请求
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-blue-700">🔧 手动头部 (createCSRFHeaders)</h3>
              <p className="text-sm text-gray-600">
                使用 createCSRFHeaders 手动创建请求头
              </p>
              <Button 
                onClick={testManualHeaders}
                disabled={loading || csrfLoading || !csrfToken}
                variant="outline"
                className="w-full"
              >
                测试手动头部
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-red-700">❌ 不安全请求</h3>
              <p className="text-sm text-gray-600">
                不包含 CSRF token 的请求（应该失败）
              </p>
              <Button 
                onClick={testUnsafeRequest}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                测试不安全请求
              </Button>
            </div>
          </div>
        </Card>

        {/* 响应结果 */}
        {(response || error) && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">响应结果</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <strong>错误:</strong> {error}
              </div>
            )}
            {response && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">状态码:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      response.status >= 200 && response.status < 300 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">响应数据:</span>
                  <pre className="mt-2 bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="font-medium">响应头:</span>
                  <pre className="mt-2 bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 使用说明 */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">新页面 CSRF 使用指南</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900">1. 导入必要的 hooks 和函数</h3>
              <pre className="mt-1 bg-gray-100 p-2 rounded">
{`import { useCSRFContext } from '@/contexts/CSRFContext'
import { createCSRFHeaders, secureRequest } from '@/hooks/useCSRF'`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">2. 获取 CSRF token</h3>
              <pre className="mt-1 bg-gray-100 p-2 rounded">
{`const { csrfToken, loading, error } = useCSRFContext()`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">3. 发送安全请求（推荐）</h3>
              <pre className="mt-1 bg-gray-100 p-2 rounded">
{`const response = await secureRequest('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
}, csrfToken)`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">4. 或者手动创建头部</h3>
              <pre className="mt-1 bg-gray-100 p-2 rounded">
{`const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: createCSRFHeaders(csrfToken),
  body: JSON.stringify(data),
  credentials: 'include',
})`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}