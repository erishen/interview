import { NextRequest, NextResponse } from 'next/server'
import { withLusca } from '@/lib/lusca'

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

/**
 * 安全测试 API 路由
 * 用于验证 Lusca 安全防护是否正常工作
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  const { method } = req
  
  if (method === 'GET') {
    // 返回安全状态信息
    return NextResponse.json({
      message: 'Security middleware is active',
      timestamp: new Date().toISOString(),
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'same-origin',
        'X-XSS-Protection': '1; mode=block',
      },
      security: {
        csrf: 'enabled',
        xss: 'enabled',
        hsts: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled',
        csp: 'enabled',
      }
    })
  }
  
  if (method === 'POST') {
    try {
      const body = await req.json()
      
      // 简单的输入验证示例
      if (body.test && typeof body.test === 'string') {
        return NextResponse.json({
          message: 'POST request processed successfully',
          received: body.test,
          timestamp: new Date().toISOString(),
        })
      }
      
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }
  }
  
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

// 使用 Lusca 中间件包装处理器
export const GET = withLusca(handler)
export const POST = withLusca(handler)