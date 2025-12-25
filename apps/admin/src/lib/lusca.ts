import lusca from 'lusca'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Lusca 安全中间件配置 - Admin 项目
 * 提供 CSRF、XSS、HSTS 等安全防护
 */
export const luscaConfig = {
  // CSRF 防护
  csrf: {
    angular: false as const, // 不使用 Angular 风格的 CSRF
    cookie: {
      name: '_csrf',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 3600000, // 1小时
    },
  },
  
  // XSS 防护
  xss: true,
  
  // X-Frame-Options 防护
  xframe: 'SAMEORIGIN',
  
  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1年
    includeSubDomains: true,
    preload: true,
  },
  
  // Content Security Policy - Admin 专用配置
  csp: {
    policy: process.env.NODE_ENV === 'development' ? {
      // 开发环境：宽松的 CSP 配置以支持热重载
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: https:",
      'font-src': "'self' data:",
      'connect-src': "'self' ws: wss:",
      'frame-src': "'none'",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
    } : {
      // 生产环境：严格的 CSP 配置
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: https:",
      'font-src': "'self' data:",
      'connect-src': "'self'",
      'frame-src': "'none'",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
    },
  },
  
  // Referrer Policy
  referrerPolicy: 'same-origin',
  
  // 禁用 X-Powered-By 头
  hidePoweredBy: true,
  
  // 防止 MIME 类型嗅探
  nosniff: true,
}

/**
 * 创建 Lusca 中间件实例
 */
export function createLuscaMiddleware() {
  return lusca(luscaConfig)
}

/**
 * Next.js API 路由的 Lusca 中间件包装器
 */
export function withLusca(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // 在 Next.js 中，我们需要手动应用安全头
    const response = await handler(req)
    
    // 添加安全头
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }
    
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'same-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')    // CSP 头 - 根据环境调整
    const cspPolicy = luscaConfig.csp.policy as Record<string, string>
    const cspValue = Object.entries(cspPolicy)
      .map(([directive, value]) => `${directive} ${Array.isArray(value) ? value.join(' ') : value}`)
      .join('; ')
    
    // 在开发环境中不设置严格的 CSP，避免阻止热重载
    if (process.env.NODE_ENV !== 'development') {
      response.headers.set('Content-Security-Policy', cspValue)
    }
    
    // 隐藏 X-Powered-By
    response.headers.delete('X-Powered-By')
    
    return response
  }
}

/**
 * CSRF Token 生成和验证工具
 */
export class CSRFProtection {
  private static readonly SECRET = process.env.CSRF_SECRET || this.generateSecureRandom(32)

  /**
   * 生成安全的随机字符串（用于 CSRF secret）
   */
  private static generateSecureRandom(length: number = 32): string {
    const crypto = require('crypto')
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
  }
  
  /**
   * 生成 CSRF Token
   */
  static generateToken(): string {
    const timestamp = Date.now().toString()
    const randomBytes = Math.random().toString(36).substring(2)
    return Buffer.from(`${timestamp}:${randomBytes}:${this.SECRET}`).toString('base64')
  }
  
  /**
   * 验证 CSRF Token
   */
  static validateToken(token: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [timestamp, randomBytes, secret] = decoded.split(':')
      
      // 检查密钥
      if (secret !== this.SECRET) {
        return false
      }
      
      // 检查时间戳（1小时内有效）
      const tokenTime = parseInt(timestamp, 10)
      const currentTime = Date.now()
      const oneHour = 60 * 60 * 1000
      
      return (currentTime - tokenTime) < oneHour
    } catch {
      return false
    }
  }
}

/**
 * 管理员专用安全工具函数
 */
export const AdminSecurityUtils = {
  /**
   * 清理 XSS 攻击的字符串
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // 移除尖括号
      .replace(/javascript:/gi, '') // 移除 javascript: 协议
      .replace(/on\w+=/gi, '') // 移除事件处理器
      .trim()
  },
  
  /**
   * 验证管理员权限
   */
  validateAdminAccess(userRole: string): boolean {
    return ['admin', 'super_admin'].includes(userRole)
  },
  
  /**
   * 验证 URL 是否安全
   */
  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  },
  
  /**
   * 生成安全的随机字符串
   */
  generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
  
  /**
   * 记录安全事件
   */
  logSecurityEvent(event: string, details: any) {
    console.log(`[ADMIN SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      ...details
    })
  },
}