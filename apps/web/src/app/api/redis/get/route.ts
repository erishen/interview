import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    const value = await redis.get(key);
    const ttl = await redis.ttl(key);

    return NextResponse.json({ 
      success: true, 
      key, 
      value,
      exists: value !== null,
      ttl: ttl > 0 ? ttl : null
    });
  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get value from Redis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
