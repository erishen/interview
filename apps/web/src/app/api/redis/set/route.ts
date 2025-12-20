import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    
    if (ttl && typeof ttl === 'number' && ttl > 0) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }

    return NextResponse.json({ 
      success: true, 
      key, 
      value,
      ...(ttl && { ttl })
    });
  } catch (error) {
    console.error('Redis SET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set value in Redis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
