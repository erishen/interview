import { NextRequest, NextResponse } from 'next/server'
import { withLusca, AdminSecurityUtils } from '@/lib/lusca'

/**
 * 管理员安全测试 API 路由
 * 用于验证 Lusca 安全防护是否正常工作
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  const { method } = req
  
  if (method === 'GET') {
    // 记录安全检查事件
    AdminSecurityUtils.logSecurityEvent('SECURITY_CHECK', {
      userAgent: req.headers.get('user-agent'),
      ip: req.ip || 'unknown'
    })
    
    // 返回安全状态信息
    return NextResponse.json({
      message: 'Admin security middleware is active',
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
        adminProtection: 'enabled',
      }
    })
  }
  
  if (method === 'POST') {
    try {
      const body = await req.json()
      
      // 管理员权限验证示例
      if (body.adminAction && body.userRole) {
        const hasAdminAccess = AdminSecurityUtils.validateAdminAccess(body.userRole)
        
        if (!hasAdminAccess) {
          AdminSecurityUtils.logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', {
            userRole: body.userRole,
            action: body.adminAction
          })
          
          return NextResponse.json(
            { error: 'Insufficient admin privileges' },
            { status: 403 }
          )
        }
      }
      
      // 输入清理示例
      if (body.test && typeof body.test === 'string') {
        const sanitizedInput = AdminSecurityUtils.sanitizeInput(body.test)
        
        AdminSecurityUtils.logSecurityEvent('INPUT_SANITIZATION', {
          original: body.test,
          sanitized: sanitizedInput
        })
        
        return NextResponse.json({
          message: 'Admin POST request processed successfully',
          original: body.test,
          sanitized: sanitizedInput,
          timestamp: new Date().toISOString(),
        })
      }
      
      return NextResponse.json(
        { error: 'Invalid input for admin endpoint' },
        { status: 400 }
      )
    } catch (error) {
      AdminSecurityUtils.logSecurityEvent('SECURITY_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
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