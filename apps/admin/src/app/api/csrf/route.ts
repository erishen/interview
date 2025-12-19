import { NextRequest, NextResponse } from 'next/server'
import { CSRFProtection, AdminSecurityUtils } from '@/lib/lusca'

/**
 * 管理员 CSRF Token API 路由
 * 用于生成和验证 CSRF Token
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // 生成新的 CSRF Token
    const token = CSRFProtection.generateToken()
    
    AdminSecurityUtils.logSecurityEvent('CSRF_TOKEN_GENERATED', {
      userAgent: req.headers.get('user-agent'),
      ip: req.ip || 'unknown'
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