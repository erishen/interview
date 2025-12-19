import { NextRequest, NextResponse } from 'next/server'
import { withLusca, AdminSecurityUtils } from '@/lib/lusca'

/**
 * CSRF 测试 API 路由
 * 用于测试 CSRF 保护功能
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  try {
    if (req.method === 'GET') {
      // GET 请求不需要 CSRF 保护
      return NextResponse.json({
        success: true,
        message: 'CSRF test endpoint is working',
        timestamp: new Date().toISOString(),
        method: 'GET',
        csrfRequired: false,
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      
      // 记录安全事件
      AdminSecurityUtils.logSecurityEvent('CSRF_TEST_REQUEST', {
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
        message: 'CSRF protected request successful',
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
    console.error('CSRF test API error:', error)
    
    AdminSecurityUtils.logSecurityEvent('CSRF_TEST_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
    })

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