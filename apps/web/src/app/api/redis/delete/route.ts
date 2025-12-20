import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    const result = await redis.del(key);

    return NextResponse.json({ 
      success: true, 
      key, 
      deleted: result > 0,
      deletedCount: result
    });
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete value from Redis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
