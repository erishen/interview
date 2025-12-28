import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8081'

// 用户类型定义
interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

// 获取 NextAuth token
async function getNextAuthToken(request: NextRequest): Promise<string | null> {
  // 从 cookie 中获取 next-auth.session-token
  const cookies = request.cookies
  const sessionToken = cookies.get('next-auth.session-token') ||
                      cookies.get('__Secure-next-auth.session-token') ||
                      cookies.get('next-auth.csrf-token')

  return sessionToken?.value || null
}

export async function POST(request: NextRequest) {
  try {
    // 方法 1: 检查 NextAuth session
    const session = await getServerSession(authOptions)

    let authUser: AuthUser | null = null

    if (session?.user) {
      authUser = {
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        role: session.user.role || 'user'
      }
    }

    // 方法 2: 检查请求头中的用户信息（用于 Passport 登录）
    if (!authUser) {
      const userHeader = request.headers.get('x-auth-user')
      if (userHeader) {
        try {
          authUser = JSON.parse(userHeader)
        } catch (e) {
          console.error('[FastAPI Login] Failed to parse user header:', e)
        }
      }
    }

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized - No valid authentication found' }, { status: 401 })
    }

    // 只有 admin 角色才能获取 FastAPI token
    if (authUser.role !== 'admin') {
      return NextResponse.json({ error: `Forbidden - User role: ${authUser.role}` }, { status: 403 })
    }

    // 方法 1: 尝试使用 NextAuth token 获取 FastAPI token
    const nextAuthToken = await getNextAuthToken(request)
    if (nextAuthToken) {
      // 创建超时控制器
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000) // 30 秒超时

      const response = await fetch(`${FASTAPI_URL}/auth/token-from-nextauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nextAuthToken}`
        },
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          access_token: data.access_token,
          token_type: data.token_type,
        })
      }
    }

    // 方法 2: 降级到使用密码登录
    const formData = new URLSearchParams()
    formData.append('username', process.env.FASTAPI_ADMIN_USERNAME || 'admin')

    // 支持 BASE64 编码的密码
    let fastApiPassword = ''
    if (process.env.FASTAPI_ADMIN_PASSWORD_BASE64) {
      try {
        fastApiPassword = Buffer.from(process.env.FASTAPI_ADMIN_PASSWORD_BASE64, 'base64').toString('utf-8')
      } catch (err) {
        console.error('[FastAPI Login] Failed to decode BASE64 password:', err)
      }
    }
    formData.append('password', fastApiPassword || process.env.FASTAPI_ADMIN_PASSWORD || 'secret')

    // 创建超时控制器
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 秒超时

    const response = await fetch(`${FASTAPI_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: controller.signal
    })

    clearTimeout(timeout)

    const responseText = await response.text()

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to login to FastAPI',
        status: response.status,
        details: responseText
      }, { status: response.status })
    }

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('[FastAPI Login] Failed to parse response:', responseText)
      return NextResponse.json({
        error: 'Failed to parse FastAPI response',
        details: responseText
      }, { status: 500 })
    }

    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
    })
  } catch (error) {
    console.error('[FastAPI Login] Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
