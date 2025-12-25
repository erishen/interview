import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
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
    console.log('[FastAPI Login] NextAuth Session:', JSON.stringify(session, null, 2))

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
      console.log('[FastAPI Login] User from header:', userHeader)
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
    console.log('[FastAPI Login] User role:', authUser.role)
    if (authUser.role !== 'admin') {
      return NextResponse.json({ error: `Forbidden - User role: ${authUser.role}` }, { status: 403 })
    }

    // 方法 1: 尝试使用 NextAuth token 获取 FastAPI token
    const nextAuthToken = await getNextAuthToken(request)
    if (nextAuthToken) {
      console.log('[FastAPI Login] Using NextAuth token')

      const response = await fetch(`${FASTAPI_URL}/auth/token-from-nextauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nextAuthToken}`
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          access_token: data.access_token,
          token_type: data.token_type,
        })
      } else {
        console.warn('[FastAPI Login] Failed to use NextAuth token, fallback to password')
      }
    }

    // 方法 2: 降级到使用密码登录
    console.log('[FastAPI Login] Using password login (fallback)')
    const formData = new URLSearchParams()
    formData.append('username', process.env.ADMIN_USERNAME || 'admin')
    formData.append('password', process.env.ADMIN_PASSWORD || 'secret')

    console.log('[FastAPI Login] FASTAPI_URL:', FASTAPI_URL)
    console.log('[FastAPI Login] Username:', process.env.ADMIN_USERNAME || 'admin')

    const response = await fetch(`${FASTAPI_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    })

    const responseText = await response.text()
    console.log('[FastAPI Login] Response status:', response.status)
    console.log('[FastAPI Login] Response body:', responseText)

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
