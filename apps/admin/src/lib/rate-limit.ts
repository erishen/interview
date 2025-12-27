import { redisCache } from './redis'

/**
 * 速率限制配置
 */
interface RateLimitConfig {
  windowMs: number      // 时间窗口（毫秒）
  maxRequests: number   // 最大请求数
  keyGenerator?: (request: Request) => string
  skipFailedRequests?: boolean
  skipSuccessfulRequests?: boolean
}

/**
 * 速率限制结果
 */
interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: Date
}

/**
 * 速率限制器类
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipFailedRequests: config.skipFailedRequests || false,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    }
  }

  /**
   * 默认的键生成器（基于 IP 地址）
   */
  private defaultKeyGenerator(request: Request): string {
    // 在真实环境中，你应该从 X-Forwarded-For 或 X-Real-IP 获取 IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown-ip'
    return `ratelimit:${ip}`
  }

  /**
   * 检查请求是否超过速率限制
   */
  async check(request: Request): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(request)
    const now = Date.now()
    const resetTime = new Date(now + this.config.windowMs)

    try {
      // 从 Redis 获取当前计数
      const currentData = await redisCache.get(key)
      const current = (currentData as any) || { count: 0, startTime: now }

      // 检查窗口是否过期
      if (now - current.startTime >= this.config.windowMs) {
        // 重置窗口
        const newData = { count: 1, startTime: now }
        await redisCache.set(key, newData, Math.ceil(this.config.windowMs / 1000))

        return {
          success: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests - 1,
          resetTime,
        }
      }

      // 检查是否超过限制
      if (current.count >= this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
        }
      }

      // 增加计数
      const newData = { count: current.count + 1, startTime: current.startTime }
      await redisCache.set(key, newData, Math.ceil(this.config.windowMs / 1000))

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - current.count - 1,
        resetTime,
      }
    } catch (error) {
      // 如果 Redis 失败，允许请求通过（fail-open 策略）
      console.error('[RateLimiter] Error checking rate limit:', error)
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime,
      }
    }
  }

  /**
   * 清除速率限制（用于测试或特殊情况）
   */
  async clear(request: Request): Promise<void> {
    const key = this.config.keyGenerator(request)
    await redisCache.delete(key).catch(err => {
      console.error('[RateLimiter] Error clearing rate limit:', err)
    })
  }
}

/**
 * 预定义的速率限制器实例
 */
export const rateLimiters = {
  // 登录请求：5 次 / 15 分钟
  login: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 分钟
    maxRequests: 5,
  }),

  // 注册请求：3 次 / 小时
  register: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 小时
    maxRequests: 3,
  }),

  // API 请求：100 次 / 分钟
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 100,
  }),

  // 通用请求：1000 次 / 小时
  general: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 小时
    maxRequests: 1000,
  }),
}

/**
 * 速率限制中间件辅助函数
 */
export function createRateLimitMiddleware(limiter: RateLimiter) {
  return async (request: Request) => {
    const result = await limiter.check(request)
    return result
  }
}
