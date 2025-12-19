'use client'

import { useState, useEffect } from 'react'

/**
 * 管理员安全测试页面
 * 用于测试 Lusca 安全防护功能
 */
export default function AdminSecurityTestPage() {
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>('admin')

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

  // 测试管理员安全功能
  const runAdminSecurityTests = async () => {
    setLoading(true)
    const results: any[] = []

    try {
      // 测试 1: 检查管理员安全头
      const securityResponse = await fetch('/api/security')
      const securityData = await securityResponse.json()
      results.push({
        test: 'Admin Security Headers',
        status: securityResponse.ok ? 'PASS' : 'FAIL',
        data: securityData,
      })

      // 测试 2: 管理员 CSRF Token 生成
      const token = await fetchCSRFToken()
      results.push({
        test: 'Admin CSRF Token Generation',
        status: token ? 'PASS' : 'FAIL',
        data: { token: token ? 'Generated' : 'Failed' },
      })

      // 测试 3: 管理员 CSRF Token 验证
      if (token) {
        const csrfResponse = await fetch('/api/csrf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, userRole }),
        })
        const csrfData = await csrfResponse.json()
        results.push({
          test: 'Admin CSRF Token Validation',
          status: csrfResponse.ok ? 'PASS' : 'FAIL',
          data: csrfData,
        })
      }

      // 测试 4: 管理员权限验证
      const adminActionResponse = await fetch('/api/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminAction: 'test_admin_action',
          userRole: userRole,
          test: 'Admin privilege test'
        }),
      })
      const adminActionData = await adminActionResponse.json()
      results.push({
        test: 'Admin Privilege Validation',
        status: adminActionResponse.ok ? 'PASS' : 'FAIL',
        data: adminActionData,
      })

      // 测试 5: 非管理员权限测试
      const nonAdminResponse = await fetch('/api/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminAction: 'test_admin_action',
          userRole: 'user', // 非管理员角色
          test: 'Non-admin test'
        }),
      })
      const nonAdminData = await nonAdminResponse.json()
      results.push({
        test: 'Non-Admin Access Denial',
        status: nonAdminResponse.status === 403 ? 'PASS' : 'FAIL',
        data: nonAdminData,
      })

      // 测试 6: XSS 防护测试（管理员级别）
      const xssPayload = '<script>alert("Admin XSS")</script><img src=x onerror=alert("XSS")>'
      const xssResponse = await fetch('/api/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          test: xssPayload,
          userRole: userRole
        }),
      })
      const xssData = await xssResponse.json()
      results.push({
        test: 'Admin XSS Protection',
        status: xssResponse.ok && !xssData.sanitized?.includes('<script>') ? 'PASS' : 'FAIL',
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
      <h1 className="text-3xl font-bold mb-8 text-red-600">🔐 管理员安全防护测试</h1>
      
      <div className="grid gap-6">
        {/* 用户角色选择 */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h2 className="text-xl font-semibold mb-4">测试用户角色</h2>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="admin">管理员 (admin)</option>
            <option value="super_admin">超级管理员 (super_admin)</option>
            <option value="user">普通用户 (user)</option>
            <option value="guest">访客 (guest)</option>
          </select>
        </div>

        {/* CSRF Token 显示 */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">管理员 CSRF Token</h2>
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

        {/* 管理员安全测试 */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-4">管理员安全功能测试</h2>
          <button
            onClick={runAdminSecurityTests}
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '测试中...' : '运行管理员安全测试'}
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
                  <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 管理员安全功能说明 */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <h2 className="text-xl font-semibold mb-4">管理员安全功能说明</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>🛡️ 管理员 CSRF 防护:</strong> 专用的 CSRF Token 机制，防止管理员操作被伪造
            </div>
            <div>
              <strong>🔐 权限验证:</strong> 严格的管理员权限检查，只允许 admin/super_admin 角色
            </div>
            <div>
              <strong>🚫 XSS 防护:</strong> 增强的输入清理和验证，保护管理员界面
            </div>
            <div>
              <strong>🔒 严格的 CSP:</strong> 更严格的内容安全策略，移除 unsafe-eval
            </div>
            <div>
              <strong>🛑 点击劫持防护:</strong> X-Frame-Options: DENY（比普通用户更严格）
            </div>
            <div>
              <strong>📝 安全日志:</strong> 所有管理员操作都会记录安全事件日志
            </div>
            <div>
              <strong>🚨 缓存控制:</strong> 管理员页面禁用缓存，防止敏感信息泄露
            </div>
          </div>
        </div>

        {/* 安全警告 */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ 安全警告</h3>
          <ul className="text-red-700 text-sm space-y-1">
            <li>• 管理员账户应使用强密码和双因素认证</li>
            <li>• 定期检查和更新安全配置</li>
            <li>• 监控管理员操作日志，发现异常及时处理</li>
            <li>• 限制管理员账户的网络访问来源</li>
            <li>• 定期进行安全审计和渗透测试</li>
          </ul>
        </div>
      </div>
    </div>
  )
}