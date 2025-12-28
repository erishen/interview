import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import { getDocsDir, ensureDocsSubdir } from '@/lib/docs-path'

const DOCS_DIR = getDocsDir()
const VERSIONS_DIR = ensureDocsSubdir('.versions') || path.join(DOCS_DIR, '.versions')

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
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
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

// 获取单个版本详情
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; versionId: string } }
) {
  const session = await verifyAuth(request)
  if (!session) {
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Unauthorized - Please login first' }, { status: 401 }))
  }

  try {
    const { slug, versionId } = params

    // 验证 slug 格式
    const slugValidation = isValidSlug(slug)
    if (!slugValidation.valid) {
      return setCorsHeaders(NextResponse.json({ success: false, error: slugValidation.error }, { status: 400 }))
    }

    // 读取版本信息
    const versionPath = path.join(VERSIONS_DIR, slug, `${versionId}.json`)
    if (!fs.existsSync(versionPath)) {
      return setCorsHeaders(NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 }))
    }

    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'))

    return setCorsHeaders(NextResponse.json({ success: true, version: versionData }))
  } catch (error) {
    console.error('[Version Detail API] Error:', error)
    return setCorsHeaders(NextResponse.json({ success: false, error: 'Failed to load version' }, { status: 500 }))
  }
}
