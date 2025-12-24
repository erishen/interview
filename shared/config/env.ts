/**
 * 环境变量验证和配置工具
 * 不依赖具体框架，可以在服务端和客户端使用
 */

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

export function getEnvVarAsNumber(key: string, defaultValue?: number): number {
  const value = getEnvVar(key)
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Environment variable ${key} is not a valid number`)
  }
  return parsed
}

export function getEnvVarAsBoolean(key: string, defaultValue?: boolean): boolean {
  const value = getEnvVar(key)
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false') return false
  if (defaultValue !== undefined) return defaultValue
  throw new Error(`Environment variable ${key} is not a valid boolean`)
}

export function isProduction(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'production'
}

export function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'development'
}

export function isTest(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'test'
}
