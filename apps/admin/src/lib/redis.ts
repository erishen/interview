import Redis from 'ioredis'

// Redis configuration interface
interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
  retryDelayOnFailover?: number
  enableReadyCheck?: boolean
  maxRetriesPerRequest?: number
  lazyConnect?: boolean
}

// Default Redis configuration
const defaultConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 5000, // 5 秒连接超时
  commandTimeout: 5000, // 5 秒命令超时
}

// Redis client instance
let redisClient: Redis | null = null

/**
 * Get Redis client instance (singleton pattern)
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(defaultConfig)
    
    // Handle connection events
    redisClient.on('connect', () => {
      console.log('Redis client connected')
    })
    
    redisClient.on('ready', () => {
      console.log('Redis client ready')
    })
    
    redisClient.on('error', (err) => {
      console.error('Redis client error:', err)
    })
    
    redisClient.on('close', () => {
      console.log('Redis client connection closed')
    })
    
    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting')
    })
  }
  
  return redisClient
}

/**
 * Close Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

/**
 * Check if Redis is connected
 */
export const isRedisConnected = (): boolean => {
  return redisClient?.status === 'ready'
}

/**
 * Redis session store for NextAuth
 */
export class RedisSessionStore {
  private redis: Redis
  private prefix: string

  constructor(prefix = 'session:') {
    this.redis = getRedisClient()
    this.prefix = prefix
  }

  /**
   * Get session data
   */
  async get(sessionId: string): Promise<any> {
    try {
      const data = await this.redis.get(`${this.prefix}${sessionId}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Redis session get error:', error)
      return null
    }
  }

  /**
   * Set session data with expiration
   */
  async set(sessionId: string, sessionData: any, maxAge: number): Promise<void> {
    try {
      await this.redis.setex(
        `${this.prefix}${sessionId}`,
        maxAge,
        JSON.stringify(sessionData)
      )
    } catch (error) {
      console.error('Redis session set error:', error)
    }
  }

  /**
   * Delete session
   */
  async delete(sessionId: string): Promise<void> {
    try {
      await this.redis.del(`${this.prefix}${sessionId}`)
    } catch (error) {
      console.error('Redis session delete error:', error)
    }
  }

  /**
   * Update session expiration
   */
  async touch(sessionId: string, maxAge: number): Promise<void> {
    try {
      await this.redis.expire(`${this.prefix}${sessionId}`, maxAge)
    } catch (error) {
      console.error('Redis session touch error:', error)
    }
  }
}

/**
 * Redis cache utilities
 */
export class RedisCache {
  private redis: Redis
  private prefix: string

  constructor(prefix = 'cache:') {
    this.redis = getRedisClient()
    this.prefix = prefix
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(`${this.prefix}${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Redis cache get error:', error)
      return null
    }
  }

  /**
   * Set cached value with expiration (in seconds)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await this.redis.setex(`${this.prefix}${key}`, ttl, serialized)
      } else {
        await this.redis.set(`${this.prefix}${key}`, serialized)
      }
    } catch (error) {
      console.error('Redis cache set error:', error)
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(`${this.prefix}${key}`)
    } catch (error) {
      console.error('Redis cache delete error:', error)
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(`${this.prefix}${key}`)
      return result === 1
    } catch (error) {
      console.error('Redis cache exists error:', error)
      return false
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(`${this.prefix}${key}`)
    } catch (error) {
      console.error('Redis cache ttl error:', error)
      return -1
    }
  }

  /**
   * Clear all cache with prefix
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.prefix}*`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis cache clear error:', error)
    }
  }
}

// Export default instances
export const redisSessionStore = new RedisSessionStore()
export const redisCache = new RedisCache()

// Export Redis client getter for direct access
export { getRedisClient as redis }