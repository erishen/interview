import { NextRequest, NextResponse } from 'next/server'
import { redisCache, isRedisConnected } from '@/lib/redis'

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check Redis connection status
    const isConnected = isRedisConnected()
    
    // Test basic Redis operations
    const testKey = 'health-check'
    const testValue = { timestamp: new Date().toISOString(), status: 'ok' }
    
    // Set test value
    await redisCache.set(testKey, testValue, 60) // 1 minute TTL
    
    // Get test value
    const retrievedValue = await redisCache.get(testKey)
    
    // Check if values match
    const testPassed = JSON.stringify(testValue) === JSON.stringify(retrievedValue)
    
    // Clean up test key
    await redisCache.delete(testKey)
    
    return NextResponse.json({
      status: 'success',
      redis: {
        connected: isConnected,
        testPassed,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Redis health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      redis: {
        connected: false,
        testPassed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}