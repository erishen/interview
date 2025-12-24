import { NextRequest, NextResponse } from 'next/server'
import { fastApiConfig } from '../../packages/config/src/api'

export interface ProxyOptions {
  includeQueryParams?: boolean
  enableRedirectHandling?: boolean
  strictHeaders?: boolean
}

export interface ProxyResult {
  response: Response
  data: string
}

/**
 * 构造 FastAPI 请求 URL
 */
export function buildFastApiUrl(pathSegments: string[], includeQueryParams: boolean = false, request?: NextRequest): string {
  const filteredPath = pathSegments.filter(segment => segment.length > 0)

  // Special handling for endpoints that don't need trailing slash
  const isAuthEndpoint = filteredPath[0] === 'auth'
  const isRedisEndpoint = filteredPath[0] === 'redis'
  // Routes with parameters (like /items/123) don't need trailing slash
  const hasParameters = filteredPath.length > 1 && /^\d+$/.test(filteredPath[1])
  const needsTrailingSlash = !isAuthEndpoint && !isRedisEndpoint && !hasParameters

  const path = filteredPath.length > 0
    ? filteredPath.join('/') + (needsTrailingSlash ? '/' : '')
    : ''

  const baseUrl = `${fastApiConfig.baseUrl}/${path}`
  const queryString = includeQueryParams && request ? request.nextUrl.search : ''

  return `${baseUrl}${queryString}`
}

/**
 * 构造请求头
 */
export function buildHeaders(request: NextRequest, strict: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {}

  // 必须的认证头
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  if (strict) {
    // 严格模式：只转发必要的头
    const contentType = request.headers.get('content-type')
    if (contentType) {
      headers['Content-Type'] = contentType
    }
  } else {
    // 非严格模式：转发更多头
    const contentType = request.headers.get('content-type')
    if (contentType) {
      headers['Content-Type'] = contentType
    }

    const userAgent = request.headers.get('user-agent')
    if (userAgent) {
      headers['User-Agent'] = userAgent
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
 * 创建代理响应
 */
export function createProxyResponse(response: Response, data: string): NextResponse {
  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  })
}

/**
 * 通用的 FastAPI 代理函数
 */
export async function proxyToFastApi(
  request: NextRequest,
  method: string,
  params: { path: string[] },
  options: ProxyOptions = {}
): Promise<NextResponse> {
  const { includeQueryParams = false, enableRedirectHandling = false, strictHeaders = false } = options

  try {
    const url = buildFastApiUrl(params.path, includeQueryParams, request)
    const headers = buildHeaders(request, strictHeaders)

    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    // 对于有请求体的HTTP方法，添加body
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = await request.text()
    }

    // GET 请求可以处理重定向
    if (method.toUpperCase() === 'GET' && enableRedirectHandling) {
      fetchOptions.redirect = 'manual'
    }

    let response = await fetch(url, fetchOptions)

    // 处理重定向（仅GET请求）
    if (method.toUpperCase() === 'GET' && enableRedirectHandling) {
      response = await handleRedirect(response, headers, url)
    }

    const data = await response.text()

    return createProxyResponse(response, data)
  } catch (error) {
    console.error(`Proxy ${method} error:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
