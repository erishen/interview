import { NextRequest, NextResponse } from 'next/server'
import { CSRFProtection } from '@/lib/lusca'

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

/**
 * CSRF Token API 路由
 * 用于生成和验证 CSRF Token
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // 生成新的 CSRF Token
    const token = CSRFProtection.generateToken()
    
    const response = NextResponse.json({
      token,
      message: 'CSRF token generated successfully',
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
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { token } = body
    
    if (!token) {
      return NextResponse.json(
        { error: 'CSRF token is required' },
        { status: 400 }
      )
    }
    
    // 验证 CSRF Token
    const isValid = CSRFProtection.validateToken(token)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired CSRF token' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      message: 'CSRF token is valid',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate CSRF token' },
      { status: 500 }
    )
  }
}