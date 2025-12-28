import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import {
  isKVConfigured,
  getDoc as kvGetDoc,
  createDoc as kvCreateDoc,
  updateDoc as kvUpdateDoc,
  deleteDoc as kvDeleteDoc,
  getTrashDocs as kvGetTrashDocs,
  restoreDoc as kvRestoreDoc,
  deleteFromTrash as kvDeleteFromTrash
} from '@/lib/kv-store'
import {
  isSupabaseConfigured,
  getDoc as supabaseGetDoc,
  updateDoc as supabaseUpdateDoc,
  deleteDoc as supabaseDeleteDoc,
  getTrashDocs as supabaseGetTrashDocs,
  restoreDoc as supabaseRestoreDoc,
  deleteFromTrash as supabaseDeleteFromTrash
} from '@/lib/supabase-store'
import { getDocsDir } from '@/lib/docs-path'

// 本地开发目录
const DOCS_DIR = getDocsDir()
const TRASH_DIR = path.join(DOCS_DIR, '.trash')

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

  return { valid: true }
}

// CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
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

// 保存版本（本地开发）
async function saveVersion(slug: string, content: string, message: string, user: any): Promise<void> {
  if (isKVConfigured()) {
    // Vercel KV 暂不支持版本控制
    return
  }

  const VERSIONS_DIR = path.join(DOCS_DIR, '.versions')
  if (!fs.existsSync(VERSIONS_DIR)) {
    fs.mkdirSync(VERSIONS_DIR, { recursive: true })
  }

  const versionId = Date.now().toString()
  const versionPath = path.join(VERSIONS_DIR, `${slug}_${versionId}.json`)

  const versionData = {
    slug,
    content,
    message,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    timestamp: new Date().toISOString(),
  }

  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2), 'utf-8')
}

// 获取文档
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // 公开访问，不需要登录验证
  // const session = await verifyAuth(request)
  // if (!session) {
  //   return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  // }

  try {
    const { slug } = params

    // 验证 slug 格式
    const slugValidation = isValidSlug(slug)
    if (!slugValidation.valid) {
      return NextResponse.json({ success: false, error: slugValidation.error }, { status: 400 })
    }

    let doc

    if (isSupabaseConfigured()) {
      // 使用 Supabase 存储
      doc = await supabaseGetDoc(slug)
    } else if (isKVConfigured()) {
      // 使用 Vercel KV 存储
      doc = await kvGetDoc(slug)
    } else {
      // 文件系统存储（本地开发）
      const filePath = path.join(DOCS_DIR, `${slug}.md`)
      if (!fs.existsSync(filePath)) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 }))
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const stats = fs.statSync(filePath)

      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : slug

      const descMatch = content.match(/^> (.+)$/m)
      const description = descMatch ? descMatch[1] : undefined

      doc = {
        slug,
        title,
        description,
        content,
        created_at: stats.birthtime.toISOString(),
        updated_at: stats.mtime.toISOString(),
      }
    }

    if (!doc) {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 }))
    }

    return setCorsHeaders(NextResponse.json({
      success: true,
      doc,
    }))
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to load document' }, { status: 500 }))
  }
}

// 更新文档
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await verifyAuth(request)
  if (!session) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  }

  try {
    const { slug } = params
    const { content, message = '更新文档' } = await request.json()

    if (!content) {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 }))
    }

    // 验证 slug 格式
    const slugValidation = isValidSlug(slug)
    if (!slugValidation.valid) {
      return setCorsHeaders(NextResponse.json({ success: false, error: slugValidation.error }, { status: 400 }))
    }

    let success

    if (isSupabaseConfigured()) {
      // 使用 Supabase 存储
      const existingDoc = await supabaseGetDoc(slug)
      if (!existingDoc) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 }))
      }

      // 提取标题（从内容中）
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : slug

      success = await supabaseUpdateDoc(slug, title, content)
    } else if (isKVConfigured()) {
      // 使用 Vercel KV 存储
      const existingDoc = await kvGetDoc(slug)
      if (!existingDoc) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 }))
      }

      // 提取标题（从内容中）
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : slug

      success = await kvUpdateDoc(slug, title, content)
    } else {
      // 文件系统存储（本地开发）
      const filePath = path.join(DOCS_DIR, `${slug}.md`)

      if (!fs.existsSync(filePath)) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 }))
      }

      // 在更新前保存当前版本
      const currentContent = fs.readFileSync(filePath, 'utf-8')
      await saveVersion(slug, currentContent, message, session.user)

      // 更新文档
      fs.writeFileSync(filePath, content, 'utf-8')
      success = true
    }

    if (success) {
      // 记录操作日志（异步，不等待结果）
      logDocAction('update', slug, session)
      return setCorsHeaders(NextResponse.json({ success: true, message: 'Document updated' }))
    } else {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to update document' }, { status: 500 }))
    }
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to update document' }, { status: 500 }))
  }
}

// 删除文档
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await verifyAuth(request)
  if (!session) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  }

  try {
    const { slug } = params

    // 验证 slug 格式
    const slugValidation = isValidSlug(slug)
    if (!slugValidation.valid) {
      return setCorsHeaders(NextResponse.json({ success: false, error: slugValidation.error }, { status: 400 }))
    }

    let success

    if (isSupabaseConfigured()) {
      // 使用 Supabase 存储
      success = await supabaseDeleteDoc(slug)
    } else if (isKVConfigured()) {
      // 使用 Vercel KV 存储
      success = await kvDeleteDoc(slug)
    } else {
      // 文件系统存储（本地开发）
      const filePath = path.join(DOCS_DIR, `${slug}.md`)

      if (!fs.existsSync(filePath)) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 }))
      }

      // 软删除：移动到回收站
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const trashFileName = `${slug}_${timestamp}.md`
      const trashPath = path.join(TRASH_DIR, trashFileName)

      if (!fs.existsSync(TRASH_DIR)) {
        fs.mkdirSync(TRASH_DIR, { recursive: true })
      }

      fs.renameSync(filePath, trashPath)
      success = true
    }

    if (success) {
      // 记录操作日志（异步，不等待结果）
      logDocAction('delete', slug, session)
      return setCorsHeaders(NextResponse.json({ success: true, message: 'Document moved to trash' }))
    } else {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to delete document' }, { status: 500 }))
    }
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to delete document' }, { status: 500 }))
  }
}

// 恢复文档（从回收站移回）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await verifyAuth(request)
  if (!session) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  }

  try {
    const { slug } = params
    const { action } = await request.json()

    if (action !== 'restore') {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 }))
    }

    let success

    if (isSupabaseConfigured()) {
      // 使用 Supabase 存储
      // 查找回收站中的文件（需要 timestamp）
      const trashDocs = await supabaseGetTrashDocs()
      const trashDoc = trashDocs.find(d => d.slug === slug)

      if (!trashDoc) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found in trash' }, { status: 404 }))
      }

      success = await supabaseRestoreDoc(slug, trashDoc.trash_timestamp)
    } else if (isKVConfigured()) {
      // 使用 Vercel KV 存储
      // 查找回收站中的文件（需要 timestamp）
      const trashDocs = await kvGetTrashDocs()
      const trashDoc = trashDocs.find(d => d.slug === slug)

      if (!trashDoc) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found in trash' }, { status: 404 }))
      }

      success = await kvRestoreDoc(slug, trashDoc.trash_timestamp)
    } else {
      // 文件系统存储（本地开发）
      const trashFiles = fs.readdirSync(TRASH_DIR)
      console.log('[Restore] Looking for slug:', slug)
      console.log('[Restore] Available trash files:', trashFiles)
      const trashFile = trashFiles.find(f => f.startsWith(`${slug}_`))
      console.log('[Restore] Found trash file:', trashFile)

      if (!trashFile) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found in trash' }, { status: 404 }))
      }

      const trashPath = path.join(TRASH_DIR, trashFile)
      const restorePath = path.join(DOCS_DIR, `${slug}.md`)

      // 检查目标文件是否已存在
      if (fs.existsSync(restorePath)) {
        return setCorsHeaders(NextResponse.json({ success: false, error: 'Document already exists' }, { status: 409 }))
      }

      fs.renameSync(trashPath, restorePath)
      success = true
    }

    if (success) {
      return setCorsHeaders(NextResponse.json({ success: true, message: 'Document restored' }))
    } else {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to restore document' }, { status: 500 }))
    }
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to restore document' }, { status: 500 }))
  }
}
