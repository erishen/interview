import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as fs from 'fs'
import * as path from 'path'
import { getDocsDir, getWritableDocsDir, ensureDocsSubdir, initializeWritableDocs } from '@/lib/docs-path'

// 初始化可写的 docs 目录（仅在 Vercel 生产环境）
initializeWritableDocs()

const DOCS_DIR = getDocsDir() // 只读目录
const WRITABLE_DOCS_DIR = getWritableDocsDir() // 可写目录
const VERSIONS_DIR = ensureDocsSubdir('.versions') || path.join(WRITABLE_DOCS_DIR, '.versions')

// 安全验证：检查 slug 格式，防止路径遍历攻击
function isValidSlug(slug: string): { valid: boolean; error?: string } {
  if (slug.length === 0) return { valid: false, error: 'Slug 不能为空' }
  if (slug.length > 100) return { valid: false, error: 'Slug 不能超过 100 个字符' }

  const validPattern = /^[a-z0-9_-]+$/i
  if (!validPattern.test(slug)) {
    return { valid: false, error: 'Slug 只能包含小写字母、数字、连字符(-)和下划线(_)' }
  }

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
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
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

// 恢复到指定版本
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await verifyAuth(request)
  if (!session) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  }

  try {
    const { slug } = params
    const { version_id } = await request.json()

    // 验证 slug 格式
    const slugValidation = isValidSlug(slug)
    if (!slugValidation.valid) {
      return setCorsHeaders(NextResponse.json({ success: false, error: slugValidation.error }, { status: 400 }))
    }

    if (!version_id) {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Version ID is required' }, { status: 400 }))
    }

    // 读取版本信息
    const versionPath = path.join(VERSIONS_DIR, slug, `${version_id}.json`)
    if (!fs.existsSync(versionPath)) {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 }))
    }

    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'))

    // 将版本内容恢复到主文档
    const docPath = path.join(WRITABLE_DOCS_DIR, `${slug}.md`)
    if (!fs.existsSync(docPath)) {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 }))
    }

    fs.writeFileSync(docPath, versionData.content, 'utf-8')

    // 保存回退操作为新版本（这样用户可以再次回退）
    const newVersionId = Date.now().toString()
    const newVersionPath = path.join(VERSIONS_DIR, slug, `${newVersionId}.json`)
    const newVersionData = {
      id: newVersionId,
      doc_slug: slug,
      content: versionData.content,
      message: `回退到版本 ${version_id}`,
      author: session.user.name || session.user.email || 'Unknown',
      created_at: new Date().toISOString(),
      parent_version_id: version_id,
    }

    // 确保版本目录存在
    const docVersionDir = path.join(VERSIONS_DIR, slug)
    if (!fs.existsSync(docVersionDir)) {
      fs.mkdirSync(docVersionDir, { recursive: true })
    }

    fs.writeFileSync(newVersionPath, JSON.stringify(newVersionData, null, 2), 'utf-8')

    return setCorsHeaders(NextResponse.json({
      success: true,
      message: 'Reverted to version successfully',
      version_id: newVersionId
    }))
  } catch (error) {
    console.error('[Version Revert] Error:', error)
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to revert version' }, { status: 500 }))
  }
}
