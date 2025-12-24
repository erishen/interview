import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js 中间件
 * 在请求到达页面或 API 路由之前应用安全头
 */
export function middleware(request: NextRequest) {
  // 创建响应
  const response = NextResponse.next()
  
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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
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