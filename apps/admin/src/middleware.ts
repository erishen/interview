import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js 中间件 - Admin 项目
 * 在请求到达页面或 API 路由之前应用安全头
 */
export function middleware(request: NextRequest) {
  // 创建响应
  const response = NextResponse.next()  // 管理员专用安全头
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

  const adminSecurityHeaders: SecurityHeaders = {
    // 防止点击劫持
    'X-Frame-Options': 'DENY', // Admin 使用更严格的 DENY
    
    // 防止 MIME 类型嗅探
    'X-Content-Type-Options': 'nosniff',
    
    // XSS 防护
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'same-origin',
    
    // 权限策略 - 管理员面板限制更多功能
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    
    // Content Security Policy - 管理员专用更严格的策略
    'Content-Security-Policy': process.env.NODE_ENV === 'development' ? [
      // 开发环境：允许 unsafe-eval 以支持热重载
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self' ws: wss:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ') : [
      // 生产环境：严格的 CSP 配置
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // 移除 unsafe-eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'", // 额外的点击劫持防护
    ].join('; '),
    
    // 管理员专用安全头
    'X-Admin-Protection': 'enabled',
  }
  
  // 在生产环境中添加 HSTS
  if (process.env.NODE_ENV === 'production') {
    adminSecurityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }
  
  // 应用所有安全头
  Object.entries(adminSecurityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // 移除可能泄露信息的头
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  
  // 为管理员路由添加额外的安全检查
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/admin')) {
    
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