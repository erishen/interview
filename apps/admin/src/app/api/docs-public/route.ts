import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import {
  isKVConfigured,
  getAllDocs as kvGetAllDocs,
  getDoc as kvGetDoc
} from '@/lib/kv-store'
import {
  isSupabaseConfigured,
  getAllDocs as supabaseGetAllDocs,
  getDoc as supabaseGetDoc
} from '@/lib/supabase-store'

// 从环境变量读取允许的来源域名（逗号分隔）
const ALLOWED_ORIGINS_ENV = process.env.ALLOWED_ORIGINS || ''

const ALLOWED_ORIGINS = ALLOWED_ORIGINS_ENV
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

// 开发环境额外允许 localhost 任意端口
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:*')
}

/**
 * 验证 slug 格式（防止路径遍历攻击）
 */
function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0 || slug.length > 100) {
    return false
  }

  // 只允许字母、数字、连字符和下划线
  const validPattern = /^[a-zA-Z0-9_-]+$/
  return validPattern.test(slug) && !slug.includes('..')
}

/**
 * 验证请求来源
 */
function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false

  // 开发环境允许 localhost
  if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
    return true
  }

  // 检查是否在允许列表中
  return ALLOWED_ORIGINS.includes(origin)
}

/**
 * 设置 CORS headers
 */
function setCorsHeaders(response: NextResponse, requestOrigin: string | null) {
  if (isValidOrigin(requestOrigin)) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin || '*')
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

/**
 * 公开 API - 获取文档列表（无需认证）
 * 供 web 项目使用
 */
export async function GET(request: NextRequest) {
  // 1. 验证 Referer（防止直接 API 调用）
  const referer = request.headers.get('referer')
  if (process.env.NODE_ENV === 'production' && !referer) {
    return new NextResponse(null, { status: 403 })
  }

  // 2. 验证 Origin
  const origin = request.headers.get('origin')
  if (process.env.NODE_ENV === 'production' && !isValidOrigin(origin)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    // 如果有 slug，返回单个文档
    if (slug) {
      // 3. 验证 slug 格式
      if (!isValidSlug(slug)) {
        return NextResponse.json(
          { success: false, error: 'Invalid slug' },
          { status: 400 }
        )
      }

      let doc = null

      if (isSupabaseConfigured()) {
        doc = await supabaseGetDoc(slug)
      } else if (isKVConfigured()) {
        doc = await kvGetDoc(slug)
      } else {
        // 文件系统存储
        const DOCS_DIR = path.join(process.cwd(), '../../docs')
        const filePath = path.join(DOCS_DIR, `${slug}.md`)

        if (fs.existsSync(filePath)) {
          doc = {
            slug,
            title: '',
            content: fs.readFileSync(filePath, 'utf-8'),
            created_at: '',
            updated_at: ''
          }
        }
      }

      if (!doc) {
        return NextResponse.json(
          { success: false, error: 'Document not found' },
          { status: 404 }
        )
      }

      // 4. 设置缓存头（单个文档缓存 5 分钟）
      const response = NextResponse.json({ success: true, doc })
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return setCorsHeaders(response, origin)
    }

    // 返回文档列表
    let docs

    if (isSupabaseConfigured()) {
      docs = await supabaseGetAllDocs()
    } else if (isKVConfigured()) {
      docs = await kvGetAllDocs()
    } else {
      // 文件系统存储
      const DOCS_DIR = path.join(process.cwd(), '../../docs')

      if (!fs.existsSync(DOCS_DIR)) {
        return NextResponse.json({ success: true, docs: [] })
      }

      const files = fs.readdirSync(DOCS_DIR)
      docs = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const slug = file.replace(/\.md$/, '')
          const filePath = path.join(DOCS_DIR, file)
          const content = fs.readFileSync(filePath, 'utf-8')
          const stats = fs.statSync(filePath)

          const titleMatch = content.match(/^#\s+(.+)$/m)
          const title = titleMatch ? titleMatch[1] : slug

          const descMatch = content.match(/^> (.+)$/m)
          const description = descMatch ? descMatch[1] : undefined

          return { slug, title, description, created_at: stats.birthtime.toISOString(), updated_at: stats.mtime.toISOString() }
        })
    }

    // 5. 设置缓存头（列表缓存 1 分钟）
    const response = NextResponse.json({ success: true, docs })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return setCorsHeaders(response, origin)
  } catch (error) {
    console.error('[Public Docs API] Error:', error)
    // 生产环境不返回详细错误信息
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Failed to load docs'
      : String(error)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')

  const response = new NextResponse(null, { status: 200 })
  return setCorsHeaders(response, origin)
}
