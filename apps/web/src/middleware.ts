import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, type Locale } from './i18n/request'

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'zh',
  localePrefix: 'always'
})

/**
 * Next.js 中间件
 * 在请求到达页面或 API 路由之前应用安全头和国际化路由
 */
export function middleware(request: NextRequest) {
  // 特殊处理：如果访问根路径，重定向到默认语言
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/zh', request.url))
  }
  
  // 首先应用国际化路由
  const intlResponse = intlMiddleware(request)
  
  // 如果 intlMiddleware 返回了响应（重定向等），则直接返回
  if (intlResponse && !intlResponse.headers.get('x-middleware-skip')) {
    return addSecurityHeaders(intlResponse)
  }
  
  // 否则创建新响应并添加安全头
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

/**
 * 添加安全头到响应
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // 添加安全头
  const securityHeaders: Record<string, string> = {
    // 防止点击劫持
    'X-Frame-Options': 'SAMEORIGIN',

    // 防止 MIME 类型嗅探
    'X-Content-Type-Options': 'nosniff',

    // XSS 防护
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'same-origin',

    // 权限策略
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  }
  
  // 在生产环境中添加 HSTS
  if (process.env.NODE_ENV === 'production') {
    securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }
  
  // 应用所有安全头
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // 移除 X-Powered-By 头（如果存在）
  response.headers.delete('X-Powered-By')
  
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