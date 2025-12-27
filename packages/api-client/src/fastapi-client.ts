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
  let filteredPath = pathSegments.filter(segment => segment.length > 0)

  // FastAPI 资源路由（如 /items/, /redis/）需要尾部斜杠
  // 当 pathSegments 只有一个元素时（资源列表请求），添加尾部斜杠以避免 307 重定向
  if (filteredPath.length === 1 && !filteredPath[0].endsWith('/')) {
    filteredPath[0] = `${filteredPath[0]}/`
  }

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
        credentials: 'include',  // 关键：发送 cookies
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
  options: RequestOptions & { enableRedirectHandling?: boolean; cookieString?: string } = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    enableRedirectHandling = false,
    cookieString
  } = options

  const requestHeaders = buildHeaders({ headers }, false)

  // 如果提供了 cookieString（服务器端场景），将其添加到 Cookie header
  if (cookieString) {
    requestHeaders['Cookie'] = cookieString
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',  // 关键：发送 cookies（包括 httpOnly cookies）
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

    // 收集响应 headers，支持多个同名的 header（如 Set-Cookie）
    const responseHeaders: Record<string, string | string[]> = {}
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      // 对于可能有多个值的 header，使用数组
      if (lowerKey === 'set-cookie' || responseHeaders[key]) {
        if (Array.isArray(responseHeaders[key])) {
          responseHeaders[key].push(value)
        } else if (responseHeaders[key]) {
          responseHeaders[key] = [responseHeaders[key], value]
        } else {
          responseHeaders[key] = [value]
        }
      } else {
        responseHeaders[key] = value
      }
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
  private defaultOptions: FastApiOptions & { cookieString?: string }

  constructor(options: FastApiOptions & { cookieString?: string } = {}) {
    this.baseUrl = options.baseUrl || fastApiConfig.baseUrl
    this.defaultOptions = options
  }

  /**
   * 设置 cookie 字符串（用于服务器端场景）
   */
  setCookieString(cookieString: string) {
    this.defaultOptions.cookieString = cookieString
  }

  /**
   * 构建完整的 API URL
   */
  private buildUrl(pathSegments: string[], queryParams?: Record<string, string>): string {
    let filteredPath = pathSegments.filter(segment => segment.length > 0)

    // FastAPI 资源路由（如 /items/, /redis/）需要尾部斜杠
    // 当 pathSegments 只有一个元素时（资源列表请求），添加尾部斜杠以避免 307 重定向
    if (filteredPath.length === 1 && !filteredPath[0].endsWith('/')) {
      filteredPath[0] = `${filteredPath[0]}/`
    }

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
      cookieString: this.defaultOptions.cookieString,
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
      cookieString: this.defaultOptions.cookieString,
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
      cookieString: this.defaultOptions.cookieString,
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
      cookieString: this.defaultOptions.cookieString,
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

  // 使用 Headers API 来正确处理多个同名的 headers（如 Set-Cookie）
  const headers = new Headers()

  // 设置基本的 Content-Type
  headers.set('Content-Type', contentType)

  // 转发所有原始 headers
  for (const [key, value] of Object.entries(response.headers)) {
    const lowerKey = key.toLowerCase()

    // 跳过 Content-Type（已经设置过了）
    if (lowerKey === 'content-type') {
      continue
    }

    // 跳过 Content-Length（让 Next.js 自动计算）
    if (lowerKey === 'content-length') {
      continue
    }

    // 跳过 Transfer-Encoding（让 Next.js 自动处理）
    if (lowerKey === 'transfer-encoding') {
      continue
    }

    // 对于 Set-Cookie，使用 append（支持多个同名 header）
    if (lowerKey === 'set-cookie') {
      const cookies = Array.isArray(value) ? value : [value]
      for (const cookie of cookies) {
        headers.append('Set-Cookie', cookie as string)
      }
    } else {
      // 跳过原始的 CORS headers（我们会重新设置）
      if (!lowerKey.startsWith('access-control-')) {
        // 如果是数组，只取第一个值
        const headerValue = Array.isArray(value) ? value[0] : value
        headers.set(key, headerValue as string)
      }
    }
  }

  // 添加 CORS headers（覆盖原有的）
  if (corsEnabled) {
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', '*')
    headers.set('Access-Control-Allow-Credentials', 'true')  // 关键：允许携带 credentials
  }

  // NextResponse 会自动计算 Content-Length，不需要手动设置
  const nextResponse = new NextResponse(responseBody, {
    status: response.status,
    headers,
  })

  return nextResponse
}
