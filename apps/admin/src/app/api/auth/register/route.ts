import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { rateLimiters } from '@/lib/rate-limit'
import { AdminSecurityUtils } from '@/lib/lusca'
import { redisCache } from '@/lib/redis'

// Mock user database - replace with your actual database
const users: any[] = []

/**
 * 验证密码强度
 */
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = await rateLimiters.register.check(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many registration attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const { email, password, name } = await request.json()

    // 输入验证
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, and name are required' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    if (!AdminSecurityUtils.validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // 验证名称（清理和长度检查）
    const sanitizedName = AdminSecurityUtils.sanitizeInput(name).trim()
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      )
    }

    // 从 Redis 检查用户是否已存在（或使用你的实际数据库）
    try {
      const existingUserEmail = await redisCache.get(`user:email:${email}`)
      if (existingUserEmail) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        )
      }
    } catch (redisError) {
      console.error('[Register] Redis error checking existing user:', redisError)
      // 降级到内存检查（仅用于开发/测试）
      const existingUser = users.find((user) => user.email === email)
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const userId = Date.now().toString()
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      name: sanitizedName,
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    // 保存到 Redis（或你的实际数据库）
    try {
      await redisCache.set(`user:${userId}`, newUser, 86400) // 24 小时
      await redisCache.set(`user:email:${email}`, userId, 86400)
    } catch (redisError) {
      console.error('[Register] Failed to save user to Redis:', redisError)
      // 降级到内存存储
      users.push(newUser)
    }

    // 记录注册事件（安全审计）
    AdminSecurityUtils.logSecurityEvent('USER_REGISTRATION', {
      userId,
      email: AdminSecurityUtils.sanitizeInput(email),
      ip: AdminSecurityUtils.getClientIp(request),
      userAgent: AdminSecurityUtils.getSafeUserAgent(request),
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    )

    // 添加速率限制响应头
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())

    return response
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      console.error('[Register] Registration error:', error)
    } else {
      console.error('[Register] Registration error occurred')
      AdminSecurityUtils.logSecurityEvent('REGISTRATION_ERROR', {
        error: (error as Error).message,
      })
    }

    return NextResponse.json(
      {
        error: isDev ? (error as Error).message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
