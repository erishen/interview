import { NextRequest, NextResponse } from 'next/server'
import { userDatabase } from '../mock-database'

/**
 * GDPR 数据删除 API
 * 删除指定邮箱的所有数据
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // 1. 查询用户数据
    const userData = userDatabase[email]
    
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { 
          error: 'No data found for this email',
          message: '该邮箱没有相关数据'
        },
        { status: 404 }
      )
    }

    // 2. 实际项目中，这里应该：
    // - 从 MySQL 删除用户数据
    // - 从 Redis 删除用户会话
    // - 记录删除日志（保留至少 30 天）
    // - 发送确认邮件给用户
    
    // 示例：
    // await db.delete('user_events', { email })
    // await db.delete('shopping_carts', { email })
    // await db.insert('deletion_audit_log', { email, timestamp: Date.now() })
    
    // 模拟删除：从数据库中移除该用户的记录
    delete userDatabase[email]

    // 4. 对于 Google Analytics，引导用户自行删除
    const gaInstructions = `
      Google Analytics 数据删除说明：
      
      1. 访问：https://support.google.com/analytics/answer/10048803
      2. 选择您的数据区域
      3. 填写表单提交删除请求
      4. Google 通常在 7-30 天内处理
      
      注意：我们已记录您的删除请求并停止收集新数据
    `

    return NextResponse.json({
      success: true,
      message: '删除请求已提交',
      details: {
        recordsDeleted: userData.length,
        dataTypes: [
          'user_events',
          'shopping_cart',
          'session_data',
        ],
        processingTime: '30 天内',
        googleAnalyticsInstructions: gaInstructions,
      },
    })
  } catch (error) {
    console.error('[GDPR] Data deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 获取删除状态（可选）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    )
  }

  // 实际项目中应该查询删除请求的状态
  return NextResponse.json({
    status: 'no_pending_request',
    message: '该邮箱没有待处理的删除请求',
  })
}
