// 用户类型定义
interface PassportUser {
  id: string
  email: string
  name: string
  role: string
}

/**
 * 获取 Passport 用户（从 localStorage）
 */
function getPassportUser(): PassportUser | null {
  if (typeof window === 'undefined') return null

  try {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return null

    return JSON.parse(storedUser) as PassportUser
  } catch (err) {
    console.error('[FastAPI Client] 读取 Passport 用户失败:', err)
    return null
  }
}

/**
 * FastAPI Token 缓存接口
 */
export interface FastAPIToken {
  access_token: string
  token_type: string
  expires_at: number
}

/**
 * FastAPI 错误类
 */
export class FastAPIError extends Error {
  error: string
  status?: number
  details?: any

  constructor(data: { error: string; status?: number; details?: any }) {
    super(data.error)
    this.name = 'FastAPIError'
    this.error = data.error
    this.status = data.status
    this.details = data.details
  }
}

/**
 * FastAPI 客户端类
 */
export class FastAPIClient {
  private baseUrl: string
  private tokenCacheKey = 'fastapi:admin:token'

  constructor(baseUrl?: string) {
    // 使用本地代理路由，避免 CORS 问题
    this.baseUrl = baseUrl || '/api/fastapi'
  }

  /**
   * 获取缓存的 Token
   */
  private getCachedToken(): FastAPIToken | null {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem(this.tokenCacheKey)
      if (!cached) return null

      const token = JSON.parse(cached) as FastAPIToken

      // 检查是否过期（提前 5 分钟过期，防止边界情况）
      const FIVE_MINUTES = 5 * 60 * 1000
      if (Date.now() > token.expires_at - FIVE_MINUTES) {
        console.log('[FastAPI Client] Token 已过期，需要刷新')
        this.clearCache()
        return null
      }

      console.log('[FastAPI Client] 使用缓存的 Token')
      return token
    } catch (err) {
      console.error('[FastAPI Client] 读取缓存失败:', err)
      return null
    }
  }

  /**
   * 获取 FastAPI Token（带缓存）
   */
  async getAccessToken(): Promise<FastAPIToken> {
    // 1. 尝试从缓存获取
    const cached = this.getCachedToken()
    if (cached) {
      return cached
    }

    console.log('[FastAPI Client] 缓存未命中，请求新 Token')

    // 2. 通过后端 API 获取
    // 获取 Passport 用户信息
    const passportUser = getPassportUser()

    // 准备请求头
    const headers: HeadersInit = { 'Content-Type': 'application/json' }

    // 如果使用 Passport 认证，添加用户信息头
    if (passportUser) {
      headers['x-auth-user'] = JSON.stringify(passportUser)
    }

    const response = await fetch('/api/admin/fastapi-login', {
      method: 'POST',
      headers
    })

    if (!response.ok) {
      const error = await response.json()
      throw new FastAPIError({
        error: error.error || '获取 Token 失败',
        status: response.status
      })
    }

    const token = await response.json()

    // 3. 添加过期时间（60 分钟）
    const ONE_HOUR = 60 * 60 * 1000
    const tokenWithExpiry: FastAPIToken = {
      ...token,
      expires_at: Date.now() + ONE_HOUR
    }

    // 4. 缓存 Token
    this.cacheToken(tokenWithExpiry)

    return tokenWithExpiry
  }

  /**
   * 缓存 Token
   */
  private cacheToken(token: FastAPIToken): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenCacheKey, JSON.stringify(token))
    }
  }

  /**
   * 清除缓存的 Token
   */
  clearCache(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenCacheKey)
    }
  }

  /**
   * 获取认证请求头
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAccessToken()

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.access_token}`
    }
  }

  /**
   * 通用请求方法
   */
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })

    // 处理 403/401 错误
    if (response.status === 401 || response.status === 403) {
      console.error('[FastAPI Client] Token 可能无效，清除缓存')
      this.clearCache()

      throw new FastAPIError({
        error: '认证失败，请重新登录',
        status: response.status
      })
    }

    if (!response.ok) {
      const error = await response.json()
      throw new FastAPIError({
        error: error.error || '请求失败',
        status: response.status,
        details: error.details
      })
    }

    return response.json()
  }

  /**
   * 文档日志相关
   */
  async getDocLogs(params: {
    limit?: number
    doc_slug?: string
    action?: string
  } = {}) {
    const queryParams = new URLSearchParams()
    if (params.limit) queryParams.set('limit', params.limit.toString())
    if (params.doc_slug) queryParams.set('doc_slug', params.doc_slug)
    if (params.action) queryParams.set('action', params.action)

    return this.request<{ success: true; logs: any[] }>(
      `/api/docs/logs?${queryParams.toString()}`
    )
  }

  async getDocStats() {
    return this.request<{ success: true; stats: any }>(
      `/api/docs/stats`
    )
  }

  /**
   * 记录文档操作（可选）
   */
  async logDocAction(data: {
    action: string
    doc_slug: string
    user_id: string
    user_email: string
    user_name: string
    auth_method: string
    details?: string
  }): Promise<{ success: true }> {
    // 需要配置 DOC_LOG_API_KEY
    const apiKey = process.env.DOC_LOG_API_KEY || ''
    
    return this.request('/api/docs/log', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'X-API-Key': apiKey
      }
    })
  }

  async getMe() {
    return this.request<{ username: string; role: string }>(
      `/auth/me`
    )
  }
}

// 单例
export const fastapi = new FastAPIClient()
