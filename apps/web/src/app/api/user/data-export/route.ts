import { NextRequest, NextResponse } from 'next/server'
import { userDatabase, anonymizeIP } from '../mock-database'

/**
 * GDPR 数据导出 API
 * 导出指定邮箱的所有数据
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

    // 2. 准备导出数据
    const exportData = {
      exportDate: new Date().toISOString(),
      userEmail: email,
      recordCount: userData.length,
      data: userData.map(record => ({
        ...record,
        // 可选：匿名化 IP 地址等敏感信息
        ip: record.data.ip ? anonymizeIP(record.data.ip) : undefined,
      })),
      metadata: {
        exportFormat: 'JSON',
        encoding: 'UTF-8',
        gdprCompliant: true,
      },
      instructions: {
        dataTypes: [
          'user_events: 页面浏览、点击等行为事件',
          'shopping_cart: 购物车内容和历史',
          'session_data: 用户会话和登录记录',
        ],
        retentionPeriod: '数据保留期限：自最后活动起 2 年',
        contactInfo: '如有问题，请联系 privacy@example.com',
      },
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('[GDPR] Data export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
