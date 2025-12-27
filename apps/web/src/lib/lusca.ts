import lusca from 'lusca'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Lusca 安全中间件配置
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
  
  // Content Security Policy
  csp: {
    policy: {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
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
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // CSP 头
    const cspValue = Object.entries(luscaConfig.csp.policy)
      .map(([directive, value]) => `${directive} ${Array.isArray(value) ? value.join(' ') : value}`)
      .join('; ')
    response.headers.set('Content-Security-Policy', cspValue)
    
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
   * 使用 crypto 生成安全的随机字符串
   */
  private static generateSecureRandom(length: number = 32): string {
    const crypto = require('crypto')
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
  }

  /**
   * 使用 HMAC 生成安全的 CSRF Token
   */
  static generateToken(): string {
    const crypto = require('crypto')
    const timestamp = Date.now().toString()
    const randomBytes = crypto.randomBytes(16).toString('hex')

    // 使用 HMAC 签名，防止伪造
    const hmac = crypto.createHmac('sha256', this.SECRET)
    hmac.update(`${timestamp}:${randomBytes}`)
    const signature = hmac.digest('hex')

    // 格式: timestamp:randomBytes:signature
    return Buffer.from(`${timestamp}:${randomBytes}:${signature}`).toString('base64')
  }

  /**
   * 验证 CSRF Token
   */
  static validateToken(token: string): boolean {
    try {
      const crypto = require('crypto')
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const parts = decoded.split(':')

      if (parts.length !== 3) {
        return false
      }

      const [timestamp, randomBytes, signature] = parts

      // 验证时间戳（1小时内有效）
      const tokenTime = parseInt(timestamp, 10)
      const currentTime = Date.now()
      const oneHour = 60 * 60 * 1000

      if (isNaN(tokenTime) || (currentTime - tokenTime) >= oneHour) {
        return false
      }

      // 使用 HMAC 验证签名
      const hmac = crypto.createHmac('sha256', this.SECRET)
      hmac.update(`${timestamp}:${randomBytes}`)
      const expectedSignature = hmac.digest('hex')

      // 使用恒定时间比较，防止时序攻击
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    } catch {
      return false
    }
  }
}

/**
 * 安全工具函数
 */
export const SecurityUtils = {
  /**
   * 清理 XSS 攻击的字符串（改进版）
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }

    return input
      .replace(/[<>]/g, '') // 移除尖括号
      .replace(/javascript:/gi, '') // 移除 javascript: 协议
      .replace(/on\w+=/gi, '') // 移除事件处理器
      .replace(/data:/gi, '') // 移除 data: 协议
      .replace(/vbscript:/gi, '') // 移除 vbscript: 协议
      .replace(/&lt;/g, '<') // 恢复 HTML 实体（如果需要）
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .trim()
  },

  /**
   * 验证邮箱格式
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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
   * 使用 crypto 生成安全的随机字符串
   */
  generateSecureRandom(length: number = 32): string {
    const crypto = require('crypto')
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
  },
}