import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const DOCS_DIR = path.join(process.cwd(), '../../docs')
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8081'
const DOC_LOG_API_KEY = process.env.DOC_LOG_API_KEY || ''

// CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handle OPTIONS for preflight requests
export async function OPTIONS(_request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return setCorsHeaders(response)
}

// 权限验证中间件 - 支持 NextAuth 和 Passport.js
async function verifyAuth(request: NextRequest) {
  // 1. 尝试 NextAuth session
  const session = await getServerSession(authOptions)
  if (session) {
    console.log('[Docs API] NextAuth session found:', session.user?.email)
    return { user: session.user, authMethod: 'nextauth' }
  }

  // 2. 尝试 Passport.js (检查 X-User-Id header)
  const userId = request.headers.get('X-User-Id')
  const userEmail = request.headers.get('X-User-Email')

  if (userId && userEmail) {
    console.log('[Docs API] Passport user found:', userEmail)
    return {
      user: {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
      },
      authMethod: 'passport'
    }
  }

  console.log('[Docs API] No session found')
  return null
}

// 记录文档操作到 FastAPI
async function logDocAction(
  action: 'create' | 'update' | 'delete',
  docSlug: string,
  authResult: { user: any; authMethod: string } | null
) {
  if (!authResult?.user) return

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    // 如果配置了 API Key，添加到请求头
    if (DOC_LOG_API_KEY) {
      headers['X-API-Key'] = DOC_LOG_API_KEY
    }

    await fetch(`${FASTAPI_URL}/api/docs/log`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action,
        doc_slug: docSlug,
        user_id: authResult.user.id || '',
        user_email: authResult.user.email || '',
        user_name: authResult.user.name || '',
        auth_method: authResult.authMethod,
      }),
    }).catch(err => {
      console.warn('[Docs API] Failed to log action:', err)
    })
  } catch (error) {
    console.warn('[Docs API] Error logging action:', error)
  }
}

// 获取文档列表
export async function GET(request: NextRequest) {
  const session = await verifyAuth(request)
  if (!session) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  }
  try {
    if (!fs.existsSync(DOCS_DIR)) {
      return NextResponse.json({ success: false, error: 'Docs directory not found' }, { status: 404 })
    }

    const files = fs.readdirSync(DOCS_DIR)
    const docs = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const slug = file.replace(/\.md$/, '')
        const filePath = path.join(DOCS_DIR, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : slug
        
        const descMatch = content.match(/^> (.+)$/m)
        const description = descMatch ? descMatch[1] : undefined

        return { slug, title, description }
      })

    return setCorsHeaders(NextResponse.json({ success: true, docs }))
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to load docs' }, { status: 500 }))
  }
}

// 创建新文档
export async function POST(request: NextRequest) {
  const session = await verifyAuth(request)
  if (!session) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  }

  try {
    const { slug, title, content } = await request.json()

    if (!slug || !title || !content) {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 }))
    }

    const filePath = path.join(DOCS_DIR, `${slug}.md`)

    if (fs.existsSync(filePath)) {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Document already exists' }, { status: 409 }))
    }

    fs.writeFileSync(filePath, content, 'utf-8')

    // 记录操作日志（异步，不等待结果）
    logDocAction('create', slug, session)

    return setCorsHeaders(NextResponse.json({ success: true, message: 'Document created' }))
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to create document' }, { status: 500 }))
  }
}
