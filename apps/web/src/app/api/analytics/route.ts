import { NextRequest, NextResponse } from 'next/server'

// 埋点事件类型（与前端保持一致）
type AnalyticsEventType =
  | 'product_view'
  | 'product_detail'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'update_quantity'
  | 'cart_view'
  | 'checkout'

interface AnalyticsEventData {
  productId?: number
  productName?: string
  price?: number
  category?: string
  quantity?: number
  oldQuantity?: number
  newQuantity?: number
  cartTotal?: number
  cartCount?: number
  items?: Array<{
    productId: number
    productName: string
    price: number
    quantity: number
  }>
  [key: string]: any
}

interface AnalyticsEvent {
  type: AnalyticsEventType
  data: AnalyticsEventData
  timestamp: number
  sessionId: string
  userId?: string
  url: string
  userAgent: string
  locale: string
}

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 接收埋点数据
 */
export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json()

    // 验证必要字段
    if (!event.type || !event.timestamp || !event.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 示例：可以转发到 FastAPI 后端进行存储
    // try {
    //   const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
    //   if (fastApiUrl) {
    //     await fetch(`${fastApiUrl}/analytics`, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(event),
    //     })
    //   }
    // } catch (error) {
    //   console.error('Failed to forward to FastAPI:', error)
    // }

    // 示例：可以存储到 Redis 或其他缓存
    // const redis = await getRedisClient()
    // const key = `analytics:${new Date(event.timestamp).toISOString().split('T')[0]}`
    // await redis.lpush(key, JSON.stringify(event))

    // 返回成功响应
    return NextResponse.json(
      { success: true, message: 'Event tracked' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 获取埋点统计信息（可选）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')

    // 这里可以实现查询逻辑，例如：
    // 1. 从数据库查询埋点数据
    // 2. 返回统计报表
    // 3. 返回聚合数据

    return NextResponse.json(
      {
        message: 'Analytics query endpoint',
        params: { startDate, endDate, type },
        note: 'Implement your analytics query logic here',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
