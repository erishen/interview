'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input } from '@interview/ui'

interface DocLog {
  id: number
  action: string
  doc_slug: string
  user_id: string
  user_email: string
  user_name: string
  auth_method: string
  timestamp: string
}

interface DocStats {
  total: number
  create: number
  update: number
  delete: number
  by_user: Record<string, number>
}

export default function DocLogsPage() {
  const router = useRouter()

  const [logs, setLogs] = useState<DocLog[]>([])
  const [stats, setStats] = useState<DocStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('')
  const [filterDoc, setFilterDoc] = useState<string>('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // FastAPI 代理 API 基础路径
  const FASTAPI_PROXY_URL = '/api/fastapi/'

  // 获取 FastAPI access token
  const getAccessToken = async () => {
    try {
      console.log('[Doc Logs] Getting FastAPI token...')
      const response = await fetch('/api/admin/fastapi-login', { method: 'POST' })
      console.log('[Doc Logs] Token response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Doc Logs] Failed to get access token:', response.status, errorText)

        let errorMessage = '无法获取 FastAPI Token'
        if (response.status === 401) {
          errorMessage = '请先登录管理员账户'
        } else if (response.status === 403) {
          errorMessage = '权限不足，需要管理员角色'
        } else if (response.status === 500) {
          errorMessage = '服务器错误，请检查 FastAPI 配置'
        }

        setTokenError(errorMessage)
        return null
      }

      setTokenError(null)
      const data = await response.json()
      console.log('[Doc Logs] Got access token:', !!data.access_token)
      setAccessToken(data.access_token)
      return data.access_token
    } catch (error) {
      console.error('[Doc Logs] Failed to get access token:', error)
      setTokenError('网络错误，无法获取 Token')
      return null
    }
  }

  // 获取请求头
  const getAuthHeaders = async () => {
    const token = accessToken || await getAccessToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  // 加载日志
  const loadLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterAction) params.set('action', filterAction)
      if (filterDoc) params.set('doc_slug', filterDoc)

      const headers = await getAuthHeaders()
      const response = await fetch(`${FASTAPI_PROXY_URL}api/docs/logs?${params.toString()}`, {
        headers
      })
      const data = await response.json()

      if (data.success) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('[Doc Logs] Failed to load logs:', error)
    }
    setLoading(false)
  }

  // 加载统计
  const loadStats = async () => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${FASTAPI_PROXY_URL}api/docs/stats`, {
        headers
      })
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('[Doc Logs] Failed to load stats:', error)
    }
  }

  useEffect(() => {
    // 初始加载
    loadLogs()
    loadStats()
  }, [])

  useEffect(() => {
    // 过滤条件变化时重新加载
    loadLogs()
    loadStats()
  }, [filterAction, filterDoc])

  // 获取操作类型样式
  const getActionStyle = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取操作类型文本
  const getActionText = (action: string) => {
    switch (action) {
      case 'create': return '创建'
      case 'update': return '修改'
      case 'delete': return '删除'
      default: return action
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Token Error Alert */}
      {tokenError && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-4" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="font-bold">无法获取 FastAPI Token</p>
              <p className="text-sm">{tokenError}</p>
              <p className="text-sm mt-1">
                请确保：1. 已使用管理员账户登录 ({process.env.ADMIN_EMAIL || 'admin@example.com'})
                2. <a href="/dashboard" className="underline">前往登录页面</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📋 文档操作日志</h1>
              <p className="text-sm text-gray-500">查看文档的创建、修改和删除记录</p>
            </div>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              返回 Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">

          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600">{stats.total}</div>
                  <div className="text-sm text-gray-500 mt-1">总操作</div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{stats.create}</div>
                  <div className="text-sm text-gray-500 mt-1">创建</div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{stats.update}</div>
                  <div className="text-sm text-gray-500 mt-1">修改</div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">{stats.delete}</div>
                  <div className="text-sm text-gray-500 mt-1">删除</div>
                </div>
              </Card>
            </div>
          )}

          {/* 筛选器 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">🔍 筛选</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  操作类型
                </label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full p-2 border border rounded-md"
                >
                  <option value="">全部类型</option>
                  <option value="create">创建</option>
                  <option value="update">修改</option>
                  <option value="delete">删除</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文档标识
                </label>
                <Input
                  value={filterDoc}
                  onChange={(e) => setFilterDoc(e.target.value)}
                  placeholder="输入文档标识..."
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* 日志列表 */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">📝 操作记录</h2>
              <Button onClick={loadLogs} size="sm" variant="outline">
                刷新
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无操作记录
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        文档
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用户
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        认证方式
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionStyle(log.action)}`}>
                            {getActionText(log.action)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                          {log.doc_slug}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium">{log.user_name}</div>
                            <div className="text-xs text-gray-500">{log.user_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${log.auth_method === 'nextauth' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                            {log.auth_method === 'nextauth' ? 'OAuth' : 'Passport'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* 用户统计 */}
          {stats && stats.by_user && Object.keys(stats.by_user).length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">👥 用户操作统计</h2>
              <div className="space-y-2">
                {Object.entries(stats.by_user)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([email, count]) => (
                    <div key={email} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded">
                      <span className="text-sm font-medium truncate">{email}</span>
                      <span className="text-sm text-gray-600">{count} 次操作</span>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
