/**
 * FastAPI Client
 * Framework-agnostic FastAPI client utilities
 */

import { fastApiConfig } from '@interview/config'
import type { FastApiOptions, FastApiUrlOptions, RequestOptions, ApiResponse, ApiError } from './types'

/**
 * 构造 FastAPI 请求 URL
 */
export function buildFastApiUrl(pathSegments: string[], options: FastApiUrlOptions = {}): string {
  const { includeQueryParams = false, request } = options
  const filteredPath = pathSegments.filter(segment => segment.length > 0)

  // FastAPI 默认不需要尾部斜杠
  // 所有路由都不需要尾部斜杠
  const path = filteredPath.length > 0 ? filteredPath.join('/') : ''

  const baseUrl = `${fastApiConfig.baseUrl}/${path}`
  const queryString = includeQueryParams && request?.nextUrl?.search ? request.nextUrl.search : ''

  return `${baseUrl}${queryString}`
}

/**
 * 构造请求头
 */
export function buildHeaders(
  options: RequestOptions = {},
  strict: boolean = false
): Record<string, string> {
  const headers: Record<string, string> = {}

  // 必须的认证头
  const authHeader = options.headers?.authorization || options.headers?.Authorization
  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  if (strict) {
    // 严格模式：只转发必要的头
    const contentType = options.headers?.['content-type'] || options.headers?.['Content-Type']
    if (contentType) {
      headers['Content-Type'] = contentType
    }
  } else {
    // 非严格模式：转发更多头，包括所有自定义头
    const contentType = options.headers?.['content-type'] || options.headers?.['Content-Type']
    if (contentType) {
      headers['Content-Type'] = contentType
    }

    const userAgent = options.headers?.['user-agent'] || options.headers?.['User-Agent']
    if (userAgent) {
      headers['User-Agent'] = userAgent
    }

    // 转发所有其他自定义头（如 X-API-Key, X-User-Id, X-User-Email 等）
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        // 跳过已处理的头
        if (
          !['authorization', 'Authorization'].includes(key) &&
          !['content-type', 'Content-Type'].includes(key) &&
          !['user-agent', 'User-Agent'].includes(key)
        ) {
          headers[key] = value
        }
      }
    }
  }

  return headers
}

/**
 * 处理重定向
 */
export async function handleRedirect(
  response: Response,
  originalHeaders: Record<string, string>,
  url: string
): Promise<Response> {
  if (response.status === 307 || response.status === 302) {
    const location = response.headers.get('location')
    console.log('Redirect status:', response.status)
    console.log('Location header:', location)

    if (location) {
      let redirectUrl: string
      if (location.startsWith('http')) {
        // 绝对URL，只有外部域名才需要HTTPS
        if (location.includes('localhost') || location.includes('127.0.0.1')) {
          // 本地地址保持HTTP
          redirectUrl = location
        } else {
          // 外部地址使用HTTPS
          redirectUrl = location.replace('http://', 'https://')
        }
      } else {
        // 相对URL
        redirectUrl = `${fastApiConfig.baseUrl}${location}`
      }

      response = await fetch(redirectUrl, {
        method: 'GET',
        headers: originalHeaders,
      })
    }
  }

  return response
}

/**
 * 执行 HTTP 请求
 */
export async function makeRequest<T = any>(
  url: string,
  options: RequestOptions & { enableRedirectHandling?: boolean } = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    enableRedirectHandling = false
  } = options

  const requestHeaders = buildHeaders({ headers }, false)

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // 对于有请求体的HTTP方法，添加body
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
    if (typeof body === 'string') {
      fetchOptions.body = body
    } else {
      fetchOptions.body = JSON.stringify(body)
      requestHeaders['Content-Type'] = 'application/json'
    }
  }

  // GET 请求可以处理重定向
  if (method.toUpperCase() === 'GET' && enableRedirectHandling) {
    fetchOptions.redirect = 'manual'
  }

  // 设置超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  fetchOptions.signal = controller.signal

  try {
    let response = await fetch(url, fetchOptions)
    clearTimeout(timeoutId)

    // 处理重定向（仅GET请求）
    if (method.toUpperCase() === 'GET' && enableRedirectHandling) {
      response = await handleRedirect(response, requestHeaders, url)
    }

    const contentType = response.headers.get('content-type') || ''
    let data: any

    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`)
      }
      throw error
    }

    throw new Error('Unknown request error')
  }
}

/**
 * FastAPI 客户端类
 */
export class FastApiClient {
  private baseUrl: string
  private defaultOptions: FastApiOptions

  constructor(options: FastApiOptions = {}) {
    this.baseUrl = options.baseUrl || fastApiConfig.baseUrl
    this.defaultOptions = options
  }

  /**
   * 构建完整的 API URL
   */
  private buildUrl(pathSegments: string[], queryParams?: Record<string, string>): string {
    const filteredPath = pathSegments.filter(segment => segment.length > 0)

    // FastAPI 默认不需要尾部斜杠
    // 所有路由都不需要尾部斜杠，包括：
    // - /, /health (system)
    // - /auth (认证)
    // - /items, /items/{id} (商品)
    // - /redis (Redis 操作)
    // - /api/docs, /api/docs/log, /api/docs/logs (文档日志)
    const path = filteredPath.length > 0 ? filteredPath.join('/') : ''

    let url = `${this.baseUrl}/${path}`

    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.append(key, value)
      })
      url += `?${searchParams.toString()}`
    }

    return url
  }

  /**
   * GET 请求
   */
  async get<T = any>(
    pathSegments: string[],
    options: Omit<RequestOptions, 'method'> & { query?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    const { query, ...requestOptions } = options
    const url = this.buildUrl(pathSegments, query)

    return makeRequest<T>(url, {
      ...requestOptions,
      method: 'GET',
      enableRedirectHandling: this.defaultOptions.enableRedirectHandling,
    })
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    pathSegments: string[],
    data?: any,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(pathSegments)

    return makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data,
    })
  }

  /**
   * PUT 请求
   */
  async put<T = any>(
    pathSegments: string[],
    data?: any,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(pathSegments)

    return makeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data,
    })
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(
    pathSegments: string[],
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(pathSegments)

    return makeRequest<T>(url, {
      ...options,
      method: 'DELETE',
    })
  }
}

/**
 * 默认 FastAPI 客户端实例
 */
export const fastApiClient = new FastApiClient()

/**
 * 创建 Next.js API 响应 (用于代理)
 * 注意: 这个函数依赖 Next.js，在非 Next.js 环境中不可用
 */
export function createProxyResponse(response: any, corsEnabled: boolean = true) {
  // 确保数据被正确序列化
  let responseBody: string | null
  const contentType = response.headers['content-type'] || 'application/json'

  if (contentType.includes('application/json')) {
    // 对于JSON响应，确保数据是字符串
    if (typeof response.data === 'string') {
      responseBody = response.data
    } else {
      responseBody = JSON.stringify(response.data)
    }
  } else {
    // 对于其他类型的响应
    responseBody = typeof response.data === 'string' ? response.data : String(response.data)
  }

  // 动态导入 NextResponse 以避免在非 Next.js 环境中出错
  const { NextResponse } = require('next/server')

  const headers: Record<string, string> = {
    'Content-Type': contentType,
  }

  if (corsEnabled) {
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = '*'
  }

  return new NextResponse(responseBody, {
    status: response.status,
    headers,
  })
}
