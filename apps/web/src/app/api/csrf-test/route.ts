import { NextRequest, NextResponse } from 'next/server'
import { withLusca, SecurityUtils } from '@/lib/lusca'

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

/**
 * CSRF 测试 API 路由 - Web 项目
 * 用于测试 CSRF 保护功能
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  try {
    if (req.method === 'GET') {
      // GET 请求不需要 CSRF 保护
      return NextResponse.json({
        success: true,
        message: 'Web CSRF test endpoint is working',
        timestamp: new Date().toISOString(),
        method: 'GET',
        csrfRequired: false,
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      
      // 记录请求信息
      console.log('[WEB CSRF TEST]', {
        method: req.method,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        body: body,
        headers: {
          'x-csrf-token': req.headers.get('x-csrf-token'),
          'content-type': req.headers.get('content-type'),
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Web CSRF protected request successful',
        timestamp: new Date().toISOString(),
        method: 'POST',
        csrfRequired: true,
        receivedData: body,
        securityHeaders: {
          csrfToken: req.headers.get('x-csrf-token') ? 'Present' : 'Missing',
          contentType: req.headers.get('content-type'),
        }
      })
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST']
      },
      { status: 405 }
    )
  } catch (error) {
    console.error('Web CSRF test API error:', error)

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 只有 POST 请求需要 CSRF 保护
export const GET = handler
export const POST = withLusca(handler)