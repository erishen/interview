'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Card } from '@interview/ui'
import { fastApiConfig } from '@interview/config'
import Link from 'next/link'

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
  // 认证状态 - 纯内存状态（刷新后需要重新登录）
  // 注意：如需刷新后保持登录，请配置后端使用 httpOnly cookie
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

  // 输入清理和验证函数 - 防止 XSS 攻击
  const sanitizeInput = (input: string, maxLength?: number): string => {
    // 限制长度
    if (maxLength && input.length > maxLength) {
      input = input.substring(0, maxLength)
    }

    // 移除危险字符
    return input
      .replace(/[<>]/g, '') // 移除 < 和 > 标签
      .replace(/javascript:/gi, '') // 移除 javascript: 协议
      .replace(/on\w+=/gi, '') // 移除事件处理器
      .trim()
  }

  // 验证商品数据
  const validateItemData = (data: {
    name: string
    description: string
    price: string
    category: string
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // 验证名称
    if (!data.name || data.name.trim().length === 0) {
      errors.push('商品名称不能为空')
    } else if (data.name.length > 100) {
      errors.push('商品名称不能超过100个字符')
    }

    // 验证价格
    const priceNum = parseFloat(data.price)
    if (!data.price || isNaN(priceNum)) {
      errors.push('价格必须是有效数字')
    } else if (priceNum < 0) {
      errors.push('价格不能为负数')
    } else if (priceNum > 999999) {
      errors.push('价格不能超过999999')
    }

    // 验证描述
    if (data.description && data.description.length > 500) {
      errors.push('描述不能超过500个字符')
    }

    // 验证分类
    if (data.category && data.category.length > 50) {
      errors.push('分类不能超过50个字符')
    }

    return { isValid: errors.length === 0, errors }
  }

  // 验证 Redis 键值
  const validateRedisData = (key: string, value: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!key || key.trim().length === 0) {
      errors.push('键名不能为空')
    } else if (key.length > 200) {
      errors.push('键名不能超过200个字符')
    }

    if (!value || value.trim().length === 0) {
      errors.push('值不能为空')
    } else if (value.length > 10000) {
      errors.push('值不能超过10000个字符')
    }

    return { isValid: errors.length === 0, errors }
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
          ...options.headers,
          // 注意：不添加 Authorization header，让浏览器自动发送 cookie
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
        // 确保错误消息始终是字符串
        let errorMessage: string
        if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData?.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail)
        } else if (errorData?.message) {
          errorMessage = typeof errorData.message === 'string'
            ? errorData.message
            : JSON.stringify(errorData.message)
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
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
    // 验证登录表单
    if (!loginForm.username || !loginForm.password) {
      alert('请输入用户名和密码')
      return
    }

    if (loginForm.username.length < 3 || loginForm.username.length > 50) {
      alert('用户名长度必须在 3-50 个字符之间')
      return
    }

    if (loginForm.password.length < 6) {
      alert('密码长度至少为 6 个字符')
      return
    }

    // 清理用户名（不清理密码）
    const sanitizedUsername = sanitizeInput(loginForm.username, 50)

    setAuthLoading(true)

    // 使用代理 API 调用登录
    const result = await apiCall<AuthResponse>(fastApiConfig.endpoints.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: sanitizedUsername,
        password: loginForm.password,
      }).toString(),
    })

    if (result.success) {
      // 登录成功，后端已设置 cookie
      // 获取用户信息
      await handleGetUserInfo(true)
      // 设置一个标志 token 表示已登录
      setToken('authenticated')
      setLoginForm({ username: '', password: '' })
      alert('登录成功！')
    } else {
      console.error('Login failed:', result.error)
      if (result.error?.includes('500') || result.error?.includes('服务器内部错误')) {
        alert(`外部API认证服务暂时不可用 (500错误)。\n您可以先测试其他功能，如健康检查、Redis操作等。\n\n错误详情: ${result.error}`)
      } else {
        alert(`登录失败: ${result.error}`)
      }
    }

    setAuthLoading(false)
  }

  const handleGetUserInfo = async (silent = false) => {
    setAuthLoading(true)
    const result = await apiCall<UserInfo>('/auth/me')
    if (result.success) {
      setUserInfo(result.data!)
    } else if (!silent) {
      alert(`获取用户信息失败: ${result.error}`)
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    try {
      // 调用后端登出接口，清除 cookie
      await apiCall('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除前端状态
      setToken('')
      setUserInfo(null)
      setItems([])
      setRedisStats(null)
      setRedisKeys([])
    }
  }

  // ============ 商品管理功能 ============

  const loadItems = async () => {
    setItemsLoading(true)
    const endpoint = fastApiConfig.endpoints.items.list.replace(/\/$/, '')

    const result = await apiCall<Item[]>(endpoint)

    if (result.success) {
      setItems(result.data!)
    } else {
      alert(`加载商品失败: ${result.error}`)
    }
    setItemsLoading(false)
  }

  const handleCreateItem = async () => {
    // 验证输入数据
    const validation = validateItemData(itemForm)
    if (!validation.isValid) {
      alert('输入验证失败:\n' + validation.errors.join('\n'))
      return
    }

    // 清理输入数据
    const sanitizedData = {
      name: sanitizeInput(itemForm.name, 100),
      description: sanitizeInput(itemForm.description, 500),
      price: itemForm.price,
      category: sanitizeInput(itemForm.category, 50)
    }

    // 如果有选中的商品，则是更新操作
    if (selectedItem) {
      const result = await apiCall<Item>(`${fastApiConfig.endpoints.items.update}${selectedItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: sanitizedData.name,
          description: sanitizedData.description,
          price: parseFloat(sanitizedData.price),
          category: sanitizedData.category,
        }),
      })

      if (result.success) {
        setItemForm({ name: '', description: '', price: '', category: '' })
        setSelectedItem(null)
        loadItems()
        alert('商品更新成功！')
      } else {
        alert(`更新商品失败: ${result.error}`)
      }
    } else {
      // 否则是创建操作
      const result = await apiCall<Item>(fastApiConfig.endpoints.items.create, {
        method: 'POST',
        body: JSON.stringify({
          name: sanitizedData.name,
          description: sanitizedData.description,
          price: parseFloat(sanitizedData.price),
          category: sanitizedData.category,
        }),
      })

      if (result.success) {
        setItemForm({ name: '', description: '', price: '', category: '' })
        loadItems()
        alert('商品创建成功！')
      } else {
        alert(`创建商品失败: ${result.error}`)
      }
    }
  }

  const handleEditItem = (item: Item) => {
    setSelectedItem(item)
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || ''
    })
  }

  const handleCancelEdit = () => {
    setSelectedItem(null)
    setItemForm({ name: '', description: '', price: '', category: '' })
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('确定要删除这个商品吗？')) return

    const result = await apiCall(`${fastApiConfig.endpoints.items.update}${itemId}`, {
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
    // 暂时跳过Redis认证问题，使用跳过认证的标记
    const result = await apiCall<RedisStats>(fastApiConfig.endpoints.redis.stats)
    if (result.success) {
      setRedisStats(result.data!)
    } else {
      alert(`加载 Redis 统计失败: ${result.error}`)
    }
    setRedisLoading(false)
  }

  const loadRedisKeys = async () => {
    setRedisLoading(true)
    const result = await apiCall<string[]>(fastApiConfig.endpoints.redis.keys)
    if (result.success) {
      setRedisKeys(result.data!)
    } else {
      alert(`加载 Redis 键失败: ${result.error}`)
    }
    setRedisLoading(false)
  }

  const handleSetRedisValue = async () => {
    // 验证输入数据
    const validation = validateRedisData(redisKey, redisValue)
    if (!validation.isValid) {
      alert('输入验证失败:\n' + validation.errors.join('\n'))
      return
    }

    // 清理输入数据
    const sanitizedKey = sanitizeInput(redisKey, 200)
    const sanitizedValue = sanitizeInput(redisValue, 10000)

    const result = await apiCall(fastApiConfig.endpoints.redis.set, {
      method: 'POST',
      body: JSON.stringify({
        key: sanitizedKey,
        value: sanitizedValue,
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

  // 页面加载时检查是否已通过 cookie 认证
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 尝试调用 /auth/me 接口，如果成功说明有 cookie
        const result = await apiCall<UserInfo>('/auth/me')
        if (result.success && result.data) {
          // 已通过 cookie 认证，设置登录状态
          setUserInfo(result.data)
          // 设置一个标志 token 表示已登录（虽然实际认证是通过 cookie）
          setToken('authenticated')
        }
      } catch (error) {
        // 未登录，忽略错误
        console.log('未通过 cookie 认证')
      }
    }

    checkAuthStatus()
  }, []) // 只在组件挂载时执行一次

  // 当 token 变化时自动加载数据
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FastAPI 服务集成</h1>
              <p className="mt-2 text-gray-600">
                测试和调用 FastAPI Web 服务的所有 API 接口
              </p>
            </div>
            <Link href="/zh/dashboard">
              <Button variant="outline">← 返回 Dashboard</Button>
            </Link>
          </div>
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
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-green-800 font-medium">✅ 已登录</div>
                  {/* 不显示 token，避免安全泄露 */}
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
                  <Button onClick={() => handleGetUserInfo()} disabled={authLoading}>
                    获取用户信息
                  </Button>
                  <Button onClick={handleLogout} variant="outline">
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
                {/* 创建/编辑商品表单 */}
                <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium">
                    {selectedItem ? '编辑商品' : '创建新商品'}
                  </h3>
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
                  <textarea
                    placeholder="描述（可选）"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <Input
                    placeholder="分类（可选）"
                    value={itemForm.category}
                    onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateItem} size="sm">
                      {selectedItem ? '更新商品' : '创建商品'}
                    </Button>
                    {selectedItem && (
                      <Button onClick={handleCancelEdit} size="sm" variant="outline">
                        取消编辑
                      </Button>
                    )}
                  </div>
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
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded border">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate" title={item.name}>
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              ¥{item.price} {item.category && `· ${item.category}`}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 ml-4">
                            <Button
                              onClick={() => handleEditItem(item)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              编辑
                            </Button>
                            <Button
                              onClick={() => handleDeleteItem(item.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-800"
                            >
                              删除
                            </Button>
                          </div>
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
                  const result = await apiCall(fastApiConfig.endpoints.system.health)
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
                  const result = await apiCall(fastApiConfig.endpoints.redis.ping)
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
