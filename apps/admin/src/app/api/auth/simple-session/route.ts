import { NextRequest, NextResponse } from 'next/server'
import { AdminSecurityUtils } from '@/lib/lusca'
import { redisCache } from '@/lib/redis'

// Mark this route as dynamic since it uses cookies
export const dynamic = 'force-dynamic'

/**
 * 验证会话令牌格式
 */
function isValidSessionToken(token: string): boolean {
  // 期望格式：64 个十六进制字符（32 字节）
  return /^[a-f0-9]{64}$/.test(token)
}

export async function GET(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionToken = request.cookies.get('admin-session')?.value

    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }

    // 验证令牌格式
    if (!isValidSessionToken(sessionToken)) {
      // 清除无效的 cookie
      const response = NextResponse.json({
        authenticated: false,
        user: null,
        error: 'Invalid session',
      })
      response.cookies.delete('admin-session')
      return response
    }

    // 从 Redis 检查会话是否存在
    try {
      const sessionData = await redisCache.get(`session:${sessionToken}`)

      if (!sessionData) {
        // 会话不存在或已过期
        const response = NextResponse.json({
          authenticated: false,
          user: null,
          error: 'Session expired',
        })
        response.cookies.delete('admin-session')
        return response
      }

      // 会话有效
      return NextResponse.json({
        authenticated: true,
        user: (sessionData as any).user,
        expires: (sessionData as any).expires,
      })
    } catch (redisError) {
      // Redis 失败时的降级处理
      const isDev = process.env.NODE_ENV === 'development'

      if (isDev) {
        console.error('[Simple-Session] Redis error:', redisError)
      }

      // 如果 Redis 不可用，我们仍然返回验证结果
      // 但在生产环境中应该拒绝访问
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({
          authenticated: false,
          user: null,
          error: 'Session verification failed',
        }, { status: 500 })
      }

      // 开发环境允许通过
      return NextResponse.json({
        authenticated: true,
        user: {
          id: '1',
          email: process.env.ADMIN_EMAIL || 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

  } catch (error) {
    // 安全的错误处理
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      console.error('[Simple-Session] Session error:', error)
    } else {
      // 生产环境记录关键信息
      AdminSecurityUtils.logSecurityEvent('SESSION_ERROR', {
        ip: AdminSecurityUtils.getClientIp(request),
        userAgent: AdminSecurityUtils.getSafeUserAgent(request),
      })
    }

    return NextResponse.json({
      authenticated: false,
      user: null,
      error: isDev ? (error as Error).message : 'Session check failed',
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value

    if (sessionToken && isValidSessionToken(sessionToken)) {
      // 从 Redis 删除会话
      try {
        await redisCache.delete(`session:${sessionToken}`)
      } catch (redisError) {
        console.error('[Simple-Session] Failed to delete session from Redis:', redisError)
      }
    }

    // 清除 cookie
    const response = NextResponse.json({
      success: true,
      message: 'Session terminated',
    })
    response.cookies.delete('admin-session')

    return response

  } catch (error) {
    console.error('[Simple-Session] Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to terminate session',
    }, { status: 500 })
  }
}
