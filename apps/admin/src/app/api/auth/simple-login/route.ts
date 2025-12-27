import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { rateLimiters } from '@/lib/rate-limit'

/**
 * 安全的随机令牌生成器
 */
function generateSecureToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

/**
 * 环境变量验证
 */
function validateEnv() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHashBase64 = process.env.NEXTAUTH_ADMIN_PASSWORD_HASH_BASE64

  if (!adminEmail || !adminPasswordHashBase64) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables: ADMIN_EMAIL or NEXTAUTH_ADMIN_PASSWORD_HASH_BASE64')
    } else {
      console.warn('[Simple-Login] Using fallback credentials for development only')
    }
  }
}

/**
 * 解码 Base64 编码的 bcrypt hash
 */
function decodeBase64Hash(base64Hash: string): string {
  try {
    return Buffer.from(base64Hash, 'base64').toString('utf-8')
  } catch (error) {
    console.error('[Simple-Login] Failed to decode Base64 hash:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证环境变量
    validateEnv()

    // 应用速率限制
    const rateLimitResult = await rateLimiters.login.check(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Too many login attempts. Please try again later.',
      }, {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000).toString(),
        },
      })
    }

    const body = await request.json()
    const { email, password } = body

    // 输入验证
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format',
      }, { status: 400 })
    }

    // 从环境变量获取管理员凭据
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const adminPasswordHashBase64 = process.env.NEXTAUTH_ADMIN_PASSWORD_HASH_BASE64
    const adminPasswordHash = adminPasswordHashBase64 ? decodeBase64Hash(adminPasswordHashBase64) : ''

    // 验证凭据
    if (email !== adminEmail) {
      // 不暴露邮箱是否存在
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 })
    }

    // 验证密码
    let isPasswordValid = false
    if (adminPasswordHash) {
      isPasswordValid = await bcrypt.compare(password, adminPasswordHash)
    } else if (process.env.NODE_ENV !== 'production' && password === 'admin123') {
      // 仅开发环境允许明文密码
      isPasswordValid = true
    }

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 })
    }

    // 生成安全的会话令牌
    const sessionToken = generateSecureToken()

    const response = NextResponse.json({
      success: true,
      user: {
        id: '1',
        email: adminEmail,
        name: 'Admin User',
        role: 'admin',
      },
      sessionToken,
    })

    // 设置会话 Cookie
    response.cookies.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    })

    // 设置速率限制响应头
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())

    return response

  } catch (error) {
    // 生产环境不暴露详细错误
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      console.error('[Simple-Login] Login error:', error)
    } else {
      console.error('[Simple-Login] Login error occurred')
    }

    return NextResponse.json({
      success: false,
      error: isDev ? (error as Error).message : 'Internal server error',
    }, { status: 500 })
  }
}