'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Card, Input } from '@interview/ui'
import { fastapi, FastAPIError } from '@/lib/fastapi-client'

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
  const { data: session, status } = useSession()
  const { user, isLoading: authLoading } = useAuth()

  const [logs, setLogs] = useState<DocLog[]>([])
  const [allLogs, setAllLogs] = useState<DocLog[]>([])
  const [stats, setStats] = useState<DocStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterAction, setFilterAction] = useState<string>('')
  const [filterDoc, setFilterDoc] = useState<string>('')

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // 应用筛选条件
  const applyFilters = (logsData: DocLog[]) => {
    let filtered = [...logsData]

    // 操作类型筛选
    if (filterAction) {
      filtered = filtered.filter(log => log.action === filterAction)
    }

    // 文档标识筛选（模糊匹配）
    if (filterDoc && filterDoc.trim()) {
      const keyword = filterDoc.toLowerCase().trim()
      filtered = filtered.filter(log =>
        log.doc_slug.toLowerCase().includes(keyword)
      )
    }

    console.log('[Doc Logs] Applied filters:', {
      action: filterAction,
      slug: filterDoc,
      resultCount: filtered.length
    })

    // 更新总数并应用分页
    setTotalCount(filtered.length)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setLogs(filtered.slice(startIndex, endIndex))
  }

  // 加载数据
  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fastapi.getDocLogs({
        limit: 1000, // 加载所有数据，前端进行筛选和分页
      })

      if (data.success) {
        setAllLogs(data.logs)
        applyFilters(data.logs)
      }
    } catch (err: any) {
      console.error('[Doc Logs] Failed to load logs:', err)
      
      if (err instanceof FastAPIError) {
        if (err.message?.includes('认证') || err.message?.includes('Token')) {
          setError('认证失败，请重新登录')
          fastapi.clearCache()
        } else {
          setError('加载失败，请稍后重试')
        }
      } else {
        setError('加载失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  // 加载统计
  const loadStats = async () => {
    try {
      const data = await fastapi.getDocStats()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (err: any) {
      console.error('[Doc Logs] Failed to load stats:', err)
      if (err instanceof FastAPIError) {
        setError('认证失败，请重新登录')
        fastapi.clearCache()
      }
    }
  }

  // 检查登录状态并加载数据
  useEffect(() => {
    // 等待两种认证状态都加载完成
    if (status === 'loading' || authLoading) return

    // 检查是否有任一种认证存在
    if (!session && !user) {
      router.push('/auth/signin')
    } else {
      // 已登录，加载数据
      loadLogs()
      loadStats()
    }
  }, [session, status, user, authLoading])

  // 数据加载后应用筛选
  useEffect(() => {
    if (allLogs.length > 0) {
      applyFilters(allLogs)
    }
  }, [allLogs])

  // 分页变化时重新应用筛选
  useEffect(() => {
    if (allLogs.length > 0) {
      applyFilters(allLogs)
    }
  }, [currentPage, pageSize])

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

  // 处理错误重试
  const handleRetry = async () => {
    fastapi.clearCache()
    loadLogs()
    loadStats()
  }

  // 认证加载中状态
  if (status === 'loading' || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 未登录状态（effect 会重定向）
  if (!session && !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 mb-4" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="font-bold">{error}</p>
              <Button onClick={handleRetry} size="sm" variant="outline">
                重试
              </Button>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">🔍 筛选</h2>
              {(filterAction || filterDoc) && (
                <Button
                  onClick={() => {
                    setFilterAction('')
                    setFilterDoc('')
                    setCurrentPage(1)
                  }}
                  variant="outline"
                  size="sm"
                >
                  清除筛选
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  操作类型
                </label>
                <select
                  value={filterAction}
                  onChange={(e) => {
                    setFilterAction(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full p-2 border border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  onChange={(e) => {
                    setFilterDoc(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="输入文档标识（如：frontend）..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  每页显示
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="w-full p-2 border border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                  <option value={50}>50 条/页</option>
                  <option value={100}>100 条/页</option>
                </select>
              </div>
            </div>
          </Card>

          {/* 日志列表 */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <div>
                <h2 className="text-lg font-semibold">📝 操作记录</h2>
                <p className="text-sm text-gray-500">
                  共 {totalCount} 条记录，第 {currentPage} / {Math.ceil(totalCount / pageSize)} 页
                  {(filterAction || filterDoc) && (
                    <span className="ml-2 text-blue-600">
                      （已应用筛选）
                    </span>
                  )}
                </p>
              </div>
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
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          文档
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          认证方式
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          时间
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getActionStyle(log.action)}`}>
                              {getActionText(log.action)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{log.doc_slug}</code>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{log.user_name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">{log.user_email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${log.auth_method === 'nextauth' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                              {log.auth_method === 'nextauth' ? 'OAuth' : 'Passport'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {new Date(log.timestamp).toLocaleString('zh-CN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页控件 */}
                {totalCount > pageSize && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      显示第 {Math.min((currentPage - 1) * pageSize + 1, totalCount)} - {Math.min(currentPage * pageSize, totalCount)} 条
                      / 共 {totalCount} 条
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        首页
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        ← 上一页
                      </Button>

                      {/* 页码显示 */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const totalPages = Math.ceil(totalCount / pageSize)
                          const pages: (number | string)[] = []

                          // 总是显示第一页
                          pages.push(1)

                          // 显示当前页附近的页码
                          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                            if (!pages.includes(i)) {
                              pages.push(i)
                            }
                          }

                          // 显示最后一页
                          if (totalPages > 1) {
                            pages.push(totalPages)
                          }

                          return pages.map((page, index) => {
                            const prevPage = pages[index - 1]
                            const showEllipsis = prevPage && typeof prevPage === 'number' && typeof page === 'number' && page - prevPage > 1

                            return (
                              <span key={page}>
                                {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                                <Button
                                  onClick={() => setCurrentPage(page as number)}
                                  variant={currentPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  className={`w-10 h-10 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                                >
                                  {page}
                                </Button>
                              </span>
                            )
                          })
                        })()}
                      </div>

                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                        disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        下一页 →
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(Math.ceil(totalCount / pageSize))}
                        disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        末页
                      </Button>
                    </div>
                  </div>
                )}
              </>
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
