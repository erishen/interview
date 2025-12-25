import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/config'

/**
 * Next.js 中间件 - Admin 项目
 * 在请求到达页面或 API 路由之前应用安全头
 */

// 创建国际化中间件
const intlMiddleware = createMiddleware(routing)

// 管理员专用安全头
interface SecurityHeaders {
  'X-Frame-Options': string
  'X-Content-Type-Options': string
  'X-XSS-Protection': string
  'Referrer-Policy': string
  'Permissions-Policy': string
  'Content-Security-Policy': string
  'X-Admin-Protection': string
  'Strict-Transport-Security'?: string
}

function getSecurityHeaders(): SecurityHeaders {
  const fastapiUrl = process.env.FASTAPI_URL || 'http://localhost:8081'

  const headers: SecurityHeaders = {
    // 防止点击劫持
    'X-Frame-Options': 'DENY',
    // 防止 MIME 类型嗅探
    'X-Content-Type-Options': 'nosniff',
    // XSS 防护
    'X-XSS-Protection': '1; mode=block',
    // Referrer Policy
    'Referrer-Policy': 'same-origin',
    // 权限策略 - 管理员面板限制更多功能
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    // Content Security Policy
    'Content-Security-Policy': process.env.NODE_ENV === 'development' ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      `connect-src 'self' ws: wss: ${fastapiUrl}`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ') : [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      `connect-src 'self' ${fastapiUrl}`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    // 管理员专用安全头
    'X-Admin-Protection': 'enabled',
  }

  // 在生产环境中添加 HSTS
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }

  return headers
}

export function middleware(request: NextRequest) {
  // 首先处理国际化
  const response = intlMiddleware(request)

  // 如果没有返回响应（通常不应该发生），使用默认响应
  if (!response) {
    return NextResponse.next()
  }

  // 如果是重定向响应，直接返回（语言切换时的重定向）
  if (response.headers.get('location')) {
    return response
  }

  // 获取安全头
  const securityHeaders = getSecurityHeaders()

  // 应用所有安全头
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // 移除可能泄露信息的头
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')

  // 为管理员路由添加额外的安全检查（考虑国际化前缀）
  const pathname = request.nextUrl.pathname
  const isDashboardRoute = pathname.match(/\/(?:en|zh)\/dashboard/) || pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.match(/\/(?:en|zh)\/admin/) || pathname.startsWith('/admin')

  if (isDashboardRoute || isAdminRoute) {
    // 添加管理员专用的安全头
    response.headers.set('X-Admin-Route', 'protected')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

/**
 * 配置中间件匹配的路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
