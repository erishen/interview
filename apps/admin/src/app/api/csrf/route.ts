import { NextRequest, NextResponse } from 'next/server'
import { CSRFProtection, AdminSecurityUtils } from '@/lib/lusca'

// Mark this route as dynamic since it uses cookies and headers
export const dynamic = 'force-dynamic'

/**
 * 管理员 CSRF Token API 路由
 * 用于生成和验证 CSRF Token
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // 生成新的 CSRF Token
    const token = CSRFProtection.generateToken()
    
    // 获取客户端IP地址
    const getClientIP = (request: NextRequest): string => {
      // 尝试多种方式获取IP地址
      const forwardedFor = request.headers.get('x-forwarded-for')
      const realIP = request.headers.get('x-real-ip')
      const cfConnectingIP = request.headers.get('cf-connecting-ip')

      // 优先级：CF-Connecting-IP > X-Real-IP > X-Forwarded-For > req.ip > localhost
      if (cfConnectingIP) {
        return cfConnectingIP.split(',')[0].trim()
      }
      if (realIP) {
        return realIP.split(',')[0].trim()
      }
      if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
      }
      if (request.ip) {
        return request.ip
      }

      // 在开发环境中，如果都没有，返回开发环境的标识
      return process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown'
    }

    AdminSecurityUtils.logSecurityEvent('CSRF_TOKEN_GENERATED', {
      userAgent: req.headers.get('user-agent'),
      ip: getClientIP(req)
    })
    
    const response = NextResponse.json({
      token,
      message: 'Admin CSRF token generated successfully',
      timestamp: new Date().toISOString(),
    })
    
    // 设置 CSRF Token 到 Cookie
    response.cookies.set('_csrf', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1小时
      path: '/',
    })
    
    return response
  } catch (error) {
    AdminSecurityUtils.logSecurityEvent('CSRF_TOKEN_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json(
      { error: 'Failed to generate admin CSRF token' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { token, userRole } = body
    
    if (!token) {
      AdminSecurityUtils.logSecurityEvent('CSRF_VALIDATION_FAILED', {
        reason: 'Missing token',
        userRole
      })
      
      return NextResponse.json(
        { error: 'CSRF token is required for admin operations' },
        { status: 400 }
      )
    }
    
    // 验证管理员权限
    if (userRole && !AdminSecurityUtils.validateAdminAccess(userRole)) {
      AdminSecurityUtils.logSecurityEvent('UNAUTHORIZED_CSRF_VALIDATION', {
        userRole,
        token: token.substring(0, 10) + '...' // 只记录部分 token
      })
      
      return NextResponse.json(
        { error: 'Admin privileges required for CSRF validation' },
        { status: 403 }
      )
    }
    
    // 验证 CSRF Token
    const isValid = CSRFProtection.validateToken(token)
    
    if (!isValid) {
      AdminSecurityUtils.logSecurityEvent('CSRF_VALIDATION_FAILED', {
        reason: 'Invalid or expired token',
        userRole
      })
      
      return NextResponse.json(
        { error: 'Invalid or expired admin CSRF token' },
        { status: 403 }
      )
    }
    
    AdminSecurityUtils.logSecurityEvent('CSRF_VALIDATION_SUCCESS', {
      userRole
    })
    
    return NextResponse.json({
      message: 'Admin CSRF token is valid',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    AdminSecurityUtils.logSecurityEvent('CSRF_VALIDATION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json(
      { error: 'Failed to validate admin CSRF token' },
      { status: 500 }
    )
  }
}