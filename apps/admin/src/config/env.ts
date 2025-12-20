// Environment configuration
const PORT = process.env.PORT || '3003'
const HOST = process.env.HOST || 'localhost'
const PROTOCOL = process.env.PROTOCOL || 'http'

export const config = {
  port: PORT,
  host: HOST,
  protocol: PROTOCOL,
  baseUrl: `${PROTOCOL}://${HOST}:${PORT}`,
  nextAuthUrl: `${PROTOCOL}://${HOST}:${PORT}`,
  apiUrl: `${PROTOCOL}://${HOST}:${PORT}/api`,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
  }
}

export default config