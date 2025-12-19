'use client'

import { useState, useEffect } from 'react'

/**
 * 安全测试页面
 * 用于测试 Lusca 安全防护功能
 */
export default function SecurityTestPage() {
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 获取 CSRF Token
  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf')
      const data = await response.json()
      setCsrfToken(data.token)
      return data.token
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
      return null
    }
  }

  // 测试安全功能
  const runSecurityTests = async () => {
    setLoading(true)
    const results: any[] = []

    try {
      // 测试 1: 检查安全头
      const securityResponse = await fetch('/api/security')
      const securityData = await securityResponse.json()
      results.push({
        test: 'Security Headers',
        status: securityResponse.ok ? 'PASS' : 'FAIL',
        data: securityData,
      })

      // 测试 2: CSRF Token 生成
      const token = await fetchCSRFToken()
      results.push({
        test: 'CSRF Token Generation',
        status: token ? 'PASS' : 'FAIL',
        data: { token: token ? 'Generated' : 'Failed' },
      })

      // 测试 3: CSRF Token 验证
      if (token) {
        const csrfResponse = await fetch('/api/csrf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })
        const csrfData = await csrfResponse.json()
        results.push({
          test: 'CSRF Token Validation',
          status: csrfResponse.ok ? 'PASS' : 'FAIL',
          data: csrfData,
        })
      }

      // 测试 4: XSS 防护测试
      const xssPayload = '<script>alert("XSS")</script>'
      const xssResponse = await fetch('/api/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: xssPayload }),
      })
      const xssData = await xssResponse.json()
      results.push({
        test: 'XSS Protection',
        status: xssResponse.ok && !xssData.received?.includes('<script>') ? 'PASS' : 'FAIL',
        data: xssData,
      })

    } catch (error) {
      results.push({
        test: 'Error',
        status: 'FAIL',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      })
    }

    setTestResults(results)
    setLoading(false)
  }

  useEffect(() => {
    fetchCSRFToken()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lusca 安全防护测试</h1>
      
      <div className="grid gap-6">
        {/* CSRF Token 显示 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">CSRF Token</h2>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
            {csrfToken || '加载中...'}
          </div>
          <button
            onClick={fetchCSRFToken}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            刷新 Token
          </button>
        </div>

        {/* 安全测试 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">安全功能测试</h2>
          <button
            onClick={runSecurityTests}
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '测试中...' : '运行安全测试'}
          </button>
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded border-l-4 ${
                    result.status === 'PASS'
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{result.test}</h3>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        result.status === 'PASS'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 安全功能说明 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">安全功能说明</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>CSRF 防护:</strong> 防止跨站请求伪造攻击，通过验证请求中的 CSRF Token
            </div>
            <div>
              <strong>XSS 防护:</strong> 防止跨站脚本攻击，通过设置安全头和输入验证
            </div>
            <div>
              <strong>HSTS:</strong> HTTP 严格传输安全，强制使用 HTTPS 连接（生产环境）
            </div>
            <div>
              <strong>CSP:</strong> 内容安全策略，限制资源加载来源
            </div>
            <div>
              <strong>X-Frame-Options:</strong> 防止点击劫持攻击
            </div>
            <div>
              <strong>X-Content-Type-Options:</strong> 防止 MIME 类型嗅探
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}