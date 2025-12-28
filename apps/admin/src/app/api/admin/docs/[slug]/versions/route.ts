import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import { getDocsDir, getWritableDocsDir, ensureDocsSubdir, initializeWritableDocs } from '@/lib/docs-path'

// 初始化可写的 docs 目录（仅在 Vercel 生产环境）
initializeWritableDocs()

const DOCS_DIR = getDocsDir() // 只读目录
const WRITABLE_DOCS_DIR = getWritableDocsDir() // 可写目录
const VERSIONS_DIR = ensureDocsSubdir('.versions') || path.join(WRITABLE_DOCS_DIR, '.versions')

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
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handle OPTIONS for preflight requests
export async function OPTIONS(_request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return setCorsHeaders(response)
}

// 权限验证中间件
async function verifyAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session) {
    return { user: session.user, authMethod: 'nextauth' }
  }

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

// 获取文档版本列表
export async function GET(
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

    // 确保文档版本目录存在
    const docVersionDir = path.join(VERSIONS_DIR, slug)
    if (!fs.existsSync(docVersionDir)) {
      return setCorsHeaders(NextResponse.json({ success: true, versions: [] }))
    }

    // 读取版本列表
    const versionFiles = fs.readdirSync(docVersionDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const versionPath = path.join(docVersionDir, file)
        const content = fs.readFileSync(versionPath, 'utf-8')
        const version = JSON.parse(content)
        return version
      })
      // 按创建时间倒序排列（最新的在前）
      .sort((a, b) => {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return dateB.getTime() - dateA.getTime()
      })

    return setCorsHeaders(NextResponse.json({ success: true, versions: versionFiles }))
  } catch (error) {
    console.error('[Versions API] Error loading versions:', error)
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to load versions' }, { status: 500 }))
  }
}
