'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Card } from '@interview/ui'

// FastAPI 服务配置 - 使用代理 API 避免 CORS 问题
const FASTAPI_BASE_URL = '/api/fastapi/'

// API 响应类型定义
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface AuthResponse {
  access_token: string
  token_type: string
}

interface UserInfo {
  username: string
  role: string
}

interface Item {
  id: number
  name: string
  description?: string
  price: number
  category?: string
  created_at?: string
  updated_at?: string
}

interface RedisStats {
  connected: boolean
  keys_count: number
  memory_used: string
  uptime: number
  version: string
  connected_clients: number
}

export default function ApiIntegrationPage() {
  // 认证状态
  const [token, setToken] = useState<string>('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  // 商品管理状态
  const [items, setItems] = useState<Item[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  // Redis 状态
  const [redisStats, setRedisStats] = useState<RedisStats | null>(null)
  const [redisKeys, setRedisKeys] = useState<string[]>([])
  const [redisLoading, setRedisLoading] = useState(false)

  // 表单状态
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  })
  const [redisKey, setRedisKey] = useState('')
  const [redisValue, setRedisValue] = useState('')

  // 调试状态
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]) // 保留最后10条日志
  }

  // 通用 API 调用函数
  const apiCall = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const url = `${FASTAPI_BASE_URL}${endpoint}`
      const method = options.method || 'GET'
      addDebugLog(`🚀 ${method} ${url}`)

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        credentials: 'include', // 确保发送 cookies
        ...options,
      })

      addDebugLog(`📡 Response: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { detail: response.statusText }
        }
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        addDebugLog(`❌ Error: ${errorMessage}`)
        return {
          success: false,
          error: errorMessage
        }
      }

      const data = await response.json()
      addDebugLog(`✅ Success: ${JSON.stringify(data).substring(0, 100)}...`)
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      addDebugLog(`💥 Network Error: ${errorMessage}`)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // ============ 认证功能 ============

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      alert('请输入用户名和密码')
      return
    }

    setAuthLoading(true)

    // 使用代理 API 调用登录
    const result = await apiCall<AuthResponse>('auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: loginForm.username,
        password: loginForm.password,
      }).toString(),
    })

    if (result.success) {
      console.log('Login successful:', result.data)
      setToken(result.data!.access_token)
      setLoginForm({ username: '', password: '' })
      alert('登录成功！')
    } else {
      console.error('Login failed:', result.error)
      alert(`登录失败: ${result.error}`)
    }

    setAuthLoading(false)
  }

  const handleGetUserInfo = async () => {
    setAuthLoading(true)
    const result = await apiCall<UserInfo>('/auth/me')
    if (result.success) {
      setUserInfo(result.data!)
    } else {
      alert(`获取用户信息失败: ${result.error}`)
    }
    setAuthLoading(false)
  }

  // ============ 商品管理功能 ============

  const loadItems = async () => {
    setItemsLoading(true)
    const result = await apiCall<Item[]>('/items/')
    if (result.success) {
      setItems(result.data!)
    } else {
      alert(`加载商品失败: ${result.error}`)
    }
    setItemsLoading(false)
  }

  const handleCreateItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      alert('请输入商品名称和价格')
      return
    }

    const result = await apiCall<Item>('/items/', {
      method: 'POST',
      body: JSON.stringify({
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        category: itemForm.category,
      }),
    })

    if (result.success) {
      setItemForm({ name: '', description: '', price: '', category: '' })
      loadItems() // 重新加载商品列表
      alert('商品创建成功！')
    } else {
      alert(`创建商品失败: ${result.error}`)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('确定要删除这个商品吗？')) return

    const result = await apiCall(`/items/${itemId}`, {
      method: 'DELETE',
    })

    if (result.success) {
      loadItems() // 重新加载商品列表
      alert('商品删除成功！')
    } else {
      alert(`删除商品失败: ${result.error}`)
    }
  }

  // ============ Redis 管理功能 ============

  const loadRedisStats = async () => {
    setRedisLoading(true)
    const result = await apiCall<RedisStats>('/redis/stats')
    if (result.success) {
      setRedisStats(result.data!)
    } else {
      alert(`加载 Redis 统计失败: ${result.error}`)
    }
    setRedisLoading(false)
  }

  const loadRedisKeys = async () => {
    setRedisLoading(true)
    const result = await apiCall<string[]>('/redis/keys')
    if (result.success) {
      setRedisKeys(result.data!)
    } else {
      alert(`加载 Redis 键失败: ${result.error}`)
    }
    setRedisLoading(false)
  }

  const handleSetRedisValue = async () => {
    if (!redisKey || !redisValue) {
      alert('请输入键和值')
      return
    }

    const result = await apiCall('/redis/set', {
      method: 'POST',
      body: JSON.stringify({
        key: redisKey,
        value: redisValue,
        expire: 300, // 5分钟过期
      }),
    })

    if (result.success) {
      setRedisKey('')
      setRedisValue('')
      loadRedisKeys()
      alert('Redis 值设置成功！')
    } else {
      alert(`设置 Redis 值失败: ${result.error}`)
    }
  }

  // 初始化加载
  useEffect(() => {
    if (token) {
      loadItems()
      loadRedisStats()
      loadRedisKeys()
    }
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FastAPI 服务集成</h1>
          <p className="mt-2 text-gray-600">
            测试和调用 FastAPI Web 服务的所有 API 接口
          </p>
          <div className="mt-4 space-y-2">
            <div className="text-sm text-blue-600">
              <a href="http://localhost:8081/docs" target="_blank" rel="noopener noreferrer" className="underline">
                📖 查看 FastAPI 文档 (http://localhost:8081/docs)
              </a>
            </div>
            <div className="text-sm text-green-600">
              ✅ API 代理已启用 - 无需担心 CORS 问题
            </div>
            <div className="text-sm text-gray-500">
              🔧 代理地址: /api/fastapi/* → http://localhost:8081/*
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 认证模块 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">🔐 认证管理</h2>

            {!token ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <Input
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    placeholder="输入用户名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    密码
                  </label>
                  <Input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    placeholder="输入密码"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={authLoading}
                  className="w-full"
                >
                  {authLoading ? '登录中...' : '登录'}
                </Button>
                <div className="text-sm text-gray-500">
                  默认用户: admin / secret
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-green-800 font-medium">✅ 已登录</div>
                  <div className="text-green-600 text-sm mt-1">
                    Token: {token.substring(0, 20)}...
                  </div>
                </div>

                {userInfo && (
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-blue-800 font-medium">👤 用户信息</div>
                    <div className="text-blue-600 text-sm mt-1">
                      用户名: {userInfo.username}<br/>
                      角色: {userInfo.role}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button onClick={handleGetUserInfo} disabled={authLoading}>
                    获取用户信息
                  </Button>
                  <Button
                    onClick={() => {
                      setToken('')
                      setUserInfo(null)
                      setItems([])
                      setRedisStats(null)
                      setRedisKeys([])
                    }}
                    variant="outline"
                  >
                    登出
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* 商品管理模块 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">📦 商品管理</h2>

            {!token && (
              <div className="text-gray-500 text-sm mb-4">
                请先登录以使用商品管理功能
              </div>
            )}

            {token && (
              <>
                {/* 创建商品表单 */}
                <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium">创建新商品</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="商品名称"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="价格"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                    />
                  </div>
                  <Input
                    placeholder="描述（可选）"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                  />
                  <Input
                    placeholder="分类（可选）"
                    value={itemForm.category}
                    onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                  />
                  <Button onClick={handleCreateItem} size="sm">
                    创建商品
                  </Button>
                </div>

                {/* 商品列表 */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">商品列表</h3>
                    <Button onClick={loadItems} size="sm" variant="outline">
                      刷新
                    </Button>
                  </div>

                  {itemsLoading ? (
                    <div className="text-center py-4">加载中...</div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded border">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              ¥{item.price} {item.category && `· ${item.category}`}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDeleteItem(item.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-800"
                          >
                            删除
                          </Button>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          暂无商品
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Redis 管理模块 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">🗄️ Redis 缓存管理</h2>

            {!token && (
              <div className="text-gray-500 text-sm mb-4">
                请先登录以使用 Redis 管理功能
              </div>
            )}

            {token && (
              <>
                {/* Redis 统计信息 */}
                {redisStats && (
                  <div className="mb-6 p-4 bg-blue-50 rounded">
                    <h3 className="font-medium text-blue-800 mb-2">Redis 状态</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>连接状态: <span className={redisStats.connected ? 'text-green-600' : 'text-red-600'}>
                        {redisStats.connected ? '已连接' : '未连接'}
                      </span></div>
                      <div>键数量: {redisStats.keys_count}</div>
                      <div>内存使用: {redisStats.memory_used}</div>
                      <div>运行时间: {Math.floor(redisStats.uptime / 3600)}h</div>
                      <div>版本: {redisStats.version}</div>
                      <div>连接客户端: {redisStats.connected_clients}</div>
                    </div>
                  </div>
                )}

                {/* 设置 Redis 值 */}
                <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium">设置缓存值</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="键名"
                      value={redisKey}
                      onChange={(e) => setRedisKey(e.target.value)}
                    />
                    <Input
                      placeholder="值"
                      value={redisValue}
                      onChange={(e) => setRedisValue(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSetRedisValue} size="sm">
                    设置值 (5分钟过期)
                  </Button>
                </div>

                {/* Redis 键列表 */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">缓存键列表</h3>
                    <Button onClick={loadRedisKeys} size="sm" variant="outline">
                      刷新
                    </Button>
                  </div>

                  {redisLoading ? (
                    <div className="text-center py-4">加载中...</div>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {redisKeys.map((key) => (
                        <div key={key} className="p-2 bg-white rounded border text-sm">
                          {key}
                        </div>
                      ))}
                      {redisKeys.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          无缓存键
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* 系统状态模块 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">⚙️ 系统状态</h2>

            <div className="space-y-3">
              <Button
                onClick={async () => {
                  const result = await apiCall('/health')
                  if (result.success) {
                    alert('✅ FastAPI 服务运行正常')
                  } else {
                    alert(`❌ 服务异常: ${result.error}`)
                  }
                }}
                className="w-full"
              >
                检查服务健康状态
              </Button>

              <Button
                onClick={async () => {
                  const result = await apiCall('/redis/ping')
                  if (result.success) {
                    alert('✅ Redis 连接正常')
                  } else {
                    alert(`❌ Redis 异常: ${result.error}`)
                  }
                }}
                variant="outline"
                className="w-full"
              >
                检查 Redis 连接
              </Button>

              <div className="text-sm text-gray-500 mt-4">
                <div>代理 API 地址: {FASTAPI_BASE_URL}</div>
                <div>原始服务地址: http://localhost:8081</div>
                <div>API 文档: <a href="http://localhost:8081/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">点击查看</a></div>
              </div>
            </div>
          </Card>
        </div>

        {/* 调试面板 */}
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 API 调用日志</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <div className="text-gray-500">暂无 API 调用日志</div>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => setDebugLogs([])}
                variant="outline"
                size="sm"
              >
                清空日志
              </Button>
              <Button
                onClick={() => addDebugLog('🔄 调试面板测试')}
                variant="outline"
                size="sm"
              >
                测试日志
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
