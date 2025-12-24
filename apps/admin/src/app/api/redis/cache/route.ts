import { NextRequest, NextResponse } from 'next/server'
import { redisCache } from '@/lib/redis'

// Mark this route as dynamic since it uses request.url
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 })
    }
    
    const value = await redisCache.get(key)
    
    return NextResponse.json({
      key,
      value,
      exists: value !== null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Redis get error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, ttl } = body
    
    if (!key || value === undefined) {
      return NextResponse.json({ 
        error: 'Key and value are required' 
      }, { status: 400 })
    }
    
    await redisCache.set(key, value, ttl)
    
    return NextResponse.json({
      success: true,
      key,
      value,
      ttl,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Redis set error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 })
    }
    
    await redisCache.delete(key)
    
    return NextResponse.json({
      success: true,
      key,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Redis delete error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}