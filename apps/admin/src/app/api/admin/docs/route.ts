import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import { isKVConfigured, getAllDocs, createDoc as kvCreateDoc, updateDoc as kvUpdateDoc, deleteDoc as kvDeleteDoc, getTrashDocs, restoreDoc as kvRestoreDoc, deleteFromTrash as kvDeleteFromTrash } from '@/lib/kv-store'

// 安全验证：检查 slug 格式，防止路径遍历攻击
function isValidSlug(slug: string): { valid: boolean; error?: string } {
  // 长度限制
  if (slug.length === 0) return { valid: false, error: 'Slug 不能为空' }
  if (slug.length > 100) return { valid: false, error: 'Slug 不能超过 100 个字符' }

  // 格式限制：只允许小写字母、数字、连字符和下划线
  const validPattern = /^[a-z0-9_-]+$/i
  if (!validPattern.test(slug)) {
    return { valid: false, error: 'Slug 只能包含小写字母、数字、连字符(-)和下划线(_)' }
  }

  // 防止路径遍历攻击
  const dangerousPatterns = ['..', '/', '\\', '\0', '\n', '\r']
  for (const pattern of dangerousPatterns) {
    if (slug.includes(pattern)) {
      return { valid: false, error: 'Slug 包含非法字符' }
    }
  }

  // 预留的 slug 名称
  const reservedSlugs = ['new', 'edit', 'delete', 'api', 'admin']
  if (reservedSlugs.includes(slug.toLowerCase())) {
    return { valid: false, error: '此文件名已被保留' }
  }

  return { valid: true }
}

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
    return { user: session.user, authMethod: 'nextauth' }
  }

  // 2. 尝试 Passport.js (检查 X-User-Id header)
  const userId = request.headers.get('X-User-Id')
  const userEmail = request.headers.get('X-User-Email')

  if (userId && userEmail) {
    return {
      user: {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
      },
      authMethod: 'passport'
    }
  }

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
    // 构建完整 URL（服务器端需要完整 URL）
    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3003}`

    const response = await fetch(`${baseUrl}/api/fastapi/api/docs/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        doc_slug: docSlug,
        user_id: authResult.user.id || '',
        user_email: authResult.user.email || '',
        user_name: authResult.user.name || '',
        auth_method: authResult.authMethod,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn('[Docs API] Log action failed:', response.status, errorText)
    }
  } catch (error) {
    // 静默失败，不影响文档操作
    console.warn('[Docs API] Error logging action:', error)
  }
}

// 获取文档列表（支持回收站）
export async function GET(request: NextRequest) {
  const session = await verifyAuth(request)
  if (!session) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  }

  // 获取查询参数
  const { searchParams } = new URL(request.url)
  const trash = searchParams.get('trash') === 'true'

  try {
    let docs

    if (isKVConfigured()) {
      // 使用 Vercel KV 存储
      if (trash) {
        docs = await getTrashDocs()
      } else {
        docs = await getAllDocs()
      }
    } else {
      // 文件系统存储（本地开发）
      const DOCS_DIR = path.join(process.cwd(), '../../docs')
      const TRASH_DIR = path.join(DOCS_DIR, '.trash')
      const targetDir = trash ? TRASH_DIR : DOCS_DIR

      if (!fs.existsSync(targetDir)) {
        return NextResponse.json({ success: false, error: 'Directory not found' }, { status: 404 })
      }

      const files = fs.readdirSync(targetDir)
      docs = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
          // 回收站文件格式: slug_2025-12-26T00-53-17-764Z.md
          const slug = trash ? file.replace(/_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.md$/, '') : file.replace(/\.md$/, '')
          const filePath = path.join(targetDir, file)
          const content = fs.readFileSync(filePath, 'utf-8')
          const stats = fs.statSync(filePath)

          const titleMatch = content.match(/^#\s+(.+)$/m)
          const title = titleMatch ? titleMatch[1] : slug

          const descMatch = content.match(/^> (.+)$/m)
          const description = descMatch ? descMatch[1] : undefined

          return { slug, title, description, created_at: stats.birthtime.toISOString(), updated_at: stats.mtime.toISOString() }
        })
        // 按创建时间倒序排列
        .sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB.getTime() - dateA.getTime()
        })
    }

    return setCorsHeaders(NextResponse.json({ success: true, docs, isTrash: trash }))
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

    // 验证 slug 格式
    const slugValidation = isValidSlug(slug)
    if (!slugValidation.valid) {
      return setCorsHeaders(NextResponse.json({ success: false, error: slugValidation.error }, { status: 400 }))
    }

    let success

    if (isKVConfigured()) {
      // 使用 Vercel KV 存储
      success = await kvCreateDoc(slug, title, content)
    } else {
      // 文件系统存储（本地开发）
      const DOCS_DIR = path.join(process.cwd(), '../../docs')
      const filePath = path.join(DOCS_DIR, `${slug}.md`)

      if (fs.existsSync(filePath)) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document already exists' }, { status: 409 }))
      }

      // 规范化路径，防止路径遍历
      const normalizedPath = path.normalize(filePath)
      if (!normalizedPath.startsWith(path.normalize(DOCS_DIR))) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Invalid slug' }, { status: 400 }))
      }

      fs.writeFileSync(filePath, content, 'utf-8')
      success = true
    }

    if (success) {
      // 记录操作日志（异步，不等待结果）
      logDocAction('create', slug, session)
      return setCorsHeaders(NextResponse.json({ success: true, message: 'Document created' }))
    } else {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to create document' }, { status: 500 }))
    }
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to create document' }, { status: 500 }))
  }
}
