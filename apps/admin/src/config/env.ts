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
}

export default config